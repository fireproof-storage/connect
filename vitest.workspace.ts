import { defineWorkspace } from "vitest/config";

import aws from "./vitest.aws.config.ts";
import betterSqlite3 from "./vitest.better-sqlite3.config.ts";
import nodeSqlite3Wasm from "./vitest.node-sqlite3-wasm.config.ts";
import partykit from "./vitest.partykit.config.ts";
import s3 from "./vitest.s3.config.ts";
// import connector from "./vitest.connector.config.ts";
import netlify from "./vitest.netlify.config.ts";
// import cf_kv from "./vitest.cf-kv.config.ts";

void nodeSqlite3Wasm;
void betterSqlite3;
void netlify;
void aws;
void partykit;
void s3;

export default defineWorkspace([
  // nodeSqlite3Wasm,
  // betterSqlite3,
  // connector,
  // s3,
  aws,
  // netlify,
  // partykit,
  //cf_kv
]);
