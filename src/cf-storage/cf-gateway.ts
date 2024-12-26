import { Result, URI, exception2Result, key, EnvActions, Env as CTEnv } from "@adviser/cement";
import { bs, rt, Logger, NotFoundError, SuperThis, ensureLogger, falsyToUndef } from "@fireproof/core";
import { DurableObjectStorage } from "@cloudflare/workers-types";
import { Env } from "./env.js"
import { base64pad } from "multiformats/bases/base64"

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

const durableObjects = new Map<string, DurableObjectStorage>();
export async function attachStorage<T extends DurableObjectStorage>(key: string, dos: T): Promise<T> {
  durableObjects.set(key, dos);
  return dos;
}

function ensureCFKey<S>(url: URI, fn: (kd: { key: string; dos: DurableObjectStorage }) => Promise<Result<S>>): Promise<Result<S>> {
  // const r = url.getParamsResult({ duraStorage: key.OPTIONAL }).Ok();
  const dos = durableObjects.get(url.pathname);
  if (!dos) {
    return Promise.resolve(Result.Err(new NotFoundError(`DurableObject not found:${url.pathname}`)));
  }
  const rParams = url.getParamsResult({
    store: key.REQUIRED,
    key: key.REQUIRED,
    index: key.OPTIONAL,
  });
  if (rParams.isErr()) {
    return Promise.resolve(Result.Err(rParams.Err()));
  }
  const params = rParams.Ok();
  let idxStr = ""
  if (params.index) {
    idxStr = `${params.index}-`
  }
  const keyStr = `${idxStr}${params.store}/${params.key}`;
  return fn({ key: keyStr, dos });
}

export class CFGateway implements bs.Gateway {
  readonly sthis: SuperThis;
  readonly logger: Logger;
  constructor(sthis: SuperThis) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "CFGateway");
  }

  buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    const url = baseUrl.build();
    url.setParam("key", key);
    return Promise.resolve(Result.Ok(url.URI()));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async destroy(iurl: URI): Promise<Result<void>> {
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
      return exception2Result(() => dos.put<string>(key, base64pad.encode(body)))
    })
  }

  async get(url: URI): Promise<bs.GetResult> {
    return ensureCFKey(url, async ({ key, dos }) => {
      const rRet = await exception2Result(() => dos.get<string>(key));
      if (rRet.isErr()) {
        return Result.Err(rRet.Err());
      }
      const buffer = rRet.Ok();
      if (!buffer) {
        return Result.Err(new NotFoundError(`Not found: ${key}`));
      }
      return Result.Ok(base64pad.decode(buffer));
    })
  }

  async delete(url: URI): Promise<bs.VoidResult> {
    return ensureCFKey(url, async ({ key, dos }) => {
      return exception2Result(() => dos.delete(key));
    })
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

export class CFEnvAction implements EnvActions {
  readonly cfEnv: Record<string, string>;
  constructor(env: Env) {
    this.cfEnv = env as unknown as Record<string, string>;
  }
  active(): boolean {
    return true;
  }
  register(env: CTEnv): CTEnv {
    return env
  }
  get(key: string): string | undefined {
    return this.cfEnv[key];
  }
  set(key: string, value?: string): void {
    if (value) {
      this.cfEnv[key] = value;
    }
  }
  delete(key: string): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.cfEnv[key];
  }
  keys(): string[] {
    return Object.keys(this.cfEnv).filter((k) => typeof this.cfEnv[k] === "string");
  }
}



export function registerCFStoreProtocol(protocol = "cf:", overrideBaseURL?: string): versionUnregister {
  // URI.protocolHasHostpart(protocol);
  const unreg: versionUnregister = (() => {

    rt.kb.registerKeyBagProviderFactory({
      protocol: "cf:",
      override: true,
      factory: async (url: URI, _sthis: SuperThis): Promise<rt.kb.KeyBagProvider> => {
        const duraObjectPath = url.pathname
        function ensureDos<T>(fn: (dos: DurableObjectStorage) => T) {
          const dos = durableObjects.get(duraObjectPath)
          if (!dos) {
            throw new NotFoundError(`DurableObject not found:${duraObjectPath}`);
          }
          return fn(dos)
        }
        return {
          get: async (id: string) => {
            return ensureDos(async (dos) => {
              const item = await dos.get(id) as string
              if (!item) {
                return falsyToUndef(item)
              }
              return JSON.parse(item)
            })
          },
          async set(id: string, item: rt.kb.KeyItem) {
            return ensureDos((dos) => dos.put(id, JSON.stringify(item)))
          }
        }
      }
    })

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
