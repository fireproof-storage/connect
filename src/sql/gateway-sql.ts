import { Logger, ResolveOnce, Result, URI, exception2Result } from "@adviser/cement";

// import { TestStore } from "../../blockstore/types.js";
import { SQLConnectionFactoryx } from "./sql-connection-factory.js";
import { DataSQLStore, MetaSQLStore, WalSQLStore } from "./types.js";
import { DataStoreFactory, MetaStoreFactory, WalStoreFactory } from "./store-version-factory.js";
import { exceptionWrapper, getKey, getName, bs, NotFoundError, SuperThis, ensureSuperLog } from "@fireproof/core";

export class SQLWalGateway implements bs.Gateway {
  readonly storeType = "wal";
  readonly logger: Logger;
  readonly sthis: SuperThis;
  walSQLStore: WalSQLStore = {} as WalSQLStore;
  constructor(_sthis: SuperThis) {
    this.sthis = ensureSuperLog(_sthis, "SQLWalGateway");
    this.logger = this.sthis.logger;
  }

  buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    const url = baseUrl.build().setParam("key", key).URI();
    return Promise.resolve(Result.Ok(url));
  }

  async start(baseUrl: URI): Promise<Result<URI>> {
    return exception2Result(async () => {
      this.logger.Debug().Url(baseUrl).Msg("start");
      const conn = await SQLConnectionFactoryx(this.sthis, baseUrl);
      const ws = await WalStoreFactory(this.sthis, conn.dbConn);
      const upUrl = await ws.start(conn.url);
      this.walSQLStore = ws;
      this.logger.Debug().Url(upUrl).Msg("started");
      return upUrl;
    });
  }
  close(baseUrl: URI) {
    return this.walSQLStore.close(baseUrl);
  }
  destroy(baseUrl: URI) {
    return this.walSQLStore.destroy(baseUrl);
  }

  async put(url: URI, body: Uint8Array): Promise<Result<void>> {
    return exception2Result(async () => {
      const branch = getKey(url, this.logger);
      const name = getName(this.sthis, url);
      await this.walSQLStore.insert(url, {
        state: body,
        updated_at: new Date(),
        name,
        branch,
      });
    });
  }
  async get(url: URI): Promise<bs.GetResult> {
    return exceptionWrapper(async () => {
      const branch = getKey(url, this.logger);
      const name = getName(this.sthis, url);
      const record = await this.walSQLStore.select(url, { name, branch });
      if (record.length === 0) {
        return Result.Err(new NotFoundError(`not found ${name} ${branch}`));
      }
      return Result.Ok(record[0].state);
    });
  }
  async delete(url: URI): Promise<Result<void>> {
    return exception2Result(async () => {
      const branch = getKey(url, this.logger);
      const name = getName(this.sthis, url);
      await this.walSQLStore.delete(url, { name, branch });
    });
  }

  async getPlain(url: URI, key: string): Promise<Result<Uint8Array>> {
    const conn = await SQLConnectionFactoryx(this.sthis, url);
    const name = getName(this.sthis, url);
    const sqlStore = await WalStoreFactory(this.sthis, conn.dbConn);
    const surl = await sqlStore.start(url);
    const records = await sqlStore.select(surl, {
      name,
      branch: key,
    });
    return Result.Ok(records[0].state);
  }
}

export class SQLMetaGateway implements bs.Gateway {
  readonly storeType = "meta";
  readonly logger: Logger;
  readonly sthis: SuperThis;
  metaSQLStore: MetaSQLStore = {} as MetaSQLStore;
  constructor(sthis: SuperThis) {
    this.sthis = ensureSuperLog(sthis, "SQLMetaGateway");
    this.logger = this.sthis.logger;
  }

  buildUrl(url: URI, key: string): Promise<Result<URI>> {
    return Promise.resolve(Result.Ok(url.build().setParam("key", key).URI()));
  }

  async start(baseUrl: URI): Promise<Result<URI>> {
    return exception2Result(async () => {
      this.logger.Debug().Url(baseUrl).Msg("start");
      const conn = await SQLConnectionFactoryx(this.sthis, baseUrl);
      const ws = await MetaStoreFactory(this.sthis, conn.dbConn);
      const upUrl = await ws.start(conn.url);
      this.metaSQLStore = ws;
      this.logger.Debug().Url(upUrl).Msg("started");
      return upUrl;
    });
  }
  close(baseUrl: URI): Promise<Result<void>> {
    return this.metaSQLStore.close(baseUrl);
  }
  destroy(baseUrl: URI): Promise<Result<void>> {
    return this.metaSQLStore.destroy(baseUrl);
  }

  async put(url: URI, body: Uint8Array): Promise<Result<void>> {
    return exception2Result(async () => {
      const branch = getKey(url, this.logger);
      const name = getName(this.sthis, url);
      await this.metaSQLStore.insert(url, {
        meta: body,
        updated_at: new Date(),
        name,
        branch,
      });
    });
  }
  async get(url: URI): Promise<bs.GetResult> {
    return exceptionWrapper(async () => {
      const branch = getKey(url, this.logger);
      const name = getName(this.sthis, url);
      const record = await this.metaSQLStore.select(url, {
        name,
        branch,
      });
      if (record.length === 0) {
        return Result.Err(new NotFoundError(`not found ${name} ${branch}`));
      }
      return Result.Ok(record[0].meta);
    });
  }
  async delete(url: URI): Promise<Result<void>> {
    return exception2Result(async () => {
      const branch = getKey(url, this.logger);
      const name = getName(this.sthis, url);
      await this.metaSQLStore.delete(url, {
        name,
        branch,
      });
    });
  }

