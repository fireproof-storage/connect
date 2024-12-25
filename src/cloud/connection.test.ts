import { ensureSuperThis, SuperThis } from "@fireproof/core";
import { Future, URI } from "@adviser/cement";
import {
  buildReqGestalt,
  buildReqOpen,
  MsgIsError,
  MsgIsResGestalt,
  MsgIsResOpen,
  defaultGestalt,
  MsgerParams,
  Gestalt,
  ReqOpen,
  ReqSignedUrlParam,
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
import { applyStart, defaultMsgParams, MsgConnection, Msger } from "./msger.js";
import { HttpConnection } from "./http-connection.js";
import { WSConnection } from "./ws-connection.js";
import { HonoServer } from "./hono-server.js";
import { Hono } from "hono";
import { NodeHonoServer } from "./node-hono-server.js";
import { $ } from "zx";
import * as fs from "fs/promises";
import * as toml from "smol-toml";
import { Env } from "./backend/env.js";
import { calculatePreSignedUrl, PreSignedMsg } from "./pre-signed-url.js";

function httpStyle(sthis: SuperThis, port: number, msgP: MsgerParams, qOpen: ReqOpen, my: Gestalt) {
  const remote = defaultGestalt(defaultMsgParams(sthis, { hasPersistent: true, protocol: "http" }), {
    id: "HTTP-server",
  });
  const exGt = { my, remote };
  return {
    name: "HTTP",
    remoteGestalt: remote,
    cInstance: HttpConnection,
    ok: {
      url: () => URI.from(`http://127.0.0.1:${port}/fp`),
      open: () =>
        applyStart(
          Msger.openHttp(
            sthis,
            qOpen,
            [URI.from(`http://localhost:${port}/fp`)],
            {
              ...msgP,
              protocol: "http",
              timeout: 1000,
            },
            exGt
          )
        ),
    },
    connRefused: {
      url: () => URI.from(`http://127.0.0.1:${port - 1}/fp`),
      open: () =>
        Msger.openHttp(
          sthis,
          qOpen,
          [URI.from(`http://localhost:${port - 1}/fp`)],
          {
            ...msgP,
            protocol: "http",
            timeout: 1000,
          },
          exGt
        ),
    },
    timeout: {
      url: () => URI.from(`http://4.7.1.1:${port}/fp`),
      open: () =>
        Msger.openHttp(
          sthis,
          qOpen,
          [URI.from(`http://4.7.1.1:${port}/fp`)],
          {
            ...msgP,
            protocol: "http",
            timeout: 500,
          },
          exGt
        ),
    },
  };
}

function wsStyle(sthis: SuperThis, port: number, msgP: MsgerParams, qOpen: ReqOpen, my: Gestalt) {
  const remote = defaultGestalt(defaultMsgParams(sthis, { hasPersistent: true, protocol: "ws" }), { id: "WS-server" });
  const exGt = { my, remote };
  return {
    name: "WS",
    remoteGestalt: remote,
    cInstance: WSConnection,
    ok: {
      url: () => URI.from(`http://127.0.0.1:${port}/ws`),
      open: () =>
        applyStart(
          Msger.openWS(
            sthis,
            qOpen,
            URI.from(`http://localhost:${port}/ws`),
            {
              ...msgP,
              protocol: "ws",
              timeout: 1000,
            },
            exGt
          )
        ),
    },
    connRefused: {
      url: () => URI.from(`http://127.0.0.1:${port - 1}/ws`),
      open: () =>
        Msger.openWS(
          sthis,
          qOpen,
          URI.from(`http://localhost:${port - 1}/ws`),
          {
            ...msgP,
            protocol: "ws",
            timeout: 1000,
          },
          exGt
        ),
    },
    timeout: {
      url: () => URI.from(`http://4.7.1.1:${port - 1}/ws`),
      open: () =>
        Msger.openWS(
          sthis,
          qOpen,
          URI.from(`http://4.7.1.1:${port - 1}/ws`),
          {
            ...msgP,
            protocol: "ws",
            timeout: 500,
          },
          exGt
        ),
    },
  };
}

async function resolveToml() {
  const tomlFile = "src/cloud/backend/wrangler.toml";
  const tomeStr = await fs.readFile(tomlFile, "utf-8");
  const wranglerFile = toml.parse(tomeStr) as unknown as {
    env: { "test-reqRes": { vars: Env } };
  };
  return {
    tomlFile,
    env: wranglerFile.env["test-reqRes"].vars,
  };
}

async function refURL(sp: PreSignedMsg) {
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
        // amzDate?: string;
      },
    })
  )
    .Ok()
    .asObj();
}

