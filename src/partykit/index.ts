import { ConnectFunction, connectionFactory, makeKeyBagUrlExtractable } from "../connection-from-store";
import { bs, Database } from "@fireproof/core";
import { registerPartyKitStoreProtocol } from "./gateway";
import { BuildURI, KeyedResolvOnce, runtimeFn } from "@adviser/cement";

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
  const url = BuildURI.from(process.env.FP_KEYBAG_URL || "file://./dist/kb-dir-partykit");
  url.setParam("extractKey", "_deprecated_internal_api");
  process.env.FP_KEYBAG_URL = url.toString();
}

registerPartyKitStoreProtocol();

const connectionCache = new KeyedResolvOnce<bs.Connection>();
export const connect: ConnectFunction = (
  db: Database,
  remoteDbName = "",
  url = "http://localhost:1999?protocol=ws"
) => {
  const { sthis, crdt, name: dbName } = db;
  if (!dbName) {
    throw db.logger.Error().Msg("Database name is required").AsError();
  }
  const urlObj = BuildURI.from(url);
  // const existingName = urlObj.getParam("name");
  urlObj.defParam("name", dbName() || remoteDbName);
  urlObj.defParam("localName", dbName());
  urlObj.defParam("storekey", `@${dbName()}:data@`);
  urlObj.protocol("partykit:");
  return connectionCache.get(urlObj.toString()).once(() => {
    makeKeyBagUrlExtractable(sthis);
    const connection = connectionFactory(sthis, urlObj);
    connection.connect_X(crdt.blockstore);
    return connection;
  });
};
