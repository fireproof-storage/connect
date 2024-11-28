import { defineWorkspace } from "vitest/config";

import aws from "./vitest.aws.config.ts";
import betterSqlite3 from "./vitest.better-sqlite3.config.ts";
// import nodeSqlite3Wasm from "./vitest.node-sqlite3-wasm.config.ts";
import libsql from "./vitest.libsql.config.ts";
// import nodeSqlite3Wasm from "./vitest.node-sqlite3-wasm.config.ts";
import partykit from "./vitest.partykit.config.ts";
import v1Cloud from "./vitest.v1-cloud.config.ts";
import s3 from "./vitest.s3.config.ts";
// import connector from "./vitest.connector.config.ts";
// import netlify from "./vitest.netlify.config.ts";
// import ucan from "./vitest.ucan.config.ts";
import cfWorker from "./vitest.cf-worker.config.ts";
import netlify from "./vitest.netlify.config.ts";
import ucan from "./vitest.ucan.config.ts";
import metaHack from "./vitest.meta-hack.config.ts";
// import cf_kv from "./vitest.cf-kv.config.ts";

export default defineWorkspace([
  // nodeSqlite3Wasm,
  betterSqlite3,
  libsql,
  // connector,
  metaHack,
  s3,
  aws,
  netlify,
  partykit,
  v1Cloud,
  cfWorker,
  ucan,
]);
