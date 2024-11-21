import { fireproof } from "@fireproof/core";
import * as UCAN from "@fireproof/ucan";
import { fxware, store } from "spellcaster/spellcaster.js";

/**
 * @typedef {import("@fireproof/core").DocTypes} DocTypes
 */

/**
 * @template T
 * @typedef {import("spellcaster/spellcaster.js").Effect<T>} Effect
 */

/**
 * @template V
 * @typedef {import("@fireproof/core").AllDocsResponse<DocTypes & V>} AllDocsResponse
 */

/**
 * @typedef {import("./types").Msg} Msg
 * @typedef {import("./types").State} State
 */

const DEFAULT_DB_NAME = "my-fireproof-db";

/**
 * @param state {State}
 * @param msg {Msg}
 * @returns {State}
 */
const update = (state, msg) => {
  switch (msg.type) {
    case "CONNECTED": return { ...state, database: msg.database }
    case "SET_CLOCK": return { ...state, clock: msg.clock }

    case "SET_CLOCK_ID_INPUT": {
      const val = msg.clockId.trim();
      const clockIdInput = val.match(/did\:key\:.+/) ? /** @type {`did:key:${string}`} */ (val) : undefined

      return { ...state, clockIdInput };
    }

    case "SET_DATABASE_CONTENTS": {
      return { ...state, databaseContents: msg.contents };
    }

    case "SET_DATABASE_NAME": {
      const val = msg.name.trim()
      const databaseName = val.length ? val : DEFAULT_DB_NAME;
      return { ...state, databaseName };
    }

    case "SET_EMAIL": {
      const val = msg.email.trim()
      const email = val.length && val.includes("@") ? /** @type {`${string}@${string}`} */ (val) : undefined

      return { ...state, email }
    }

    case "SET_LOGGED_IN": return { ...state, loggedIn: msg.loggedIn }
    case "SET_SERVER": return { ...state, server: msg.server }

    case "SET_SERVER_INPUT": {
      const val = msg.server.trim()
      const serverInput = val.length && val.match(/https?\:\/\//) ? val : undefined

      return { ...state, serverInput }
    }

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
    case "CONNECT":
      return [connect]
    case "CONNECTED":
      return [fetchDbContents]
    case "DATABASE_CONTENTS_CHANGED":
      return [fetchDbContents]
    case "LOGIN":
      return [login];
    case "SET_AGENT":
      return [determineClock];
    case "SET_CLOCK":
      return [connect]
    case "SET_CLOCK_ID_INPUT":
      return [determineClock];
    case "SET_DATABASE_NAME":
      return [determineClock, saveConfig];
    case "SET_EMAIL":
      return [determineClock, saveConfig];
    case "SET_SERVER":
      return [determineAgent, saveConfig];
    case "SET_SERVER_INPUT":
      return [determineServer];
    default:
      return [];
  }
};

// Effects
// =======

/** @returns {Promise<Msg>} */
async function connect() {
  const { agent, clock, databaseName, email, server } = state()

  const database = fireproof(databaseName)
  const context = await UCAN.connect(database, {
    agent,
    clock,
    server,
    email: email ? UCAN.email(email) : undefined
  })

  await context.connection.loaded;

  return { type: "CONNECTED", database }
}

/** @returns {Promise<Msg>} */
async function determineAgent() {
  const { server } = state()
  const agent = await UCAN.agent({ server });

  return { type: "SET_AGENT", agent };
}

/** @returns {Promise<Msg>} */
async function determineClock() {
  const { agent, clockIdInput, databaseName, email, server } = state();

  const clock = clockIdInput
    ? UCAN.clockId(clockIdInput)
    : await UCAN.clock({ audience: email ? UCAN.email(email) : agent.agent, databaseName });

  if (clock.isNew && email) {
    await UCAN.registerClock({ clock, server })
  }

  return { type: "SET_CLOCK", clock };
}

/** @returns {Promise<Msg>} */
async function determineServer() {
  const { serverInput } = state()
  const server = await UCAN.server(serverInput)

  return { type: "SET_SERVER", server };
}

/** @returns {Promise<Msg>} */
async function fetchDbContents() {
  const db = state().database
  if (!db) return { type: "-" }

  /** @type {AllDocsResponse<{ text: string }>} */
  const docs = await db.allDocs();

  /** @type {[string, string][]} */
  const contents = docs.rows.map(row => {
    return [row.value._id, row.value.text]
  })

  return { type: "SET_DATABASE_CONTENTS", contents: new Map(contents) }
}

/** @returns {Promise<Msg>} */
async function login() {
  const { agent, email } = state()

  if (!email) return { type: "-" }

  await UCAN.login({
    agent,
    email: UCAN.email(email)
  })

  return { type: "SET_LOGGED_IN", loggedIn: true }
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

// Initial state
const initialState = await (async () => {
  const server = await UCAN.server(config?.server);
  const agent = await UCAN.agent({ server });
  const email = config?.email ? UCAN.email(config.email) : undefined;
  const databaseName = config?.databaseName || DEFAULT_DB_NAME;
  const clock = await UCAN.clock({ audience: email || agent.agent, databaseName });

  return {
    agent,
    clock,
    databaseContents: new Map(),
    databaseName,
    loggedIn: email ? await UCAN.isLoggedIn({ agent, email }) : false,
    server,
    email: config?.email
  }
})()

// Setup & export store
export const [state, send] = store({
  state: initialState,
  update,
  middleware: fxware(fx),
});

// Setup database & connect
send({ type: "CONNECT" })
