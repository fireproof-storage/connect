import { KeyedResolvOnce, URI } from "@adviser/cement";
import { bs, type Database } from "@fireproof/core";
import { Delegation, Principal, SignerArchive } from "@ucanto/interface";
import { Agent, type AgentMeta, type AgentData, type AgentDataExport } from "@web3-storage/access/agent";
import { Absentee, ed25519 } from "@ucanto/principal";
import { DID, parseLink } from "@ucanto/core";
import { DidMailto, fromEmail, toEmail } from "@web3-storage/did-mailto";
import * as W3 from "@web3-storage/w3up-client/account";
import * as Del from "@ucanto/core/delegation";
import { unwrap } from "@web3-storage/w3up-client/result";
import { bytesToDelegations } from "@web3-storage/access/encoding";
import * as Signature from "@ipld/dag-ucan/signature";
import type { Signer as SignerWithoutVerifier } from "@ipld/dag-ucan";

import * as Client from "./client.js";
import * as ClockCaps from "./clock/capabilities.js";
import { connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store.js";
import { registerUCANStoreProtocol } from "./ucan-gateway.js";
import stateStore from "./store/state/index.js";
import { Service, type AgentWithStoreName, type Clock, type ClockWithoutDelegation, type Server } from "./types.js";
import { agentProofs, exportDelegation, extractDelegation } from "./common.js";

// Exports

export { Agent, AgentWithStoreName, Clock, ClockWithoutDelegation, Server, Service } from "./types.js";

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
  readonly poll: boolean;
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
    .setParam("poll", params.poll === true ? "t" : "f")
    .setParam("server-host", serv.uri.toString())
    .setParam("server-id", serv.id.did())
    .setParam("storekey", `@${dbName}:data@`);

  if ("storeName" in klok) fpUrl.setParam("clock-store", klok.storeName);
  if (email) fpUrl.setParam("email-id", email.did());

  // Connect
  const connection = await connectionCache.get(fpUrl.toString()).once(async () => {
    makeKeyBagUrlExtractable(sthis);
    const conn = connectionFactory(sthis, fpUrl);
    await conn.connect_X(blockstore);
    return conn;
  });

  await connection.loaded;

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
  databaseName?: string;
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
  databaseName?: string;
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

export function clockStoreName({ audience, databaseName }: { audience: Principal; databaseName?: string }) {
  return databaseName ? `fireproof/${databaseName}/${audience.did()}/clock` : `fireproof/${audience.did()}/clock`;
}

export async function createAndSaveClock({
  audience,
  databaseName,
  storeName,
}: {
  audience: Principal | AgentWithStoreName;
  databaseName?: string;
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
  databaseName?: string;
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

export function email(string: `${string}@${string}`): SignerWithoutVerifier<DidMailto, typeof Signature.NON_STANDARD> {
  return Absentee.from({ id: fromEmail(string) });
}

export async function isLoggedIn(params: {
  agent?: AgentWithStoreName;
  email: Principal<DidMailto>;
}): Promise<boolean> {
  const proxy = params.agent || (await agent());
  const proofs = proxy.agent.proofs([{ with: params.email.did(), can: "*" }]);

  return proofs.length > 0;
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

// SHARING
// -------

/**
 * Claim a specific share.
 *
 * ⚠️ Polls until the share is confirmed and the delegation is available on the server.
 *
 * @param context
 * @param context.email The (principal) email of the receiver of the share.
 * @param context.cid The CID communicated by the sharer.
 */
export async function claimShare(
  args: { email: Principal<DidMailto>; cid: string },
  context?: {
    agent?: AgentWithStoreName;
    server?: Server;
  }
) {
  const ctx = {
    agent: context?.agent || (await agent({ server: context?.server })),
    server: context?.server || (await server()),
  };

  const proofs = agentProofs(ctx.agent.agent);
  const attestation = proofs.attestations[0];
  const delegation = proofs.delegations[0];

  const claim = async () => {
    const resp = await ClockCaps.claimShare
      .invoke({
        issuer: ctx.agent.agent.issuer,
        audience: ctx.server.id,
        with: ctx.agent.id.did(),
        proofs: [attestation, delegation],
        nb: { recipient: args.email.did(), proof: parseLink(args.cid) },
      })
      .execute(ctx.agent.agent.connection);

    if (resp.out.error) throw resp.out.error;
    return Object.values(resp.out.ok.delegations).flatMap((proof) => bytesToDelegations(proof));
  };

  const poll = async () => {
    const proofs = await claim();
    const attestation = proofs.find((p) => p.capabilities[0].can === "ucan/attest");

    if (!attestation) {
      await new Promise((resolve) => {
        setTimeout(resolve, 2500);
      });

      return await poll();
    }

    return proofs;
  };

  return await poll();
}

/**
 * Claim all shares.
 *
 * @param args
 * @param args.email The (principal) email of the receiver of the share.
 */
export async function claimShares(
  args: { email: Principal<DidMailto> },
  context?: {
    agent?: AgentWithStoreName;
    server?: Server;
  }
) {
  const ctx = {
    agent: context?.agent || (await agent({ server: context?.server })),
    server: context?.server || (await server()),
  };

  const proofs = agentProofs(ctx.agent.agent);
  const attestation = proofs.attestations[0];
  const delegation = proofs.delegations[0];

  const resp = await ClockCaps.claimShares
    .invoke({
      issuer: ctx.agent.agent.issuer,
      audience: ctx.server.id,
      with: ctx.agent.id.did(),
      proofs: [attestation, delegation],
      nb: { recipient: args.email.did() },
    })
    .execute(ctx.agent.agent.connection);

  if (resp.out.error) throw resp.out.error;
  return Object.values(resp.out.ok.delegations).flatMap((proof) => bytesToDelegations(proof));
}

/**
 * Share database access to a given email address.
 *
 * This makes a delegation to the email address and starts
 * the authorization process. The sharer will receive an email
 * with a link that will validate the share. Returns a CID
 * that has to be communicated to the receiver of the share.
 */
export async function share(
  args: {
    from: SignerWithoutVerifier<DidMailto>;
    to: Principal<DidMailto>;
  },
  {
    agent,
    clock,
    server,
  }: {
    agent: AgentWithStoreName;
    clock: Clock;
    server: Server;
  }
): Promise<{ cid: string }> {
  if (clock.delegation.audience.did() !== args.from.did()) {
    throw new Error("The audience of the given clock (delegation) does not match the `from` email address.");
  }

  const delegation = await delegateClock({
    audience: args.to,
    clockDID: clock.id.did(),
    issuer: args.from,
    proof: clock.delegation,
  });

  const authorizeShareResp = await ClockCaps.authorizeShare
    .invoke({
      issuer: agent.agent.issuer,
      audience: server.id,
      with: agent.agent.issuer.did(),
      nb: {
        issuer: args.from.did(),
        recipient: args.to.did(),
        proof: delegation.cid,
      },
      proofs: [delegation],
    })
    .execute(agent.agent.connection);

  if (authorizeShareResp.out.error) throw authorizeShareResp.out.error;
  return { cid: delegation.cid.toString() };
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

async function delegateClock({
  audience,
  clockDID,
  issuer,
  proof,
}: {
  audience: Principal;
  clockDID: `did:key:${string}`;
  issuer: SignerWithoutVerifier;
  proof: Delegation;
}): Promise<Delegation> {
  return await ClockCaps.clock.delegate({
    issuer,
    audience,
    with: clockDID,
    proofs: [proof],
    expiration: Infinity,
  });
}
