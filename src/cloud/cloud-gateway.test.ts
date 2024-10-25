import { fireproof, Database, bs, ConfigOpts } from "@fireproof/core";
import { registerFireproofCloudStoreProtocol } from "./gateway";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { smokeDB } from "../../tests/helper";
import { mockSuperThis } from "@fireproof/core/tests/helpers";

describe("FireproofCloudGateway", () => {
  let db: Database;
  let unregister: () => void;
  const sthis = mockSuperThis();

  beforeAll(() => {
    unregister = registerFireproofCloudStoreProtocol("fireproof:");
  });

  beforeEach(() => {
    const config: ConfigOpts = {
      storeUrls: {
        base: process.env.FP_STORAGE_URL || "fireproof://localhost:1999",
      },
    };
    const name = "fireproof-cloud-test-db-" + sthis.nextId().str;
    db = fireproof(name, config);
  });

  afterEach(() => {
    // Clear the database before each test
    if (db) {
      db.destroy();
    }
  });

  afterAll(() => {
    unregister();
  });

  it("env setup is ok", () => {
    // expect(process.env.FP_STORAGE_URL).toMatch(/fireproof:\/\/localhost:1999/);
  });

  it("should have loader and options", async () => {
    const store = (await db.crdt.blockstore.loader?.carStore()) as bs.DataStore;
    expect(store).toBeDefined();

    expect(store.url().protocol).toBe("fireproof:");
    // expect(baseUrl.hostname).toBe("localhost");
    // expect(baseUrl.port || "").toBe("1999");
  });

  it("should initialize and perform basic operations", async () => {
    const docs = await smokeDB(db);

    // // get a new db instance
    // db = new Database(name, config);

    // Test update operation
    const updateDoc = await db.get<{ content: string }>(docs[0]._id);
    updateDoc.content = "Updated content";
    const updateResult = await db.put(updateDoc);
    expect(updateResult.id).toBe(updateDoc._id);

    const updatedDoc = await db.get<{ content: string }>(updateDoc._id);
    expect(updatedDoc.content).toBe("Updated content");

    // Test delete operation
    await db.del(updateDoc._id);
    try {
      await db.get(updateDoc._id);
      throw new Error("Document should have been deleted");
    } catch (e) {
      const error = e as Error;
      expect(error.message).toContain("Not found");
    }

    // Clean up
    await db.destroy();
  });

  it("should subscribe to changes", async () => {
    // Extract stores from the loader
    const metaStore = (await db.crdt.blockstore.loader?.metaStore()) as bs.MetaStore;

    const metaGateway = metaStore.realGateway;

    const metaUrl = await metaGateway.buildUrl(metaStore.url(), "main");
    await metaGateway.start(metaStore.url());

    let didCall = false;

    if (metaGateway.subscribe) {
      let resolve: () => void;
      const p = new Promise<void>((r) => {
        resolve = r;
      });

      const metaSubscribeResult = await metaGateway?.subscribe?.(metaUrl?.Ok(), async (data: bs.FPEnvelopeMeta) => {
        expect(data.payload).toContain("parents");
        didCall = true;
        resolve();
      });
      expect(metaSubscribeResult?.Ok()).toBeTruthy();
      const ok = await db.put({ _id: "key1", hello: "world1" });
      expect(ok).toBeTruthy();
      expect(ok.id).toBe("key1");
      await p;
      expect(didCall).toBeTruthy();
    }
  });
});
