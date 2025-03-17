// import { DurableObject } from "cloudflare:workers";
import { SQLDatabase, sqliteCoerceParams, SQLParams, SQLStatement } from "../meta-merger/abstract-sql.js";
// import { Env } from "./env.js";
import { ExecSQLResult, FPBackendDurableObject } from "./server.js";

export class CFDObjSQLStatement implements SQLStatement {
  readonly sql: string;
  readonly db: CFDObjSQLDatabase;
  readonly isSchema: boolean;
  constructor(db: CFDObjSQLDatabase, sql: string, isSchema = false) {
    this.db = db;
    this.sql = sql;
    this.isSchema = isSchema;
  }
  async run<T>(...params: SQLParams): Promise<T> {
    // console.log("CFDObjSQLStatement.run", this.sql, params);
    const res = (await this.db.dobj.execSql(this.sql, sqliteCoerceParams(params), this.isSchema)) as ExecSQLResult;
    return res.rawResults[0] as T;
  }
  async all<T>(...params: SQLParams): Promise<T[]> {
    // console.log("CFDObjSQLStatement.all", this.sql, params);
    const res = (await this.db.dobj.execSql(this.sql, sqliteCoerceParams(params), this.isSchema)) as ExecSQLResult;
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
