import { Logger } from "@adviser/cement";
import { ensureLogger } from "../../utils";
import { SQLOpts, SQLTableNames, DefaultSQLTableNames } from "./types";

function sqlTableName(...names: string[]): string {
  return names
    .map((name) => name.replace(/^[^a-zA-Z0-9]+/, "").replace(/[^a-zA-Z0-9]+/g, "_"))
    .filter((i) => i.length)
    .join("_");
}

function ensureTableNames(url: URL, opts?: Partial<SQLOpts>): SQLTableNames {
  let isIndex = "";
  if (url.searchParams.has("index")) {
    isIndex = url.searchParams.get("index") || ".idx";
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

const textEncoder = new TextEncoder();
function ensureTextEncoder(opts?: Partial<SQLOpts>): TextEncoder {
  return opts?.textEncoder || textEncoder;
}

const textDecoder = new TextDecoder();
function ensureTextDecoder(opts?: Partial<SQLOpts>): TextDecoder {
  return opts?.textDecoder || textDecoder;
}

function url2sqlFlavor(url: URL): "sqlite" | "mysql" | "postgres" {
  const flavor = url.protocol.replace(/:.*$/, "");
  switch (flavor) {
    case "sqlite":
    case "mysql":
    case "postgres":
      return flavor;
    default:
      throw new Error("unsupported protocol " + flavor);
  }
}

export function ensureSQLOpts(url: URL, opts: Partial<SQLOpts>, componentName: string, ctx?: Record<string, unknown>): SQLOpts {
  return {
    url,
    sqlFlavor: url2sqlFlavor(url),
    tableNames: ensureTableNames(url, opts),
    logger: ensureLogger(opts, componentName, ctx),
    textEncoder: ensureTextEncoder(opts),
    textDecoder: ensureTextDecoder(opts),
  };
}