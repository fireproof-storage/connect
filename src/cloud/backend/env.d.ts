// Generated by Wrangler on Fri Aug 16 2024 13:55:06 GMT+0200 (Central European Summer Time)
// by running `wrangler types`

import type { DurableObjectNamespace } from "@cloudflare/workers-types";
import { FPMetaGroups } from "./fp-meta-groups.js";

export interface Env {
  // bucket: R2Bucket;
  // kv_store: KVNamespace;

  ACCESS_KEY_ID: string;
  ACCOUNT_ID: string;
  BUCKET_NAME: string;
  CLOUDFLARE_API_TOKEN: string;
  EMAIL: string;
  FIREPROOF_SERVICE_PRIVATE_KEY: string;
  POSTMARK_TOKEN: string;
  SECRET_ACCESS_KEY: string;
  SERVICE_ID: string;
  STORAGE_URL: string;
  REGION: string;
  VERSION: string;
  FP_DEBUG: string;
  FP_STACK: string;
  FP_FORMAT: string;
  TEST_DATE?: string;
  MAX_IDLE_TIME?: string;

  FP_META_GROUPS: DurableObjectNamespace<FPMetaGroups>;
}

// declare module "cloudflare:test" {
//   // ...or if you have an existing `Env` type...
//   interface ProvidedEnv extends Env {
//     readonly test: boolean;
//   }
// }