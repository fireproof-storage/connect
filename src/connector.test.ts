import { describe } from "vitest";
import { ensureSuperThis, fireproof, SuperThis, SuperThisOpts, ConfigOpts } from "@fireproof/core";
import { connectionFactory } from "./connection-from-store";
// import { registerS3StoreProtocol } from "./s3/s3-gateway";
import { URI, runtimeFn, MockLogger } from "@adviser/cement";
import { registerPartyKitStoreProtocol } from "./connect-partykit/partykit-store";

// describe("connector", () => {
//   // let unreg: () => void;
//   let url: URI;
//   const sthis = ensureSuperThis();
//   beforeAll(async () => {
//     await sthis.start();
//     // unreg = registerS3StoreProtocol();
//     // url = URI.from("s3://testbucket/connector")
//     //   .build()
//     //   .setParam("region", "eu-central-1")
//     //   .setParam("accessKey", "minioadmin")
//     //   .setParam("secretKey", "minioadmin")
//     //   .setParam("ensureBucket", "true")
//     //   .setParam("endpoint", "http://127.0.0.1:9000")
//     //   .URI();
//     url = URI.from("file://./dist/connect_to?storekey=@bla@")
//   });
//   afterAll(() => {
//     // unreg();
//   });
//   it("should store and retrieve data", async () => {
//     console.log("--1")
//     const wdb = fireproof("my-database", {
//       store: {
//         stores: {
//           base: "file://./dist/connector?storekey=@bla@",
//         },
//       },
//     });
//     // db.connect("s3://testbucket/connector");
//     console.log("--2")
//     const connection = await connectionFactory(sthis, url);
//     console.log("--3")
//     await connection.connect_X(wdb.blockstore);
//
//     // await new Promise((res) => setTimeout(res, 1000));
//
//     console.log("--4")
//     const ran = Math.random().toString();
//     const count = 3;
//     for (let i = 0; i < count; i++) {
//       console.log("--4.01", i)
//       await wdb.put({ _id: `key${i}:${ran}`, hello: `world${i}` });
//       console.log("--4.02", i)
//     }
//     console.log("--4.1")
//     for (let i = 0; i < count; i++) {
//       expect(await wdb.get<{ hello: string }>(`key${i}:${ran}`)).toEqual({
//         _id: `key${i}:${ran}`,
//         hello: `world${i}`,
//       });
//     }
//     console.log("--5")
//     const docs = await wdb.allDocs();
//     console.log("--6")
//     expect(docs.rows.length).toBeGreaterThanOrEqual(count);
//     (await wdb.blockstore.loader?.WALStore())?.processQueue.waitIdle();
//     await new Promise((res) => setTimeout(res, 1000));
//     // console.log("--7")
//     await wdb.blockstore.destroy();
//     // console.log("--8")
//
//     const rdb = fireproof("", {
//       store: {
//         stores: {
//           base: url,
//         },
//       },
//     });
//     console.log("--9")
//     const rdocs = await rdb.allDocs();
//     // // console.log("--10", rdocs)
//     expect(rdocs.rows.length).toBeGreaterThanOrEqual(count);
//     for (let i = 0; i < count; i++) {
//       expect(await rdb.get<{ hello: string }>(`key${i}:${ran}`)).toEqual({
//         _id: `key${i}:${ran}`,
//         hello: `world${i}`,
//       });
//     }
//     console.log("--11", rdocs.rows.length)
//   });
// });

describe("partykit", () => {
  let url: URI;
  let aliceURL: URI;
  let bobURL: URI;

  let configA: ConfigOpts;
  let configB: ConfigOpts;

  let messagePromise: Promise<void>;
  let messageResolve: (value: void | PromiseLike<void>) => void;


  const sthis = ensureSuperThis();
  beforeAll(async () => {
    await sthis.start();

    configA = {
      store: {
        stores: {
          base: storageURL(sthis).build().setParam("storekey", "zTvTPEPQRWij8rfb3FrFqBm"),
        },
      },
    };

    configB = {
      store: {
        stores: {
          base: storageURL(sthis).build().setParam("storekey", "zTvTPEPQRWij8rfb3FrFqBm"),
        },
      },
    };

    registerPartyKitStoreProtocol();
    url = URI.from("partykit://localhost:1999").build().setParam("storkey", "zTvTPEPQRWij8rfb3FrFqBm").URI();
    //url = URI.from("file://./dist/connect_to?storekey=@bla@")

    aliceURL = url.build().setParam("logname", "alice").URI();
    bobURL = url.build().setParam("logname", "bob").URI();

    // const sysfs = await rt.getFileSystem(URI.from("file:///"));
    // await sysfs.rm('/Users/mschoch/.fireproof/v0.19-file/alice', { recursive: true }).catch(() => {
    //   /* */
    // });
  });

  afterAll(() => {
    // unreg();
  });

  it("should", async () => {
    const alice = fireproof("alice", configA);
    const connection = await connectionFactory(sthis, aliceURL);
    await connection.connect_X(alice.blockstore);

    const bob = fireproof("bob", configB);
    const connectionBob = await connectionFactory(sthis, bobURL);
    await connectionBob.connect_X(bob.blockstore);


    messagePromise = new Promise<void>((resolve) => {
      messageResolve = resolve
    })

    bob.subscribe(docs => {
      console.log("bob sees docs")
      messageResolve()
    }, true)


    await alice.put({ _id: `foo`, hello: `bar` });

    //console.log('waiting for alice to clear')



    // wait for alice WAL to clear
    await (await alice.blockstore.loader?.WALStore())?.processQueue.waitIdle();

    // wait a while
    await new Promise((res) => setTimeout(res, 3000));

    console.log('about to force refresh bob remote')
    //await bob.blockstore.loader?.remoteMetaStore?.load('main')
    await connectionBob.loader?.remoteMetaStore?.load('main')
    //
    // console.log('about to force refresh bob remote');
    //
    // await (await bob.blockstore.loader?.WALStore())?.process()

    const all = await bob.allDocs()
    console.log("bob all rows len", all.rows.length)

    console.log('waiting for bob to see')
    // wait for bob to see message
    await messagePromise


    // wait a while
    //await new Promise((res) => setTimeout(res, 1000));
  });
});

// export function storageURL(): URI {
//   const old = rt.SysContainer.env.get("FP_STORAGE_URL");
//   if (runtimeFn().isBrowser) {
//     return URI.merge(`indexdb://fp`, old);
//   }
//   return URI.merge(`./dist/env`, old);
// }

export function storageURL(sthis: SuperThis): URI {
  const old = sthis.env.get("FP_STORAGE_URL");
  let merged: URI;
  if (runtimeFn().isBrowser) {
    merged = URI.merge(`indexdb://fp`, old, "indexdb:");
  } else {
    merged = URI.merge(`./dist/env`, old);
  }
  return merged;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function mockSuperThis(sthis?: Partial<SuperThisOpts>): SuperThis {
  const mockLog = MockLogger();
  return ensureSuperThis({
    logger: mockLog.logger,
    ctx: {
      logCollector: mockLog.logCollector,
    },
  });
}