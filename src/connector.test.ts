// import { connectionFactory } from "./connection-from-store";
// import { registerS3StoreProtocol } from "./s3/s3-gateway";
import { URI, runtimeFn } from "@adviser/cement";
import { type Database, type SuperThis, bs, fireproof } from "@fireproof/core";
import { type TaskContext, describe } from "vitest";
import type { ConnectFunction } from "./connection-from-store";

// import { registerPartyKitStoreProtocol } from "./partykit/gateway";
// import { a } from "@adviser/cement/base-sys-abstraction-C9WW3w57";

async function getConnect(moduleName: string) {
  const connect = await import(`./${moduleName}`).then((module) => module.connect);
  return connect;
}

async function smokeDB(db: Database) {
  const ran = Math.random().toString();
  for (let i = 0; i < 10; i++) {
    await db.put({ _id: `key${i}:${ran}`, hello: `world${i}` });
  }
  for (let i = 0; i < 10; i++) {
    expect(await db.get<{ hello: string }>(`key${i}:${ran}`)).toEqual({
      _id: `key${i}:${ran}`,
      hello: `world${i}`,
    });
  }
  const docs = await db.allDocs();
  expect(docs.rows.length).toBeGreaterThan(9);
  return docs.rows.map((row) => row.value);
}

interface ExtendedGateway extends bs.Gateway {
  logger: { _attributes: { module: string; url?: string } };
  headerSize: number;
  fidLength: number;
  handleByteHeads: (meta: Uint8Array) => Promise<bs.VoidResult>;
}

interface ExtendedStore {
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

  beforeEach(async (context: TaskContext) => {
    // console.log(context)
    // const originalEnv = { FP_STORAGE_URL: process.env.FP_STORAGE_URL, FP_KEYBAG_URL: process.env.FP_KEYBAG_URL };
    process.env.FP_STORAGE_URL = "./dist/fp-dir-file";
    dbName = "test-local-" + Math.random().toString(36).substring(7);
    emptyDbName = "test-empty-" + Math.random().toString(36).substring(7);
    remoteDbName = "test-remote-" + Math.random().toString(36).substring(7);
    db = fireproof(dbName);
    connect = await getConnect(context.task.file.projectName);
    cx = connect(db, remoteDbName);
    await cx.loaded;
    console.log("beforeEach", db.name);
    await smokeDB(db);
    await (await db.blockstore.loader?.WALStore())?.process();
    console.log("beforeEach done", db.name);
  });
  it("should launch tests in the right environment", async () => {
    console.log("beforeEach", process.env.FP_STORAGE_URL, process.env.FP_KEYBAG_URL, db.name);
    const dbStorageUrl = db.blockstore.sthis.env.get("FP_STORAGE_URL");
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
    const carLog = await db.blockstore.loader?.carLog;
    expect(carLog).toBeDefined();
    expect(carLog?.length).toBe(10);
    if (!carLog) return;
    await (await db.blockstore.loader?.WALStore())?.process();
    const carStore = (await db.blockstore.loader?.remoteCarStore) as unknown as ExtendedStore;
    const carGateway = carStore?.gateway;
    const testKey = carLog[0][0].toString();
    const carUrl = await carGateway?.buildUrl(carStore?._url, testKey);
    const carGetResult = await carGateway?.get(carUrl?.Ok());
    expect(carGetResult).toBeDefined();
    expect(carGetResult?.Ok()).toBeDefined();
  });

  it("should have meta in the remote gateway", async () => {
    // await (await db.blockstore.loader?.WALStore())?.process();
    const metaStore = (await db.blockstore.loader?.remoteMetaStore) as unknown as ExtendedStore;
    const metaGateway = metaStore.gateway;
    const metaUrl = await metaGateway?.buildUrl(metaStore._url, "main");
    // await metaGateway?.start(metaStore?._url);
    console.log("metaUrl", metaUrl?.Ok()?.toString());
    const metaGetResult = await metaGateway.get(metaUrl?.Ok());
    expect(metaGetResult).toBeDefined();
    expect(metaGetResult.Ok()).toBeDefined();
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

  it("should sync to an empty db", async () => {
    // await (await db.blockstore.loader?.WALStore())?.process();
    console.log("db-names", db.name, emptyDbName, remoteDbName);

    const db2 = fireproof(emptyDbName);
    await db2.ready;
    const carLog0 = db2.blockstore.loader?.carLog;
    expect(carLog0).toBeDefined();
    expect(carLog0?.length).toBe(0);

    // const metaStore = (await db.blockstore.loader?.metaStore()) as unknown as ExtendedStore;

    const remoteMetaStore = (await db.blockstore.loader?.remoteMetaStore) as unknown as ExtendedStore;

    const url = remoteMetaStore?._url;
    // console.log("metaStore", url.toString());

    const parsedUrl = new URL(url.toString());
    parsedUrl.searchParams.set("cache", "two");

    console.log("db2 CONNECT", db2.name, remoteDbName, parsedUrl.toString());
    // const cx2 = connect(db2, parsedUrl.toString());
    const cx2 = connect(db2, remoteDbName); //, `partykit://localhost:1999/?name=${remoteDbName}&protocol=ws&cache=bust`);
    // const cx2 = connect(db2, remoteDbName);

    await cx2.loaded;
    console.log("db2 LOADED", db2.name);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const carLog = db2.blockstore.loader?.carLog;
    expect(carLog).toBeDefined();
    expect(carLog?.length).toBeGreaterThan(2);

    console.log("db2 ALLDOCS", db2.name);
    const docs = await db2.allDocs<{ hello: string }>();
    expect(docs).toBeDefined();
    expect(docs.rows.length).toBe(10);
    expect(docs.rows[0].value._id).toMatch("key");
    expect(docs.rows[0].value.hello).toMatch("world");

    console.log("db2 WRITE", db2.name);
    // it should sync write from the new db to the orginal db
    const ok = await db2.put({ _id: "secondary", hello: "original" });
    expect(ok).toBeDefined();
    expect(ok.id).toBeDefined();
    expect(ok.id).toBe("secondary");

    await (await db2.blockstore.loader?.WALStore())?.process();

    console.log("db2 processed", db2.name);

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
