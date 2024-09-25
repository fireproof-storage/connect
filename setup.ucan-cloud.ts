import { registerUCANStoreProtocol } from "./src/ucan-cloud/ucan-gateway.ts";

registerUCANStoreProtocol();

process.env.FP_STORAGE_URL = "http://localhost:8787";
process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-ucan?fs=mem&extractKey=_deprecated_internal_api";
