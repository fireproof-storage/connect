import { URI } from "@adviser/cement";
import { fireproof, Database } from "@fireproof/core";
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";

import { registerUCANStoreProtocol } from "./ucan-gateway";
import { smokeDB } from "../../tests/helper";

////////////////////////////////////////
// TESTS
////////////////////////////////////////

describe("UCANGateway", () => {
  let db: Database;
  let unregister: () => void;
  let uri: URI;

  beforeAll(() => {
    unregister = registerUCANStoreProtocol("ucan:");
  });

  afterAll(() => {
    unregister();
  });

  beforeEach(async () => {
    uri = URI.from(process.env.FP_STORAGE_URL);

    const config = {
      store: {
        stores: {
          base: process.env.FP_STORAGE_URL || "",
        },
      },
    };

    const name = uri.getParam("name");
    if (!name) throw new Error("Missing `name` param");

    db = fireproof(name, config);
  });

  afterEach(() => {
    // Clear the database before each test
    if (db) {
      db.destroy();
    }
  });

  it("should have loader and options", () => {
    const loader = db.blockstore?.loader;
    expect(loader).toBeDefined();

    if (!loader) {
      throw new Error("Loader is not defined");
    }

    expect(loader.ebOpts).toBeDefined();
    expect(loader.ebOpts.store).toBeDefined();
    expect(loader.ebOpts.store.stores).toBeDefined();

    if (!loader.ebOpts.store.stores) {
      throw new Error("Loader stores is not defined");
    }

    if (!loader.ebOpts.store.stores.base) {
      throw new Error("Loader stores.base is not defined");
    }

    // Test base URL configuration
    const baseUrl = URI.from(loader.ebOpts.store.stores.base.toString());
    expect(baseUrl.protocol).toBe("ucan:");
    expect(baseUrl.hostname).toBe("localhost");
    expect(baseUrl.port).toBe("8787");
  });

  it("should initialize and perform basic operations", async () => {
    const docs = await smokeDB(db);

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
