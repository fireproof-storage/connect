import { registerFireproofCloudStoreProtocol } from "./src/cloud/gateway.ts";
import { BuildURI } from '@adviser/cement'

registerFireproofCloudStoreProtocol();

const url = BuildURI.from("fireproof://localhost:1998")
              .setParam("getBaseUrl", "http://127.0.0.1:9000/testbucket/fp-cloud-test")
              .setParam("protocol", "ws")
              .setParam("getNeedsAuth", "true")
process.env.FP_STORAGE_URL = url.toString()
process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-fireproof-cloud?extractKey=_deprecated_internal_api";