const sthis = ensureSuperThis();
const msgP = defaultMsgParams(sthis, { hasPersistent: true });
for (const honoServer of [
  {
    name: "NodeHonoServer",
    factory: async (remoteGestalt: Gestalt, _port: number) => {
      return new HonoServer(sthis, msgP, remoteGestalt, new NodeHonoServer((await resolveToml()).env));
    },
  },
  {
    name: "CFHonoServer",
    factory: async (remoteGestalt: Gestalt, port: number) => {
      const { tomlFile } = await resolveToml();
      $.verbose = !!process.env.FP_DEBUG;
      const runningWrangler = $`
              wrangler dev -c ${tomlFile} --port ${port} --env test-${remoteGestalt.protocolCapabilities[0]} --no-show-interactive-dev-session &
              waitPid=$!
              echo "PID:$waitPid"
              wait $waitPid`;
      const waitReady = new Future();
      let pid: number | undefined;
      runningWrangler.stdout.on("data", (chunk) => {
        // console.log(">>", chunk.toString())
        const mightPid = chunk.toString().match(/PID:(\d+)/)?.[1];
        if (mightPid) {
          pid = +mightPid;
        }
        if (chunk.includes("Ready on http")) {
          waitReady.resolve(true);
        }
      });
      runningWrangler.stderr.on("data", (chunk) => {
        // eslint-disable-next-line no-console
        console.error("!!", chunk.toString());
      });
      await waitReady.asPromise();
      const hs = {
        start: async () => {
          return hs;
        },
        close: async () => {
          if (pid) process.kill(pid);
        },
      } as unknown as HonoServer;
      return hs;
    },
  },
]) {
  describe(`${honoServer.name} - Connection`, () => {
    const port = 1024 + Math.floor(Math.random() * (65536 - 1024));
    const qOpen = buildReqOpen(sthis, {
      key: {
        ledger: "test",
        tenant: "test",
      },
      reqId: "req-open-test",
    });
    const my = defaultGestalt(msgP, { id: "FP-Universal-Client" });
    for (const style of [httpStyle(sthis, port, msgP, qOpen, my), wsStyle(sthis, port, msgP, qOpen, my)]) {
      describe(style.name, () => {
        let server: HonoServer;
        beforeAll(async () => {
          const app = new Hono();
          server = await (await honoServer.factory(style.remoteGestalt, port)).start(app, port);
        });
        afterAll(async () => {
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
          let c: MsgConnection;
          beforeEach(async () => {
            const rC = await style.ok.open();
            expect(rC.isOk()).toBeTruthy();
            c = rC.Ok();
            expect(c.conn).toEqual({
              key: {
                ledger: "test",
                tenant: "test",
              },
              reqId: "req-open-test",
              resId: c.conn.resId,
            });
          });
          afterEach(async () => {
            await c.close();
          });

          it("kaputt url http", async () => {
            const r = await c.request(
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
            });
          });
          it("gestalt url http", async () => {
            const msgP = defaultMsgParams(sthis, {});
            const req = buildReqGestalt(sthis, defaultGestalt(msgP, { id: "test" }));
            const r = await c.request(req, { waitFor: MsgIsResGestalt });
            if (!MsgIsResGestalt(r)) {
              assert.fail("expected MsgError", JSON.stringify(r));
            }
            expect(r.gestalt).toEqual(c.exchangedGestalt?.remote);
          });

          it("openConnection", async () => {
            const req = buildReqOpen(sthis, { ...c.conn });
            const r = await c.request(req, { waitFor: MsgIsResOpen });
            if (!MsgIsResOpen(r)) {
              assert.fail(JSON.stringify(r));
            }
            expect(r).toEqual({
              conn: c.conn,
              tid: req.tid,
              type: "resOpen",
              version: "FP-MSG-1.0",
            });
          });
        });

        it("open", async () => {
          const rC = await Msger.open(sthis, URI.from(`http://localhost:${port}/fp`), qOpen, msgP);
          expect(rC.isOk()).toBeTruthy();
          const c = rC.Ok();
          expect(c.conn).toEqual({
            key: {
              ledger: "test",
              tenant: "test",
            },
            reqId: "req-open-test",
            resId: c.conn.resId,
          });
          expect(c).toBeInstanceOf(style.cInstance);
          expect(c.exchangedGestalt).toEqual({
            my,
            remote: style.remoteGestalt,
          });
          await c.close();
        });
        describe(`${honoServer.name} - Msgs`, () => {
          let conn: MsgConnection;
          beforeAll(async () => {
            const rC = await Msger.open(sthis, URI.from(`http://localhost:${port}/fp`), qOpen, msgP);
            expect(rC.isOk()).toBeTruthy();
            conn = rC.Ok();
          });
          afterAll(async () => {
            await conn.close();
          });
          it("Open", async () => {
            const res = await conn.request(qOpen, { waitFor: MsgIsResOpen });
            expect(MsgIsResOpen(res)).toBeTruthy();
            expect(res.conn).toEqual({ ...qOpen.conn, resId: res.conn?.resId });
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
              const res = await conn.request(buildReqGetData(sthis, sp, conn.conn), { waitFor: MsgIsResGetData });
              if (MsgIsResGetData(res)) {
                // expect(res.params).toEqual(sp);
                expect(URI.from(res.signedUrl).asObj()).toEqual(await refURL(res));
              } else {
                assert.fail("expected MsgResGetData", JSON.stringify(res));
              }
            });
            it("Put", async () => {
              const sp = sup();
              const res = await conn.request(buildReqPutData(sthis, sp, conn.conn), { waitFor: MsgIsResPutData });
              if (MsgIsResPutData(res)) {
                // expect(res.params).toEqual(sp);
                expect(URI.from(res.signedUrl).asObj()).toEqual(await refURL(res));
              } else {
                assert.fail("expected MsgResPutData", JSON.stringify(res));
              }
            });
            it("Del", async () => {
              const sp = sup();
              const res = await conn.request(buildReqDelData(sthis, sp, conn.conn), { waitFor: MsgIsResDelData });
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
              const res = await conn.request(buildReqGetWAL(sthis, sp, conn.conn), { waitFor: MsgIsResGetWAL });
              if (MsgIsResGetWAL(res)) {
                // expect(res.params).toEqual(sp);
                expect(URI.from(res.signedUrl).asObj()).toEqual(await refURL(res));
              } else {
                assert.fail("expected MsgResGetWAL", JSON.stringify(res));
              }
            });
            it("Put", async () => {
              const sp = sup();
              const res = await conn.request(buildReqPutWAL(sthis, sp, conn.conn), { waitFor: MsgIsResPutWAL });
              if (MsgIsResPutWAL(res)) {
                // expect(res.params).toEqual(sp);
                expect(URI.from(res.signedUrl).asObj()).toEqual(await refURL(res));
              } else {
                assert.fail("expected MsgResPutWAL", JSON.stringify(res));
              }
            });
            it("Del", async () => {
              const sp = sup();
              const res = await conn.request(buildReqDelWAL(sthis, sp, conn.conn), { waitFor: MsgIsResDelWAL });
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
    }
  });
}
