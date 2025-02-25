import { ensureSuperThis, fireproof, SysFileSystem, rt, storeType2DataMetaWal, StoreType } from "@fireproof/core";
import { registerSqliteStoreProtocol } from "./gateway-sql.js";
import { V0_19SQL_VERSION } from "./v0.19/version.js";
import { URI } from "@adviser/cement";

describe("sqlite", () => {
  const _my_app = "my-app";
  function my_app() {
    return _my_app;
  }
  const sthis = ensureSuperThis();
  let fsx: SysFileSystem;

  function params(store: StoreType, taste: string) {
    return Object.entries({
      store,
      name: my_app(),
      storekey: `@${my_app()}-${storeType2DataMetaWal(store)}@`,
      taste,
      version: V0_19SQL_VERSION,
    });
    //  new RegExp(`${base}\\?name=${my_app()}&store=data&taste=${taste}&version=${V0_19SQL_VERSION}`)
  }

  let taste: string;
  let base: string;

  beforeAll(async () => {
    await sthis.start();
    fsx = await rt.gw.file.sysFileSystemFactory(URI.from("file:///"));
    registerSqliteStoreProtocol();
    const url = URI.from(process.env.FP_STORAGE_URL || "dummy://");
    taste = url.getParam("taste") || "better-sqlite3";
    base = `sqlite://./dist/sqlite-${taste}`;
  });

  it("sqlite path", async () => {
    let dbFile = base.replace(/\?.*$/, "").replace(/^sqlite:\/\//, "");
    dbFile = sthis.pathOps.join(dbFile, `${my_app()}.sqlite`);
    await fsx.rm(dbFile, { recursive: true }).catch(() => {
      /* */
    });

    const db = fireproof(my_app(), {
      storeUrls: {
        base: `${base}?taste=${taste}`,
      },
    });
    // console.log(`>>>>>>>>>>>>>>>file-path`)
    await db.put({ name: "my-app" });
    expect((await fsx.stat(dbFile)).isFile()).toBeTruthy();
    expect(db.name).toBe(my_app());
    const carStore = await db.ledger.crdt.blockstore.loader.attachedStores.local().active.car;
    for (const [k, v] of params("car", taste)) {
      expect(carStore?.url().getParam(k)).toBe(v);
    }
    const fileStore = await db.ledger.crdt.blockstore.loader.attachedStores.local().active.file;
    for (const [k, v] of params("file", taste)) {
      expect(fileStore?.url().getParam(k)).toBe(v);
    }
    const metaStore = await db.ledger.crdt.blockstore.loader.attachedStores.local().active.meta;
    for (const [k, v] of params("meta", taste)) {
      expect(metaStore?.url().getParam(k)).toBe(v);
    }
    await db.close();
  });

  it("full config path", async () => {
    const db = fireproof(my_app(), {
      storeUrls: {
        base: `${base}?taste=${taste}`,
        // meta: `${base}/meta?taste=${taste}`,
        data: {
          meta: `${base}/meta?taste=${taste}`,
          car: `${base}/data?taste=${taste}`,
          wal: `${base}/wal?taste=${taste}`,
        },
        idx: {
          meta: `${base}/idx-meta?taste=${taste}`,
          car: `${base}/idx-data?taste=${taste}`,
          wal: `${base}/idx-wal?taste=${taste}`,
        },
        // wal: `${base}/wal?taste=${taste}`,
      },
    });
    // console.log(`>>>>>>>>>>>>>>>file-path`)
    expect(db.name).toBe(my_app());

    await db.put({ name: my_app() });

    const carStore = await db.ledger.crdt.blockstore.loader.attachedStores.local().active.car;
    for (const [k, v] of params("car", taste)) {
      expect(carStore?.url().getParam(k)).toBe(v);
    }

    const fileStore = await db.ledger.crdt.blockstore.loader.attachedStores.local().active.file;
    for (const [k, v] of params("file", taste)) {
      expect(fileStore?.url().getParam(k)).toBe(v);
    }
    const metaStore = await db.ledger.crdt.blockstore.loader.attachedStores.local().active.meta;
    for (const [k, v] of params("meta", taste)) {
      expect(metaStore?.url().getParam(k)).toBe(v);
    }
    await db.close();
  });
});
