import { URI } from "@adviser/cement";
import { AddKeyToDbMetaGateway, V2SerializedMetaKey } from "./meta-key-hack.js";
import { rt, bs, fireproof, PARAM, ensureSuperThis } from "@fireproof/core";

describe("MetaKeyHack", () => {
  const storageMap = new Map();

  const sthis = ensureSuperThis();
  const memGw = new rt.gw.memory.MemoryGateway(sthis, storageMap);
  bs.registerStoreProtocol({
    protocol: "hack:",
    defaultURI: () => URI.from(`hack://localhost?version=hack`),
    serdegateway: async () => {
      return new AddKeyToDbMetaGateway(memGw, "v2");
    },
  });

  const db = fireproof("test", {
    storeUrls: {
      base: "hack://localhost",
    },
    keyBag: {
      url: "memory://./dist/kb-dir-partykit?extractKey=_deprecated_internal_api",
    },
  });
  const ctx = { loader: db.ledger.crdt.blockstore.loader };

  it("inject key into meta", async () => {
    const loader = db.ledger.crdt.blockstore.loader;
    const metaStore = loader.attachedStores.local().active.meta;
    const subscribeFn = vitest.fn();
    const unreg = await metaStore.realGateway.subscribe(
      ctx,
      metaStore.url().build().setParam(PARAM.SELF_REFLECT, "x").URI(),
      subscribeFn
    );
    expect(unreg.isOk()).toBeTruthy();
    await db.put({ val: "test" });

    const dataStore = loader.attachedStores.local().active.car;
    const kb = new rt.KeyBag(db.ledger.opts.keyBag);
    const rDataStoreKeyItem = await kb.getNamedKey(dataStore.url().getParam(PARAM.STORE_KEY) ?? "");

    await rDataStoreKeyItem.Ok().upsert("zBUFMmu5c3VdCa4r2DZTzhR", false);
    await rDataStoreKeyItem.Ok().upsert("zH1fyizirAiYVxoaQ2XZ3Xj", false);

    expect(rDataStoreKeyItem.isOk()).toBeTruthy();
    const rUrl = await memGw.buildUrl(metaStore.url(), "main");
    // console.log(">>>>", rUrl.Ok().toString())
    const rGet = await memGw.get(rUrl.Ok());
    const metas = JSON.parse(ctx.loader.sthis.txt.decode(rGet.Ok())) as V2SerializedMetaKey;
    const keyMaterials = metas.keys;
    const dataStoreKeyMaterial = await rDataStoreKeyItem.Ok().asKeysItem();
    expect(keyMaterials.length).toBeGreaterThan(0);
    expect(dataStoreKeyMaterial).toEqual({
      keys: {
        ...(await rDataStoreKeyItem
          .Ok()
          .get()
          .then(async (r) => ({
            [r?.fingerPrint as string]: {
              default: true,
              fingerPrint: r?.fingerPrint,
              key: await r?.extract().then((i) => i.keyStr),
            },
          }))),
        z3boMcLEQxjZAMrVo2j3k9bZJzmSqXkQmh6q7bLZ2nRuo: {
          default: false,
          fingerPrint: "z3boMcLEQxjZAMrVo2j3k9bZJzmSqXkQmh6q7bLZ2nRuo",
          key: "zH1fyizirAiYVxoaQ2XZ3Xj",
        },
        zG5F2VWVAs3uAFyLE5rty5WWo7zJ1oBmYTdnraxfhaHG5: {
          default: false,
          fingerPrint: "zG5F2VWVAs3uAFyLE5rty5WWo7zJ1oBmYTdnraxfhaHG5",
          key: "zBUFMmu5c3VdCa4r2DZTzhR",
        },
      },
      name: "@test-data@",
    });

    // expect(keyMaterials.every((k) => k === dataStoreKeyMaterial.keyStr)).toBeTruthy()
    expect(subscribeFn).toHaveBeenCalledTimes(1);
    const addKeyToDbMetaGateway = metaStore.realGateway as AddKeyToDbMetaGateway;
    expect(
      subscribeFn.mock.calls.map((i) =>
        i.map((i) => i.payload.map((i: bs.DbMetaEvent) => i.eventCid.toString())).flat()
      )
    ).toEqual([addKeyToDbMetaGateway.lastDecodedMetas.map((i) => i.metas.map((i) => i.cid)).flat()]);
    unreg.Ok()();
  });
});
