import { ResolveOnce } from "@adviser/cement";
import { TenantSql } from "./tenant.js";

import type { Database, Statement } from "better-sqlite3";

export interface TenantLedgerRow {
  readonly tenant: string;
  readonly ledger: string;
  readonly createdAt: Date;
}

export class TenantLedgerSql {
  static schema() {
    return [
      ...TenantSql.schema(),
      `
      CREATE TABLE IF NOT EXISTS TenantLedger(
        tenant TEXT NOT NULL,
        ledger TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        PRIMARY KEY(tenant, ledger),
        FOREIGN KEY(tenant) REFERENCES Tenant(tenant)
      )
    `,
    ];
  }

  readonly db: Database;
  readonly tenantSql: TenantSql;
  constructor(db: Database, tenantSql: TenantSql) {
    this.db = db;
    this.tenantSql = tenantSql;
  }

  readonly #sqlCreateTenantLedger = new ResolveOnce<Statement[]>();
  sqlCreateTenantLedger(): Statement[] {
    return this.#sqlCreateTenantLedger.once(() => {
      return TenantLedgerSql.schema().map((i) => this.db.prepare(i));
    });
  }

  readonly #sqlInsertTenantLedger = new ResolveOnce<Statement<[string, string, string, string, string]>>();
  sqlEnsureTenantLedger(): Statement<[string, string, string, string, string]> {
    return this.#sqlInsertTenantLedger.once(() => {
      return this.db.prepare(`
        INSERT INTO TenantLedger(tenant, ledger, createdAt)
          SELECT ?, ?, ? WHERE
            NOT EXISTS(SELECT 1 FROM TenantLedger WHERE tenant = ? and ledger = ?)
      `);
    });
  }

  async ensure(t: TenantLedgerRow) {
    await this.tenantSql.ensure(t);
    const stmt = this.sqlEnsureTenantLedger();
    return stmt.run(t.tenant, t.ledger, t.createdAt.toISOString(), t.tenant, t.ledger);
  }
}
