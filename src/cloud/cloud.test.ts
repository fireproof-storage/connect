// import { env } from "cloudflare:test"
import { BuildURI, Future, URI } from "@adviser/cement";
import { ReqSignedUrl, ResSignedUrl } from "./msg-types";
import { Env } from "./backend/env";
import { $ } from "zx";
import fs from "fs/promises";
import * as toml from "smol-toml";
import { bs, Database, fireproof } from "@fireproof/core";
import { mockSuperThis } from "../../node_modules/@fireproof/core/tests/helpers.js";
import { AwsClient } from "aws4fetch";
import { smokeDB } from "../../tests/helper";
import { registerFireproofCloudStoreProtocol } from "./client/gateway";
import { calculatePreSignedUrl } from "./pre-signed-url";
import { newWebSocket } from "./new-websocket";

function testReqSignedUrl(tid = "test") {
  return {
    tid: tid,
    type: "reqSignedUrl",
    params: {
      // protocol: "ws",
      path: "/hallo",
      name: "test-name",
      method: "GET",
      tenantId: "tenantId",
      store: "wal",
      key: "main",
    },
    version: "test",
  } satisfies ReqSignedUrl;
}

async function testResSignedUrl(env: Env, tid?: string, amzDate?: string): Promise<ResSignedUrl> {
  const req = testReqSignedUrl(tid);
  const rSignedUrl = await calculatePreSignedUrl(req, env, amzDate);
  if (rSignedUrl.isErr()) {
    throw rSignedUrl.Err();
  }
  return {
    params: req.params,
    signedUrl: rSignedUrl.Ok().toString(),
    // `http://localhost:8080/tenantId/test-name/wal/main.json?tid=${tid}&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=accessKeyId%2F20241121%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241121T225359Z&X-Amz-Expires=86400&X-Amz-Signature=f52d5ecfbb6be93210dd57cb49ba1e426a8aee24a0738aedb636ae5722fcdded&X-Amz-SignedHeaders=host`,
    tid: tid || "test",
    type: "resSignedUrl",
    version: env.VERSION,
  } satisfies ResSignedUrl;
}

