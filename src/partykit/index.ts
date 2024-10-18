import { BuildURI, CoerceURI, KeyedResolvOnce, runtimeFn, URI } from "@adviser/cement";
import { bs, Database, fireproof } from "@fireproof/core";
import { ConnectFunction, connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store";
import { registerPartyKitStoreProtocol } from "./gateway";

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
  const petnames = fireproof("petname.mappings");
  try {
    const result = await petnames.query<string, { remoteName: string; firstConnect: boolean }>('localName', { key: dbName, includeDocs: true })
    if (result.rows.length === 0) {
      const doc = { remoteName: petnames.sthis.nextId().str, firstConnect: true };
      await petnames.put(doc);
      return doc;
    }
    const doc = result.rows[0].doc as { remoteName: string; }
    return { remoteName: doc.remoteName, firstConnect: false };
  } catch (_error) {
    const remoteName = petnames.sthis.nextId().str;
    await petnames.put({ _id: dbName, remoteName, firstConnect: true });
    return { remoteName };
  }
}

export function cloudConnect(
  db: Database,
  dashboardURI = URI.from("https://dashboard.fireproof.storage/"),
  partykitURL: CoerceURI = "https://fireproof-cloud.jchris.partykit.dev/"
) {
  const dbName = db.name;
  if (!dbName) {
    throw new Error("Database name is required for cloud connection");
  }

  getOrCreateRemoteName(dbName).then(async ({ remoteName, firstConnect = true }) => {
    if (firstConnect && runtimeFn().isBrowser && window.location.href.indexOf(dashboardURI.toString()) === -1) {
      // Set firstConnect to false after opening the window, so we don't constantly annoy with the dashboard
      const petnames = fireproof("petname.mappings");
      await petnames.put({ localName: dbName, remoteName: remoteName, endpoint: partykitURL, firstConnect: false });

      const connectURI = dashboardURI.build().pathname("/fp/databases/connect");

      connectURI.defParam("localName", dbName);
      connectURI.defParam("remoteName", remoteName);
      window.open(connectURI.toString(), "_blank");
    }
    return connect(db, remoteName, URI.from(partykitURL).toString());
  });
}
