import { BuildURI, CoerceURI, runtimeFn, URI } from "@adviser/cement";
import { bs, Database, ensureLogger, SuperThis } from "@fireproof/core";

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
    const rName = this.url.getParamResult("name");
    if (rName.isErr()) {
      throw this.logger.Error().Err(rName).Msg("missing Parameter").AsError();
    }
    const storeRuntime = bs.toStoreRuntime({ stores }, this.sthis);
    const loader = {
      name: rName.Ok(),
      ebOpts: {
        logger: this.logger,
        store: { stores },
        storeRuntime,
      },
      sthis: this.sthis,
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

export function connectionFactory(sthis: SuperThis, iurl: CoerceURI): bs.ConnectionBase {
  return new ConnectionFromStore(sthis, URI.from(iurl));
}

export function makeKeyBagUrlExtractable(sthis: SuperThis) {
  let base = sthis.env.get("FP_KEYBAG_URL");
  if (!base) {
    if (runtimeFn().isBrowser) {
      base = "indexdb://fp-keybag";
    } else {
      base = "file://./dist/kb-dir-partykit";
    }
  }
  const kbUrl = BuildURI.from(base);
  kbUrl.defParam("extractKey", "_deprecated_internal_api");
  sthis.env.set("FP_KEYBAG_URL", kbUrl.toString());
  sthis.logger.Debug().Url(kbUrl, "keyBagUrl").Msg("Make keybag url extractable");
}

export type ConnectFunction = (db: Database, name?: string, url?: string) => bs.Connection;
