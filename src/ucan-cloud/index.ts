import { KeyedResolvOnce, runtimeFn } from "@adviser/cement";
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
  const url = new URL(process.env.FP_KEYBAG_URL || "file://./dist/kb-dir-ucan-cloud");
  url.searchParams.set("extractKey", "_deprecated_internal_api");
  process.env.FP_KEYBAG_URL = url.toString();
}

registerUCANStoreProtocol();

// CONNECT

const connectionCache = new KeyedResolvOnce<bs.Connection>();

export interface ConnectionParams {
  clockId?: `did:key:${string}`;
  email: `${string}@${string}`;
  serverId: `did:${string}:${string}`;
  url?: string;
}

export const connect = async (db: Database, params: ConnectionParams): Promise<bs.Connection> => {
  const { sthis, blockstore, name: dbName } = db;
  const { email } = params;
  const url = params.url || "http://localhost:8787";
  const urlObj = new URL(url);

  let clockId = params.clockId;

  // URL param validation
  if (!dbName) {
    throw new Error("`dbName` is required");
  }

  if (!email) {
    throw new Error("`email` is required");
  }

  // DB name
  const existingName = urlObj.searchParams.get("name");
  const name = existingName || dbName;

  // Server host
  const serverHostUrl = url.replace(/\/+$/, "");

  // Server id
  let serverId: `did:${string}:${string}`;

  if (params.serverId) {
    serverId = params.serverId;
  } else {
    serverId = await fetch(`${serverHostUrl}/did`)
      .then((r) => r.text())
      .then((r) => r as `did:${string}:${string}`);
  }

  // Use stored clock id if needed
  const storeName = clockStoreName({ databaseName: dbName });
  const clockStore = await stateStore(storeName);

  if (clockId === undefined) {
    const clockExport = await clockStore.load();
    if (clockExport) clockId = clockExport.principal.id as `did:key:${string}`;
  }

  // Register new clock if needed
  if (clockId === undefined) {
    const newClock = await createNewClock({
      databaseName: dbName,
      email,
      serverHost: url,
      serverId,
    });

    clockId = newClock.did();
  }

  // Add params to URL
  urlObj.searchParams.set("name", name);
  urlObj.searchParams.set("clock-id", clockId);
  urlObj.searchParams.set("email", email);
  urlObj.searchParams.set("server-host", url);
  urlObj.searchParams.set("server-id", serverId);
  urlObj.searchParams.set("storekey", `@${dbName}:data@`);

  const fpUrl = urlObj.toString().replace("http://", "ucan://").replace("https://", "ucan://");
  console.log("fpUrl", fpUrl);

  // Connect
  return connectionCache.get(fpUrl).once(() => {
    makeKeyBagUrlExtractable(sthis);
    console.log("Connecting to Fireproof Cloud", fpUrl);
    const connection = connectionFactory(sthis, fpUrl);
    connection.connect_X(blockstore);
    return connection;
  });
};
