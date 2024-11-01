import { fireproof } from "@fireproof/core";
import * as UCAN from "@fireproof/connect/ucan";
import meow from "meow";

// 🙀

const cli = meow(
  `
	Options
	  --clock, -c      Clock id
	  --database, -d   Database name
	  --email, -e      Email
		--register, -r   Force clock registration
		--server, -s     Server URL
`,
  {
    importMeta: import.meta,
    flags: {
      clock: {
        type: "string",
        shortFlag: "c",
      },
      database: {
        type: "string",
        shortFlag: "d",
        isRequired: true,
      },
      email: {
        type: "string",
        shortFlag: "e",
      },
      register: {
        type: "boolean",
        shortFlag: "r",
        default: false,
      },
      server: {
        type: "string",
        shortFlag: "s",
      },
    },
  }
);

// 🚀

const dbName = cli.flags.database;
const server = await UCAN.server(cli.flags.server);
const agent = await UCAN.agent({ server });

const email = cli.flags.email ? UCAN.email(cli.flags.email) : undefined;
if (email) await UCAN.login({ agent, email });

const clock = cli.flags.clock
  ? UCAN.clockId(cli.flags.clock)
  : await UCAN.clock({ audience: email || agent, databaseName: dbName });
console.log("⌛", clock.delegation.issuer.did(), "→", clock.delegation.audience.did());

console.log("👮 AGENT DID:", agent.id.did());
console.log("⏰ CLOCK DID:", clock.id.did());
console.log("🤖 SERVER DID:", server.id.did());

if (clock.isNew || ("delegation" in clock && cli.flags.register)) {
  await UCAN.registerClock({
    clock,
    server,
  });
}

const db = fireproof(dbName);

const context = await UCAN.connect(db, {
  agent,
  clock,
  email,
  server,
});

const resp = await db.put({ test: `document-${Date.now()}` });

console.log("Document added", resp);
