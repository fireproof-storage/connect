import { BuildURI, CoerceURI, KeyedResolvOnce, runtimeFn, URI } from "@adviser/cement";
import { bs, Database, fireproof } from "@fireproof/core";
import { ConnectFunction, connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store";
import { registerPartyKitStoreProtocol } from "./gateway";

interface ConnectData {
  readonly remoteName: string;
  firstConnect: boolean;
  endpoint?: string;
}

const SYNC_DB_NAME = "_fp.sync";
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

async function getOrCreateRemoteName(dbName: string) {
  const syncDb = fireproof(SYNC_DB_NAME);
  const result = await syncDb.query<string, ConnectData>("localName", { key: dbName, includeDocs: true });
  if (result.rows.length === 0) {
    const doc = { remoteName: syncDb.sthis.nextId().str, localName: dbName, firstConnect: true } as ConnectData;
    const { id } = await syncDb.put(doc);
    return { ...doc, _id: id };
  }
  const doc = result.rows[0].doc;
  return doc;
}

export function cloudConnect(
  db: Database,
  dashboardURI: CoerceURI = "https://dashboard.fireproof.storage/",
  partykitURI: CoerceURI = "https://fireproof-cloud.jchris.partykit.dev/"
) {
  const dbName = db.name as unknown as string;
  if (!dbName) {
    throw new Error("Database name is required for cloud connection");
  }

  getOrCreateRemoteName(dbName).then(async (doc) => {
    if (!doc) {
      throw new Error("Failed to get or create remote name");
    }
    if (
      doc.firstConnect &&
      runtimeFn().isBrowser &&
      window.location.href.indexOf(URI.from(dashboardURI).toString()) === -1
    ) {
      // Set firstConnect to false after opening the window, so we don't constantly annoy with the dashboard
      const syncDb = fireproof(SYNC_DB_NAME);
      doc.endpoint = URI.from(partykitURI).toString();
      doc.firstConnect = false;
      await syncDb.put(doc);

      const connectURI = URI.from(dashboardURI).build().pathname("/fp/databases/connect");

      connectURI.defParam("localName", dbName);
      connectURI.defParam("remoteName", doc.remoteName);
      if (doc.endpoint) {
        connectURI.defParam("endpoint", doc.endpoint);
      }
      console.log(connectURI.toString());
      window.open(connectURI.toString(), "_blank");
    }
    return connect(db, doc.remoteName, URI.from(doc.endpoint).toString());
  });
}
