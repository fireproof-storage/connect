import { registerNetlifyStoreProtocol } from "./src/netlify/gateway.ts";
import { URI } from "@adviser/cement";

registerNetlifyStoreProtocol();

const url = URI.from("netlify://localhost:8888").build();

process.env.FP_STORAGE_URL = url.toString();
process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-netlify?fs=mem&extractKey=_deprecated_internal_api";
