import { ensureSuperThis } from "@fireproof/core";
import { URI } from "@adviser/cement";
import {
  buildReqGestalt,
  buildReqOpen,
  MsgIsError,
  MsgIsResGestalt,
  MsgIsResOpen,
  defaultGestalt,
  ReqSignedUrlParam,
  GwCtx,
  MsgWithError,
  ResOptionalSignedUrl,
} from "./msg-types.js";
import {
  MsgIsResGetData,
  MsgIsResPutData,
  MsgIsResDelData,
  buildReqPutData,
  buildReqDelData,
  buildReqGetData,
} from "./msg-types-data.js";
import {
  buildReqGetWAL,
  buildReqPutWAL,
  buildReqDelWAL,
  MsgIsResGetWAL,
  MsgIsResPutWAL,
  MsgIsResDelWAL,
} from "./msg-types-wal.js";
import { applyStart, defaultMsgParams, MsgConnected, Msger } from "./msger.js";
import { HonoServer } from "./hono-server.js";
import { Hono } from "hono";
import { calculatePreSignedUrl } from "./pre-signed-url.js";
import { CFHonoServerFactory, httpStyle, NodeHonoServerFactory, resolveToml, wsStyle } from "./test-helper.js";
import {
  buildReqDelMeta,
  buildBindGetMeta,
  buildReqPutMeta,
  MsgIsResDelMeta,
  ResDelMeta,
  ReqDelMeta,
  BindGetMeta,
  EventGetMeta,
  MsgIsEventGetMeta,
  MsgIsResPutMeta,
} from "./msg-type-meta.js";

async function refURL(sp: ResOptionalSignedUrl) {
  const { env } = await resolveToml("D1");
  return (
    await calculatePreSignedUrl(sp, {
      storageUrl: URI.from(env.STORAGE_URL),
      aws: {
        accessKeyId: env.ACCESS_KEY_ID,
        secretAccessKey: env.SECRET_ACCESS_KEY,
        region: env.REGION,
      },
      test: {
        amzDate: URI.from(sp.signedUrl).getParam("X-Amz-Date"),
      },
    })
  )
    .Ok()
    .asObj();
}

