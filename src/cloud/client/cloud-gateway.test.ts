import { Hono } from "hono";
import { HonoServer } from "../hono-server.js";
import { buildReqOpen, defaultGestalt } from "../msg-types.js";
import { NodeHonoServerFactory, CFHonoServerFactory, wsStyle } from "../test-helper.js";
import { bs, ensureSuperThis, NotFoundError } from "@fireproof/core";
import { defaultMsgParams } from "../msger.js";
import { FireproofCloudGateway, registerFireproofCloudStoreProtocol } from "./gateway.js";
import { BuildURI } from "@adviser/cement";

const sthis = ensureSuperThis();
const msgP = defaultMsgParams(sthis, { hasPersistent: true });
const my = defaultGestalt(msgP, { id: "FP-Universal-Client" });
for (const honoServer of [NodeHonoServerFactory(), CFHonoServerFactory()]) {
  const qOpen = buildReqOpen(sthis, {
    key: {
      ledger: "test",
      tenant: "test",
    },
  });
  const port = 1024 + Math.floor(Math.random() * (65536 - 1024));
  const style = wsStyle(sthis, port, msgP, qOpen, my);
  describe(`${honoServer.name} - Gateway`, () => {
    let server: HonoServer;
    let gw: bs.Gateway;
    let unregister: () => void;
    let url: BuildURI;
    beforeAll(async () => {
      const app = new Hono();
      server = await (await honoServer.factory(sthis, msgP, style.remoteGestalt, port)).start(app, port);
      unregister = registerFireproofCloudStoreProtocol("fireproof:");
      gw = new FireproofCloudGateway(sthis);
      url = BuildURI.from(`fireproof://localhost:${port}/`)
        .setParam("protocol", "http")
        .setParam("name", "ledger-name")
        .setParam("tenant", "tendant");
    });
    afterAll(async () => {
      await server.close();
      unregister();
    });
    describe("data", () => {
      it("get not found", async () => {
        await Promise.all(
          Array(20)
            .fill(async () => {
              url.setParam("store", "data");
              const key = `theDataKey-${sthis.nextId().str}`;
              const kurl = (await gw.buildUrl(url.URI(), key)).Ok();
              const res = await gw.get(kurl);
              expect(res.isErr()).toBeTruthy();
              expect(res.Err()).toBeInstanceOf(NotFoundError);
            })
            .map((f) => f())
        );
      });

      it("put - get - del - get", async () => {
        await Promise.all(
          Array(20)
            .fill(async () => {
              const resStart = await gw.start(url.URI());
              expect(resStart.isOk()).toBeTruthy();

              url.setParam("store", "data");
              const key = `theDataKey-${sthis.nextId().str}`;
              const kurl = (await gw.buildUrl(url.URI(), key)).Ok();

              const resPut = await gw.put(kurl, sthis.txt.encode("Hello, World!"));
              expect(resPut.isOk()).toBeTruthy();
              const resGet = await gw.get(kurl);
              expect(resGet.isOk()).toBeTruthy();
              expect(sthis.txt.decode(resGet.Ok())).toBe("Hello, World!");
              const resDel = await gw.delete(kurl);
              expect(resDel.isOk()).toBeTruthy();

              const res = await gw.get(kurl);
              expect(res.isErr()).toBeTruthy();
              expect(res.Err()).toBeInstanceOf(NotFoundError);
            })
            .map((f) => f())
        );
      });
    });

    describe("WAL", () => {
      it("get not found", async () => {
        await Promise.all(
          Array(20)
            .fill(async () => {
              url.setParam("store", "wal");
              const key = `theDataKey-${sthis.nextId().str}`;
              const kurl = (await gw.buildUrl(url.URI(), key)).Ok();
              const res = await gw.get(kurl);
              expect(res.isErr()).toBeTruthy();
              expect(res.Err()).toBeInstanceOf(NotFoundError);
            })
            .map((f) => f())
        );
      });

      it("put - get - del - get", async () => {
        await Promise.all(
          Array(20)
            .fill(async () => {
              const resStart = await gw.start(url.URI());
              expect(resStart.isOk()).toBeTruthy();

              url.setParam("store", "wal");
              const key = `theWALKey-${sthis.nextId().str}`;
              const kurl = (await gw.buildUrl(url.URI(), key)).Ok();

              const resPut = await gw.put(kurl, sthis.txt.encode("Hello, World!"));
              expect(resPut.isOk()).toBeTruthy();
              const resGet = await gw.get(kurl);
              expect(resGet.isOk()).toBeTruthy();
              expect(sthis.txt.decode(resGet.Ok())).toBe("Hello, World!");
              const resDel = await gw.delete(kurl);
              expect(resDel.isOk()).toBeTruthy();

              const res = await gw.get(kurl);
              expect(res.isErr()).toBeTruthy();
              expect(res.Err()).toBeInstanceOf(NotFoundError);
            })
            .map((f) => f())
        );
      });
    });
  });
}