import { exception2Result, Logger, Result, } from "@adviser/cement";
import { PARAM, SuperThis, bs } from "@fireproof/core";

async function getStoreKeys(logger: Logger, loader: bs.Loadable): Promise<Set<string>> {
    const storeKeys = [await loader.carStore(), await loader.fileStore()].map(store => store.url().getParam(PARAM.STORE_KEY))
    const ret = new Set<string>()
    for (const key of storeKeys) {
        if (!key) {
            logger.Warn().Msg("missing store key").AsError();
        } else {
            ret.add(key)
        }
    }
    return ret
}

export async function deserializeMetaWithKeySideEffect(sthis: SuperThis, rraw: Result<Uint8Array>, loader: bs.Loadable): Promise<Result<Uint8Array>> {
    if (rraw.isErr()) {
        return rraw;
    }
    const json = await exception2Result(() => JSON.parse(sthis.txt.decode(rraw.unwrap())))
    if (json.isErr()) {
        // security: don't log the raw data
        sthis.logger.Error().Err(json).Msg("failed to parse json").AsError();
    } else {
        const keyed = json.Ok() as { key: string };
        if (typeof keyed.key === "string") {
            const kb = await loader.keyBag()
            const keys = await getStoreKeys(sthis.logger, loader)
            if (keys.size !== 1) {
                sthis.logger.Warn().Msg("expected exactly one store key").AsError();
            } else {
                const storeKey = Array.from(keys.values())[0]
                const res = await kb.setNamedKey(storeKey, keyed.key)
                if (res.isErr()) {
                    sthis.logger.Error().Err(res).Str(PARAM.STORE_KEY, storeKey).Msg("failed to set key").AsError();
                }
            }
        }
    }
    return rraw
    //   return rt.gw.fpDeserialize(sthis, raw, url);
}

export async function attachKeyToMeta(sthis: SuperThis, raw: Uint8Array, loader: bs.Loadable): Promise<Uint8Array> {
  const keys = await getStoreKeys(sthis.logger, loader)
  if (keys.size !== 1) {
      sthis.logger.Warn().Msg("expected exactly one store key").AsError();
      return raw
  }
  const json = JSON.parse(sthis.txt.decode(raw))
  json.key = Array.from(keys.values())[0]
  return sthis.txt.encode(JSON.stringify(json))
}