import { fireproof } from "@fireproof/core";
import * as UCAN from "@fireproof/connect/ucan";
import meow from "meow";

// 🙀

const cli = meow(
  `
	Options
	  --database, -d   Database name
	  --email, -e      Email
`,
  {
    importMeta: import.meta,
    flags: {
      database: {
        type: "string",
        shortFlag: "d",
        isRequired: true,
      },
      email: {
        type: "string",
        shortFlag: "e",
      },
    },
  }
);

// 🚀

const agent = await UCAN.agent();

const email = cli.flags.email ? UCAN.email(cli.flags.email) : undefined;
if (email) await UCAN.login({ agent, email });

const dbName = cli.flags.database;

const clock = await UCAN.clock({ audience: email || agent, databaseName: dbName });
const server = await UCAN.server();

console.log("⌛", clock.delegation.issuer.did(), "→", clock.delegation.audience.did());

console.log("👮 AGENT DID:", agent.id.did());
console.log("⏰ CLOCK DID:", clock.id.did());
console.log("🤖 SERVER DID:", server.id.did());

if (clock.isNew) {
  await UCAN.registerClock({
    clock,
  });
}

const db = fireproof(dbName);

await UCAN.connect(db, {
  agent,
  clock,
  email,
  server,
});

await db.put({ test: "document" });
