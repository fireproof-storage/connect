// import { Logger } from "@adviser/cement";
import { ensureLogger, SuperThis } from "@fireproof/core";
import { DBConnection, DataSQLStore, MetaSQLStore, WalSQLStore } from "./types.js";
import { v0_19sqliteDataFactory, v0_19sqliteMetaFactory, v0_19sqliteWalFactory } from "./v0.19/sqlite_factory.js";
// import { SQLITE_VERSION } from "./v0.19-better-sqlite3/version";

// export function prepareSQLVersion(iurl: URL, opts: LoggerOpts | Logger): URL {
//   if (iurl.searchParams.get("version")) return iurl;
//   const url = new URL(iurl.toString());
//   switch (url.protocol) {
//     case "sqlite:":
//       {
//         url.searchParams.set("version", SQLITE_VERSION);
//       }
//       break;
//     default:
//       throw ensureLogger(opts, "ensureSQLVersion").Error().Str("url", url.toString()).Msg("unsupported protocol").AsError();
//   }
//   return url;
// }

export async function WalStoreFactory(sthis: SuperThis, db: DBConnection): Promise<WalSQLStore> {
  switch (db.opts.sqlGestalt.flavor) {
    case "sqlite":
      return v0_19sqliteWalFactory(sthis, db);
    default:
      throw ensureLogger(sthis, "WalStoreFactory").Error().Msg("unsupported db connection").AsError();
  }
}

export async function DataStoreFactory(sthis: SuperThis, db: DBConnection): Promise<DataSQLStore> {
  switch (db.opts.sqlGestalt.flavor) {
    case "sqlite":
      return v0_19sqliteDataFactory(sthis, db);
    default:
      throw ensureLogger(sthis, "DataStoreFactory").Error().Msg("unsupported db connection").AsError();
  }
}

export async function MetaStoreFactory(sthis: SuperThis, db: DBConnection): Promise<MetaSQLStore> {
  switch (db.opts.sqlGestalt.flavor) {
    case "sqlite":
      return v0_19sqliteMetaFactory(sthis, db);
    default:
      throw ensureLogger(sthis, "MetaStoreFactory").Error().Msg("unsupported db connection").AsError();
  }
}
