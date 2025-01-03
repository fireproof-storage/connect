import { SQLDatabase, sqliteCoerceParams, SQLParams, SQLStatement } from "./abstract-sql.js";

import type { D1Database } from "@cloudflare/workers-types";

export class CFWorkerSQLStatement implements SQLStatement {
  readonly stmt: D1PreparedStatement;
  constructor(stmt: D1PreparedStatement) {
    this.stmt = stmt;
  }

  async run<T>(...iparams: SQLParams): Promise<T> {
    return this.stmt.bind(...sqliteCoerceParams(iparams)).run() as T;
  }
  async all<T>(...params: SQLParams): Promise<T[]> {
    const rows = await this.stmt.bind(...sqliteCoerceParams(params)).run();
    return rows.results as T[];
  }
}

export class CFWorkerSQLDatabase implements SQLDatabase {
  readonly db: D1Database;
  constructor(db: D1Database) {
    this.db = db;
  }

  prepare(sql: string): SQLStatement {
    return new CFWorkerSQLStatement(this.db.prepare(sql));
  }
}
