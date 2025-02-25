import { Attachable, GatewayUrlsParam } from "@fireproof/core";
import { registerNetlifyStoreProtocol } from "./gateway.js";
import { BuildURI, runtimeFn, URI } from "@adviser/cement";

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

if (!runtimeFn().isBrowser) {
  const url = BuildURI.from(process.env.FP_KEYBAG_URL || "file://./dist/kb-dir-netlify");
  url.setParam("extractKey", "_deprecated_internal_api");
  process.env.FP_KEYBAG_URL = url.toString();
}

registerNetlifyStoreProtocol();

export function toNetlify(url = "netlify://localhost:8888?protocol=ws"): Attachable {
  const urlObj = URI.from(url);
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

// const connectionCache = new KeyedResolvOnce<bs.Connection>();
// export const connect: ConnectFunction = (
//   db: Database,
//   remoteDbName = "",
//   url = "netlify://localhost:8888?protocol=ws"
// ) => {
//   const { sthis, name: dbName } = db;
//   if (!dbName) {
//     throw new Error("dbName is required");
//   }
//   const urlObj = BuildURI.from(url);
//   const existingName = urlObj.getParam("name");
//   urlObj.defParam("name", remoteDbName || existingName || dbName);
//   urlObj.defParam("localName", dbName);
//   urlObj.defParam("storekey", `@${dbName}:data@`);
//   return connectionCache.get(urlObj.toString()).once(() => {
//     makeKeyBagUrlExtractable(sthis);
//     const connection = connectionFactory(sthis, urlObj);
//     connection.connect(db.ledger.crdt.blockstore);
//     return connection;
//   });
// };
