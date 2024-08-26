import { Logger, SuperThis, SysFileSystem, rt } from "@fireproof/core";
import { DataSQLStore, DBConnection, MetaSQLStore, SQLOpts, WalSQLStore } from "../types";
import { ResolveOnce, URI } from "@adviser/cement";
import { SQLConnectionResult } from "../sql-connection-factory";

export async function v0_19sqliteWalFactory(sthis: SuperThis, db: DBConnection): Promise<WalSQLStore> {
  const { V0_19_Sqlite_WalStore } = await import("./sqlite/sqlite-wal-store.js");
  return new V0_19_Sqlite_WalStore(sthis, db);
}

export async function v0_19sqliteDataFactory(sthis: SuperThis, db: DBConnection): Promise<DataSQLStore> {
  const { V0_19_SqliteDataStore } = await import("./sqlite/sqlite-data-store.js");
  return new V0_19_SqliteDataStore(sthis, db);
}

export async function v0_19sqliteMetaFactory(sthis: SuperThis, db: DBConnection): Promise<MetaSQLStore> {
  const { V0_19_SqliteMetaStore } = await import("./sqlite/sqlite-meta-store.js");
  return new V0_19_SqliteMetaStore(sthis, db);
}

// export interface Sqlite3Statement {
//     run(keys?: unknown): void;
//     all(): Promise<unknown[]>;
// }

// export interface Sqlite3Database {
//         close(): void;
//         prepare(sql: string): Sqlite3Statement;
// }

export type Sqlite3Taste = "better-sqlite3" | "node-sqlite3-wasm";
export interface TasteHandler {
  readonly taste: Sqlite3Taste;
  quoteTemplate(o: unknown): Record<string, unknown>;
  toBlob(data: Uint8Array): unknown;
  fromBlob(data: unknown): Uint8Array;
}

export abstract class Sqlite3Connection implements DBConnection {
  _client?: unknown;
  readonly taste: TasteHandler;
  readonly logger: Logger;
  readonly opts: SQLOpts;
  readonly url: URI;
  readonly sthis: SuperThis;

  constructor(sthis: SuperThis, url: URI, opts: SQLOpts, taste: TasteHandler) {
    this.sthis = sthis;
    this.url = url;
    this.logger = sthis.logger;
    this.opts = opts;
    this.taste = taste;
  }
  abstract connect(): Promise<void>;
  private readonly _fs = new ResolveOnce<SysFileSystem>();
  async fs(): Promise<SysFileSystem> {
    return this._fs.once(async () => {
      return rt.getFileSystem(URI.from("file:///"));
    })
  }
}

export async function v0_19sqliteConnectionFactory(sthis: SuperThis, url: URI, opts: Partial<SQLOpts>): Promise<SQLConnectionResult> {
  const upUrl = url.build().defParam("taste", "better-sqlite3").URI();
  switch (upUrl.getParam("taste")) {
    case "node-sqlite3-wasm": {
      const { V0_19NSWConnection } = await import("./sqlite/node-sqlite3-wasm/sqlite-connection.js");
      return {
        dbConn: new V0_19NSWConnection(sthis, upUrl, opts),
        url: upUrl.build().setParam("taste", "node-sqlite3-wasm").URI(),
      };
    }
    case "better-sqlite3":
    default: {
      const { V0_19BS3Connection } = await import("./sqlite/better-sqlite3/sqlite-connection.js");
      return {
        dbConn: new V0_19BS3Connection(sthis, upUrl, opts),
        url: upUrl.build().setParam("taste", "better-sqlite3").URI(),
      };
    }
  }
}
