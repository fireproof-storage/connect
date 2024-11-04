import { fireproof } from "@fireproof/core";
import * as UCAN from "@fireproof/connect/ucan";
import meow from "meow";

// 🙀

const cli = meow(
  `
	Options
	  --clock, -c      Clock id
	  --database, -d   Database name
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
const clock = await UCAN.clock({ audience: agent, databaseName: dbName });

console.log("⌛", clock.delegation.issuer.did(), "→", clock.delegation.audience.did());

console.log("👮 AGENT DID:", agent.id.did());
console.log("⏰ CLOCK DID:", clock.id.did());
console.log("🤖 SERVER DID:", server.id.did());

// TEST DELEGATION

const agent2 = await UCAN.agent({
  server,
  storeName: "agent-2",
});

const delegation = await UCAN.Capabilities.Clock.clock.delegate({
  issuer: agent.agent.issuer,
  audience: agent2.id,
  with: clock.id.did(),
  proofs: [clock.delegation],
});

const clock2 = await UCAN.clockDelegation({
  audience: agent2,
  databaseName: dbName,
  delegation,
  storeName: "clock-2",
});

const db = fireproof(dbName);

const context = await UCAN.connect(db, {
  agent: agent2,
  clock: clock2,
  server,
});

const resp = await db.put({ test: `document-${Date.now()}` });

console.log("Document added", resp);
