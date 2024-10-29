import { defineWorkspace } from "vitest/config";

import aws from "./vitest.aws.config.ts";
import betterSqlite3 from "./vitest.better-sqlite3.config.ts";
import nodeSqlite3Wasm from "./vitest.node-sqlite3-wasm.config.ts";
import partykit from "./vitest.partykit.config.ts";
import cloud from "./vitest.cloud.config.ts";
import s3 from "./vitest.s3.config.ts";
// import connector from "./vitest.connector.config.ts";
import netlify from "./vitest.netlify.config.ts";
import ucan from "./vitest.ucan.config.ts";
// import cf_kv from "./vitest.cf-kv.config.ts";

export default defineWorkspace([
  nodeSqlite3Wasm,
  betterSqlite3,
  // connector,
  s3,
  aws,
  netlify,
  partykit,
  cloud,
  //cf_kv
  ucan,
]);
