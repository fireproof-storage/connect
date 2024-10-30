import { fireproof } from "@fireproof/core";

import * as Connector from "../index";

async function _usingAgent() {
  const dbName = "my-db";
  const db = fireproof(dbName);

  const agent = await Connector.agent();

  await Connector.connect(db, {
    agent,
    clock: await Connector.clock({
      audience: agent.agent,
      databaseName: dbName,
    }),
    server: await Connector.server(),
  });
}

async function _usingEmail() {
  const dbName = "my-db";
  const db = fireproof(dbName);

  const agent = await Connector.agent();
  const email = Connector.email("example@fireproof.storage");

  await Connector.connect(db, {
    agent,
    clock: await Connector.clock({
      audience: email,
      databaseName: dbName,
    }),
    email,
    server: await Connector.server(),
  });
}

async function _usingExternalClock() {
  const dbName = "my-db";
  const db = fireproof(dbName);

  const agent = await Connector.agent();
  const email = Connector.email("example@fireproof.storage");

  await Connector.connect(db, {
    agent,
    clock: Connector.clockId("did:key:EXAMPLE"),
    email,
    server: await Connector.server(),
  });
}
