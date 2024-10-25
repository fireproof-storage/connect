import { KeyedResolvOnce, runtimeFn, BuildURI, CoerceURI } from "@adviser/cement";
import { bs, Database } from "@fireproof/core";

import { connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store";
import { registerUCANStoreProtocol } from "./ucan-gateway";
import { clockStoreName, createNewClock } from "./common";
import stateStore from "./store/state";

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
  readonly clockId?: `did:key:${string}`;
  readonly email: `${string}@${string}`;
  readonly serverId?: `did:${string}:${string}`;
  readonly didServerURL?: CoerceURI;
}

export async function connect(db: Database, params: ConnectionParams): Promise<bs.Connection> {
  const { sthis, blockstore, name: dbName } = db;
  const { email } = params;
  const didServerUrl = BuildURI.from(params.didServerURL || "http://localhost:8787");

  // URL param validation
  if (!dbName) {
    throw new Error("`dbName` is required");
  }

  if (!email) {
    throw new Error("`email` is required");
  }

  // DB name
  const existingName = didServerUrl.getParam("name");
  const name = existingName || dbName;

  // Server host
  // const serverHostUrl = url.replace(/\/+$/, "");

  // Server id
  let serverId: `did:${string}:${string}`;

  if (params.serverId) {
    serverId = params.serverId;
  } else {
    serverId = await fetch(didServerUrl.pathname("/did").asURL())
      .then((r) => r.text())
      .then((r) => r as `did:${string}:${string}`);
  }

  // Use stored clock id if needed
  const storeName = clockStoreName({ databaseName: dbName });
  const clockStore = await stateStore(storeName);

  let clockId = params.clockId;
  if (!clockId) {
    const clockExport = await clockStore.load();
    if (clockExport) clockId = clockExport.principal.id as `did:key:${string}`;
  }
  // Register new clock if needed
  if (!clockId) {
    const newClock = await createNewClock({
      databaseName: dbName,
      email,
      serverURI: didServerUrl.URI(),
      serverId,
    });

    clockId = newClock.did();
  }

  const fpUrl = BuildURI.from(didServerUrl.toString())
    .protocol("ucan:")
    .setParam("server-host", didServerUrl.toString())
    .setParam("name", name)
    .setParam("clock-id", clockId)
    .setParam("email", email)
    .setParam("server-id", serverId)
    .setParam("storekey", `@${dbName}:data@`);
  // eslint-disable-next-line no-console
  console.log("fpUrl", fpUrl.toString());
  // Connect
  return connectionCache.get(fpUrl.toString()).once(() => {
    makeKeyBagUrlExtractable(sthis);
    // eslint-disable-next-line no-console
    console.log("Connecting to Fireproof Cloud", fpUrl);
    const connection = connectionFactory(sthis, fpUrl);
    connection.connect_X(blockstore);
    return connection;
  });
}
