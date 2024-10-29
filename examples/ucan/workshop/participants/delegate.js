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
    "OqJlcm9vdHOB2CpYJQABcRIgMONvy395DjCxwwV9M2AWpaupV5tkGiz1nHmgP8jNqMpndmVyc2lvbgGgAgFxEiDgbzFAsk09dCPqq3iKotq52FnNhUeRwHyR5PS4IjsGDqdhc1hE7aEDQJLgk41xXGwlz1m2xyPbyI19MJmLNz/iQ1JyrssyVpMW/ouOQsRk78xjgRvzyTc9J+GsVnHU9bTx69bpir3DGAxhdmUwLjkuMWNhdHSBomNjYW5nY2xvY2svKmR3aXRoeDhkaWQ6a2V5Ono2TWtmWndNNlh2WWJhQWkyWUY0QmNETVh1VU5RaFBidm9VMjlOendNZ050UTV2bWNhdWRYIu0BrNT3zi6/YUh3ABUiWZ6+4Cj/sHOE9n/f4FGPt1oX5f5jZXhw9mNpc3NYIu0BEJGcSFMh9yKb403zbg8HAY+wHuuDAlHXBOf7bNQ3hGZjcHJmgMkCAXESIHfLtChi5rBexOEFOHiZwe001mu/zapwvz6oavN1wUAFp2FzWETtoQNAcW2OJvOqLhGAo96u4uXXSfJV/MXQ2Vl3Lk1kKniGy647dGPoYNsrCBtESaihdiFilzEGQC2k1jX4pKXQmlvuBGF2ZTAuOS4xY2F0dIGiY2NhbmdjbG9jay8qZHdpdGh4OGRpZDprZXk6ejZNa2Zad002WHZZYmFBaTJZRjRCY0RNWHVVTlFoUGJ2b1UyOU56d01nTnRRNXZtY2F1ZFgi7QGr9nJuLwp0nEDgRD++xMEevJxeidIR77e76vGnnmmJyWNleHD2Y2lzc1gi7QGs1PfOLr9hSHcAFSJZnr7gKP+wc4T2f9/gUY+3Whfl/mNwcmaB2CpYJQABcRIg4G8xQLJNPXQj6qt4iqLaudhZzYVHkcB8keT0uCI7Bg5ZAXESIDDjb8t/eQ4wscMFfTNgFqWrqVebZBos9Zx5oD/IzajKoWp1Y2FuQDAuOS4x2CpYJQABcRIgd8u0KGLmsF7E4QU4eJnB7TTWa7/NqnC/Pqhq83XBQAU="
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

await db.close();
process.exit(0);
