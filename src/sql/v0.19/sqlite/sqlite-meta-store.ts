import type { RunResult, Statement } from "better-sqlite3";
import { DBConnection, MetaRecord, MetaRecordKey, MetaSQLStore } from "../../types.js";
import { V0_19BS3Connection } from "./better-sqlite3/sqlite-connection.js";
import { KeyedResolvOnce, Logger, Result, URI, exception2Result } from "@adviser/cement";
import { ensureSqliteVersion } from "./sqlite-ensure-version.js";
import { ensureSuperLog, getStore, SuperThis } from "@fireproof/core";

// export class MetaSQLRecordBuilder {
//   readonly record: MetaRecord;
//   readonly textEncoder: TextEncoder;

//   constructor(record: MetaRecord, textEncoder: TextEncoder) {
//     this.record = record;
//     this.textEncoder = textEncoder;
//   }

//   static fromUploadMetaFnParams(
//     data: Uint8Array,
//     params: bs.UploadMetaFnParams,
//     textEncoder: TextEncoder
//   ): MetaSQLRecordBuilder {
//     return new MetaSQLRecordBuilder(
//       {
//         name: params.name,
//         branch: params.branch,
//         meta: data,
//         updated_at: new Date(),
//       },
//       textEncoder
//     );
//   }

//   static fromBytes(str: string, name: string, branch: string, textEncoder: TextEncoder): MetaSQLRecordBuilder {
//     return new MetaSQLRecordBuilder(
//       {
//         name: name,
//         branch: branch,
//         meta: textEncoder.encode(str),
//         updated_at: new Date(),
//       },
//       textEncoder
//     );
//   }

//   build(): MetaRecord {
//     return this.record;
//   }
// }

interface SQLiteMetaRecord {
  name: string;
  branch: string;
  meta: Buffer;
  updated_at: string;
}

export class V0_19_SqliteMetaStore implements MetaSQLStore {
  readonly dbConn: V0_19BS3Connection;
  readonly logger: Logger;
  readonly sthis: SuperThis;
  constructor(sthis: SuperThis, dbConn: DBConnection) {
    this.dbConn = dbConn as V0_19BS3Connection;
    this.sthis = ensureSuperLog(sthis, "V0_19_SqliteMetaStore", { url: dbConn.opts.url });
    this.logger = this.sthis.logger;
  }
  async startx(url: URI): Promise<URI> {
    this.logger.Debug().Url(url).Msg("starting");
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
            meta BLOB NOT NULL,
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
          (name, branch, meta, updated_at)
          values (@name, @branch, @meta, @updated_at)
          ON CONFLICT(name, branch) DO UPDATE SET meta=@meta, updated_at=@updated_at
          `);
    });
  }

  readonly #selectStmt = new KeyedResolvOnce<Statement>();
  private async selectStmt(url: URI) {
    return this.#selectStmt.get(this.table(url)).once(async (table) => {
      await this.createTable(url);
      return this.dbConn.client.prepare(
        `select name, branch, meta, updated_at from ${table} where name = @name and branch = @branch`
      );
    });
  }

  readonly #deleteStmt = new KeyedResolvOnce<Statement>();
  private async deleteStmt(url: URI) {
    return this.#deleteStmt.get(this.table(url)).once(async (table) => {
      await this.createTable(url);
      return this.dbConn.client.prepare(`delete from ${table} where name = @name and branch = @branch`);
    });
  }

  async insert(url: URI, ose: MetaRecord): Promise<RunResult> {
    this.logger.Debug().Url(url).Str("name", ose.name).Str("branch", ose.branch).Len(ose.meta).Msg("insert");
    const bufMeta = this.dbConn.taste.toBlob(ose.meta);
    const toInsert = this.dbConn.taste.quoteTemplate({
      name: ose.name,
      branch: ose.branch,
      meta: bufMeta,
      updated_at: ose.updated_at.toISOString(),
    });
    return this.insertStmt(url).then((i) => {
      try {
        return i.run(toInsert);
      } catch (e) {
        throw this.logger.Error().Err(e).Url(url).Any("toInsert", toInsert).Msg("insert").AsError();
      }
    });
  }
  async select(url: URI, key: MetaRecordKey): Promise<MetaRecord[]> {
    const toKey = this.dbConn.taste.quoteTemplate(key);
    this.logger.Debug().Any("key", toKey).Msg("select");
    try {
      return this.selectStmt(url).then((stmt) =>
        stmt.all(toKey).map((irow) => {
          const row = irow as SQLiteMetaRecord;
          return {
            name: row.name,
            branch: row.branch,
            meta: this.dbConn.taste.fromBlob(row.meta),
            updated_at: new Date(row.updated_at),
          };
        })
      );
    } catch (e) {
      throw this.logger.Error().Err(e).Url(url).Any("toKey", toKey).Msg("select").AsError();
    }
  }

  async delete(url: URI, key: MetaRecordKey): Promise<RunResult> {
    this.logger.Debug().Str("name", key.name).Str("branch", key.branch).Msg("delete");
    return this.deleteStmt(url).then((i) => i.run(this.dbConn.taste.quoteTemplate(key)));
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async close(url: URI): Promise<Result<void>> {
    this.logger.Debug().Msg("close");
    // await this.dbConn.close();
    return Result.Ok(undefined);
  }
  async destroy(url: URI): Promise<Result<void>> {
    return exception2Result(async () => {
      this.logger.Debug().Msg("destroy");
      await this.dbConn.client.prepare(`delete from ${this.table(url)}`).run();
    });
  }
}