describe("CloudBackendTest", () => {
  const sthis = mockSuperThis();
  let env: Env;
  let pid: number;
  const port = +(process.env.FP_WRANGLER_PORT || 0) || ~~(1024 + Math.random() * (0x10000 - 1024));
  const wrangler = BuildURI.from("http://localhost")
    .port("" + port)
    .URI();
  async function cfFetch(relative: string, init: RequestInit) {
    return fetch(wrangler.build().appendRelative(relative).asURL(), init);
  }
  beforeAll(async () => {
    const tomlFile = "src/cloud/backend/wrangler.toml";
    const tomeStr = await fs.readFile(tomlFile, "utf-8");
    const wranglerFile = toml.parse(tomeStr) as unknown as {
      env: { test: { vars: Env } };
    };
    env = wranglerFile.env.test.vars;
    if (process.env.FP_WRANGLER_PORT) {
      return;
    }
    $.verbose = !!process.env.FP_DEBUG;
    const runningWrangler = $`
      wrangler dev -c ${tomlFile} --port ${port} --env test --no-show-interactive-dev-session &
      waitPid=$!
      echo "PID:$waitPid"
      wait $waitPid`;
    const waitReady = new Future();
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
    // await f.asPromise()
    // wrangler dev -c src/cloud/backend/wrangler.toml --port 4711  --env test
  });

  afterAll(async () => {
    // console.log("kill", runningWrangler.pid, runningWrangler)
    // process.kill(runningWrangler.pid)
    // process.stdin.write(Array(4).fill("x\n\r").join(""))
    if (pid) process.kill(pid);
  });

  describe("raw tests", () => {
    it("return 404", async () => {
      const res = await cfFetch("/posts", {});
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({
        message: "Notfound:/posts",
        tid: "internal",
        type: "error",
        version: env.VERSION,
      });
    });
    it("return 422 invalid json", async () => {
      const res = await cfFetch("/fp", { method: "PUT" });
      expect(res.status).toBe(422);
      expect(await res.json()).toEqual({
        message: "Unexpected end of JSON input",
        tid: "internal",
        type: "error",
        version: env.VERSION,
      });
    });

    it("return 422 illegal msg", async () => {
      const res = await cfFetch("/fp", {
        method: "PUT",
        body: JSON.stringify({
          bucket: "test",
          key: "test",
        }),
      });
      expect(res.status).toBe(422);
      expect(await res.json()).toEqual({
        message: "unknown msg.type=undefined",
        tid: "internal",
        type: "error",
        version: env.VERSION,
      });
    });

    it("return 200 msg", async () => {
      const res = await cfFetch("/fp", {
        method: "PUT",
        body: JSON.stringify(testReqSignedUrl()),
      });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(await testResSignedUrl(env));
    });
    it("use websockets SignedUrl", async () => {
      await Promise.all(
        Array(100)
          .fill(null)
          .map(async () => {
            const url = wrangler.build().appendRelative("/ws").protocol("ws:");
            const so = await newWebSocket(url);
            const done = new Future();
            let total = 10;
            let tid = `${total}-test-${Math.random()}`;
            so.onopen = () => {
              so.send(JSON.stringify(testReqSignedUrl(tid)));
            };
            so.onmessage = async (msg) => {
              try {
                const res = JSON.parse(msg.data.toString()) as ResSignedUrl;
                expect(res).toEqual(await testResSignedUrl(env, tid, URI.from(res.signedUrl).getParam("X-Amz-Date")));
                if (--total === 0) {
                  done.resolve(true);
                } else {
                  tid = `${total}-test-${Math.random()}`;
                  so.send(JSON.stringify(testReqSignedUrl(tid)));
                }
              } catch (err) {
                done.reject(err);
              }
            };
            so.onerror = (ev) => {
              assert.fail(`WebSocket error: ${ev}`);
            };
            return done.asPromise().then(() => so.close(1000, "done"));
          })
      );
    });
  });

  describe("FireproofCloudGateway", () => {
    let db: Database;
    let unregister: () => void;
    interface ExtendedGateway extends bs.Gateway {
      headerSize: number;
      subscribe?: (url: URI, callback: (meta: Uint8Array) => void) => Promise<bs.UnsubscribeResult>; // Changed VoidResult to UnsubscribeResult
    }

    // has to leave
    interface ExtendedStore {
      gateway: ExtendedGateway;
      _url: URI;
      name: string;
    }

    beforeAll(() => {
      unregister = registerFireproofCloudStoreProtocol("fireproof:");
    });

    beforeEach(() => {
      const config = {
        store: {
          stores: {
            base: wrangler
              .build()
              .protocol("fireproof:")
              .setParam("protocol", "ws")
              .setParam("testMode", "true")
            // process.env.FP_STORAGE_URL, // || "fireproof://localhost:1968",
          },
        },
      };
      const name = "fireproof-cloud-test-db-" + sthis.nextId().str;
      db = fireproof(name, config);
    });

    afterEach(async () => {
      // Clear the database before each test
      if (db) {
        setInterval(() => console.log("Waiting for db to close"), 1000);
        console.log("Closing db");
        await db.close();
        console.log("Closed db");
        await db.destroy();
        console.log("Destroyed db");
      }
    });

    afterAll(() => {
      unregister();
    });

    // it("env setup is ok", () => {
    //   // expect(process.env.FP_STORAGE_URL).toMatch(/fireproof:\/\/localhost:1999/);
    // });

    it("should have loader and options", () => {
      const loader = db.blockstore.loader;
      expect(loader).toBeDefined();
      if (!loader) {
        throw new Error("Loader is not defined");
      }
      expect(loader.ebOpts).toBeDefined();
      expect(loader.ebOpts.store).toBeDefined();
      expect(loader.ebOpts.store.stores).toBeDefined();
      if (!loader.ebOpts.store.stores) {
        throw new Error("Loader stores is not defined");
      }
      if (!loader.ebOpts.store.stores.base) {
        throw new Error("Loader stores.base is not defined");
      }

      const baseUrl = URI.from(loader.ebOpts.store.stores.base);
      expect(baseUrl.protocol).toBe("fireproof:");
      // expect(baseUrl.hostname).toBe("localhost");
      // expect(baseUrl.port || "").toBe("1999");
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
    });

    it("should subscribe to changes", async () => {
      // Extract stores from the loader
      const metaStore = (await db.blockstore.loader?.metaStore()) as unknown as ExtendedStore;

      const metaGateway = metaStore?.gateway;

      const metaUrl = await metaGateway?.buildUrl(metaStore?._url, "main");
      await metaGateway?.start(metaStore?._url);

      let didCall = false;

      expect(metaGateway.subscribe).toBeTypeOf("function");
      if (metaGateway.subscribe) {
        const future = new Future<void>();

        const metaSubscribeResult = await metaGateway.subscribe(metaUrl?.Ok(), (data: Uint8Array) => {
          // console.log("data", data);
          const decodedData = sthis.txt.decode(data);
          expect(decodedData).toContain("parents");
          didCall = true;
          future.resolve();
        });
        expect(metaSubscribeResult.isOk()).toBeTruthy();
        const ok = await db.put({ _id: "key1", hello: "world1" });
        expect(ok).toBeTruthy();
        expect(ok.id).toBe("key1");
        await future.asPromise();
        expect(didCall).toBeTruthy();
        metaSubscribeResult.Ok()();
      }
    });
  });
  describe("AwsClient R2", () => {
    it("make presigned url", async () => {
      const sthis = mockSuperThis();
      const a4f = new AwsClient({
        accessKeyId: sthis.env.get("CF_ACCESS_KEY_ID") || "accessKeyId",
        secretAccessKey: sthis.env.get("CF_SECRET_ACCESS_KEY") || "secretAccessKey",
        region: "us-east-1",
        service: "s3",
      });
      const buildUrl = BuildURI.from(sthis.env.get("CF_STORAGE_URL") || "https://bucket.example.com/db/main")
        .appendRelative("db/main")
        .setParam("X-Amz-Expires", "22");
      const signedUrl = await a4f
        .sign(new Request(buildUrl.toString(), { method: "PUT" }), {
          aws: {
            signQuery: true,
            datetime: "2021-09-01T12:34:56Z",
          },
        })
        .then((res) => res.url);
      expect(URI.from(signedUrl).asObj()).toEqual(
        buildUrl
          .setParam("X-Amz-Date", "2021-09-01T12:34:56Z")
          .setParam("X-Amz-Algorithm", "AWS4-HMAC-SHA256")
          .setParam("X-Amz-Credential", `${a4f.accessKeyId}/2021-09-/${a4f.region}/${a4f.service}/aws4_request`)
          .setParam("X-Amz-SignedHeaders", "host")
          .setParam(
            "X-Amz-Signature",
            sthis.env.get("CF_PRESIGNED_SIGNATURE") ||
            "bbae4604fbe51a4ce9972183d8871a8a187ab0f4d2415afd6dc728f8ccc9900f"
          )
          .asObj()
      );
    });
  });
});