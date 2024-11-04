import * as UCAN from "@fireproof/connect/ucan";
import { fxware, store } from "spellcaster/spellcaster.js";

/**
 & @template T
 * @typedef {import("spellcaster/spellcaster.js").Effect<T>} Effect
 */

/**
 * @typedef {import("./types").Msg} Msg
 * @typedef {import("./types").State} State
 */

const DEFAULT_DB_NAME = "my-fireproof-db";

/**
 * @param state {State}
 * @param msg {Msg}
 * @returns State
 */
const update = (state, msg) => {
  switch (msg.type) {
    case "SET_CLOCK":
      return { ...state, clock: msg.clock };
    case "SET_DATABASE_NAME":
      const databaseName = msg.name.length ? msg.name : DEFAULT_DB_NAME;
      return { ...state, databaseName };
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
    case "SET_DATABASE_NAME":
      return [determineClock, saveConfig];
    default:
      return [];
  }
};

// Effects
// =======

/** @returns {Promise<Msg>} */
async function determineClock() {
  const { agent, databaseName } = state();
  const clock = await UCAN.clock({ audience: agent.agent, databaseName });
  return { type: "SET_CLOCK", clock };
}

/** @returns {Msg} */
function saveConfig() {
  const { clock, databaseName, email, server } = state();

  localStorage.setItem(
    "config",
    JSON.stringify({
      clockId: "storeName" in clock ? undefined : clock.id.did(),
      databaseName,
      email,
      server: server.uri.toString(),
    })
  );

  return { type: "-" };
}

// Setup
// =====

const storedState = localStorage.getItem("config");

/** @type {Record<string, any> | undefined} */
const config = storedState ? JSON.parse(storedState) : undefined;

const databaseName = config?.databaseName || DEFAULT_DB_NAME;
const server = await UCAN.server(config?.server);
const agent = await UCAN.agent({ server });
const email = config?.email ? UCAN.email(config.email) : undefined;
const clock = await UCAN.clock({ audience: email || agent.agent, databaseName });

export const [state, send] = store({
  state: {
    agent,
    clock,
    databaseName,
    server,
  },
  update,
  middleware: fxware(fx),
});
