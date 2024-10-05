import { ConnectFunction, connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store";
import { bs, Database } from "@fireproof/core";
import { registerAWSStoreProtocol } from "./gateway";
import { KeyedResolvOnce } from "@adviser/cement";

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

if (
  typeof process !== "undefined" &&
  process.env &&
  !process.env.FP_KEYBAG_URL?.includes("extractKey=_deprecated_internal_api")
) {
  const url = new URL(process.env.FP_KEYBAG_URL || "file://./dist/kb-dir-aws?fs=mem");
  url.searchParams.set("extractKey", "_deprecated_internal_api");
  process.env.FP_KEYBAG_URL = url.toString();
}

registerAWSStoreProtocol();

const connectionCache = new KeyedResolvOnce<bs.Connection>();
export const connect: ConnectFunction = (
  db: Database,
  remoteDbName = "",
  url = "https://aws.amazon.com",
  region = "us-east-2",
  uploadUrl = "https://7leodn3dj2.execute-api.us-east-2.amazonaws.com/uploads",
  webSocketUrl = "wss://fufauby0ii.execute-api.us-east-2.amazonaws.com/Prod",
  dataUrl = "https://fp1-uploads-201698179963.s3.us-east-2.amazonaws.com"
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
  urlObj.searchParams.set("region", region);
  urlObj.searchParams.set("uploadUrl", uploadUrl);
  urlObj.searchParams.set("webSocketUrl", webSocketUrl);
  urlObj.searchParams.set("dataUrl", dataUrl);
  const fpUrl = urlObj.toString().replace("https://", "aws://");
  return connectionCache.get(fpUrl).once(() => {
    makeKeyBagUrlExtractable(sthis);
    const connection = connectionFactory(sthis, fpUrl);
    connection.connect_X(blockstore);
    return connection;
  });
};
