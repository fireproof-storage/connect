// import { connectionFactory } from "./connection-from-store";
// import { registerS3StoreProtocol } from "./s3/s3-gateway";
import { URI, runtimeFn } from "@adviser/cement";
import { type Database, type SuperThis, bs, ensureSuperThis, fireproof } from "@fireproof/core";
// import type { ConnectFunction } from "./connection-from-store.js";
import { smokeDB } from "../tests/helper.js";

// import { registerPartyKitStoreProtocol } from "./partykit/gateway";
// import { a } from "@adviser/cement/base-sys-abstraction-C9WW3w57";

// async function getConnect(moduleName: string) {
//   const connect = await import(`./${moduleName}`).then((module) => module.connect);
//   return connect;
// }

// MUST go if superthis is there
// interface ExtendedGateway extends bs.Gateway {
//   // logger: { _attributes: { module: string; url?: string } };
//   headerSize: number;
//   fidLength: number;
//   handleByteHeads: (meta: Uint8Array) => Promise<bs.VoidResult>;
// }

// // MUST go if superthis is there
// interface ExtendedStore extends bs.BaseStore {
//   gateway: ExtendedGateway;
//   _url: URI;
//   name: string;
// }

describe.skip("loading the base store", () => {
  let db: Database;
  // let cx: bs.Connection;
  let dbName: string;
  let emptyDbName: string;
  // let remoteDbName: string;
  // let connect: ConnectFunction;
  const sthis = ensureSuperThis();
  let ctx: bs.SerdeGatewayCtx;

  let resetFPStorageUrl: string;
  afterEach(async () => {
    process.env.FP_STORAGE_URL = resetFPStorageUrl;
  });

  beforeEach(async (context) => {
    // console.log(context)
    // const originalEnv = { FP_STORAGE_URL: process.env.FP_STORAGE_URL, FP_KEYBAG_URL: process.env.FP_KEYBAG_URL };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    resetFPStorageUrl = process.env.FP_STORAGE_URL!;
    process.env.FP_STORAGE_URL = "./dist/fp-dir-file";
    dbName = "test-local-" + sthis.nextId().str;
    emptyDbName = "test-empty-" + sthis.nextId().str;
    // remoteDbName = "test-remote-" + sthis.nextId().str;
    db = fireproof(dbName);
    if (context.task.file.projectName === undefined) {
      throw new Error("projectName is undefined");
    }
    ctx = { loader: db.ledger.crdt.blockstore.loader };

    // db.attach(toNetlify())
    // db.attach(toFireproofCloud())

    // connect = await getConnect(context.task.file.projectName);
    // cx = await Promise.resolve(connect(db, remoteDbName));
    // await cx.loaded;
    await smokeDB(db);
    await db.ledger.crdt.blockstore.loader.attachedStores.local().active.wal.process();
  });
  it("should launch tests in the right environment", async () => {
    const dbStorageUrl = sthis.env.get("FP_STORAGE_URL");
    expect(dbStorageUrl).toBe("./dist/fp-dir-file");
    const docs = await db.allDocs<{ hello: string }>();
    expect(docs).toBeDefined();
    expect(docs.rows.length).toBe(10);
    expect(docs.rows[0].value._id).toMatch("key");
    expect(docs.rows[0].value.hello).toMatch("world");
  });

  it("should have data in the local gateway", async () => {
    const carLog = await db.ledger.crdt.blockstore.loader.carLog;
    expect(carLog).toBeDefined();
    expect(carLog.length).toBe(10);
    if (!carLog) return;
    const carStore = await db.ledger.crdt.blockstore.loader.attachedStores.local().active.car;
    const carGateway = carStore.realGateway;
    const testKey = carLog.asArray()[0][0].toString();
    const carUrl = await carGateway.buildUrl(ctx, carStore.url(), testKey);
    // await carGateway.start(carStore._url);
    const carGetResult = await carGateway.get(ctx, carUrl.Ok());
    expect(carGetResult).toBeDefined();
    expect(carGetResult.Ok()).toBeDefined();
  });

  it("should have meta in the local gateway", async () => {
    const metaStore = await db.ledger.crdt.blockstore.loader.attachedStores.local().active.meta;
    const metaGateway = metaStore.realGateway;
    const metaUrl = await metaGateway.buildUrl(ctx, metaStore.url(), "main");
    // await metaGateway.start(metaStore._url);
    const metaGetResult = await metaGateway.get(ctx, metaUrl.Ok());
    expect(metaGetResult).toBeDefined();
    expect(metaGetResult.Ok()).toBeDefined();
  });

  it.skip("should have data in the remote gateway", async () => {
    // await sleep(3000);
    const carLog = await db.ledger.crdt.blockstore.loader.carLog;
    expect(carLog).toBeDefined();
    expect(carLog.length).toBe(10);
    await db.ledger.crdt.blockstore.loader.attachedStores.local().active.wal.process();
    const carStore = db.ledger.crdt.blockstore.loader.attachedStores.remotes()[0].active.car;
    const carGateway = carStore.realGateway;
    const testKey = carLog.asArray()[0][0].toString();
    const carUrl = await carGateway.buildUrl(ctx, carStore.url(), testKey);
    const carGetResult = await carGateway.get(ctx, carUrl.Ok());
    expect(carGetResult.Ok()).toBeDefined();
  });

  it("should have meta in the remote gateway", async () => {
    // await (await db.ledger.crdt.blockstore.loader.WALStore()).process();
    const metaStore = db.ledger.crdt.blockstore.loader.attachedStores.remotes()[0].active.meta;
    const metaGateway = metaStore.realGateway;
    await metaGateway.start(ctx, metaStore.url());

    const metaUrl = await metaGateway.buildUrl(ctx, metaStore.url(), "main");
    const metaGetResult = await metaGateway.get<bs.DbMetaEvent[]>(ctx, metaUrl.Ok());
    if (metaGetResult.isErr()) {
      expect(metaGetResult.Err().message).toBe("xxx");
    }
    expect(metaGetResult.isOk()).toBeTruthy();
    const metaBody = metaGetResult.Ok();
    expect(JSON.stringify(metaBody.payload)).toMatch(/"parents":\["bafy/);
  });

  it("should open an empty db", async () => {
    const db2 = fireproof(emptyDbName);
    const docs = await db2.allDocs<{ hello: string }>();
    expect(docs).toBeDefined();
    expect(docs.rows.length).toBe(0);
  });

  it("should sync to an empty db", async (ctx) => {
    // FIXME temporarily disable this test for netlify and aws
    if (ctx.task.file.projectName === "netlify" || ctx.task.file.projectName === "aws") {
      ctx.skip();
    }
    // await (await db.ledger.crdt.blockstore.loader.WALStore()).process();

    const db2 = fireproof(emptyDbName);
    await db2.ready;
    const carLog0 = db2.ledger.crdt.blockstore.loader.carLog;
    expect(carLog0).toBeDefined();
    expect(carLog0.length).toBe(0);

    // const metaStore = (await db.ledger.crdt.blockstore.loader.metaStore()) as unknown as ExtendedStore;

    // const remoteMetaStore = (await db.ledger.crdt.blockstore.loader.remoteMetaStore) as unknown as ExtendedStore;

    // const url = remoteMetaStore._url;
    // console.log("metaStore", url.toString());

    // const parsedUrl = url.build().setParam("cache", "two");
    // parsedUrl.searchParams.set("cache", "two");

    // const cx2 = connect(db2, parsedUrl.toString());
    // const cx2 = connect(db2, remoteDbName); //, `partykit://localhost:1999/?name=${remoteDbName}&protocol=ws&cache=bust`);
    // const cx2 = connect(db2, remoteDbName);

    // await cx2.loaded;
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const carLog = db2.ledger.crdt.blockstore.loader.carLog;
    expect(carLog).toBeDefined();
    expect(carLog.length).toBeGreaterThan(2);

    const docs = await db2.allDocs<{ hello: string }>();
    expect(docs).toBeDefined();
    expect(docs.rows.length).toBe(10);
    expect(docs.rows[0].value._id).toMatch("key");
    expect(docs.rows[0].value.hello).toMatch("world");

    // it should sync write from the new db to the orginal db
    const ok = await db2.put({ _id: "secondary", hello: "original" });
    expect(ok).toBeDefined();
    expect(ok.id).toBeDefined();
    expect(ok.id).toBe("secondary");

    await db2.ledger.crdt.blockstore.loader.attachedStores.local().active.wal.process();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const docs2 = await db.get<{ hello: string }>("secondary");
    expect(docs2).toBeDefined();
    expect(docs2.hello).toBe("original");
  });
});

export function storageURL(sthis: SuperThis): URI {
  const old = sthis.env.get("FP_STORAGE_URL");
  let merged: URI;
  if (runtimeFn().isBrowser) {
    merged = URI.merge(`indexdb://fp`, old, "indexdb:");
  } else {
    merged = URI.merge(`./dist/env`, old);
  }
  return merged;
}
