// Generated by Wrangler on Fri Aug 16 2024 13:55:06 GMT+0200 (Central European Summer Time)
// by running `wrangler types`

// import type { DurableObjectNamespace } from "@cloudflare/workers-types";
import { CFTestStorageProvider } from "./cf-test-dobj.ts";
// import { FPMetaGroups } from "./fp-meta-groups.js";
// import { WSEvents } from "hono/ws";

export interface Env {
  // bucket: R2Bucket;
  // kv_store: KVNamespace;
  NAMESPACE: KVNamespace;

  FP_STORAGE_URL: string;
  FP_KEYBAG_URL: string;
  VERSION: string;
  FP_DEBUG: string;
  FP_STACK: string;
  FP_FORMAT: string;
  FP_PROTOCOL: string;

  // STORAGE: DurableObjectStorage;
  CFTestStorage: DurableObjectStorage<CFTestStorageProvider>;
}

// declare module "cloudflare:test" {
//   // ...or if you have an existing `Env` type...
//   interface ProvidedEnv extends Env {
//     readonly test: boolean;
//   }
// }
