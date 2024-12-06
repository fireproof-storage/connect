import { connectionFactory } from "../connection-from-store.js";
import { CoerceURI } from "@adviser/cement";
import { Database } from "@fireproof/core";

// Usage:
//
// import { useFireproof } from 'use-fireproof'
// import { connect } from '@fireproof/s3'
//
// const { db } = useFireproof('test')
//
// const url = URI.from("s3://testbucket/fp-test").build();
// url.setParam("region", "eu-central-1");
// url.setParam("accessKey", "minioadmin");
// url.setParam("secretKey", "minioadmin");
// url.setParam("ensureBucket", "true");
// url.setParam("endpoint", "http://127.0.0.1:9000");
//
// const cx = connect.s3(db, url);

export const connect = {
  s3: async (db: Database, url?: CoerceURI) => {
    const { sthis, blockstore } = db;
    const connection = await connectionFactory(sthis, url);
    await connection.connect_X(blockstore);
    // return connection;
  },
};
