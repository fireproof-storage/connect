import { registerPartyKitStoreProtocol } from "./src/partykit/gateway.ts";

registerPartyKitStoreProtocol();

process.env.FP_STORAGE_URL = "partykit://localhost:1999?protocol=ws";
process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-partykit?fs=mem&extractKey=_deprecated_internal_api";
