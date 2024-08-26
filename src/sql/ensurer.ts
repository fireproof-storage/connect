import { ensureSuperLog, SuperThis } from "@fireproof/core";
import { SQLOpts, SQLTableNames, DefaultSQLTableNames, SQLGestalt } from "./types";
import { URI } from "@adviser/cement";

function sqlTableName(...names: string[]): string {
  return names
    .map((name) => name.replace(/^[^a-zA-Z0-9]+/, "").replace(/[^a-zA-Z0-9]+/g, "_"))
    .filter((i) => i.length)
    .join("_");
}

function ensureTableNames(url: URI, opts?: Partial<SQLOpts>): SQLTableNames {
  let isIndex = "";
  if (url.hasParam("index")) {
    isIndex = url.getParam("index") || ".idx";
  }
  const ret = opts?.tableNames || DefaultSQLTableNames;
  // console.log("isIndex->", opts?.url, isIndex, sqlTableName(isIndex,  ret.data));
  if (isIndex.length) {
    return {
      data: sqlTableName(isIndex, ret.data),
      meta: sqlTableName(isIndex, ret.meta),
      wal: sqlTableName(isIndex, ret.wal),
    };
  }
  return {
    data: sqlTableName(ret.data),
    meta: sqlTableName(ret.meta),
    wal: sqlTableName(ret.wal),
  };
}

function url2sqlFlavor(sthis: SuperThis, url: URI): SQLGestalt {
  const flavor = url.protocol.replace(/:.*$/, "");
  switch (flavor) {
    case "sqlite":
      return {
        flavor: "sqlite",
        version: url.getParam("version"),
        taste: url.getParam("taste"),
      };
    default:
      throw sthis.logger.Error().Str("flavor", flavor).Msg("unsupported protocol").AsError();
  }
}

export function ensureSQLOpts(
  sthis: SuperThis,
  url: URI,
  opts: Partial<SQLOpts>,
): SQLOpts {
  return {
    url,
    sqlGestalt: url2sqlFlavor(sthis, url),
    tableNames: ensureTableNames(url, opts),
  };
}
