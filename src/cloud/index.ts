import { BuildURI, CoerceURI, KeyedResolvOnce, runtimeFn, URI } from "@adviser/cement";
import { bs, Database, fireproof } from "@fireproof/core";
import { ConnectFunction, connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store.js";
import { registerFireproofCloudStoreProtocol } from "./gateway.js";

interface ConnectData {
  readonly remoteName: string;
  firstConnect: boolean;
  endpoint?: string;
}

const SYNC_DB_NAME = "fp_sync";

// Usage:
//
// import { useFireproof } from 'use-fireproof'
// import { connect } from '@fireproof/cloud'
//
// const { db } = useFireproof('test')
//
// const cx = connect(db);

// TODO need to set the keybag url automatically

// if (!process.env.FP_KEYBAG_URL) {
//   process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-fireproof?fs=mem";
// }

if (!runtimeFn().isBrowser) {
  const url = BuildURI.from(process.env.FP_KEYBAG_URL || "file://./dist/kb-dir-FireproofCloud");
  url.setParam("extractKey", "_deprecated_internal_api");
  process.env.FP_KEYBAG_URL = url.toString();
}

registerFireproofCloudStoreProtocol();

const connectionCache = new KeyedResolvOnce<bs.Connection>();
export const rawConnect: ConnectFunction = (
  db: Database,
  remoteDbName = "",
  url = "fireproof://cloud.fireproof.direct"
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
  urlObj.defParam("getBaseUrl", "https://storage.fireproof.direct/");
  const fpUrl = urlObj
    .toString()
    .replace(/^http:\/\//, "fireproof://")
    .replace(/^https:\/\//, "fireproof://");
  // console.log("Config URL: " + fpUrl);
  return connectionCache.get(fpUrl).once(() => {
    makeKeyBagUrlExtractable(sthis);
    const connection = connectionFactory(sthis, fpUrl);
    connection.connect_X(blockstore);
    return connection;
  });
};

async function getOrCreateRemoteName(dbName: string, remoteName?: string) {
  const syncDb = fireproof(SYNC_DB_NAME);

  const result = await syncDb.query<string, ConnectData>("localName", { key: dbName, includeDocs: true });
  if (result.rows.length === 0) {
    const doc = {
      remoteName: remoteName || syncDb.sthis.timeOrderedNextId().str,
      localName: dbName,
      firstConnect: !remoteName,
    } as ConnectData;
    const { id } = await syncDb.put(doc);
    return { ...doc, _id: id };
  }
  const doc = result.rows[0].doc;
  return doc;
}

export function connect(
  db: Database,
  remoteName?: string,
  dashboardURI: CoerceURI = "https://dashboard.fireproof.storage/",
  remoteURI: CoerceURI = "fireproof://cloud.fireproof.direct"
): Promise<bs.Connection> {
  const dbName = db.name as string;
  if (!dbName) {
    throw new Error("Database name is required for cloud connection");
  }

  return getOrCreateRemoteName(dbName, remoteName).then(async (doc) => {
    if (!doc) {
      throw new Error("Failed to get or create remote name");
    }
    doc.endpoint = URI.from(remoteURI).toString();
    const connection = rawConnect(db, doc.remoteName, URI.from(doc.endpoint).toString());
    const connectURI = URI.from(dashboardURI).build().pathname("/fp/databases/connect");
    connectURI.defParam("localName", dbName);
    connectURI.defParam("remoteName", doc.remoteName);
    if (doc.endpoint) {
      connectURI.defParam("endpoint", doc.endpoint);
    }
    // eslint-disable-next-line no-console
    console.log("Fireproof Cloud: " + connectURI.toString());
    if (
      doc.firstConnect &&
      runtimeFn().isBrowser &&
      window.location.href.indexOf(URI.from(dashboardURI).toString()) === -1
    ) {
      // Set firstConnect to false after opening the window, so we don't constantly annoy with the dashboard
      const syncDb = fireproof(SYNC_DB_NAME);
      doc.firstConnect = false;
      await syncDb.put(doc);

      // window.open(connectURI.toString(), "_blank");
    }
    connection.dashboardUrl = URI.from(connectURI);
    return connection;
  });
}
