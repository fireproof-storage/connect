import { ensureSuperThis, fireproof, SysFileSystem, rt } from "@fireproof/core";
import { registerSqliteStoreProtocol } from "./gateway-sql";
import { V0_19SQL_VERSION } from "./v0.19/version";
import { BuildURI, URI } from "@adviser/cement";

describe("sqlite", () => {
  const _my_app = "my-app";
  function my_app() {
    return _my_app;
  }
  const sthis = ensureSuperThis();
  let fsx: SysFileSystem;

  function params(store: string, taste: string) {
    return Object.entries({
      store,
      name: my_app(),
      storekey: `@${my_app()}:${store}@`,
      taste,
      version: V0_19SQL_VERSION,
    });
    //  new RegExp(`${base}\\?name=${my_app()}&store=data&taste=${taste}&version=${V0_19SQL_VERSION}`)
  }

  let taste: string;
  let base: URI;

  beforeAll(async () => {
    await sthis.start();
    fsx = await rt.getFileSystem(URI.from("file:///"));
    registerSqliteStoreProtocol();
    const url = URI.from(process.env.FP_STORAGE_URL || "dummy://");
    taste = url.getParam("taste") || "better-sqlite3";
    base = URI.from(`sqlite://./dist/sqlite-${taste}`);
  });

  it("sqlite path", async () => {
    let dbFile = base.pathname; // replace(/\?.*$/, "").replace(/^sqlite:\/\//, "");
    dbFile = sthis.pathOps.join(dbFile, `${my_app()}.sqlite`);
    await fsx.rm(dbFile, { recursive: true }).catch(() => {
      /* */
    });

    const db = fireproof(my_app(), {
      storeUrls: {
        base: BuildURI.from(base).setParam("taste", taste),
      },
    });
    // console.log(`>>>>>>>>>>>>>>>file-path`)
    await db.put({ name: "my-app" });
    expect((await fsx.stat(dbFile)).isFile()).toBeTruthy();
    expect(db.name).toBe(my_app());
    const carStore = await db.crdt.blockstore.loader?.carStore();
    for (const [k, v] of params("data", taste)) {
      expect(carStore?.url().getParam(k)).toBe(v);
    }
    const fileStore = await db.crdt.blockstore.loader?.fileStore();
    for (const [k, v] of params("data", taste)) {
      expect(fileStore?.url().getParam(k)).toBe(v);
    }
    const metaStore = await db.crdt.blockstore.loader?.metaStore();
    for (const [k, v] of params("meta", taste)) {
      expect(metaStore?.url().getParam(k)).toBe(v);
    }
    await db.close();
  });

  it("full config path", async () => {
    const db = fireproof(my_app(), {
      storeUrls: {
        base: `${base}?taste=${taste}`,
        data: {
          meta: `${base}/meta?taste=${taste}`,
          data: `${base}/data?taste=${taste}`,
          wal: `${base}/wal?taste=${taste}`,
        },
        idx: {
          data: `${base}/index?taste=${taste}`,
          meta: `${base}/index?taste=${taste}`,
          wal: `${base}/index?taste=${taste}`,
        },
      },
    });
    // console.log(`>>>>>>>>>>>>>>>file-path`)
    await db.put({ name: my_app() });
    expect(db.name).toBe(my_app());

    const carStore = await db.crdt.blockstore.loader?.carStore();
    for (const [k, v] of params("data", taste)) {
      expect(carStore?.url().getParam(k)).toBe(v);
    }

    const fileStore = await db.crdt.blockstore.loader?.fileStore();
    for (const [k, v] of params("data", taste)) {
      expect(fileStore?.url().getParam(k)).toBe(v);
    }
    const metaStore = await db.crdt.blockstore.loader?.metaStore();
    for (const [k, v] of params("meta", taste)) {
      expect(metaStore?.url().getParam(k)).toBe(v);
    }
    await db.close();
  });
});
