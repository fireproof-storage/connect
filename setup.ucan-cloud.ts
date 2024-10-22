import { registerUCANStoreProtocol } from "./src/ucan-cloud/ucan-gateway.ts";

registerUCANStoreProtocol();

const email = "example@fireproof.storage";
const protocol = "http://";
const host = "localhost:8787";
const confProfile = "fireproof";

process.env.FP_STORAGE_URL = `ucan://${host}?email=${encodeURIComponent(email)}&serverHost=${encodeURIComponent(protocol + host)}&conf-profile=${encodeURIComponent(confProfile)}`;
process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-ucan?fs=mem&extractKey=_deprecated_internal_api";
