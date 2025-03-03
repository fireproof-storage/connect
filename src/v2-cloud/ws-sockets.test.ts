import { ensureSuperThis } from "@fireproof/core";
import { NodeHonoServerFactory, wsStyle } from "./test-helper.js";
import { defaultMsgParams, Msger } from "./msger.js";
import { buildReqGestalt, defaultGestalt, MsgIsResGestalt, } from "./msg-types.js";
import { Hono } from "hono";
import { HonoServer } from "./hono-server.js";

describe("test multiple connections", () => {
  const sthis = ensureSuperThis();
  const msgP = defaultMsgParams(sthis, { hasPersistent: true });
  const port = +(process.env.FP_WRANGLER_PORT || 0) || 1024 + Math.floor(Math.random() * (65536 - 1024));
  const my = defaultGestalt(msgP, { id: "FP-Universal-Client" });
  const stype = wsStyle(sthis, port, msgP, my);
  const connections = 3;

  let hserv: HonoServer;

  beforeAll(async () => {
    const app = new Hono();
    hserv = await NodeHonoServerFactory()
      .factory(sthis, msgP, stype.remoteGestalt, port)
      .then((srv) => srv.register(app, port));
  });
  afterAll(async () => {
    await hserv.close();
  });

  it("could open multiple connections", async () => {
    const conns = await Promise.all(
      Array(connections)
        .fill(0)
        .map(() => {
          return Msger.connect(sthis, "http://localhost:" + port + "/fp");
        })
    ).then((cs) => cs.map((c) => c.Ok()));

    const rest = [...conns]
    for (const c of conns) {
      console.log("rest", rest.length)  
      const gestalts = await Promise.all(
        rest.map((c) => c.request(buildReqGestalt(sthis, my), { waitFor: MsgIsResGestalt }))
      );
      expect(
        gestalts.map((g) => {
          if (MsgIsResGestalt(g)) {
            return g.connInfo.connIds.length;
          }
        })
      ).toEqual(Array(rest.length).fill(rest.length));
      console.log("closing", rest.length)
      await c.close();
      console.log("closed", rest.length)
      rest.shift()
    }

  });
});
