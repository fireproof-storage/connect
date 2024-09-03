import { describe } from "vitest";
import { ensureSuperThis, fireproof } from "@fireproof/core";
import { connectionFactory } from "./connection-from-store";
// import { registerS3StoreProtocol } from "./s3/s3-gateway";
import { URI } from "@adviser/cement";

describe("connector", () => {
  // let unreg: () => void;
  let url: URI;
  const sthis = ensureSuperThis();
  beforeAll(async () => {
    await sthis.start();
    // unreg = registerS3StoreProtocol();
    // url = URI.from("s3://testbucket/connector")
    //   .build()
    //   .setParam("region", "eu-central-1")
    //   .setParam("accessKey", "minioadmin")
    //   .setParam("secretKey", "minioadmin")
    //   .setParam("ensureBucket", "true")
    //   .setParam("endpoint", "http://127.0.0.1:9000")
    //   .URI();
    url = URI.from("file://./dist/connect_to?storekey=@bla@");
  });
  afterAll(() => {
    // unreg();
  });
  it("should store and retrieve data", async () => {
    const wdb = fireproof("my-database", {
      store: {
        stores: {
          base: "file://./dist/connector?storekey=@bla@",
        },
      },
    });
    // db.connect("s3://testbucket/connector");
    const connection = await connectionFactory(sthis, url);
    await connection.connect_X(wdb.blockstore);

    // await new Promise((res) => setTimeout(res, 1000));

    const ran = Math.random().toString();
    const count = 3;
    for (let i = 0; i < count; i++) {
      await wdb.put({ _id: `key${i}:${ran}`, hello: `world${i}` });
    }
    for (let i = 0; i < count; i++) {
      expect(await wdb.get<{ hello: string }>(`key${i}:${ran}`)).toEqual({
        _id: `key${i}:${ran}`,
        hello: `world${i}`,
      });
    }
    const docs = await wdb.allDocs();
    expect(docs.rows.length).toBeGreaterThanOrEqual(count);
    (await wdb.blockstore.loader?.WALStore())?.processQueue.waitIdle();
    await new Promise((res) => setTimeout(res, 1000));
    // console.log("--7")
    await wdb.blockstore.destroy();
    // console.log("--8")

    const rdb = fireproof("", {
      store: {
        stores: {
          base: url,
        },
      },
    });
    const rdocs = await rdb.allDocs();
    // // console.log("--10", rdocs)
    expect(rdocs.rows.length).toBeGreaterThanOrEqual(count);
    for (let i = 0; i < count; i++) {
      expect(await rdb.get<{ hello: string }>(`key${i}:${ran}`)).toEqual({
        _id: `key${i}:${ran}`,
        hello: `world${i}`,
      });
    }
  });
});
