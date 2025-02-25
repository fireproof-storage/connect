import { exception2Result, Result, URI } from "@adviser/cement";
import { NotFoundError, PARAM, SuperThis, bs, rt } from "@fireproof/core";

// async function getStoreKeys(logger: Logger, loader: bs.Loadable): Promise<Set<string>> {
//     const storeKeys = [await loader.carStore(), await loader.fileStore()].map(store => store.url().getParam(PARAM.STORE_KEY))
//     const ret = new Set<string>()
//     for (const key of storeKeys) {
//         if (!key) {
//             logger.Warn().Msg("missing store key").AsError();
//         } else {
//             ret.add(key)
//         }
//     }
//     return ret
// }

// export async function deserializeMetaWithKeySideEffect(sthis: SuperThis, rraw: Result<Uint8Array>, loader: bs.Loadable): Promise<Result<Uint8Array>> {
//     if (rraw.isErr()) {
//         return rraw;
//     }
//     const json = await exception2Result(() => JSON.parse(sthis.txt.decode(rraw.unwrap())))
//     if (json.isErr()) {
//         // security: don't log the raw data
//         sthis.logger.Error().Err(json).Msg("failed to parse json").AsError();
//     } else {
//         const keyed = json.Ok() as { key: string };
//         if (typeof keyed.key === "string") {
//             const kb = await loader.keyBag()
//             const keys = await getStoreKeys(sthis.logger, loader)
//             if (keys.size !== 1) {
//                 sthis.logger.Warn().Msg("expected exactly one store key").AsError();
//             } else {
//                 const storeKey = Array.from(keys.values())[0]
//                 const res = await kb.setNamedKey(storeKey, keyed.key)
//                 if (res.isErr()) {
//                     sthis.logger.Error().Err(res).Str(PARAM.STORE_KEY, storeKey).Msg("failed to set key").AsError();
//                 }
//             }
//         }
//     }
//     return rraw
//     //   return rt.gw.fpDeserialize(sthis, raw, url);
// }

// export async function attachKeyToMeta(sthis: SuperThis, raw: Uint8Array, loader: bs.Loadable): Promise<Uint8Array> {
//   const keys = await getStoreKeys(sthis.logger, loader)
//   if (keys.size !== 1) {
//       sthis.logger.Warn().Msg("expected exactly one store key").AsError();
//       return raw
//   }
//   const json = JSON.parse(sthis.txt.decode(raw))
//   json.key = Array.from(keys.values())[0]
//   return sthis.txt.encode(JSON.stringify(json))
// }

type V1SerializedMetaKey = rt.gw.SerializedMeta & {
  // old version
  readonly key?: string | string[];
  // new version
  readonly keys?: string[];
};

export interface V2SerializedMetaKey {
  readonly metas: rt.gw.SerializedMeta[];
  readonly keys: string[];
}

// type SerializedMetaWithKey = V1SerializedMetaKey[] | V2SerializedMetaKey;

function fromV1toV2SerializedMetaKey(v1s: unknown[], keys: string[] = []): V2SerializedMetaKey {
  const res = (v1s as Partial<V1SerializedMetaKey>[]).reduce(
    (acc, v1) => {
      const keys: string[] = [];
      if (v1.key) {
        if (typeof v1.key === "string") {
          acc.keys.add(v1.key);
        } else {
          keys.push(...v1.key);
        }
      }
      if (v1.keys) {
        keys.push(...v1.keys);
      }
      for (const key of keys) {
        acc.keys.add(key);
      }
      if (
        typeof v1.cid === "string" &&
        (!v1.data || typeof v1.data === "string") &&
        (!v1.parents || Array.isArray(v1.parents))
      ) {
        acc.metas.set(v1.cid, {
          data: v1.data ?? "",
          parents: v1.parents ?? [],
          cid: v1.cid,
        });
      }
      return acc;
    },
    {
      metas: new Map<string, rt.gw.SerializedMeta>(),
      keys: new Set<string>(keys),
    }
  );
  return {
    metas: Array.from(res.metas.values()),
    keys: Array.from(res.keys),
  };
}

function isV2SerializedMetaKey(or: NonNullable<unknown>): or is Partial<V2SerializedMetaKey> {
  const my = or as Partial<V2SerializedMetaKey>;
  return my !== null && (!my.keys || Array.isArray(my.keys)) && (!my.metas || Array.isArray(my.metas));
}

function toV2SerializedMetaKey(or: NonNullable<unknown>): V2SerializedMetaKey {
  if (Array.isArray(or)) {
    return fromV1toV2SerializedMetaKey(or);
  }
  if (isV2SerializedMetaKey(or)) {
    return fromV1toV2SerializedMetaKey(or.metas ?? [], or.keys ?? []);
  }
  throw new Error("not a valid serialized meta key");
}

export class AddKeyToDbMetaGateway implements bs.SerdeGateway {
  private readonly sdGw: rt.gw.DefSerdeGateway;
  readonly version: "v1" | "v2";
  constructor(gw: bs.Gateway, version: "v1" | "v2") {
    this.sdGw = new rt.gw.DefSerdeGateway(gw);
    this.version = version;
  }

