import { registerSqliteStoreProtocol } from "./src/sql/gateway-sql.js";

registerSqliteStoreProtocol();
process.env.FP_STORAGE_URL = "sqlite://dist/fp-dir-better-sqlite3";
process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-better-sqlite3?fs=mem";
