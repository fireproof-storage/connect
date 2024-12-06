import { fireproof } from "@fireproof/core";
import { registerS3StoreProtocol } from "./s3-gateway.js";
import { smokeDB } from "../../tests/helper.js";

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
