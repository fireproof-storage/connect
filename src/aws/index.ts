import { ConnectFunction, connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store";
import { bs, Ledger } from "@fireproof/core";
import { registerAWSStoreProtocol } from "./gateway";
import { BuildURI, KeyedResolvOnce, runtimeFn } from "@adviser/cement";

// Usage:
//
// import { useFireproof } from 'use-fireproof'
// import { connect } from '@fireproof/aws'
//
// const { db } = useFireproof('test')
//
// const cx = connect.aws(db);

// TODO need to set the keybag url automatically

// if (!process.env.FP_KEYBAG_URL) {
//   process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-aws?fs=mem";
// }

if (!runtimeFn().isBrowser) {
  const url = new URL(process.env.FP_KEYBAG_URL || "file://./dist/kb-dir-aws?fs=mem");
  url.searchParams.set("extractKey", "_deprecated_internal_api");
  process.env.FP_KEYBAG_URL = url.toString();
}

registerAWSStoreProtocol();

const connectionCache = new KeyedResolvOnce<bs.Connection>();
export const connect: ConnectFunction = (
  db: Ledger,
  remoteDbName = "",
  url = "aws://aws.amazon.com",
  region = "us-east-2",
  uploadUrl = "https://7leodn3dj2.execute-api.us-east-2.amazonaws.com/uploads",
  webSocketUrl = "wss://fufauby0ii.execute-api.us-east-2.amazonaws.com/Prod",
  dataUrl = "https://fp1-uploads-201698179963.s3.us-east-2.amazonaws.com"
) => {
  const { sthis, blockstore, name: dbName } = db;
  if (!dbName) {
    throw new Error("dbName is required");
  }
  const urlObj = BuildURI.from(url);
  const existingName = urlObj.getParam("name");
  urlObj.setParam("name", remoteDbName || existingName || dbName);
  urlObj.defParam("localName", dbName);
  urlObj.defParam("storekey", `@${dbName}:data@`);
  urlObj.defParam("region", region);
  urlObj.defParam("uploadUrl", uploadUrl);
  urlObj.defParam("webSocketUrl", webSocketUrl);
  urlObj.defParam("dataUrl", dataUrl);
  return connectionCache.get(urlObj.toString()).once(() => {
    makeKeyBagUrlExtractable(sthis);
    const connection = connectionFactory(sthis, urlObj);
    connection.connect_X(blockstore);
    return connection;
  });
};
