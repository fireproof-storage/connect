import { ensureLogger, SuperThis } from "@fireproof/core";
import { DBConnection, SQLOpts } from "./types.js";
import { v0_19sqliteConnectionFactory } from "./v0.19/sqlite_factory.js";
import { URI } from "@adviser/cement";

export interface SQLConnectionResult {
  readonly dbConn: DBConnection;
  readonly url: URI;
}

export function SQLConnectionFactoryx(sthis: SuperThis, url: URI, opts: Partial<SQLOpts> = {}): Promise<SQLConnectionResult> {
  const logger = ensureLogger(sthis, "SQLFactory");
  switch (url.protocol) {
    case "sqlite:":
      logger.Debug().Str("databaseURL", url.toString()).Msg("connecting to sqlite");
      return v0_19sqliteConnectionFactory(sthis, url, { ...opts });
    default:
      throw logger
        .Error()
        .Msg("unsupported protocol " + url.protocol)
        .AsError();
  }
}
