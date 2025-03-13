import { registerSqliteStoreProtocol } from "./src/sql/gateway-sql.js";

registerSqliteStoreProtocol();
process.env.FP_STORAGE_URL = "sqlite://dist/fp-dir-libsql?taste=libsql";
process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-libsql";
