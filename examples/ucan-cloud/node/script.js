import { fireproof } from "@fireproof/core";
import * as UCAN from "@fireproof/connect/ucan";
import meow from "meow";

// 🙀

const cli = meow(
  `
	Options
	  --email, -e  Email
`,
  {
    importMeta: import.meta,
    flags: {
      email: {
        type: "string",
        shortFlag: "e",
        isRequired: true,
      },
    },
  }
);

// 🚀

const dbName = "my-db";
const email = UCAN.email(cli.flags.email);
const acc = await UCAN.login({ email });
const clock = await UCAN.clock({ audience: email, databaseName: dbName });
const agent = await UCAN.agent();
const server = await UCAN.server();

console.log("👮 AGENT DID:", agent.id.did());
console.log("⏰ CLOCK DID:", clock.id.did());
console.log("🤖 SERVER DID:", server.id.did());

await UCAN.registerClock({
  clock,
});

// console.log(
//   acc.model.proofs.map((d) => {
//     return {
//       iss: d.issuer.did(),
//       aud: d.audience.did(),
//       xyz: d.capabilities.map(JSON.stringify),
//     };
//   })
// );

const db = fireproof(dbName);

await UCAN.connect(db, {
  agent,
  clock,
  email,
  server,
});
