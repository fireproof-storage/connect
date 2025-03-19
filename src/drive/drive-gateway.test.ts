import { fireproof } from "@fireproof/core";
import {registerGDriveStoreProtocol} from "./drive-gateway.ts"
import { describe, it } from "vitest";
import { smokeDB } from "../../tests/helper.js";

describe("store-register", { timeout: 100000 }, () => {
  it("should store and retrieve data", { timeout: 100000 },  async () => {
    registerGDriveStoreProtocol("gdrive:", "ya29.a0AeXRPp7h4fANs0x2Y9nL3TCvL96bAnUJmwQ0oOlXPcKSmnajd_h8X2yxA8vdUo62CiKySJzrhYHMhwQVqvLnNVrHaSgR23PuF6rZXLXMApAu6rfRWtVFFKS8pYjEm36VW5csE656Z5bHXzWLXitqz9we-7zskpMNbak_NWOMaCgYKAXoSAQ8SFQHGX2MiXQzoB1I3l33KyL1DJICHNw0175")
    const db = fireproof("diy-0.0", {
      storeUrls: {
        base: "gdrive://home-improvement",
      },
    });
    await smokeDB(db);
  });
});
