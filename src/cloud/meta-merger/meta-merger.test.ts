// import type { Database } from "better-sqlite3";
import { MetaMerger } from "./meta-merger.js";
import { CRDTEntry, ensureSuperThis } from "@fireproof/core";
import { Connection } from "../msg-types.js";
import { runtimeFn } from "@adviser/cement";
import { SQLDatabase } from "./abstract-sql.js";
import type { Env } from "../backend/env.js";

function sortCRDTEntries(rows: CRDTEntry[]) {
  return rows.sort((a, b) => a.cid.localeCompare(b.cid));
}

describe("MetaMerger", () => {
  let db: SQLDatabase;
  const sthis = ensureSuperThis();
  let mm: MetaMerger;
  beforeAll(async () => {
    //    db = new Database(':memory:');
    if (runtimeFn().isCFWorker) {
      const { CFWorkerSQLDatabase } = await import("./cf-worker-abstract-sql.js");
      const { env } = await import("cloudflare:test");
      db = new CFWorkerSQLDatabase((env as Env).DB);
    } else {
      const { BetterSQLDatabase } = await import("./bettersql-abstract-sql.js");
      db = new BetterSQLDatabase("./dist/test.db");
    }
    mm = new MetaMerger(sthis, db);
    await mm.createSchema();
  });

  let connection: Connection;
  beforeEach(() => {
    connection = {
      key: {
        tenant: `tenant${sthis.timeOrderedNextId().str}`,
        ledger: "ledger",
      },
      reqId: "reqId",
      resId: "resId",
    } satisfies Connection;
  });

  it("insert nothing", async () => {
    await mm.addMeta({
      connection,
      metas: [],
      now: new Date(),
    });
    const rows = await mm.metaToSend(connection);
    expect(rows).toEqual([]);
  });

  it("insert one multiple", async () => {
    const cid = sthis.timeOrderedNextId().str;
    for (let i = 0; i < 10; i++) {
      const metas = Array(i).fill({
        cid: cid,
        parents: [],
        data: "MomRkYXRho",
      });
      await mm.addMeta({
        connection,
        metas,
        now: new Date(),
      });
      const rows = await mm.metaToSend(connection);
      if (i === 1) {
        expect(rows).toEqual(metas);
      } else {
        expect(rows).toEqual([]);
      }
    }
  });

  it("insert multiple", async () => {
    for (let i = 0; i < 10; i++) {
      const metas = Array(i)
        .fill({
          cid: "x",
          parents: [],
          data: "MomRkYXRho",
        })
        .map((m) => ({ ...m, cid: sthis.timeOrderedNextId().str }));
      await mm.addMeta({
        connection: { ...connection, reqId: sthis.timeOrderedNextId().str } satisfies Connection,
        metas,
        now: new Date(),
      });
      const rows = await mm.metaToSend(connection);
      expect(sortCRDTEntries(rows)).toEqual(sortCRDTEntries(metas));
    }
  });

  it("metaToSend to sink", async () => {
    const connections = Array(2)
      .fill(connection)
      .map((c) => ({ ...c, reqId: sthis.timeOrderedNextId().str }));
    const ref: CRDTEntry[] = [];
    for (const connection of connections) {
      const metas = Array(2)
        .fill({
          cid: "x",
          parents: [],
          data: "MomRkYXRho",
        })
        .map((m) => ({ ...m, cid: sthis.timeOrderedNextId().str }));
      ref.push(...metas);
      await mm.addMeta({
        connection,
        metas,
        now: new Date(),
      });
    }
    // wrote 10 connections with 3 metas each
    for (const connection of connections) {
      const rows = await mm.metaToSend(connection);
      expect(sortCRDTEntries(rows)).toEqual(sortCRDTEntries(ref));
    }
    const newConnections = Array(2)
      .fill(connection)
      .map((c) => ({ ...c, reqId: sthis.timeOrderedNextId().str }));
    for (const connection of newConnections) {
      const rows = await mm.metaToSend(connection);
      expect(sortCRDTEntries(rows)).toEqual(sortCRDTEntries(ref));
    }
  });
});
