import type { RunResult, Statement } from "better-sqlite3";
import { DBConnection, WalKey, WalRecord, WalSQLStore } from "../../types.js";
import { V0_19BS3Connection } from "./better-sqlite3/sqlite-connection.js";
import { KeyedResolvOnce, Logger, Result, URI } from "@adviser/cement";
import { ensureSqliteVersion } from "./sqlite-ensure-version.js";
import { ensureSuperLog, exception2Result, getStore, SuperThis } from "@fireproof/core";

export class WalSQLRecordBuilder {
  readonly #record: WalRecord;

  constructor(record: WalRecord) {
    this.#record = record;
  }

  static fromRecord(record: WalRecord): WalSQLRecordBuilder {
    return new WalSQLRecordBuilder(record);
  }

  build(): WalRecord {
    return this.#record;
  }
}

interface SQLiteWalRecord {
  readonly name: string;
  readonly branch: string;
  readonly state: Buffer;
  readonly updated_at: string;
}

export class V0_19_Sqlite_WalStore implements WalSQLStore {
  readonly dbConn: V0_19BS3Connection;
  readonly logger: Logger;
  readonly sthis: SuperThis;
  constructor(sthis: SuperThis, dbConn: DBConnection) {
    this.dbConn = dbConn as V0_19BS3Connection;
    this.sthis = ensureSuperLog(sthis, "V0_19_Sqlite_WalStore", { url: dbConn.opts.url });
    this.logger = this.sthis.logger
  }
  async startx(url: URI): Promise<URI> {
    this.logger.Debug().Msg("start");
    await this.dbConn.connect();
    const ret = await ensureSqliteVersion(this.sthis, url, this.dbConn);
    this.logger.Debug().Url(ret).Msg("started");
    return ret;
  }

  table(url: URI): string {
    return getStore(url, this.sthis, (...x: string[]) => x.join("_")).name;
  }

  readonly #createTable = new KeyedResolvOnce();
  async createTable(url: URI) {
    return this.#createTable.get(this.table(url)).once(async (table) => {
      await this.dbConn.client
        .prepare(
          `CREATE TABLE IF NOT EXISTS ${table} (
            name TEXT not null,
            branch TEXT not null,
            state BLOB NOT NULL,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (name, branch)
        )`
        )
        .run();
    });
  }

  readonly #insertStmt = new KeyedResolvOnce<Statement>();
  private async insertStmt(url: URI) {
    return this.#insertStmt.get(this.table(url)).once(async (table) => {
      await this.createTable(url);
      return this.dbConn.client.prepare(`insert into ${table}
      (name, branch, state, updated_at)
      values (@name, @branch, @state, @updated_at)
      ON CONFLICT(name, branch) DO UPDATE SET state=@state, updated_at=@updated_at
      `);
    });
  }

  readonly #selectStmt = new KeyedResolvOnce<Statement>();
  private async selectStmt(url: URI) {
    return this.#selectStmt.get(this.table(url)).once(async (table) => {
      await this.createTable(url);
      return this.dbConn.client.prepare(
        `select name, branch, state, updated_at from ${table}
         where name = @name and branch = @branch`
      );
    });
  }

  readonly #deleteStmt = new KeyedResolvOnce<Statement>();
  private async deleteStmt(url: URI) {
    return this.#deleteStmt.get(this.table(url)).once(async (table) => {
      await this.createTable(url);
      return this.dbConn.client.prepare(
        `delete from ${table} where name = @name and branch = @branch`
      ) as unknown as Statement;
    });
  }

  async insert(url: URI, ose: WalRecord): Promise<RunResult> {
    const wal = WalSQLRecordBuilder.fromRecord(ose).build();
    const bufState = this.dbConn.taste.toBlob(this.sthis.txt.encode(JSON.stringify(wal.state)));
    return this.insertStmt(url).then((i) =>
      i.run(
        this.dbConn.taste.quoteTemplate({
          name: ose.name,
          branch: ose.branch,
          state: bufState,
          updated_at: wal.updated_at.toISOString(),
        })
      )
    );
  }

  async select(url: URI, key: WalKey): Promise<WalRecord[]> {
    const res = (await this.selectStmt(url).then((i) => i.all(this.dbConn.taste.quoteTemplate(key)))).map((irow) => {
      const row = irow as SQLiteWalRecord;
      return {
        name: row.name,
        branch: row.branch,
        state: this.dbConn.taste.fromBlob(row.state),
        updated_at: new Date(row.updated_at),
      };
    });
    this.logger.Debug().Str("name", key.name).Str("branch", key.branch).Uint64("res", res.length).Msg("select");
    return res;
  }

  async delete(url: URI, key: WalKey): Promise<RunResult> {
    this.logger.Debug().Str("name", key.name).Str("branch", key.branch).Msg("delete");
    return this.deleteStmt(url).then((i) => i.run(this.dbConn.taste.quoteTemplate(key)));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async close(url: URI): Promise<Result<void>> {
    this.logger.Debug().Msg("close");
    return Result.Ok(undefined);
  }
  async destroy(url: URI): Promise<Result<void>> {
    return exception2Result(async () => {
      this.logger.Debug().Msg("destroy");
      await this.createTable(url);
      await this.dbConn.client.prepare(`delete from ${this.table(url)}`).run();
    });
  }
}
