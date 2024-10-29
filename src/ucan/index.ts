import { KeyedResolvOnce, URI } from "@adviser/cement";
import { bs, type Database } from "@fireproof/core";
import { Delegation, Principal, SignerArchive } from "@ucanto/interface";
import { Agent, type AgentMeta, type AgentData, type AgentDataExport } from "@web3-storage/access/agent";
import { Absentee, ed25519 } from "@ucanto/principal";
import { DID } from "@ucanto/core";
import { DidMailto, fromEmail, toEmail } from "@web3-storage/did-mailto";
import * as W3 from "@web3-storage/w3up-client/account";
import * as Del from "@ucanto/core/delegation";
import { unwrap } from "@web3-storage/w3up-client/result";

import * as Client from "./client";
import * as ClockCaps from "./clock/capabilities";
import { connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store";
import { registerUCANStoreProtocol } from "./ucan-gateway";
import stateStore from "./store/state";
import { Service, type AgentWithStoreName, type Clock, type ClockWithoutDelegation, type Server } from "./types";
import { exportDelegation, extractDelegation } from "./common";

// Exports

export { Agent, AgentWithStoreName, Clock, ClockWithoutDelegation, Server, Service } from "./types";

export const Capabilities = { Clock: ClockCaps };

// Setup

registerUCANStoreProtocol();

// CONNECT
// =======

const connectionCache = new KeyedResolvOnce<bs.Connection>();

export interface ConnectionParams {
  readonly agent: AgentWithStoreName;
  readonly clock: Clock | ClockWithoutDelegation;
  readonly email: Principal<DidMailto>;
  readonly server: Server;
}

export async function connect(
  db: Database,
  params: Partial<ConnectionParams> = {}
): Promise<{
  agent: AgentWithStoreName;
  clock: Clock | ClockWithoutDelegation;
  connection: bs.Connection;
  server: Server;
}> {
  const { sthis, blockstore, name: dbName } = db;
  const { email } = params;

  // URL param validation
  if (!dbName) {
    throw new Error("`dbName` is required");
  }

  // Parts
  const agnt = params.agent || (await agent());
  const serv = params.server || (await server());

  // Typescript being weird?
  const klok = (params.clock || (await clock({ audience: email || agnt.agent, databaseName: dbName }))) as
    | Clock
    | ClockWithoutDelegation;

  // DB name
  const existingName = serv.uri.getParam("name");
  const name = existingName || dbName;

  // Build FP URL
  const fpUrl = serv.uri
    .build()
    .protocol("ucan:")
    .setParam("agent-store", agnt.storeName)
    .setParam("clock-id", klok.id.did())
    .setParam("name", name)
    .setParam("server-host", serv.uri.toString())
    .setParam("server-id", serv.id.did())
    .setParam("storekey", `@${dbName}:data@`);

  if ("storeName" in klok) fpUrl.setParam("clock-store", klok.storeName);
  if (email) fpUrl.setParam("email-id", email.did());

  // Connect
  const connection = connectionCache.get(fpUrl.toString()).once(() => {
    makeKeyBagUrlExtractable(sthis);
    const connection = connectionFactory(sthis, fpUrl);
    connection.connect_X(blockstore);
    return connection;
  });
  // Fin
  return {
    agent: agnt,
    clock: klok,
    connection,
    server: serv,
  };
}

// AGENT
// -----

export async function agent(options?: { server?: Server; storeName?: string }): Promise<AgentWithStoreName> {
  const agentFromStore = await loadSavedAgent(options);
  if (agentFromStore) return agentFromStore;
  return await createAndSaveAgent(options);
}

export function agentStoreName() {
  return `fireproof/agent`;
}

export async function createAndSaveAgent(options?: {
  server?: Server;
  storeName?: string;
}): Promise<AgentWithStoreName> {
  let storeName = options?.storeName;
  storeName = storeName || agentStoreName();
  const store = await stateStore(storeName);

  const principal = await ed25519.generate();
  const agentData: Partial<AgentData> = {
    meta: { name: "fireproof-agent", type: "app" },
    principal,
  };

  const connection = Client.service(options?.server || (await server()));
  const agnt = await Agent.create<Service>(agentData, { store, connection });

  return {
    agent: agnt,
    id: agnt.issuer,
    storeName,
  };
}

export async function loadSavedAgent(options?: {
  server?: Server;
  storeName?: string;
}): Promise<AgentWithStoreName | undefined> {
  let storeName = options?.storeName;
  storeName = storeName || agentStoreName();
  const store = await stateStore(storeName);

  const data = await store.load();
  if (!data) return undefined;

  const connection = Client.service(options?.server || (await server()));
  const agnt = Agent.from<Service>(data, { store, connection });

  return {
    agent: agnt,
    id: agnt.issuer,
    storeName,
  };
}

// CLOCK
// -----

export async function clock(options: {
  audience: Principal | AgentWithStoreName;
  databaseName: string;
  storeName?: string;
}): Promise<Clock> {
  const clockFromStore = await loadSavedClock(options);
  if (clockFromStore) return clockFromStore;
  return await createAndSaveClock(options);
}

/**
 * Import a clock delegation and then save it
 * so you can use it with `clock` later on.
 */
export async function clockDelegation({
  audience,
  databaseName,
  delegation,
  storeName,
}: {
  audience: Principal | AgentWithStoreName;
  databaseName: string;
  delegation: Delegation;
  storeName?: string;
}): Promise<Clock> {
  const clockAudience = "agent" in audience ? audience.agent : audience;
  storeName = storeName || clockStoreName({ audience: clockAudience, databaseName });
  const store = await stateStore(storeName);

  let iterator = delegation.iterate();
  let clockRoot;

  while (clockRoot === undefined) {
    const del = iterator.next();
    if (del.value.proofs.length === 0) {
      clockRoot = del.value;
    } else {
      iterator = del.value.iterate();
    }
  }

  if (clockRoot === undefined) {
    throw new Error("Unable to determine clock root");
  }

  const clock = {
    delegation,
    id: clockRoot.issuer,
    isNew: false,
    storeName,
  };

  const raw: AgentDataExport = {
    meta: { name: storeName, type: "service" },
    principal: { id: delegation.issuer.did(), keys: {} },
    spaces: new Map(),
    delegations: new Map([exportDelegation(delegation)]),
  };

  await store.save(raw);
  return { ...clock, storeName };
}

export function clockId(id: `did:key:${string}`): ClockWithoutDelegation {
  return { id: DID.parse(id), isNew: false };
}

export function clockStoreName({ audience, databaseName }: { audience: Principal; databaseName: string }) {
  return `fireproof/${databaseName}/${audience.did()}/clock`;
}

export async function createAndSaveClock({
  audience,
  databaseName,
  storeName,
}: {
  audience: Principal | AgentWithStoreName;
  databaseName: string;
  storeName?: string;
}): Promise<Clock> {
  const clockAudience = "agent" in audience ? audience.agent : audience;
  storeName = storeName || clockStoreName({ audience: clockAudience, databaseName });
  const store = await stateStore(storeName);
  const clock = await Client.createClock({ audience: clockAudience });
  const signer = clock.signer;

  if (signer === undefined) {
    throw new Error("Cannot save a clock without a signer");
  }

  const raw: AgentDataExport = {
    meta: { name: storeName, type: "service" },
    principal: signer.toArchive(),
    spaces: new Map(),
    delegations: new Map([exportDelegation(clock.delegation)]),
  };

  await store.save(raw);
  return { ...clock, storeName };
}

export async function loadSavedClock({
  audience,
  databaseName,
  storeName,
}: {
  audience: Principal | AgentWithStoreName;
  databaseName: string;
  storeName?: string;
}): Promise<Clock | undefined> {
  const clockAudience = "agent" in audience ? audience.agent : audience;
  storeName = storeName || clockStoreName({ audience: clockAudience, databaseName });
  const store = await stateStore(storeName);
  const clockExport = await store.load();

  if (clockExport) {
    const delegation = await extractDelegation(clockExport);
    if (delegation === undefined) return undefined;

    return {
      delegation: delegation,
      id: DID.parse(clockExport.principal.id as `did:key:${string}`),
      isNew: false,
      signer: ed25519.from(clockExport.principal as SignerArchive<`did:key:${string}`, ed25519.SigAlg>),
      storeName,
    };
  }

  return undefined;
}

export async function registerClock(params: { clock: Clock; server?: Server }) {
  const srvr = params.server || (await server());
  const service = Client.service(srvr);
  const registration = await Client.registerClock({ clock: params.clock, server: srvr, service });
  if (registration.out.error) throw registration.out.error;
}

// LOGIN
// -----

const AGENT_META: AgentMeta = { name: "fireproof-agent", type: "app" };

export function email(string: `${string}@${string}`): Principal<DidMailto> {
  return Absentee.from({ id: fromEmail(string) });
}

export async function login(params: { agent?: AgentWithStoreName; email: Principal<DidMailto> }) {
  const proxy = params.agent || (await agent());
  const result = await W3.login({ agent: proxy.agent as unknown as Agent }, toEmail(params.email.did()));
  if (result.error) throw result.error;

  const saved = await result.ok.save();
  if (saved.error) throw saved.error;

  // Save agent delegations to store
  const dataExport: AgentDataExport = {
    meta: AGENT_META,
    principal: proxy.agent.issuer.toArchive(),
    spaces: new Map(),
    delegations: new Map(proxy.agent.proofs().map(exportDelegation)),
  };

  const store = await stateStore(proxy.storeName);
  await store.save(dataExport);

  return result.ok;
}

// SERVER
// ------

/**
 * Determine server properties.
 * NOTE: This sends a request to the server for the DID if you don't provide it yourself.
 *       In other words, when working offline, cache the server id and provide it here.
 */
export async function server(
  url = "https://fireproof-ucan.jchris.workers.dev",
  id?: `did:${string}:${string}`
): Promise<Server> {
  const uri = URI.from(url);

  if (!id) {
    id = await fetch(uri.build().pathname("/did").asURL())
      .then((r) => r.text())
      .then((r) => r as `did:${string}:${string}`);
  }

  if (!id) {
    throw new Error("Unable to determine server id.");
  }

  return {
    id: DID.parse(id),
    uri,
  };
}

// UTILS
// =====

export const delegation = {
  async archive(delegation: Delegation): Promise<Uint8Array> {
    const result = await Del.archive(delegation);
    return unwrap(result);
  },

  async extract(archive: Uint8Array): Promise<Delegation> {
    const result = await Del.extract(archive);
    if (result.ok === undefined) throw result.error;
    return result.ok;
  },
};
