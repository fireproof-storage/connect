import { ConnectFunction, connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store";
import { bs, Database } from "@fireproof/core";
import { registerNetlifyStoreProtocol } from "./gateway";
import { KeyedResolvOnce } from "@adviser/cement";

// Usage:
//
// import { useFireproof } from 'use-fireproof'
// import { connect } from '@fireproof/netlify'
//
// const { db } = useFireproof('test')
//
// const url = URI.from("netlify://localhost:8888").build();
//
// const cx = connect.netlify(db, url);

if (
  typeof process !== "undefined" &&
  process.env &&
  !process.env.FP_KEYBAG_URL?.includes("extractKey=_deprecated_internal_api")
) {
  const url = new URL(process.env.FP_KEYBAG_URL || "file://./dist/kb-dir-netlify?fs=mem");
  url.searchParams.set("extractKey", "_deprecated_internal_api");
  process.env.FP_KEYBAG_URL = url.toString();
}

registerNetlifyStoreProtocol();

const connectionCache = new KeyedResolvOnce<bs.Connection>();
export const connect: ConnectFunction = (
  db: Database,
  remoteDbName = "",
  url = "http://localhost:8888?protocol=ws"
) => {
  const { sthis, blockstore, name: dbName } = db;
  if (!dbName) {
    throw new Error("dbName is required");
  }
  const urlObj = new URL(url);
  const existingName = urlObj.searchParams.get("name");
  urlObj.searchParams.set("name", remoteDbName || existingName || dbName);
  urlObj.searchParams.set("localName", dbName);
  urlObj.searchParams.set("storekey", `@${dbName}:data@`);
  const fpUrl = urlObj.toString().replace("http://", "netlify://").replace("https://", "netlify://");
  console.log("fpUrl", fpUrl);
  return connectionCache.get(fpUrl).once(() => {
    makeKeyBagUrlExtractable(sthis);
    console.log("Connecting to netlify", fpUrl);
    const connection = connectionFactory(sthis, fpUrl);
    connection.connect_X(blockstore);
    return connection;
  });
};
