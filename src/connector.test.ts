// import { connectionFactory } from "./connection-from-store";
// import { registerS3StoreProtocol } from "./s3/s3-gateway";
import { URI, runtimeFn } from "@adviser/cement";
import { type Database, type SuperThis, bs, fireproof } from "@fireproof/core";
import { mockSuperThis } from "../node_modules/@fireproof/core/tests/helpers";
import { type TaskContext, describe } from "vitest";
import type { ConnectFunction } from "./connection-from-store";
import { smokeDB } from "../tests/helper";

// import { registerPartyKitStoreProtocol } from "./partykit/gateway";
// import { a } from "@adviser/cement/base-sys-abstraction-C9WW3w57";

async function getConnect(moduleName: string) {
  const connect = await import(`./${moduleName}`).then((module) => module.connect);
  return connect;
}

// MUST go if superthis is there
interface ExtendedGateway extends bs.Gateway {
  // logger: { _attributes: { module: string; url?: string } };
  headerSize: number;
  fidLength: number;
  handleByteHeads: (meta: Uint8Array) => Promise<bs.VoidResult>;
}

// MUST go if superthis is there
interface ExtendedStore extends bs.BaseStore {
  gateway: ExtendedGateway;
  _url: URI;
  name: string;
}

describe("loading the base store", () => {
  let db: Database;
  let cx: bs.Connection;
  let dbName: string;
  let emptyDbName: string;
  let remoteDbName: string;
  let connect: ConnectFunction;
  const sthis = mockSuperThis();

  let resetFPStorageUrl: string;
  afterEach(async () => {
    process.env.FP_STORAGE_URL = resetFPStorageUrl;
  });

  beforeEach(async (context: TaskContext) => {
    // console.log(context)
    // const originalEnv = { FP_STORAGE_URL: process.env.FP_STORAGE_URL, FP_KEYBAG_URL: process.env.FP_KEYBAG_URL };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    resetFPStorageUrl = process.env.FP_STORAGE_URL!;
    process.env.FP_STORAGE_URL = "./dist/fp-dir-file";
    dbName = "test-local-" + sthis.nextId().str;
    emptyDbName = "test-empty-" + sthis.nextId().str;
    remoteDbName = "test-remote-" + sthis.nextId().str;
    db = fireproof(dbName);
    if (context.task.file.projectName === undefined) {
      throw new Error("projectName is undefined");
    }
    connect = await getConnect(context.task.file.projectName);
    cx = await Promise.resolve(connect(db, remoteDbName));
    await cx.loaded;
    await smokeDB(db);
    await (await db.blockstore.loader?.WALStore())?.process();
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
    const carLog = await db.blockstore.loader?.carLog;
    expect(carLog).toBeDefined();
    expect(carLog?.length).toBe(10);
    if (!carLog) return;
    const carStore = (await db.blockstore.loader?.carStore()) as unknown as ExtendedStore;
    const carGateway = carStore?.gateway;
    const testKey = carLog[0][0].toString();
    const carUrl = await carGateway?.buildUrl(carStore?._url, testKey);
    // await carGateway?.start(carStore?._url);
    const carGetResult = await carGateway?.get(carUrl?.Ok());
    expect(carGetResult).toBeDefined();
    expect(carGetResult?.Ok()).toBeDefined();
  });

  it("should have meta in the local gateway", async () => {
    const metaStore = (await db.blockstore.loader?.metaStore()) as unknown as ExtendedStore;
    const metaGateway = metaStore?.gateway;
    const metaUrl = await metaGateway?.buildUrl(metaStore?._url, "main");
    // await metaGateway?.start(metaStore?._url);
    const metaGetResult = await metaGateway?.get(metaUrl?.Ok());
    expect(metaGetResult).toBeDefined();
    expect(metaGetResult?.Ok()).toBeDefined();
  });

  it("should have data in the remote gateway", async () => {
    // await sleep(3000);
    const carLog = await db.blockstore.loader?.carLog;
    expect(carLog).toBeDefined();
    expect(carLog?.length).toBe(10);
    await (await db.blockstore.loader?.WALStore())?.process();
    const carStore = (await db.blockstore.loader?.remoteCarStore) as unknown as ExtendedStore;
    const carGateway = carStore?.gateway;
    const testKey = carLog?.[0][0].toString() as string;
    const carUrl = await carGateway?.buildUrl(carStore._url, testKey);
    const carGetResult = await carGateway?.get(carUrl.Ok());
    expect(carGetResult.Ok()).toBeDefined();
  });

  it("should have meta in the remote gateway", async () => {
    // await (await db.blockstore.loader?.WALStore())?.process();
    const metaStore = db.blockstore.loader?.remoteMetaStore as unknown as ExtendedStore;
    const metaGateway = metaStore.gateway;
    await metaGateway.start(metaStore.url());

    const metaUrl = await metaGateway.buildUrl(metaStore.url(), "main");
    const metaGetResult = await metaGateway.get(metaUrl?.Ok());
    if (metaGetResult.isErr()) {
      expect(metaGetResult.Err().message).toBe("xxx");
    }
    expect(metaGetResult.isOk()).toBeTruthy();
    const metaBody = metaGetResult.Ok();
    const decodedMetaBody = db.sthis.txt.decode(metaBody);
    expect(decodedMetaBody).toBeDefined();
    expect(decodedMetaBody).toMatch(/"parents":\["bafy/);
    const dbMetaRes = await bs.setCryptoKeyFromGatewayMetaPayload(metaStore._url, db.sthis, metaGetResult?.Ok());
    const dbMeta = dbMetaRes.Ok() as unknown as bs.DbMeta;
    expect(dbMeta).toBeDefined();
    expect(dbMeta.key).toBeDefined();
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
    // await (await db.blockstore.loader?.WALStore())?.process();

    const db2 = fireproof(emptyDbName);
    await db2.ready;
    const carLog0 = db2.blockstore.loader?.carLog;
    expect(carLog0).toBeDefined();
    expect(carLog0?.length).toBe(0);

    // const metaStore = (await db.blockstore.loader?.metaStore()) as unknown as ExtendedStore;

    // const remoteMetaStore = (await db.blockstore.loader?.remoteMetaStore) as unknown as ExtendedStore;

    // const url = remoteMetaStore?._url;
    // console.log("metaStore", url.toString());

    // const parsedUrl = url.build().setParam("cache", "two");
    // parsedUrl.searchParams.set("cache", "two");

    // const cx2 = connect(db2, parsedUrl.toString());
    const cx2 = connect(db2, remoteDbName); //, `partykit://localhost:1999/?name=${remoteDbName}&protocol=ws&cache=bust`);
    // const cx2 = connect(db2, remoteDbName);

    await cx2.loaded;
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const carLog = db2.blockstore.loader?.carLog;
    expect(carLog).toBeDefined();
    expect(carLog?.length).toBeGreaterThan(2);

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

    await (await db2.blockstore.loader?.WALStore())?.process();

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
