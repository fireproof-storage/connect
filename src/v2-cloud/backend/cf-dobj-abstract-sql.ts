// import { DurableObject } from "cloudflare:workers";
import { SQLDatabase, sqliteCoerceParams, SQLParams, SQLStatement } from "../meta-merger/abstract-sql.js";
// import { Env } from "./env.js";
import { ExecSQLResult, FPBackendDurableObject } from "./server.js";

export class CFDObjSQLStatement implements SQLStatement {
  readonly sql: string;
  readonly db: CFDObjSQLDatabase;
  constructor(db: CFDObjSQLDatabase, sql: string) {
    this.db = db;
    this.sql = sql;
  }
  async run<T>(...params: SQLParams): Promise<T> {
    const res = (await this.db.dobj.execSql(this.sql, sqliteCoerceParams(params))) as ExecSQLResult;
    return res.rawResults[0] as T;
  }
  async all<T>(...params: SQLParams): Promise<T[]> {
    const res = (await this.db.dobj.execSql(this.sql, sqliteCoerceParams(params))) as ExecSQLResult;
    return res.rawResults as T[];
  }
}

export class CFDObjSQLDatabase implements SQLDatabase {
  readonly dobj: DurableObjectStub<FPBackendDurableObject>;
  constructor(dobj: DurableObjectStub<FPBackendDurableObject>) {
    this.dobj = dobj;
  }
  prepare(sql: string): SQLStatement {
    return new CFDObjSQLStatement(this, sql);
  }
}
