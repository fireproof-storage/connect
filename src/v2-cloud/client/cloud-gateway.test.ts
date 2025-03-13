import { Hono } from "hono";
import { HonoServer } from "../hono-server.js";
import { defaultGestalt } from "../msg-types.js";
import { NodeHonoServerFactory, CFHonoServerFactory, wsStyle, MockJWK, mockJWK } from "../test-helper.js";
import { bs, ensureSuperThis, NotFoundError } from "@fireproof/core";
import { defaultMsgParams } from "../msger.js";
import { FireproofCloudGateway, registerFireproofCloudStoreProtocol } from "./gateway.js";
import { BuildURI, URI } from "@adviser/cement";

describe("test multiple connections", () => {
  const sthis = ensureSuperThis();
  const msgP = defaultMsgParams(sthis, { hasPersistent: true });
  const my = defaultGestalt(msgP, { id: "FP-Universal-Client" });
  let auth: MockJWK;

  beforeAll(async () => {
    auth = await mockJWK();
  });

  describe.each([
    // force multi line
    NodeHonoServerFactory(),
    CFHonoServerFactory(sthis, "stream", "D1"),
    CFHonoServerFactory(sthis, "stream", "DO"),
  ])("$name - Gateway", ({ factory, port }) => {
    const reqs = 1;
    let style;

    let server: HonoServer;
    let gw: bs.Gateway;
    let unregister: () => void;
    let url: URI;
    beforeAll(async () => {
      // privEnvJWK = await jwk2env(keyPair.privateKey, sthis);
      style = wsStyle(sthis, auth.applyAuthToURI, port, msgP, my);
      const app = new Hono();
      server = await factory(sthis, msgP, style.remoteGestalt, port, auth.keys.strings.publicKey).then((srv) =>
        srv.once(app, port)
      );
      unregister = registerFireproofCloudStoreProtocol("fireproof:");
      gw = new FireproofCloudGateway(sthis);
      const lurl = auth.applyAuthToURI(
        BuildURI.from(`fireproof://localhost:${port}/`)
          .setParam("protocol", "http")
          .setParam("name", "ledger-name")
          .setParam("tenant", "tendant")
      );
      url = (await gw.start(lurl, sthis)).Ok();
    });
    afterAll(async () => {
      await server.close();
      unregister();
    });
    describe("data", () => {
      it("get not found", async () => {
        await Promise.all(
          Array(reqs)
            .fill(async () => {
              const my = url.build().setParam("store", "data").URI();
              const key = `theDataKey-${sthis.nextId().str}`;
              const kurl = (await gw.buildUrl(my, key, sthis)).Ok();
              const res = await gw.get(kurl, sthis);
              expect(res.isErr()).toBeTruthy();
              expect(res.Err()).toBeInstanceOf(NotFoundError);
            })
            .map((f) => f())
        );
      });

      it("put - get - del - get", async () => {
        await Promise.all(
          Array(1)
            .fill(async () => {
              const resStart = await gw.start(url, sthis);
              expect(resStart.isOk()).toBeTruthy();

              const my = url.build().setParam("store", "data");
              const key = `theDataKey-${sthis.nextId().str}`;
              const kurl = (await gw.buildUrl(my.URI(), key, sthis)).Ok();

              const resPut = await gw.put(kurl, sthis.txt.encode("Hello, World!"), sthis);
              expect(resPut.isOk()).toBeTruthy();
              const resGet = await gw.get(kurl, sthis);
              expect(resGet.isOk()).toBeTruthy();
              expect(sthis.txt.decode(resGet.Ok())).toBe("Hello, World!");
              const resDel = await gw.delete(kurl, sthis);
              expect(resDel.isOk()).toBeTruthy();

              const res = await gw.get(kurl, sthis);
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
          Array(reqs)
            .fill(async () => {
              const my = url.build().setParam("store", "wal");
              const key = `theDataKey-${sthis.nextId().str}`;
              const kurl = (await gw.buildUrl(my.URI(), key, sthis)).Ok();
              const res = await gw.get(kurl, sthis);
              expect(res.isErr()).toBeTruthy();
              expect(res.Err()).toBeInstanceOf(NotFoundError);
            })
            .map((f) => f())
        );
      });

      it("put - get - del - get", async () => {
        await Promise.all(
          Array(reqs)
            .fill(async () => {
              const resStart = await gw.start(url, sthis);
              expect(resStart.isOk()).toBeTruthy();

              const my = url.build().setParam("store", "wal");
              const key = `theWALKey-${sthis.nextId().str}`;
              const kurl = (await gw.buildUrl(my.URI(), key, sthis)).Ok();

              const resPut = await gw.put(kurl, sthis.txt.encode("Hello, World!"), sthis);
              expect(resPut.isOk()).toBeTruthy();
              const resGet = await gw.get(kurl, sthis);
              expect(resGet.isOk()).toBeTruthy();
              expect(sthis.txt.decode(resGet.Ok())).toBe("Hello, World!");
              const resDel = await gw.delete(kurl, sthis);
              expect(resDel.isOk()).toBeTruthy();

              const res = await gw.get(kurl, sthis);
              expect(res.isErr()).toBeTruthy();
              expect(res.Err()).toBeInstanceOf(NotFoundError);
            })
            .map((f) => f())
        );
      });
    });
  });
});
