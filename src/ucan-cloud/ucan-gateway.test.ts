import { URI } from "@adviser/cement";
import { fireproof, Database } from "@fireproof/core";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Absentee } from "@ucanto/principal";
import * as UCANTO from "@ucanto/core";
import { ed25519 } from "@ucanto/principal";
import { Signer } from "@ucanto/principal/ed25519";
import * as UCAN from "@web3-storage/capabilities/ucan";
import * as DidMailto from "@web3-storage/did-mailto";
import { StoreConf } from "@web3-storage/access/stores/store-conf";
import { AgentDataExport, AgentMeta } from "@web3-storage/access/agent";

import { registerUCANStoreProtocol } from "./ucan-gateway";
import { smokeDB } from "../../tests/helper";
import { exportDelegation } from "./common";

////////////////////////////////////////
// W3
////////////////////////////////////////

async function authorizeW3({
  confProfile,
  email,
  host,
}: {
  confProfile: string;
  email: `${string}@${string}`;
  host: string;
}) {
  const serverPrivateKey =
    "MgCZc476L5pn6Kiw5YdLHEy5CHZgw5gRWxNj/UcLRQoxaHu0BREgGEsI7N8cQxjO6fdgA/lEAphNmR/um1DEfmBTBByY=";
  const signer = Signer.parse(serverPrivateKey);
  const account = Absentee.from({ id: DidMailto.fromEmail(email) });
  const agent = await ed25519.Signer.generate();

  const hostURI = URI.from(host);
  if (!hostURI) throw new Error("`hostURI` is not a valid URI");

  const delegation = await UCANTO.delegate({
    issuer: account,
    audience: agent,
    capabilities: [{ can: "*", with: "ucan:*" }],
    expiration: Infinity,
  });

  const attestation = await UCAN.attest.delegate({
    issuer: signer,
    audience: agent,
    with: signer.did(),
    nb: { proof: delegation.cid },
    expiration: Infinity,
  });

  const store = new StoreConf({ profile: confProfile });
  const agentMeta: AgentMeta = { name: "test", type: "device" };

  const raw: AgentDataExport = {
    meta: agentMeta,
    principal: agent.toArchive(),
    spaces: new Map(),
    delegations: new Map([exportDelegation(delegation), exportDelegation(attestation)]),
  };

  await store.save(raw);
}

////////////////////////////////////////
// TESTS
////////////////////////////////////////

describe("UCANGateway", () => {
  let db: Database;
  let unregister: () => void;
  let uri: URI;
  let email: `${string}@${string}`;
  let host: string;

  beforeAll(() => {
    unregister = registerUCANStoreProtocol("ucan:");
  });

  afterAll(() => {
    unregister();
  });

  beforeEach(async () => {
    uri = URI.from(process.env.FP_STORAGE_URL);

    const ep = uri.getParam("email");
    if (ep) email = ep as `${string}@${string}`;
    else throw new Error("Missing email param in URI");

    const sp = uri.getParam("server-host");
    if (sp) host = sp;
    else throw new Error("Missing server-host param in URI");

    const config = {
      store: {
        stores: {
          base: process.env.FP_STORAGE_URL || "",
        },
      },
    };

    const name = "ucan-test-db-" + Math.random().toString(36).substring(7);
    db = fireproof(name, config);

    await authorizeW3({ email, host, confProfile: uri.getParam("conf-profile") || "fireproof-connect/test" });
  });

  afterEach(() => {
    // Clear the database before each test
    if (db) {
      db.destroy();
    }
  });

  // it.skip("should have loader and options", () => {
  //   const loader = db.blockstore?.loader;
  //   expect(loader).toBeDefined();

  //   if (!loader) {
  //     throw new Error("Loader is not defined");
  //   }

  //   expect(loader.ebOpts).toBeDefined();
  //   expect(loader.ebOpts.store).toBeDefined();
  //   expect(loader.ebOpts.store.stores).toBeDefined();

  //   if (!loader.ebOpts.store.stores) {
  //     throw new Error("Loader stores is not defined");
  //   }

  //   if (!loader.ebOpts.store.stores.base) {
  //     throw new Error("Loader stores.base is not defined");
  //   }

  //   // Test base URL configuration
  //   const baseUrl = new URL(loader.ebOpts.store.stores.base.toString());
  //   expect(baseUrl.protocol).toBe("ucan:");
  //   expect(baseUrl.hostname).toBe("localhost");
  //   expect(baseUrl.port).toBe("8787");
  // });

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
