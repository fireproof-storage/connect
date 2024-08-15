import { describe } from "vitest";
import { fireproof, rt } from "@fireproof/core";
import { connectionFactory } from "./connection-from-store";
// import { registerS3StoreProtocol } from "./s3/s3-gateway";

import { URI } from "@adviser/cement";
import {registerPartyKitStoreProtocol} from "./connect-partykit/partykit-gateway";

// describe("connector", () => {
//   // let unreg: () => void;
//   let url: URI;
//   beforeAll(async () => {
//     await rt.SysContainer.start();
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
//     const connection = await connectionFactory(url);
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
//     // console.log("--7")
//     await wdb.blockstore.destroy();
//     // console.log("--8")
//
//     const rdb = fireproof("", {
//       store: {
//         stores: {
//           base: url,
//           useEncryptedBlockstore: true
//         },
//       },
//     });
//     console.log("--9")
//     const rdocs = await rdb.allDocs();
//     // console.log("--10", rdocs)
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

  beforeAll(async () => {
    await rt.SysContainer.start();
    registerPartyKitStoreProtocol();
    url = URI.from("partykit://localhost:1999")
       .build()
       .setParam("room", "test")
       .URI();
    //url = URI.from("file://./dist/connect_to?storekey=@bla@")
  });

  afterAll(() => {
    // unreg();
  });

  it("should", async () => {
    let db = fireproof("test")
    const connection = await connectionFactory(url);
    await connection.connect_X(db.blockstore);

    await db.put({ _id: `foo`, hello: `bar` });

    // wait a while
    await new Promise((res) => setTimeout(res, 1000));
  });

});