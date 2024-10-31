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

const acc = await UCAN.login({ email: cli.flags.email });

console.log(
  acc.model.proofs.map((d) => {
    return {
      iss: d.issuer.did(),
      aud: d.audience.did(),
    };
  })
);

// const context = await usingEmail(cli.flags.email);

// await UCAN.registerClock(context);

// TOOLBOX

async function usingEmail(email) {
  const dbName = "my-db";
  const db = fireproof(dbName);

  // Automatically creates/loads agent and a clock with the email as the audience
  // NOTE: You can also provide the agent and/or clock yourself.
  return await UCAN.connect(db, {
    email,
  });
}
