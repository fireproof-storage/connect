import { registerSqliteStoreProtocol } from "./src/sql/gateway-sql.js";

registerSqliteStoreProtocol();
process.env.FP_STORAGE_URL = "sqlite://dist/fp-dir-node-sqlite3-wasm?taste=node-sqlite3-wasm";
process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-node-sqlite3-warm?fs=mem";
