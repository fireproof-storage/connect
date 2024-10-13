import { fireproof, Database, bs, ConfigOpts } from "@fireproof/core";
import { registerPartyKitStoreProtocol } from "./gateway";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { smokeDB } from "../../tests/helper";
import { mockSuperThis } from "@fireproof/core/tests/helpers";
import { Future } from "@adviser/cement";

describe("PartyKitGateway", () => {
  let db: Database;
  let unregister: () => void;
  const sthis = mockSuperThis();

  beforeAll(() => {
    unregister = registerPartyKitStoreProtocol("partykit:");
  });

  beforeEach(() => {
    const config: ConfigOpts = {
      storeUrls: {
        base: process.env.FP_STORAGE_URL || "partykit://localhost:1999",
      },
    };
    const name = "partykit-test-db-" + sthis.nextId();
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
    expect(process.env.FP_STORAGE_URL).toMatch(/partykit:\/\/localhost:1999/);
  });

  it("should have loader and options", async () => {
    const store = (await db.crdt.blockstore.loader?.carStore()) as bs.BaseStore;
    const url = store.url();
    expect(url.protocol).toBe("partykit:");
    expect(url.hostname).toBe("localhost");
    expect(url.port).toBe("1999");
  });

  it("should initialize and perform basic operations", async () => {
    const docs = await smokeDB(db);
    // Test update operation
    const updateDoc = await db.get<{ readonly content: string }>(docs[0]._id);
    const updateResult = await db.put({
      ...updateDoc,
      content: "Updated content",
    });
    expect(updateResult.id).toBe(updateDoc._id);

    const updatedDoc = await db.get<{ readonly content: string }>(updateDoc._id);
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
    const metaStore = (await db.crdt.blockstore.loader?.metaStore()) as bs.BaseStore;

    const metaGateway = metaStore.realGateway;

    const metaUrl = await metaGateway.buildUrl(metaStore.url(), "main");
    await metaGateway.start(metaStore.url());

    if (metaGateway.subscribe) {
      const future = new Future<void>();
      let didCall = false;
      const metaSubscribeResult = await metaGateway.subscribe?.(metaUrl.Ok(), async (data: Uint8Array) => {
        const decodedData = sthis.txt.decode(data);
        expect(decodedData).toContain("parents");
        didCall = true;
        future.resolve();
      });
      expect(metaSubscribeResult.Ok()).toBeTruthy();
      const ok = await db.put({ _id: "key1", hello: "world1" });
      expect(ok).toBeTruthy();
      expect(ok.id).toBe("key1");
      await future.asPromise();
      expect(didCall).toBeTruthy();
    }
  });
});
