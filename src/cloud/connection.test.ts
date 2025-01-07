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
  ResSignedUrl,
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

async function refURL(sp: ResSignedUrl) {
  const { env } = await resolveToml();
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
    sthis.env.sets((await resolveToml()).env as unknown as Record<string, string>);
  });

  describe.each([[NodeHonoServerFactory(), CFHonoServerFactory()]])("$name - Connection", (honoServer) => {
    const port = +(process.env.FP_WRANGLER_PORT || 0) || 1024 + Math.floor(Math.random() * (65536 - 1024));
    const qOpen = buildReqOpen(sthis, { reqId: "req-open-test" });
    const my = defaultGestalt(msgP, { id: "FP-Universal-Client" });
    describe.each([httpStyle(sthis, port, msgP, my), wsStyle(sthis, port, msgP, my)])("$name", (style) => {
      let server: HonoServer;
      beforeAll(async () => {
        const app = new Hono();
        server = await honoServer
          .factory(sthis, msgP, style.remoteGestalt, port)
          .then((srv) => srv.register(app, port));
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
        // describe("Meta", async () => {
        //   // const res = await conn.request(buildReqGetMeta(), { waitFor: MsgIsResGetMeta });
        //   // expect(MsgIsError(res)).toBeTruthy();
        // });
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