  async getPlain(url: URI, key: string): Promise<Result<Uint8Array>> {
    const conn = await SQLConnectionFactoryx(this.sthis, url);
    const name = getName(this.sthis, url);
    const sqlStore = await MetaStoreFactory(this.sthis, conn.dbConn);
    const surl = await sqlStore.start(url);
    const records = await sqlStore.select(surl, {
      name,
      branch: key,
    });
    return Result.Ok(records[0].meta);
  }
}

export class SQLDataGateway implements bs.Gateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;
  dataSQLStore: DataSQLStore = {} as DataSQLStore;
  constructor(sthis: SuperThis) {
    this.sthis = ensureSuperLog(sthis, "SQLDataGateway");
    this.logger = this.sthis.logger;
  }

  buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    return Promise.resolve(Result.Ok(baseUrl.build().setParam("key", key).URI()));
  }

  async start(baseUrl: URI): Promise<Result<URI>> {
    return exception2Result(async () => {
      this.logger.Debug().Url(baseUrl).Msg("pre-sql-connection");
      const conn = await SQLConnectionFactoryx(this.sthis, baseUrl);
      this.logger.Debug().Url(baseUrl).Msg("post-sql-connection");
      const ws = await DataStoreFactory(this.sthis, conn.dbConn);
      this.logger.Debug().Url(conn.url).Msg("post-data-store-factory");
      const upUrl = await ws.start(conn.url);
      this.dataSQLStore = ws;
      this.logger.Debug().Url(upUrl).Msg("started");
      return upUrl;
    });
  }
  close(baseUrl: URI): Promise<Result<void>> {
    return this.dataSQLStore.close(baseUrl);
  }
  destroy(baseUrl: URI): Promise<Result<void>> {
    return this.dataSQLStore.destroy(baseUrl);
  }

  async put(url: URI, body: Uint8Array): Promise<Result<void>> {
    return exception2Result(async () => {
      const cid = getKey(url, this.logger);
      const name = getName(this.sthis, url);
      await this.dataSQLStore.insert(url, {
        data: body,
        updated_at: new Date(),
        name: name,
        car: cid,
      });
    });
  }
  async get(url: URI): Promise<bs.GetResult> {
    return exceptionWrapper(async () => {
      const branch = getKey(url, this.logger);
      const record = await this.dataSQLStore.select(url, branch);
      if (record.length === 0) {
        return Result.Err(new NotFoundError(`not found ${branch}`));
      }
      return Result.Ok(record[0].data);
    });
  }
  async delete(url: URI): Promise<Result<void>> {
    return exception2Result(async () => {
      const branch = getKey(url, this.logger);
      await this.dataSQLStore.delete(url, branch);
      return Result.Ok(undefined);
    });
  }
  async getPlain(url: URI, key: string): Promise<Result<Uint8Array>> {
    const conn = await SQLConnectionFactoryx(this.sthis, url);
    const sqlStore = await DataStoreFactory(this.sthis, conn.dbConn);
    const surl = await sqlStore.start(url);
    const records = await sqlStore.select(surl, key);
    return Result.Ok(records[0].data);
  }
}

class SQLStoreGateway implements bs.Gateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;
  constructor(sthis: SuperThis) {
    this.sthis = ensureSuperLog(sthis, "SQLStoreGateway");
    this.logger = this.sthis.logger;
  }

  async buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    return (await this.getGateway(baseUrl)).buildUrl(baseUrl, key);
  }
  async start(baseUrl: URI): Promise<Result<URI>> {
    return (await this.getGateway(baseUrl)).start(baseUrl);
  }
  async close(baseUrl: URI): Promise<Result<void, Error>> {
    return (await this.getGateway(baseUrl)).close(baseUrl);
  }
  async destroy(baseUrl: URI): Promise<Result<void, Error>> {
    return (await this.getGateway(baseUrl)).destroy(baseUrl);
  }
  async put(url: URI, body: Uint8Array): Promise<Result<void, Error>> {
    return (await this.getGateway(url)).put(url, body);
  }
  async get(url: URI): Promise<Result<Uint8Array, Error | NotFoundError>> {
    return (await this.getGateway(url)).get(url);
  }
  async delete(url: URI): Promise<Result<void, Error>> {
    return (await this.getGateway(url)).delete(url);
  }
  async getPlain(url: URI, key: string): Promise<Result<Uint8Array, Error>> {
    return (await this.getGateway(url)).getPlain(url, key);
  }

  readonly walGateway = new ResolveOnce<SQLWalGateway>();
  readonly dataGateway = new ResolveOnce<SQLDataGateway>();
  readonly metaGateway = new ResolveOnce<SQLMetaGateway>();
  async getGateway(url: URI) {
    const store = url.getParam("store");
    switch (store) {
      case "wal":
        return this.walGateway.once(async () => {
          return new SQLWalGateway(this.sthis);
        });
      case "meta":
        return this.metaGateway.once(async () => {
          return new SQLMetaGateway(this.sthis);
        });
      case "data":
        return this.dataGateway.once(async () => {
          return new SQLDataGateway(this.sthis);
        });
      default:
        throw this.logger.Error().Str("store", store).Msg(`Method not implemented`);
    }
  }
}

const _register = new ResolveOnce<boolean>();

export function registerSqliteStoreProtocol() {
  return _register.once(() => {
    return bs.registerStoreProtocol({
      protocol: "sqlite:",
      defaultURI: () => URI.from("sqlite://localhost"),
      gateway: async (sthis) => {
        return new SQLStoreGateway(sthis);
      },
      // test: async (sthis) => {
      //   return new SQLTestStore(sthis);
      // },
    });
  });
}
