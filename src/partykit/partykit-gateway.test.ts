import { fireproof, Database, ConfigOpts, bs, ensureSuperThis } from "@fireproof/core";
import { registerPartyKitStoreProtocol } from "./gateway.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Future, URI } from "@adviser/cement";
import { smokeDB } from "../../tests/helper.js";
// import { storageURL } from "../connector.test.js";

// has to leave
// interface ExtendedGateway extends bs.Gateway {
//   headerSize: number;
//   subscribe?: (url: URI, callback: (meta: Uint8Array) => void) => Promise<bs.UnsubscribeResult>; // Changed VoidResult to UnsubscribeResult
// }

// // has to leave
// interface ExtendedStore {
//   gateway: ExtendedGateway;
//   _url: URI;
//   name: string;
// }

describe("PartyKitGateway", () => {
  let db: Database;
  let unregister: () => void;
  // const sthis = ensureSuperThis();
  let ctx: bs.SerdeGatewayCtx;
  const sthis = ensureSuperThis();

  beforeAll(() => {
    unregister = registerPartyKitStoreProtocol("partykit:");
  });

  beforeEach(async () => {
    const config: ConfigOpts = {
      storeUrls: {
        base: process.env.FP_STORAGE_URL || "partykit://localhost:1999",
      },
    };
    const name = "partykit-test-db-" + sthis.nextId().str;
    db = fireproof(name, config);
    ctx = { loader: db.ledger.crdt.blockstore.loader };
    await db.ready();
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

  it("should have loader and options", () => {
    const loader = db.ledger.crdt.blockstore.loader;
    expect(loader).toBeDefined();
    if (!loader) {
      throw new Error("Loader is not defined");
    }
    expect(loader.ebOpts).toBeDefined();
    // expect(loader.ebOpts.store).toBeDefined();
    // expect(loader.ebOpts.store.stores).toBeDefined();
    // if (!loader.ebOpts.store.stores) {
    //   throw new Error("Loader stores is not defined");
    // }
    // if (!loader.ebOpts.store.stores.base) {
    //   throw new Error("Loader stores.base is not defined");
    // }

    const baseUrl = URI.from(loader.ebOpts.storeUrls.car);
    expect(baseUrl.protocol).toBe("partykit:");
    expect(baseUrl.hostname).toBe("localhost");
    expect(baseUrl.port || "").toBe("1999");
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

  it.skip("should subscribe to changes", async () => {
    // Extract stores from the loader
    const metaStore = await db.ledger.crdt.blockstore.loader.attachedStores.local().active.meta;

    const metaGateway = metaStore.realGateway;

    const metaUrl = await metaGateway?.buildUrl(ctx, metaStore.url(), "main");
    await metaGateway.start(ctx, metaStore.url());

    if (metaGateway.subscribe) {
      const p = new Future<void>();
      let didCall = false;
      const metaSubscribeResult = await metaGateway.subscribe(ctx, metaUrl?.Ok(), async (data) => {
        // const decodedData = sthis.txt.decode(data);
        expect(data.payload).toContain("parents");
        if (!didCall) {
          p.resolve();
        }
        didCall = true;
      });
      expect(metaSubscribeResult.isOk()).toBeTruthy();
      const ok = await db.put({ _id: "key1", hello: "world1" });
      expect(ok).toBeTruthy();
      expect(ok.id).toBe("key1");
      await p.asPromise();
      expect(didCall).toBeTruthy();
    }
  });
});
