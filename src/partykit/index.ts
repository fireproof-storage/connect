import { ConnectFunction, connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store";
import { bs, Database } from "@fireproof/core";
import { registerPartyKitStoreProtocol } from "./gateway";
import { BuildURI, KeyedResolvOnce, runtimeFn } from "@adviser/cement";

// Usage:
//
// import { useFireproof } from 'use-fireproof'
// import { connect } from '@fireproof/partykit'
//
// const { db } = useFireproof('test')
//
// const cx = connect.partykit(db);

// TODO need to set the keybag url automatically

// if (!process.env.FP_KEYBAG_URL) {
//   process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-partykit?fs=mem";
// }

if (!runtimeFn().isBrowser) {
  const url = new URL(process.env.FP_KEYBAG_URL || "file://./dist/kb-dir-partykit");
  url.searchParams.set("extractKey", "_deprecated_internal_api");
  process.env.FP_KEYBAG_URL = url.toString();
}

registerPartyKitStoreProtocol();

const connectionCache = new KeyedResolvOnce<bs.Connection>();
export const connect: ConnectFunction = (
  db: Database,
  remoteDbName = "",
  url = "partykit://localhost:1999?protocol=ws&getBaseUrl=https://pub-6bc5b83e295847498a0d16230a55d5f6.r2.dev/"
) => {
  const { sthis, blockstore, name: dbName } = db;
  if (!dbName) {
    throw new Error("dbName is required");
  }
  const urlObj = BuildURI.from(url);
  const existingName = urlObj.getParam("name");
  urlObj.defParam("name", remoteDbName || existingName || dbName);
  urlObj.defParam("localName", dbName);
  urlObj.defParam("storekey", `@${dbName}:data@`);
  const fpUrl = urlObj.toString().replace("http://", "partykit://").replace("https://", "partykit://");
  return connectionCache.get(fpUrl).once(() => {
    makeKeyBagUrlExtractable(sthis);
    const connection = connectionFactory(sthis, fpUrl);
    connection.connect_X(blockstore);
    return connection;
  });
};
