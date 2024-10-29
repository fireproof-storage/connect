import * as FP_UCAN from "@fireproof/ucan";
import { fireproof } from "@fireproof/core";
import { imgUrlToUint8Array } from "./image.js";
import { addImage } from "./db.js";

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
const clock = FP_UCAN.clockId("did:key:z6MkfZwM6XvYbaAi2YF4BcDMXuUNQhPbvoU29NzwMgNtQ5vm");

console.log("Agent DID:", agent.id.did());
