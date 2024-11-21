import * as FP_UCAN from "@fireproof/ucan";
import { fireproof } from "@fireproof/core";
import { addImage } from "./db.js";
import { base64pad } from "multiformats/bases/base64";
import { imgUrlToUint8Array } from "./image.js";

/**
 * STEPS:
 * 1. Create agent
 * 2. Give agent DID to workshop team
 * 3. Store clock DID given by the workshop team
 * 4. Import delegation given by the workshop team (Uint8Array)
 * 5. Create clock with said delegation
 * 6. Use `connect` function with Fireproof database and the created clock
 * 7. Add image to Fireproof database
 */

const dbName = "my-db";

const agent = await FP_UCAN.agent();
const delegation = await FP_UCAN.delegation.extract(
  base64pad.baseDecode(
    "OqJlcm9vdHOB2CpYJQABcRIgak1f/Nl35ehXXk1mwrklbjxGGFE5FcGOamNHOpXa8PhndmVyc2lvbgGgAgFxEiAXetZ5fTs5dFd1hkd3uY+D6R78iNXdV6LPId7oV44KLqdhc1hE7aEDQNr8nFBFbSlZdAYeaWNnkLB/PN8zHSQxR4QusHtYUGnmRSFDeG84pgxUr0SKXrphgBJ57MhfF+PWBaATlZgkEw1hdmUwLjkuMWNhdHSBomNjYW5nY2xvY2svKmR3aXRoeDhkaWQ6a2V5Ono2TWtoVkJkc2taNG5DNXc1QWYyY0dVS2lDNTdXa1RQbzRiNXlRNHk3VUNROURQdWNhdWRYIu0B8zvGpkbGLiEUyG1YAlZM3axkYRujDuzvYG0mYXZkZeBjZXhw9mNpc3NYIu0BLRE8vJ9xkSiDAwcj8rK51vXi6iE9UEP0ZGpczLz5uDBjcHJmgMkCAXESIPJ4dolMIjVMKtpPSLs1mwr5xnExO9LTFEqchUgEoYoVp2FzWETtoQNAXc3f4sur0/Kbi7UXmr7g0q4L+OgNB5w/59GHV3UNAz21nsyg8JyjzFSecjNLnNINNHWhZUB632Cd+ywhTokqDWF2ZTAuOS4xY2F0dIGiY2NhbmdjbG9jay8qZHdpdGh4OGRpZDprZXk6ejZNa2hWQmRza1o0bkM1dzVBZjJjR1VLaUM1N1drVFBvNGI1eVE0eTdVQ1E5RFB1Y2F1ZFgi7QGr9nJuLwp0nEDgRD++xMEevJxeidIR77e76vGnnmmJyWNleHD2Y2lzc1gi7QHzO8amRsYuIRTIbVgCVkzdrGRhG6MO7O9gbSZhdmRl4GNwcmaB2CpYJQABcRIgF3rWeX07OXRXdYZHd7mPg+ke/IjV3VeizyHe6FeOCi5ZAXESIGpNX/zZd+XoV15NZsK5JW48RhhRORXBjmpjRzqV2vD4oWp1Y2FuQDAuOS4x2CpYJQABcRIg8nh2iUwiNUwq2k9IuzWbCvnGcTE70tMUSpyFSAShihU="
  )
);

const clock = await FP_UCAN.clockDelegation({
  audience: agent,
  databaseName: dbName,
  delegation,
});

console.log("CLOCK DID", clock.id.did());

const db = fireproof(dbName);

const context = await FP_UCAN.connect(db, {
  agent,
  clock,
});

const img = await imgUrlToUint8Array(
  "https://i0.wp.com/e-realtor.ca/wp-content/uploads/2021/09/Article_Header_DOUBLE-4.jpg?resize=300%2C300&ssl=1?w=512&h=256&ts=1"
);

console.log(img);

await addImage(db, agent.id.did(), img);

console.log("Added");

// await db.close();
// process.exit(0);
