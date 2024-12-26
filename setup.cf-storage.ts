import { attachStorage, CFEnvAction, registerCFStoreProtocol,  } from "./src/cf-storage/cf-gateway.ts";
import { registerEnvAction, URI } from "@adviser/cement";
import { ensureSuperThis } from "@fireproof/core";
import { env } from "cloudflare:test";


registerEnvAction(() => new CFEnvAction(env));
registerCFStoreProtocol();


const sthis = ensureSuperThis();

attachStorage(URI.from(sthis.env.get("FP_STORAGE_URL")).pathname, env.STORAGE);
attachStorage(URI.from(sthis.env.get("FP_KEYBAG_URL")).pathname, env.STORAGE);

// console.log("Env", env, sthis.env.get("FP_STORAGE_URL"));

// const url = URI.from("cf://cf-test").build();
// const toSet = {
//   FP_STORAGE_URL: url.toString(),
//   FP_TEST_VERSION: unreg.version,
// };
