import { URI } from "@adviser/cement";
import { fireproof, Database } from "@fireproof/core";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { registerUCANStoreProtocol } from "./ucan-gateway";

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

describe("UCANGateway", () => {
  let db: Database;
  let unregister: () => void;

  beforeAll(() => {
    unregister = registerUCANStoreProtocol("ucan:");
  });

  afterAll(() => {
    unregister();
  });

  it("should initialize and perform basic operations", async () => {
    // Initialize the database with UCAN configuration
    const uri = URI.from(process.env.FP_STORAGE_URL);
    const url = `ucan://${uri.host}?email=example@fireproof.storage&serverHost=${uri.protocol + uri.host}`;

    const config = {
      store: {
        stores: {
          base: url.toString(),
        },
      },
    };

    // console.log("Fireproof config:", JSON.stringify(config, null, 2));
    db = fireproof("ucan-test-db", config);

    const loader = db.blockstore.loader;
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
    const baseUrl = new URL(loader.ebOpts.store.stores.base.toString());
    expect(baseUrl.protocol).toBe("ucan:");
    expect(baseUrl.hostname).toBe("localhost");
    expect(baseUrl.port).toBe("8787");

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
