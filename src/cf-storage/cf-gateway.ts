import { Result, URI, exception2Result, key } from "@adviser/cement";
import { bs, rt, Logger, NotFoundError, SuperThis, ensureLogger } from "@fireproof/core";

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

export class CFGateway implements bs.Gateway {
  readonly sthis: SuperThis;
  readonly logger: Logger;
  constructor(sthis: SuperThis) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "CFGateway");
  }

  getDos(url: URI): Result<DurableObjectStorage> {
    const r = url.getParamsResult({ duraStorage: key.OPTIONAL }).Ok();
    const dos = durableObjects.get(r.duraStorage);
    if (!dos) {
      return Result.Err(new NotFoundError(`DurableObject not found:${r.duraStorage}`));
    }
    return Result.Ok(dos);
  }

  prepareCFKey(url: URI): Result<{ key: string; dos: DurableObjectStorage }> {
    const rDos = this.getDos(url);
    if (rDos.isErr()) {
      return Result.Err(rDos.Err());
    }
    const rParams = url.getParamsResult({
      store: key.REQUIRED,
      key: key.REQUIRED,
      index: key.OPTIONAL,
    });
    if (rParams.isErr()) {
      return Result.Err(rParams.Err());
    }
    const params = rParams.Ok();
    let idxStr = ""
    if (params.index) {
      idxStr = `${params.index}-`
    }
    const keyStr = `${idxStr}${params.store}/${params.key}`;
    return Result.Ok({ key: keyStr, dos: rDos.Ok() });
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
    const rCFKey = await this.prepareCFKey(url);
    if (rCFKey.isErr()) {
      return Result.Err(rCFKey.Err());
    }
    const cfKey = rCFKey.Ok();
    return exception2Result(() => cfKey.dos.put<Uint8Array>(cfKey.key, body));
  }

  async get(url: URI): Promise<bs.GetResult> {
    const rCFKey = await this.prepareCFKey(url);
    if (rCFKey.isErr()) {
      return Result.Err(rCFKey.Err());
    }
    const cfKey = rCFKey.Ok();
    const rRet = await exception2Result(() => cfKey.dos.get<Uint8Array>(cfKey.key));
    if (rRet.isErr()) {
      return Result.Err(rRet.Err());
    }
    const buffer = rRet.Ok();
    if (!buffer) {
      return Result.Err(new NotFoundError(`Not found: ${cfKey.key}`));
    }
    return Result.Ok(buffer);
  }

  async delete(url: URI): Promise<bs.VoidResult> {
    const rCFKey = await this.prepareCFKey(url);
    if (rCFKey.isErr()) {
      return Result.Err(rCFKey.Err());
    }
    const cfKey = rCFKey.Ok();
    return exception2Result(() => cfKey.dos.delete(cfKey.key));
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

export function registerCFStoreProtocol(protocol = "cf:", overrideBaseURL?: string): versionUnregister {
  // URI.protocolHasHostpart(protocol);
  const unreg: versionUnregister = (() => {
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
