import { ensureSuperThis } from "@fireproof/core";

import { CFHonoServerFactory, MockJWK, mockJWK, NodeHonoServerFactory, wsStyle } from "./test-helper.js";
import { defaultMsgParams, Msger } from "./msger.js";
import { buildReqChat, defaultGestalt, MsgIsResChat } from "./msg-types.js";
import { Hono } from "hono";
import { HonoServer } from "./hono-server.js";
import { Future, Result } from "@adviser/cement";

describe("test multiple connections", () => {
  const sthis = ensureSuperThis();

  describe.each([
    // dummy
    NodeHonoServerFactory(),
    CFHonoServerFactory("D1"),
    CFHonoServerFactory("DO"),
  ])("$name - Gateway", ({ factory }) => {
    const msgP = defaultMsgParams(sthis, { hasPersistent: true });
    const port = +(process.env.FP_WRANGLER_PORT || 0) || 1024 + Math.floor(Math.random() * (65536 - 1024));
    const my = defaultGestalt(msgP, { id: "FP-Universal-Client" });
    let stype;
    const connections = 3;

    let hserv: HonoServer;

    let auth: MockJWK;

    beforeAll(async () => {
      auth = await mockJWK();
      // const pair = await SessionTokenService.generateKeyPair();
      // authFactory = await mockGetAuthFactory(
      //   pair.strings.privateKey,
      //   {
      //     userId: "hello",
      //     tenants: [],
      //     ledgers: [],
      //   },
      //   sthis
      // );
      stype = wsStyle(sthis, auth.applyAuthToURI, port, msgP, my);

      const app = new Hono();
      hserv = await factory(sthis, msgP, stype.remoteGestalt, port, auth.keys.strings.publicKey).then((srv) =>
        srv.once(app, port)
      );
    });
    afterAll(async () => {
      await hserv.close();
    });

    it("could open multiple connections", async () => {
      const conns = await Promise.all(
        Array(connections)
          .fill(0)
          .map(() => {
            return Msger.connect(sthis, auth.authType, `http://localhost:${port}/fp`);
          })
      ).then((cs) => cs.map((c) => c.Ok().attachAuth(() => Promise.resolve(Result.Ok(auth.authType)))));

      const ready = new Future<void>();
      let total = (connections * (connections + 1)) / 2;
      // const recvSet = new Set(conns.map((c) => c.conn.reqId));
      for (const c of conns) {
        c.onMsg((m) => {
          if (MsgIsResChat(m)) {
            // console.log("Got a chat response", total--, qsidKey(m.conn));
            total--;
            if (total === 0) {
              ready.resolve();
            }
            // recvSet.delete(m.conn.reqId);
            // if (recvSet.size === 0) {
            // ready.resolve();
            // }
          }
        });
      }

      const rest = [...conns];
      for (const c of conns) {
        // console.log("Sending a chat request", rest.length, conns.length);
        const act = await c.request(buildReqChat(sthis, auth.authType, c.conn, "Hello"), {
          waitFor: MsgIsResChat,
        });
        if (MsgIsResChat(act)) {
          expect(act.targets.length).toBe(rest.length);
        } else {
          assert.fail("Expected a response");
        }
        await c.close((await c.msgConnAuth()).Ok());
        rest.shift();
      }

      // await conns[0].send(buildReqGestalt(sthis, my, true));
      await ready.asPromise();
    });
  });
});
