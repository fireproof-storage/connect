import { ConnectFunction, connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store";
import { registerPartyKitStoreProtocol } from "./gateway";
import { BuildURI, KeyedResolvOnce, runtimeFn } from "@adviser/cement";
import { bs, Database, fireproof } from "@fireproof/core";

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
  url = "http://localhost:1999?protocol=ws"
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

const getOrCreateRemoteName = async (dbName: string) => {
  const petnames = fireproof('petname.mappings');

  try {
    const doc = await petnames.get<{ remoteName: string; firstConnect: boolean }>(dbName);
    return { remoteName: doc.remoteName, firstConnect: false };
  } catch (error) {
    const remoteName = crypto.randomUUID();
    await petnames.put({ _id: dbName, remoteName, firstConnect: true });
    return { remoteName, firstConnect: true };
  }
};

export const cloudConnect = (db: Database) => {
  const dbName = db.name;
  if (!dbName) {
    throw new Error("Database name is required for cloud connection");
  }

  getOrCreateRemoteName(db.name).then(async ({ remoteName, firstConnect }) => {
    if (firstConnect && typeof window !== 'undefined' && window.location.href.indexOf('localhost:3000') === -1) {
      // Set firstConnect to false after opening the window, so we don't constantly annoy with the dashboard
      const petnames = fireproof('petname.mappings');
      await petnames.put({ _id: dbName, remoteName, firstConnect: false });

      const connectUrl = new URL('http://localhost:3000/fp/databases/connect');
      connectUrl.searchParams.set('localName', dbName);
      connectUrl.searchParams.set('remoteName', remoteName);
      window.open(connectUrl.toString(), '_blank');

      

    }
    return connect(db, remoteName);
  });
};
