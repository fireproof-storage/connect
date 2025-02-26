import { ConnectFunction, connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store.js";
import { bs, Database } from "@fireproof/core";
import { registerGDriveStoreProtocol } from "./drive-gateway.js";
import { BuildURI, KeyedResolvOnce } from "@adviser/cement";

// Usage:
//
// import { useFireproof } from 'use-fireproof'
// import { connect } from '@fireproof/drive'
// const { db } = useFireproof('test')
// const cx = connect(db);
//
// OR:
//
// const { useDocument, useLiveQuery, database } = useFireproof("testDB");
// connect(database);
// 




registerGDriveStoreProtocol();

const connectionCache = new KeyedResolvOnce<bs.Connection>();
export const connect: ConnectFunction = (
  db: Database,
  auth = 'yourtoken',
  url = "gdrive://googleapis.com/drive/v3/files/",
  remoteDbName = ""
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
  urlObj.defParam("auth", auth);
  
  return connectionCache.get(urlObj.toString()).once(() => {
    makeKeyBagUrlExtractable(sthis);
    const connection = connectionFactory(sthis, urlObj);
    connection.connect_X(blockstore);
    return connection;
  });
};
