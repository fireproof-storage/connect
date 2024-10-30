import { fireproof } from "@fireproof/core";

import * as Connector from "../index";

async function _usingAgent() {
  const dbName = "my-db";
  const db = fireproof(dbName);

  const agent = await Connector.agent();

  await Connector.connect(db, {
    clock: await Connector.clock({
      audience: agent,
      databaseName: dbName,
    }),
    server: await Connector.server(),
  });
}

async function _usingEmail() {
  const dbName = "my-db";
  const db = fireproof(dbName);

  const email = Connector.email("example@fireproof.storage");

  await Connector.connect(db, {
    clock: await Connector.clock({
      audience: email,
      databaseName: dbName,
    }),
    server: await Connector.server(),
  });
}
