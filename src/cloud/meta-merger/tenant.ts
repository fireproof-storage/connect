import { ResolveOnce } from "@adviser/cement";
import type { Database, Statement } from "better-sqlite3";

export interface TenantRow {
  readonly tenant: string;
  readonly createdAt: Date;
}

export class TenantSql {
  static schema(): string[] {
    return [
      `
      CREATE TABLE IF NOT EXISTS Tenant(
        tenant TEXT NOT NULL PRIMARY KEY,
        createdAt TEXT NOT NULL
      )
    `,
    ];
  }

  readonly db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  readonly #sqlCreateTenant = new ResolveOnce<Statement[]>();
  sqlCreateTenant(): Statement[] {
    return this.#sqlCreateTenant.once(() => {
      return TenantSql.schema().map((i) => this.db.prepare(i));
    });
  }

  readonly #sqlInsertTenant = new ResolveOnce<Statement>();
  sqlEnsureTenant(): Statement<[string, string, string], void> {
    return this.#sqlInsertTenant.once(() => {
      return this.db.prepare(`
        INSERT INTO Tenant(tenant, createdAt)
          SELECT ?, ? WHERE NOT EXISTS(SELECT 1 FROM Tenant WHERE tenant = ?)
      `);
    });
  }

  async ensure(t: TenantRow) {
    const stmt = this.sqlEnsureTenant();
    return stmt.run(t.tenant, t.createdAt.toISOString(), t.tenant);
  }
}
