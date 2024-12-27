import { attachStorage, registerCFStoreProtocol } from "./src/cf-storage/cf-gateway.ts";
import { URI } from "@adviser/cement";
import { CFEnvActions } from "@adviser/cement/cf";
import { ensureSuperThis } from "@fireproof/core";
import { env } from "cloudflare:test";
// import { Env } from "./src/cf-storage/env.js";

CFEnvActions.inject(env);
registerCFStoreProtocol();

async function dosFnStorage() {
  const id = env.CFTestStorage.idFromName("test-storage");
  const obj = env.CFTestStorage.get(id);
  return obj;
}
async function dosFnKeyBag() {
  const id = env.CFTestStorage.idFromName("test-keybag");
  const obj = env.CFTestStorage.get(id);
  return obj;
}

const sthis = ensureSuperThis();

attachStorage(URI.from(sthis.env.get("FP_STORAGE_URL")).pathname, dosFnStorage);
attachStorage(URI.from(sthis.env.get("FP_KEYBAG_URL")).pathname, dosFnKeyBag);
