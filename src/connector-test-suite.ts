// import { fireproof } from "@fireproof/core";

async function main() {
  // const db = fireproof("my-database", {
  //   store: {
  //       base: "./dist/stores"
  //   }
  // });

  // const connection = new ConnectSQL(SimpleSQLite("sqlite.db"));
  // await connection.connect(db.blockstore);

  // const ok = await db.put({ hello: "world:" + new Date().toISOString() });
  // logger.Info().Any("RES->", ok).Msg("put");

  // const rows = await db.allDocs();
  // logger.Info().Any("RES->", rows).Msg("All docs");

  // const doc = await db.get(ok.id);
  // console.log(doc);

  // console.log(await db.allDocs());
}

main().catch(console.error);