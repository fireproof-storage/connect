import { KeyedResolvOnce, runtimeFn } from "@adviser/cement";
import { bs, Database } from "@fireproof/core";

import { connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store";
import { registerUCANStoreProtocol } from "./ucan-gateway";

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

export const connect = (db: Database, email: `${string}@${string}`, url = "http://localhost:8787"): bs.Connection => {
  const { sthis, blockstore, name: dbName } = db;

  if (!dbName) {
    throw new Error("`dbName` is required");
  }

  if (!email) {
    throw new Error("`email` is required");
  }

  const urlObj = new URL(url);
  const existingName = urlObj.searchParams.get("name");
  urlObj.searchParams.set("name", existingName || dbName);
  urlObj.searchParams.set("email", email);
  urlObj.searchParams.set("localName", dbName);
  urlObj.searchParams.set("serverHost", url);
  urlObj.searchParams.set("storekey", `@${dbName}:data@`);
  const fpUrl = urlObj.toString().replace("http://", "ucan://").replace("https://", "ucan://");
  console.log("fpUrl", fpUrl);

  return connectionCache.get(fpUrl).once(() => {
    makeKeyBagUrlExtractable(sthis);
    console.log("Connecting to Fireproof Cloud", fpUrl);
    const connection = connectionFactory(sthis, fpUrl);
    connection.connect_X(blockstore);
    return connection;
  });
};
