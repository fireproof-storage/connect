import { fireproof } from "@fireproof/core";
import { registerGDriveStoreProtocol } from "./drive-gateway.js";
import { describe, it } from "vitest";
import { smokeDB } from "../../tests/helper.js";

describe("store-register", () => {
  
  it("should store and retrieve data", async () => {
    const unreg = registerGDriveStoreProtocol("gdrive:");
    const db = fireproof("my-database", {
      store: {
        stores: {
          base: "gdrive://www.googleapis.com/?auth=testtoken",
        },
      },
    });
    await smokeDB(db);
    await db.destroy();
    unreg();
  });

 
});
