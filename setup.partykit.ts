import { registerPartyKitStoreProtocol } from "./src/partykit/gateway.ts";

registerPartyKitStoreProtocol();

process.env.FP_STORAGE_URL = "partykit://fireproof-cloud.jchris.workers.dev?getBaseUrl=https://pub-6bc5b83e295847498a0d16230a55d5f6.r2.dev/";
process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-partykit?extractKey=_deprecated_internal_api";