describe("Connection", () => {
  const sthis = ensureSuperThis();
  const msgP = defaultMsgParams(sthis, { hasPersistent: true });

  beforeAll(async () => {
    sthis.env.sets((await resolveToml("D1")).env as unknown as Record<string, string>);
  });

  describe.each([
    // force multiple lines
    NodeHonoServerFactory(),
    CFHonoServerFactory("DO"),
    CFHonoServerFactory("D1"),
  ])("$name - Connection", (honoServer) => {
    const port = +(process.env.FP_WRANGLER_PORT || 0) || 1024 + Math.floor(Math.random() * (65536 - 1024));
    const qOpen = buildReqOpen(sthis, { reqId: "req-open-test" });
    const my = defaultGestalt(msgP, { id: "FP-Universal-Client" });
    describe.each([
      // force multiple lines
      httpStyle(sthis, port, msgP, my),
      wsStyle(sthis, port, msgP, my),
    ])(`${honoServer.name} - $name`, (style) => {
      let server: HonoServer;
      beforeAll(async () => {
        const app = new Hono();
        server = await honoServer.factory(sthis, msgP, style.remoteGestalt, port).then((srv) => srv.once(app, port));
      });
      afterAll(async () => {
        // console.log("closing server");
        await server.close();
      });
      it(`conn refused`, async () => {
        const rC = await applyStart(style.connRefused.open());
        expect(rC.isErr()).toBeTruthy();
        expect(rC.Err().message).toMatch(/ECONNREFUSED/);
      });

      it(`timeout`, async () => {
        const rC = await applyStart(style.timeout.open());
        expect(rC.isErr()).toBeTruthy();
        expect(rC.Err().message).toMatch(/Timeout/i);
      });

      describe(`connection`, () => {
        let c: MsgConnected;
        beforeEach(async () => {
          const rC = await style.ok.open().then((r) => MsgConnected.connect(r, { reqId: "req-open-testx" }));
          expect(rC.isOk()).toBeTruthy();
          c = rC.Ok();
          expect(c.conn).toEqual({
            reqId: "req-open-testx",
            resId: c.conn.resId,
          });
        });
        afterEach(async () => {
          await c.close();
        });

        it("kaputt url http", async () => {
          const r = await c.raw.request(
            {
              tid: "test",
              type: "kaputt",
              version: "FP-MSG-1.0",
            },
            { waitFor: () => true }
          );
          if (!MsgIsError(r)) {
            assert.fail("expected MsgError");
            return;
          }
          expect(r).toEqual({
            message: "unexpected message",
            tid: "test",
            type: "error",
            version: "FP-MSG-1.0",
            src: {
              tid: "test",
              type: "kaputt",
              version: "FP-MSG-1.0",
            },
          });
        });
        it("gestalt url http", async () => {
          const msgP = defaultMsgParams(sthis, {});
          const req = buildReqGestalt(sthis, defaultGestalt(msgP, { id: "test" }));
          const r = await c.raw.request(req, { waitFor: MsgIsResGestalt });
          if (!MsgIsResGestalt(r)) {
            assert.fail("expected MsgError", JSON.stringify(r));
          }
          expect(r.gestalt).toEqual(c.exchangedGestalt?.remote);
        });

        it("openConnection", async () => {
          const req = buildReqOpen(sthis, { ...c.conn });
          const r = await c.raw.request(req, { waitFor: MsgIsResOpen });
          if (!MsgIsResOpen(r)) {
            assert.fail(JSON.stringify(r));
          }
          expect(r).toEqual({
            conn: { ...c.conn, resId: r.conn?.resId },
            tid: req.tid,
            type: "resOpen",
            version: "FP-MSG-1.0",
          });
        });
      });

      it("open", async () => {
        const rC = await Msger.connect(sthis, URI.from(`http://localhost:${port}/fp`), msgP, {
          reqId: "req-open-testy",
        });
        expect(rC.isOk()).toBeTruthy();
        const c = rC.Ok();
        expect(c.conn).toEqual({
          reqId: "req-open-testy",
          resId: c.conn.resId,
        });
        expect(c.raw).toBeInstanceOf(style.cInstance);
        expect(c.exchangedGestalt).toEqual({
          my,
          remote: style.remoteGestalt,
        });
        await c.close();
      });
      describe(`${honoServer.name} - Msgs`, () => {
        let gwCtx: GwCtx;
        let conn: MsgConnected;
        beforeAll(async () => {
          const rC = await Msger.connect(sthis, URI.from(`http://localhost:${port}/fp`), msgP, qOpen.conn);
          expect(rC.isOk()).toBeTruthy();
          conn = rC.Ok();
          gwCtx = {
            conn: conn.conn,
            tenant: {
              tenant: "Tenant",
              ledger: "Ledger",
            },
          };
        });
        afterAll(async () => {
          await conn.close();
        });
        it("Open", async () => {
          const res = await conn.raw.request(buildReqOpen(sthis, conn.conn), { waitFor: MsgIsResOpen });
          if (!MsgIsResOpen(res)) {
            assert.fail("expected MsgResOpen", JSON.stringify(res));
          }
          expect(MsgIsResOpen(res)).toBeTruthy();
          expect(res.conn).toEqual({ ...qOpen.conn, resId: res.conn.resId });
        });

        function sup() {
          return {
            path: "test/me",
            key: "key-test",
          } satisfies ReqSignedUrlParam;
        }
        describe("Data", async () => {
          it("Get", async () => {
            const sp = sup();
            const res = await conn.request(buildReqGetData(sthis, sp, gwCtx), { waitFor: MsgIsResGetData });
            if (MsgIsResGetData(res)) {
              // expect(res.params).toEqual(sp);
              expect(URI.from(res.signedUrl).asObj()).toEqual(await refURL(res));
            } else {
              assert.fail("expected MsgResGetData", JSON.stringify(res));
            }
          });
          it("Put", async () => {
            const sp = sup();
            const res = await conn.request(buildReqPutData(sthis, sp, gwCtx), { waitFor: MsgIsResPutData });
            if (MsgIsResPutData(res)) {
              // expect(res.params).toEqual(sp);
              expect(URI.from(res.signedUrl).asObj()).toEqual(await refURL(res));
            } else {
              assert.fail("expected MsgResPutData", JSON.stringify(res));
            }
          });
          it("Del", async () => {
            const sp = sup();
            const res = await conn.request(buildReqDelData(sthis, sp, gwCtx), { waitFor: MsgIsResDelData });
            if (MsgIsResDelData(res)) {
              // expect(res.params).toEqual(sp);
              expect(URI.from(res.signedUrl).asObj()).toEqual(await refURL(res));
            } else {
              assert.fail("expected MsgResDelData", JSON.stringify(res));
            }
          });
        });

        describe("Meta", async () => {
          it("bind stop", async () => {
            const sp = sup();
            expect(conn.raw.activeBinds.size).toBe(0);
            const streams: ReadableStream<MsgWithError<EventGetMeta>>[] = Array(5)
              .fill(0)
              .map(() => {
                return conn.bind<EventGetMeta, BindGetMeta>(buildBindGetMeta(sthis, sp, gwCtx), {
                  waitFor: MsgIsEventGetMeta,
                });
              });
            for await (const stream of streams) {
              const reader = stream.getReader();
              while (true) {
                const { done, value: msg } = await reader.read();
                if (done) {
                  break;
                }
                if (MsgIsEventGetMeta(msg)) {
                  // expect(msg.params).toEqual(sp);
                  expect(URI.from(msg.signedUrl).asObj()).toEqual(await refURL(msg));
                } else {
                  assert.fail("expected MsgEventGetMeta", JSON.stringify(msg));
                }
                await reader.cancel();
              }
            }
            expect(conn.raw.activeBinds.size).toBe(0);
            // await Promise.all(streams.map((s) => s.cancel()));
          });

          it("Get", async () => {
            const sp = sup();
            const res = await conn.request(buildBindGetMeta(sthis, sp, gwCtx), { waitFor: MsgIsEventGetMeta });
            if (MsgIsEventGetMeta(res)) {
              // expect(res.params).toEqual(sp);
              expect(URI.from(res.signedUrl).asObj()).toEqual(await refURL(res));
            } else {
              assert.fail("expected MsgIsEventGetMeta", JSON.stringify(res));
            }
          });
          it("Put", async () => {
            const sp = sup();
            const metas = Array(5)
              .fill({ cid: "x", parents: [], data: "MomRkYXRho" })
              .map((data) => {
                return { ...data, cid: sthis.timeOrderedNextId().str };
              });
            const res = await conn.request(buildReqPutMeta(sthis, sp, metas, gwCtx), { waitFor: MsgIsResPutMeta });
            if (MsgIsResPutMeta(res)) {
              // expect(res.params).toEqual(sp);
              expect(URI.from(res.signedUrl).asObj()).toEqual(await refURL(res));
            } else {
              assert.fail("expected MsgIsResPutMeta", JSON.stringify(res));
            }
          });
          it("Del", async () => {
            const sp = sup();
            const res = await conn.request<ResDelMeta, ReqDelMeta>(buildReqDelMeta(sthis, sp, gwCtx), {
              waitFor: MsgIsResDelMeta,
            });
            if (MsgIsResDelMeta(res)) {
              // expect(res.params).toEqual(sp);
              expect(URI.from(res.signedUrl).asObj()).toEqual(await refURL(res));
            } else {
              assert.fail("expected MsgResDelWAL", JSON.stringify(res));
            }
          });
        });
        describe("WAL", async () => {
          it("Get", async () => {
            const sp = sup();
            const res = await conn.request(buildReqGetWAL(sthis, sp, gwCtx), { waitFor: MsgIsResGetWAL });
            if (MsgIsResGetWAL(res)) {
              // expect(res.params).toEqual(sp);
              expect(URI.from(res.signedUrl).asObj()).toEqual(await refURL(res));
            } else {
              assert.fail("expected MsgResGetWAL", JSON.stringify(res));
            }
          });
          it("Put", async () => {
            const sp = sup();
            const res = await conn.request(buildReqPutWAL(sthis, sp, gwCtx), { waitFor: MsgIsResPutWAL });
            if (MsgIsResPutWAL(res)) {
              // expect(res.params).toEqual(sp);
              expect(URI.from(res.signedUrl).asObj()).toEqual(await refURL(res));
            } else {
              assert.fail("expected MsgResPutWAL", JSON.stringify(res));
            }
          });
          it("Del", async () => {
            const sp = sup();
            const res = await conn.request(buildReqDelWAL(sthis, sp, gwCtx), { waitFor: MsgIsResDelWAL });
            if (MsgIsResDelWAL(res)) {
              // expect(res.params).toEqual(sp);
              expect(URI.from(res.signedUrl).asObj()).toEqual(await refURL(res));
            } else {
              assert.fail("expected MsgResDelWAL", JSON.stringify(res));
            }
          });
        });
      });
    });
  });
});