  buildUrl(ctx: bs.SerdeGatewayCtx, baseUrl: URI, key: string): Promise<Result<URI>> {
    return this.sdGw.buildUrl(ctx, baseUrl, key);
  }
  start(ctx: bs.SerdeGatewayCtx, baseUrl: URI): Promise<Result<URI>> {
    return this.sdGw.start(ctx, baseUrl);
  }
  close(ctx: bs.SerdeGatewayCtx, baseUrl: URI): Promise<Result<void, Error>> {
    return this.sdGw.close(ctx, baseUrl);
  }
  async put<T>(ctx: bs.SerdeGatewayCtx, url: URI, body: bs.FPEnvelope<T>): Promise<Result<void, Error>> {
    return this.sdGw.put(
      {
        ...ctx,
        encoder: {
          meta: async (sthis: SuperThis, payload: rt.gw.SerializedMeta[]): Promise<Result<Uint8Array>> => {
            const carStore = ctx.loader.attachedStores.local().active.car;
            const kb = await ctx.loader.keyBag();
            if (!kb) {
              return Promise.resolve(Result.Err(new Error("missing keybag")));
            }
            const keyName = carStore.url().getParam(PARAM.STORE_KEY) ?? "";
            const rKex = await kb.getNamedKey(keyName);
            if (rKex.isErr()) {
              return Promise.resolve(Result.Err(rKex.Err()));
            }
            /* security: we don't want to log the key */
            const keyMaterials = await rKex
              .Ok()
              .asKeysItem()
              .then((i) => Object.values(i.keys).map((i) => i.key));
            try {
              let serialized: string;
              switch (this.version) {
                case "v1":
                  serialized = JSON.stringify(
                    payload.map(
                      (p) =>
                        ({
                          ...p,
                          key: keyMaterials,
                        }) satisfies V1SerializedMetaKey
                    )
                  );
                  break;
                case "v2":
                  serialized = JSON.stringify({
                    metas: payload,
                    keys: keyMaterials,
                  } satisfies V2SerializedMetaKey);
                  break;
                default:
                  return Promise.resolve(Result.Err(`unknown version:[${this.version}]`));
              }
              return Promise.resolve(Result.Ok(sthis.txt.encode(serialized)));
            } catch (e) {
              return Promise.resolve(Result.Err(`failed to extract key for ${keyName}: ${(e as Error).message}`));
            }
          },
        },
      },
      url,
      body
    );
  }
  async get<S>(ctx: bs.SerdeGatewayCtx, url: URI): Promise<Result<bs.FPEnvelope<S>, Error | NotFoundError>> {
    return this.sdGw.get(this.decodeMeta(ctx), url);
  }

  // only for tests
  readonly lastDecodedMetas: V2SerializedMetaKey[] = [];

  private decodeMeta(ctx: bs.SerdeGatewayCtx): bs.SerdeGatewayCtx {
    return {
      ...ctx,
      decoder: {
        meta: async (sthis: SuperThis, raw: Uint8Array): Promise<Result<rt.gw.SerializedMeta[]>> => {
          const kb = await ctx.loader.keyBag();
          if (!kb) {
            return Promise.resolve(Result.Err(new Error("missing keybag")));
          }
          const rJsObj = exception2Result(() => JSON.parse(sthis.txt.decode(raw))) as Result<NonNullable<unknown>>;
          if (rJsObj.isErr()) {
            return Promise.resolve(Result.Err(rJsObj));
          }
          const v2 = toV2SerializedMetaKey(rJsObj.unwrap());
          // we only want to keep the last 2 metas
          if (this.lastDecodedMetas.length > 2) {
            this.lastDecodedMetas.shift();
          }
          this.lastDecodedMetas.push(v2);
          const dataUrl = await ctx.loader.attachedStores.local().active.car.url();
          const keyName = dataUrl.getParam(PARAM.STORE_KEY);
          if (!keyName) {
            ctx.loader.sthis.logger.Warn().Url(dataUrl).Msg("missing store key");
          } else {
            const rKey = await kb.getNamedKey(keyName);
            if (rKey.isErr()) {
              ctx.loader.sthis.logger.Warn().Str("keyName", keyName).Msg("did not found a extractable key");
            } else {
              for (const keyStr of v2.keys) {
                // side effect: in the keybag
                // this is the key gossip protocol
                // it basically collects all the keys that are used distributed metas
                const res = await rKey.Ok().upsert(keyStr, false);
                if (res.isErr()) {
                  ctx.loader.sthis.logger.Warn().Str("keyStr", keyStr).Msg("failed to upsert key");
                }
              }
            }
          }
          return Promise.resolve(Result.Ok(v2.metas));
        },
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete(ctx: bs.SerdeGatewayCtx, url: URI, loader?: bs.Loadable): Promise<Result<void, Error>> {
    return this.sdGw.delete(ctx, url);
  }
  subscribe(
    ctx: bs.SerdeGatewayCtx,
    url: URI,
    callback: (meta: bs.FPEnvelopeMeta) => Promise<void>
  ): Promise<Result<() => void, Error>> {
    return this.sdGw.subscribe(this.decodeMeta(ctx), url, callback);
  }
  getPlain(ctx: bs.SerdeGatewayCtx, url: URI, key: string): Promise<Result<Uint8Array>> {
    return this.sdGw.getPlain(ctx, url, key);
  }
  destroy(ctx: bs.SerdeGatewayCtx, baseUrl: URI): Promise<Result<void, Error>> {
    return this.sdGw.destroy(ctx, baseUrl);
  }
}
