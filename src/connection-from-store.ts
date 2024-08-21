import { CoerceURI, URI } from "@adviser/cement";
import { bs, ensureLogger, SuperThis } from "@fireproof/core";

// export interface StoreOptions {
//   readonly data: bs.DataStore;
//   readonly meta: bs.MetaStore;
//   readonly wal: bs.WALState;
// }

export class ConnectionFromStore extends bs.ConnectionBase {
  sthis: SuperThis
  stores?: {
    readonly data: bs.DataStore;
    readonly meta: bs.MetaStore;
  } = undefined;

  // readonly urlData: URI;
  // readonly urlMeta: URI;

  constructor(url: URI, sthis: SuperThis) {
    const logger = ensureLogger(sthis, "ConnectionFromStore", {
      url: () => url.toString(),
    });
    super(url, logger);
    this.sthis = sthis
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
      sthis: this.sthis,
    } as bs.Loadable;

    const srds = await storeRuntime.makeDataStore(loader)
    const d = await bs.ensureStart(srds, this.logger)
    const srms = await storeRuntime.makeMetaStore(loader)
    const m = await bs.ensureStart(srms, this.logger)
    this.stores = {
      data: d,
      meta: m,
    };
    // await this.stores.data.start();
    // await this.stores.meta.start();
    this.logger.Debug().Msg("onConnect-done");
    return;
  }
}

export async function connectionFactory(iurl: CoerceURI, sthis: SuperThis): Promise<bs.ConnectionBase> {
  //const logger = ensureLogger(sthis, "connectionFactory");
  return new ConnectionFromStore(URI.from(iurl), sthis);
}
