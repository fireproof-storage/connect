import { KeyedResolvOnce, runtimeFn, BuildURI, URI } from "@adviser/cement";
import { bs, Database } from "@fireproof/core";
import { Principal, SignerArchive } from "@ucanto/interface";
import { AgentDataExport } from "@web3-storage/access";
import { extract } from "@ucanto/core/delegation";
import { ed25519 } from "@ucanto/principal";
import { DID } from "@ucanto/core";

import * as Client from "./client";
import { connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store";
import { registerUCANStoreProtocol } from "./ucan-gateway";
import stateStore from "./store/state";
import type { Clock, ClockWithoutDelegation, Server } from "./types";

// Usage:
//
// import { useFireproof } from 'use-fireproof'
// import { connect } from '@fireproof/ucan'
//
// const { db } = useFireproof('test')
//
// const cx = connect.ucan(db, 'example@email.com', 'http://localhost:8787');

if (!runtimeFn().isBrowser) {
  const url = BuildURI.from(process.env.FP_KEYBAG_URL || "file://./dist/kb-dir-ucan-cloud");
  url.setParam("extractKey", "_deprecated_internal_api");
  process.env.FP_KEYBAG_URL = url.toString();
}

registerUCANStoreProtocol();

// CONNECT

const connectionCache = new KeyedResolvOnce<bs.Connection>();

export interface ConnectionParams {
  readonly clock: Clock | ClockWithoutDelegation;
  readonly email?: `${string}@${string}`;
  readonly server: Server;
}

export async function connect(db: Database, params: ConnectionParams): Promise<bs.Connection> {
  const { sthis, blockstore, name: dbName } = db;
  const { email } = params;

  // URL param validation
  if (!dbName) {
    throw new Error("`dbName` is required");
  }

  // DB name
  const existingName = params.server.uri.getParam("name");
  const name = existingName || dbName;

  // Build FP URL
  const fpUrl = params.server.uri
    .build()
    .protocol("ucan:")
    .setParam("server-host", params.server.uri.toString())
    .setParam("name", name)
    .setParam("clock-id", params.clock.id.toString())
    .setParam("server-id", params.server.id.toString())
    .setParam("storekey", `@${dbName}:data@`);

  if (email) fpUrl.setParam("email", email);

  // Connect
  return connectionCache.get(fpUrl.toString()).once(() => {
    makeKeyBagUrlExtractable(sthis);
    const connection = connectionFactory(sthis, fpUrl);
    connection.connect_X(blockstore);
    return connection;
  });
}

// CLOCK
// -----

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
  const clockStore = await stateStore(storeName);
  const clock = await Client.createClock({ audience });
  const signer = clock.signer;

  if (signer === undefined) {
    throw new Error("Cannot save a clock without a signer");
  }

  const raw: AgentDataExport = {
    meta: { name: storeName, type: "service" },
    principal: signer.toArchive(),
    spaces: new Map(),
    delegations: new Map([]),
    // delegations: new Map([exportDelegation(clock.delegation)]),
  };

  await clockStore.save(raw);
  return clock;
}

export async function loadSavedClock({
  databaseName,
  storeName,
}: {
  databaseName: string;
  storeName?: string;
}): Promise<Clock | undefined> {
  storeName = storeName || clockStoreName({ databaseName });
  const clockStore = await stateStore(storeName);

  const clockExport = await clockStore.load();
  if (clockExport) {
    const delegationKey = Array.from(clockExport.delegations.keys())[0];
    const delegationBytes = delegationKey ? clockExport.delegations.get(delegationKey)?.delegation?.[0] : undefined;

    if (delegationBytes === undefined) {
      return undefined;
    }

    const delegationResult = await extract(new Uint8Array(delegationBytes.bytes));
    if (delegationResult.error) {
      throw new Error("Failed to extract delegations");
    }

    return {
      delegation: delegationResult.ok,
      id: DID.parse(clockExport.principal.id as `did:key:${string}`),
      signer: ed25519.from(clockExport.principal as SignerArchive<`did:key:${string}`, ed25519.SigAlg>),
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
// TODO

// OTHER
// -----
// TODO:
// registerClock()

// SERVER
// ------

/**
 * Determine server properties.
 * NOTE: This sends a request to the server for the DID if you don't provide it yourself.
 *       In other words, when working offline, cache the server id and provide it here.
 */
export async function server(url = "http://localhost:8787", id?: `did:${string}:${string}`): Promise<Server> {
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
