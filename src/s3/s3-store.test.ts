import { fireproof, Database } from "@fireproof/core";
import { registerS3StoreProtocol } from "./s3-gateway";
import { describe, it, expect } from "vitest";

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
}

describe("store-register", () => {
  it("test unregister", async () => {
    let unreg = registerS3StoreProtocol("s3reg:");
    unreg();
    unreg = registerS3StoreProtocol("s3reg:");
    unreg();
  });
  it("should store and retrieve data", async () => {
    const unreg = registerS3StoreProtocol("s3test:");
    const db = fireproof("my-database", {
      store: {
        stores: {
          base: process.env.FP_STORAGE_URL,
        },
      },
    });
    await smokeDB(db);
    await db.destroy();
    unreg();
  });

  it("override default Base Dir", async () => {
    const unreg = registerS3StoreProtocol("s3test:", process.env.FP_STORAGE_URL);
    const db = fireproof("override-database");
    await smokeDB(db);
    await db.destroy();
    unreg();
  });
});
