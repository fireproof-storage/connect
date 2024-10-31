import { KeyedResolvOnce, runtimeFn, BuildURI, URI } from "@adviser/cement";
import { bs, Database } from "@fireproof/core";
import { Principal, SignerArchive } from "@ucanto/interface";
import { Agent, AgentData, AgentDataExport, AgentMeta } from "@web3-storage/access/agent";
import { Absentee, ed25519 } from "@ucanto/principal";
import { DID } from "@ucanto/core";
import { fromEmail } from "@web3-storage/did-mailto";
import * as W3 from "@web3-storage/w3up-client/account";

import * as Client from "./client";
import { connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store";
import { registerUCANStoreProtocol } from "./ucan-gateway";
import stateStore from "./store/state";
import type { AgentWithStoreName, Clock, ClockWithoutDelegation, Server, Service } from "./types";
import { exportDelegation, extractDelegation } from "./common";

// Setup

if (!runtimeFn().isBrowser) {
  const url = BuildURI.from(process.env.FP_KEYBAG_URL || "file://./dist/kb-dir-ucan-cloud");
  url.setParam("extractKey", "_deprecated_internal_api");
  process.env.FP_KEYBAG_URL = url.toString();
}

registerUCANStoreProtocol();

// CONNECT
// =======

const connectionCache = new KeyedResolvOnce<bs.Connection>();

export interface ConnectionParams {
  readonly agent?: AgentWithStoreName;
  readonly clock?: Clock | ClockWithoutDelegation;
  readonly email?: `${string}@${string}`;
  readonly server?: Server;
}

export async function connect(
  db: Database,
  params?: ConnectionParams
): Promise<{
  agent: AgentWithStoreName;
  clock: Clock | ClockWithoutDelegation;
  connection: bs.Connection;
  server: Server;
}> {
  params = params || {};

  const { sthis, blockstore, name: dbName } = db;
  const { email } = params;

  // URL param validation
  if (!dbName) {
    throw new Error("`dbName` is required");
  }

  // Email id
  const emailId = email ? Absentee.from({ id: fromEmail(email) }) : undefined;

  // Parts
  const agnt = params.agent || (await agent());
  const serv = params.server || (await server());

  // Typescript being weird?
  const klok = (params.clock || (await clock({ audience: emailId || agnt.agent, databaseName: dbName }))) as
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
  if (emailId) fpUrl.setParam("email-id", emailId.did());

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

const AGENT_META: AgentMeta = { name: "fireproof-agent", type: "app" };

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
    meta: AGENT_META,
    principal: principal,
  };

  const dataExport: AgentDataExport = {
    meta: AGENT_META,
    principal: principal.toArchive(),
    spaces: new Map(),
    delegations: new Map(),
  };

  await store.save(dataExport);

  const connection = Client.service(options?.server || (await server()));

  return {
    agent: await Agent.create<Service>(agentData, { store, connection }),
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

  return {
    agent: Agent.from<Service>(data, { store, connection }),
    storeName,
  };
}

// CLOCK
// -----

export async function clock(options: {
  audience: Principal;
  databaseName: string;
  storeName?: string;
}): Promise<Clock> {
  const clockFromStore = await loadSavedClock(options);
  if (clockFromStore) return clockFromStore;
  return await createAndSaveClock(options);
}

export function clockId(id: `did:key:${string}`): ClockWithoutDelegation {
  return { id: DID.parse(id) };
}

export function clockStoreName({ databaseName }: { databaseName: string }) {
  return `fireproof/${databaseName}/clock`;
}

export async function createAndSaveClock({
  audience,
  databaseName,
  storeName,
}: {
  audience: Principal;
  databaseName: string;
  storeName?: string;
}): Promise<Clock> {
  storeName = storeName || clockStoreName({ databaseName });
  const store = await stateStore(storeName);
  const clock = await Client.createClock({ audience });
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
  databaseName,
  storeName,
}: {
  databaseName: string;
  storeName?: string;
}): Promise<Clock | undefined> {
  storeName = storeName || clockStoreName({ databaseName });
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

export async function registerClock({ clock, server }: { clock: Clock; server: Server }) {
  const service = Client.service(server);
  const registration = await Client.registerClock({ clock, server, service });
  if (registration.out.error) throw registration.out.error;
}

// LOGIN
// -----

export async function login(params: { agent?: AgentWithStoreName; email: `${string}@${string}` }) {
  const proxy = params.agent || (await agent());
  const result = await W3.login({ agent: proxy.agent as unknown as Agent }, params.email);
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
  const uri = BuildURI.from(url);

  if (id === undefined) {
    id = await fetch(uri.pathname("/did").asURL())
      .then((r) => r.text())
      .then((r) => r as `did:${string}:${string}`);
  }

  if (id === undefined) {
    throw new Error("Unable to determine server id.");
  }

  return {
    id: DID.parse(id),
    uri: URI.from(uri),
  };
}
