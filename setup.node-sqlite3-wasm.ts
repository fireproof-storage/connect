import { registerSqliteStoreProtocol } from "./src/store-sql/store-sql.js";

registerSqliteStoreProtocol();
process.env.FP_STORAGE_URL = "sqlite://dist/fp-dir-node-sqlite3-wasm?taste=node-sqlite3-wasm";