import { fireproof, Database } from "@fireproof/core";
import { registerNetlifyStoreProtocol } from "./gateway.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { URI } from "@adviser/cement";
import { smokeDB } from "../../tests/helper.js";

describe("NetlifyGateway", () => {
  let db: Database;
  let unregister: () => void;

  beforeAll(() => {
    unregister = registerNetlifyStoreProtocol("netlify:");
  });

  afterAll(() => {
    unregister();
  });

  it("env setup is ok", () => {
    expect(process.env.FP_STORAGE_URL).toMatch(/netlify:\/\/localhost:8888/);
  });

  it("should initialize and perform basic operations", async () => {
    const config = {
      store: {
        stores: {
          base: process.env.FP_STORAGE_URL || "netlify://localhost:8888",
        },
      },
    };
    db = fireproof("netlify-test-db", config);

    const loader = db.blockstore.loader;
    expect(loader).toBeDefined();
    if (!loader) {
      throw new Error("Loader is not defined");
    }
    expect(loader.ebOpts).toBeDefined();
    expect(loader.ebOpts.store).toBeDefined();
    expect(loader.ebOpts.store.stores).toBeDefined();
    expect(loader.ebOpts.store.stores?.base).toBeDefined();
    // if (!loader.ebOpts.store.stores) {
    //   throw new Error("Loader stores is not defined");
    // }
    // if (!loader.ebOpts.store.stores.base) {
    //   throw new Error("Loader stores.base is not defined");
    // }

    const baseUrl = URI.from(loader.ebOpts.store.stores?.base?.toString());
    expect(baseUrl.protocol).toBe("netlify:");
    expect(baseUrl.hostname).toBe("localhost");
    expect(baseUrl.port).toBe("8888");

    const docs = await smokeDB(db);
    return;
    // get a new db instance
    db = new Database("netlify-test-db", config);

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
});
