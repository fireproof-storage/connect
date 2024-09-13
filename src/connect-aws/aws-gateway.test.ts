import { fireproof, Database } from "@fireproof/core";
import { registerAWSStoreProtocol } from "./aws-gateway";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

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

describe("AWSGateway", () => {
  let db: Database;
  let unregister: () => void;

  beforeAll(() => {
    unregister = registerAWSStoreProtocol("aws:");
  });

  afterAll(() => {
    unregister();
  });

  it("env setup is ok", () => {
    expect(process.env.FP_STORAGE_URL).toMatch(/aws:\/\/aws/);

    const url = new URL(process.env.FP_STORAGE_URL || "");
    expect(url.searchParams.get("dataUrl")).toBeTruthy();
    expect(url.searchParams.get("uploadUrl")).toBeTruthy();
    expect(url.searchParams.get("webSocketUrl")).toBeTruthy();
  });

  it("should initialize and perform basic operations", async () => {
    // Initialize the database with AWS configuration
    const config = {
      store: {
        stores: {
          base: process.env.FP_STORAGE_URL || "aws://aws",
        },
      },
    };
    // console.log("Fireproof config:", JSON.stringify(config, null, 2));
    db = fireproof("aws-test-db", config);

    const loader = db.blockstore.loader;
    // Assert that loader has ebOpts.store.stores
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

    // console.log("Loader stores:", loader.ebOpts.store.stores);

    // Test base URL configuration
    const baseUrl = new URL(loader.ebOpts.store.stores.base.toString());
    expect(baseUrl.protocol).toBe("aws:");
    expect(baseUrl.hostname).toBe("aws");

    // Check for required parameters in the base URL
    expect(baseUrl.searchParams.get("dataUrl")).toBeTruthy();
    expect(baseUrl.searchParams.get("uploadUrl")).toBeTruthy();
    expect(baseUrl.searchParams.get("webSocketUrl")).toBeTruthy();

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

  // it("should handle multiple databases", async () => {
  //   const db1 = fireproof("aws-test-db1", {
  //     store: {
  //       stores: {
  //         base: process.env.FP_STORAGE_URL || "aws://aws",
  //       },
  //     },
  //   });

  //   const db2 = fireproof("aws-test-db2", {
  //     store: {
  //       stores: {
  //         base: process.env.FP_STORAGE_URL || "aws://aws",
  //       },
  //     },
  //   });

  //   await smokeDB(db1);
  //   await smokeDB(db2);

  //   // Ensure data is separate
  //   const allDocs1 = await db1.allDocs();
  //   const allDocs2 = await db2.allDocs();
  //   expect(allDocs1.rows).not.toEqual(allDocs2.rows);

  //   // Clean up
  //   await db1.destroy();
  //   await db2.destroy();
  // });
});
