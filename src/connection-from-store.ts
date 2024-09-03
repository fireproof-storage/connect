import { CoerceURI, URI } from "@adviser/cement";
import { bs, ensureLogger, SuperThis } from "@fireproof/core";

// export interface StoreOptions {
//   readonly data: bs.DataStore;
//   readonly meta: bs.MetaStore;
//   readonly wal: bs.WALState;
// }

export class ConnectionFromStore extends bs.ConnectionBase {
  stores?: {
    readonly data: bs.DataStore;
    readonly meta: bs.MetaStore;
  } = undefined;

  // readonly urlData: URI;
  // readonly urlMeta: URI;

  readonly sthis: SuperThis;
  constructor(sthis: SuperThis, url: URI) {
    const logger = ensureLogger(sthis, "ConnectionFromStore", {
      url: () => url.toString(),
      this: 1,
      log: 1,
    });
    super(url, logger);
    this.sthis = sthis;
    // this.urlData = url;
    // this.urlMeta = url;
  }
  async onConnect(): Promise<void> {
    this.logger.Debug().Msg("onConnect-start");
    const stores = {
      base: this.url,
      // data: this.urlData,
      // meta: this.urlMeta,
    };
    const storeRuntime = bs.toStoreRuntime({ stores }, this.sthis);
    const loader = {
      // name: this.url.toString(),
      ebOpts: {
        logger: this.logger,
        store: { stores },
        storeRuntime,
      },
    } as bs.Loadable;

    this.stores = {
      data: await storeRuntime.makeDataStore(loader),
      meta: await storeRuntime.makeMetaStore(loader),
    };
    // await this.stores.data.start();
    // await this.stores.meta.start();
    this.logger.Debug().Msg("onConnect-done");
    return;
  }
}

export async function connectionFactory(sthis: SuperThis, iurl: CoerceURI): Promise<bs.ConnectionBase> {
  return new ConnectionFromStore(sthis, URI.from(iurl));
}
