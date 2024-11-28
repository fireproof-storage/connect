import { BuildURI } from "@adviser/cement";

// import { registerFireproofCloudStoreProtocol } from "./src/cloud/client/gateway.ts";
// import dotenv from "dotenv";

// registerFireproofCloudStoreProtocol();

// dotenv.config();

process.env.FP_STORAGE_URL = BuildURI.from("fireproof://localhost:1968")
  //  .setParam("testMode", "true")
  // .setParam("getBaseUrl", "https://storage.fireproof.direct/")
  .setParam("protocol", "ws")
  .toString();
process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-fireproof-cloud?extractKey=_deprecated_internal_api";
