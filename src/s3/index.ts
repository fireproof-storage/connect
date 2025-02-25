import { CoerceURI, URI } from "@adviser/cement";
import { Attachable, GatewayUrlsParam } from "@fireproof/core";
import { registerS3StoreProtocol } from "./s3-gateway.js";

// Usage:
//
// import { useFireproof } from 'use-fireproof'
// import { connect } from '@fireproof/s3'
//
// const { db } = useFireproof('test')
//
// const url = URI.from("s3://testbucket/fp-test").build();
// url.setParam("region", "eu-central-1");
// url.setParam("accessKey", "minioadmin");
// url.setParam("secretKey", "minioadmin");
// url.setParam("ensureBucket", "true");
// url.setParam("endpoint", "http://127.0.0.1:9000");
//
// const cx = connect.s3(db, url);

// export const connect = {
//   s3: async (db: Database, url?: CoerceURI) => {
//     const { sthis } = db;
//     const connection = await connectionFactory(sthis, url);
//     await connection.connect(db.ledger.crdt.blockstore);
//     // return connection;
//   },
// };

registerS3StoreProtocol();

export function toS3(url: CoerceURI): Attachable {
  const urlObj = URI.from(url);
  if (urlObj.protocol !== "s3") {
    throw new Error("url must have s3 protocol");
  }
  // const existingName = urlObj.getParam("name");
  // urlObj.defParam("name", remoteDbName || existingName || dbName);
  // urlObj.defParam("localName", dbName);
  // urlObj.defParam("storekey", `@${dbName}:data@`);
  return {
    name: urlObj.protocol,
    prepare(): Promise<GatewayUrlsParam> {
      return Promise.resolve({
        car: { url: urlObj },
        file: { url: urlObj },
        meta: { url: urlObj },
      });
    },
  };
}
