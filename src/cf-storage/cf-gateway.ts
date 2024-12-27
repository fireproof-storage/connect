import { ResolveOnce, Result, URI, exception2Result, key } from "@adviser/cement";
import { bs, rt, Logger, NotFoundError, SuperThis, ensureLogger, falsyToUndef, Falsy } from "@fireproof/core";
// import { DurableObjectStorage } from "@cloudflare/workers-types";
import { base64pad } from "multiformats/bases/base64";

export const CF_VERSION = "v0.1-cf-gw";

// function getFromUrlAndEnv(url: URI, paramKey: string, envKey: string, destKey: string) {
//   const sparam = url.getParam(paramKey);
//   if (sparam) {
//     return {
//       [destKey]: sparam,
//     };
//   }
//   if (process.env[envKey]) {
//     return {
//       [destKey]: process.env[envKey],
//     };
//   }
//   return {};
// }

export interface StorageProvider {
  put(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | Falsy>;
  delete(key: string): Promise<void>;
}

const durableObjects = new Map<string, () => Promise<StorageProvider>>();
export async function attachStorage<T extends StorageProvider>(key: string, dosFn: () => Promise<T>): Promise<void> {
  durableObjects.set(key, dosFn);
}

async function ensureCFKey<S>(
  url: URI,
  fn: (kd: { key: string; dos: StorageProvider }) => Promise<Result<S>>
): Promise<Result<S>> {
  // const r = url.getParamsResult({ duraStorage: key.OPTIONAL }).Ok();
  const dosFn = durableObjects.get(url.pathname);
  if (!dosFn) {
    return Promise.resolve(Result.Err(new NotFoundError(`StorageProvider not found:${url.pathname}`)));
  }
  const rParams = url.getParamsResult({
    store: key.REQUIRED,
    key: key.REQUIRED,
    name: key.REQUIRED,
    index: key.OPTIONAL,
  });
  if (rParams.isErr()) {
    return Promise.resolve(Result.Err(rParams.Err()));
  }
  const params = rParams.Ok();
  let idxStr = "";
  if (params.index) {
    idxStr = `${params.index}-`;
  }
  const keyStr = `${params.name}/${idxStr}${params.store}/${params.key}`;
  const dos = await dosFn();
  // console.log("ensureCFKey", keyStr, dos.get, dos.put);
  return fn({ key: keyStr, dos });
}

export class CFGateway implements bs.Gateway {
  readonly sthis: SuperThis;
  readonly logger: Logger;
  readonly trackDestroy = new Set<string>();
  constructor(sthis: SuperThis) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "CFGateway");
  }

  buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    const url = baseUrl.build();
    url.setParam("key", key);
    return Promise.resolve(Result.Ok(url.URI()));
  }

  async destroy(_url: URI): Promise<Result<void>> {
    const toDel = new Set<string>(this.trackDestroy);
    this.trackDestroy.clear();
    for (const urlStr of toDel) {
      await this.delete(URI.from(urlStr));
    }
    return Result.Ok(undefined);
  }

  async start(url: URI): Promise<Result<URI>> {
    this.logger.Debug().Str("url", url.toString()).Msg("start");
    const ret = url.build().defParam("version", CF_VERSION).URI();
    return Result.Ok(ret);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async close(url: URI): Promise<bs.VoidResult> {
    return Result.Ok(undefined);
  }

  async put(url: URI, body: Uint8Array): Promise<bs.VoidResult> {
    return ensureCFKey(url, ({ key, dos }) => {
      this.trackDestroy.add(url.toString());
      return exception2Result(async () => await dos.put(key, base64pad.encode(body)));
    });
  }

  async get(url: URI): Promise<bs.GetResult> {
    return ensureCFKey(url, async ({ key, dos }) => {
      // console.log("key", key, dos.put, dos.get);
      const rRet = await exception2Result(async () => await dos.get(key));
      if (rRet.isErr()) {
        return Result.Err(rRet.Err());
      }
      const buffer = rRet.Ok();
      if (!buffer) {
        return Result.Err(new NotFoundError(`Not found: ${key}`));
      }
      // console.log("buffer", buffer);
      return Result.Ok(base64pad.decode(buffer));
    });
  }

  async delete(url: URI): Promise<bs.VoidResult> {
    return ensureCFKey(url, async ({ key, dos }) => {
      return exception2Result(async () => await dos.delete(key));
    });
  }
}

export class CFTestStore implements bs.TestGateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;
  readonly gateway: bs.Gateway;
  constructor(sthis: SuperThis, gw: bs.Gateway) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "CFTestStore");
    this.gateway = gw;
  }
  async get(iurl: URI, key: string): Promise<Uint8Array> {
    const url = iurl.build().setParam("key", key).URI();
    const dbFile = this.sthis.pathOps.join(rt.getPath(url, this.sthis), rt.getFileName(url, this.sthis));
    this.logger.Debug().Url(url).Str("dbFile", dbFile).Msg("get");
    const buffer = await this.gateway.get(url);
    this.logger.Debug().Url(url).Str("dbFile", dbFile).Len(buffer).Msg("got");
    return buffer.Ok();
  }
}

export interface versionUnregister {
  (): void;
  readonly version: string;
}

const once = new ResolveOnce();
export function registerCFStoreProtocol(protocol = "cf:", overrideBaseURL?: string): versionUnregister {
  return once.once(() => _registerCFStoreProtocol(protocol, overrideBaseURL));
}

function _registerCFStoreProtocol(protocol = "cf:", overrideBaseURL?: string): versionUnregister {
  // URI.protocolHasHostpart(protocol);
  const unreg: versionUnregister = (() => {
    rt.kb.registerKeyBagProviderFactory({
      protocol: "cf:",
      override: true,
      factory: async (url: URI, _sthis: SuperThis): Promise<rt.kb.KeyBagProvider> => {
        const duraObjectPath = url.pathname;
        async function ensureDos<T>(fn: (dos: StorageProvider) => Promise<T>) {
          const dosFn = durableObjects.get(duraObjectPath);
          if (!dosFn) {
            throw new NotFoundError(`DurableObject not found:${duraObjectPath}`);
          }
          return fn(await dosFn());
        }
        return {
          _prepare: (id: string): Promise<unknown> => {
            return Promise.resolve({ id });
          },
          get: async (id: string) => {
            return ensureDos(async (dos) => {
              const item = (await dos.get(id)) as string;
              if (!item) {
                return falsyToUndef(item);
              }
              return JSON.parse(item);
            });
          },
          async set(id: string, item: rt.kb.KeyItem) {
            return ensureDos((dos) => dos.put(id, JSON.stringify(item)));
          },
        } as rt.kb.KeyBagProvider;
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _f: any = bs.registerStoreProtocol({
      protocol,
      overrideBaseURL,
      gateway: async (sthis) => {
        return new CFGateway(sthis);
      },
      test: async (sthis: SuperThis) => {
        const gateway = new CFGateway(sthis);
        return new CFTestStore(sthis, gateway);
      },
    });
    _f.version = CF_VERSION;
    return _f;
  })();
  return unreg;
}
