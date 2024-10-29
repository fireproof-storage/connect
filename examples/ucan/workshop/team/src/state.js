import * as UCAN from "@fireproof/ucan";
import { fireproof } from "@fireproof/core";
import { fxware, store } from "spellcaster/spellcaster.js";
import { docIds, imageUrls } from "./db";
import { byteArray } from "./image";
import { CBOR, DID } from "@ucanto/core";
import { base64pad } from "multiformats/bases/base64";

/**
 & @template T
 * @typedef {import("spellcaster/spellcaster.js").Effect<T>} Effect
 */

/**
 * @typedef {import("./types").Msg} Msg
 * @typedef {import("./types").State} State
 */

/**
 * @param state {State}
 * @param msg {Msg}
 * @returns State
 */
const update = (state, msg) => {
  console.log(msg);
  switch (msg.type) {
    default:
      return state;
  }
};

/**
 * @param msg {Msg}
 * @returns {Effect<Msg>[]}
 */
const fx = (msg) => {
  switch (msg.type) {
    default:
      return [];
  }
};

// Effects
// =======

// ...

// Setup
// =====

const db = fireproof("workshop-db");
const clock = await UCAN.clock({ audience: await UCAN.agent(), databaseName: "workshop-db" });
const context = await UCAN.connect(db, { clock });

// await addImage(db, byteArray);

export const [state, send] = store({
  state: {
    agent: context.agent,
    clock: clock,
    docIds: new Set(),
    images: await imageUrls(db),
    server: context.server,
  },
  update,
  middleware: fxware(fx),
});

// POLLING

async function timeoutFn() {
  const set = new Set(await docIds(db));
  const existing = state().docIds;

  const diff = Array.from(set).filter((e) => {
    return existing.has(e);
  });

  console.log("diff", diff);

  if (diff.length) {
    send({ type: "UPDATE_DOC_IDS", set });
  }

  setTimeout(timeoutFn, 2500);
}

timeoutFn();

// CONSOLE FN

/**
 * @param params {object}
 * @param params.agentDID {string}
 */
globalThis.ucanDelegate = async ({ agentDID }) => {
  const { agent, clock } = state();

  const delegation = await UCAN.Capabilities.Clock.clock.delegate({
    issuer: agent.agent.issuer,
    audience: DID.parse(agentDID),
    with: clock.id.did(),
    proofs: [clock.delegation],
    expiration: Infinity,
  });

  const archive = await UCAN.delegation.archive(delegation);
  return base64pad.baseEncode(archive);
};
