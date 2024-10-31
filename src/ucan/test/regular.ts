import { fireproof } from "@fireproof/core";

import * as Connector from "../index";

async function _usingAgent() {
  const dbName = "my-db";
  const db = fireproof(dbName);

  // Automatically creates/loads agent and a clock with the agent as the audience (because email is not provided)
  // NOTE: You can also provide the agent and/or clock yourself.
  await Connector.connect(db);
}

async function _usingEmail() {
  const dbName = "my-db";
  const db = fireproof(dbName);

  // Automatically creates/loads agent and a clock with the email as the audience
  // NOTE: You can also provide the agent and/or clock yourself.
  await Connector.connect(db, {
    email: Connector.email("example@fireproof.storage"),
  });
}

async function _usingExternalClock() {
  const dbName = "my-db";
  const db = fireproof(dbName);

  await Connector.connect(db, {
    clock: Connector.clockId("did:key:EXAMPLE"),
    email: Connector.email("example@fireproof.storage"),
  });
}
