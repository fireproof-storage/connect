import { Attachable, GatewayUrlsParam } from "@fireproof/core";
import { registerAWSStoreProtocol } from "./gateway.js";
import { BuildURI } from "@adviser/cement";

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

registerAWSStoreProtocol();

export interface AWSAttachableParams {
  readonly url: string;
  readonly region: string;
  readonly uploadUrl: string;
  readonly webSocketUrl: string;
  readonly dataUrl: string;
}

export function toAWS(ip: Partial<AWSAttachableParams> = {}): Attachable {
  const p = {
    url: "aws://aws.amazon.com",
    region: "us-east-2",
    uploadUrl: "https://7leodn3dj2.execute-api.us-east-2.amazonaws.com/uploads",
    webSocketUrl: "wss://fufauby0ii.execute-api.us-east-2.amazonaws.com/Prod",
    dataUrl: "https://fp1-uploads-201698179963.s3.us-east-2.amazonaws.com",
    ...ip,
  };
  const urlObj = BuildURI.from(p.url);
  // const existingName = urlObj.getParam("name");
  // urlObj.setParam("name", p.remoteDbName || existingName || dbName);
  // urlObj.defParam("localName", dbName);
  // urlObj.defParam("storekey", `@${dbName}:data@`);
  urlObj.defParam("region", p.region);
  urlObj.defParam("uploadUrl", p.uploadUrl);
  urlObj.defParam("webSocketUrl", p.webSocketUrl);
  urlObj.defParam("dataUrl", p.dataUrl);
  return {
    name: "aws",
    prepare(): Promise<GatewayUrlsParam> {
      return Promise.resolve({
        car: { url: urlObj },
        file: { url: urlObj },
        meta: { url: urlObj },
      });
    },
  };
}

// const connectionCache = new KeyedResolvOnce<bs.Connection>();
// export const connect: ConnectFunction = (
//   db: Database,
//   remoteDbName = "",
//   url = "aws://aws.amazon.com",
//   region = "us-east-2",
//   uploadUrl = "https://7leodn3dj2.execute-api.us-east-2.amazonaws.com/uploads",
//   webSocketUrl = "wss://fufauby0ii.execute-api.us-east-2.amazonaws.com/Prod",
//   dataUrl = "https://fp1-uploads-201698179963.s3.us-east-2.amazonaws.com"
// ) => {
//   const { sthis, name: dbName } = db;
//   if (!dbName) {
//     throw new Error("dbName is required");
//   }
//   const urlObj = BuildURI.from(url);
//   const existingName = urlObj.getParam("name");
//   urlObj.setParam("name", remoteDbName || existingName || dbName);
//   urlObj.defParam("localName", dbName);
//   urlObj.defParam("storekey", `@${dbName}:data@`);
//   urlObj.defParam("region", region);
//   urlObj.defParam("uploadUrl", uploadUrl);
//   urlObj.defParam("webSocketUrl", webSocketUrl);
//   urlObj.defParam("dataUrl", dataUrl);
//   return connectionCache.get(urlObj.toString()).once(() => {
//     makeKeyBagUrlExtractable(sthis);
//     const connection = connectionFactory(sthis, urlObj);
//     connection.connect(db.ledger.crdt.blockstore);
//     return connection;
//   });
// };
