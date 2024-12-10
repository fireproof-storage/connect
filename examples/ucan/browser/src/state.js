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
 * @typedef {import("@fireproof/ucan").Server} Server
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
  console.log(msg.type);
  switch (msg.type) {
    case "CLAIM_ALL_SHARES":
      return { ...state, shareClaims: "loading" };

    case "CLAIMED_SHARES":
      return { ...state, shareClaims: msg.delegations };

    case "CONNECT":
      return { ...state, databaseContents: "loading", shareStatus: undefined };

    case "CONNECTED":
      return {
        ...state,
        database: msg.database,
        databaseSubscriptions: [msg.disconnect],
      };

    case "SET_CLOCK":
      return { ...state, clock: msg.clock };

    case "SET_CLOCK_ID_INPUT": {
      const val = msg.clockId.trim();
      const clockIdInput = val.match(/did\:key\:.+/) ? /** @type {`did:key:${string}`} */ (val) : undefined;

      return { ...state, clockIdInput };
    }

    case "SET_DATABASE_CONTENTS":
      return { ...state, databaseContents: msg.contents };

    case "SET_EMAIL": {
      const val = msg.email.trim();
      const email = val.length && val.includes("@") ? /** @type {`${string}@${string}`} */ (val) : undefined;

      return { ...state, email };
    }

    case "SET_LOGGED_IN":
      return { ...state, loggedIn: msg.loggedIn };

    case "SET_SERVER":
      return { ...state, server: msg.server };

    case "SET_SERVER_INPUT": {
      const val = msg.server.trim();
      const serverInput = val.length && val.match(/https?\:\/\//) ? val : undefined;

      return { ...state, serverInput };
    }

    case "SHARE_WITH_EMAIL":
      return { ...state, shareStatus: { type: "LOADING" } };

    case "SHARED_WITH_EMAIL":
      return { ...state, shareStatus: { type: "SHARED", cid: msg.cid, email: msg.email } };

    case "WAIT_FOR_LOGIN":
      return { ...state, loggedIn: "in-progress" };

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
    case "CLAIM_ALL_SHARES":
      return [claimAllShares];
    case "CONNECT":
      return [connect];
    case "CONNECTED":
      return [fetchDbContents];
    case "DATABASE_CONTENTS_CHANGED":
      return [fetchDbContents];
    case "LOGIN":
      return [login];
    case "SET_AGENT":
      return [determineClock];
    case "SET_CLOCK":
      return [connect, saveConfig];
    case "SET_CLOCK_ID_INPUT":
      return [determineClock];
    case "SET_EMAIL":
      return [determineClock, saveConfig];
    case "SET_LOGGED_IN":
      return [connect];
    case "SET_SERVER":
      return [checkLoginStatusIfServerChanged(msg.server), determineAgent, saveConfig];
    case "SET_SERVER_INPUT":
      return [determineServer];
    case "SHARE_WITH_EMAIL":
      return [shareWithEmail(msg.email)];
    case "WAIT_FOR_LOGIN":
      return [waitForLogin(msg.promise)];
    default:
      return [];
  }
};

// Effects
// =======

/** @param {Server} server */
function checkLoginStatusIfServerChanged(server) {
  /** @returns Promise<Msg> */
  return async () => {
    const s = state();

    if (server.id.did() === s.server.id.did()) {
      return /** @type {Msg} */ ({ type: "-" });
    }

    const loggedIn = s.email ? await UCAN.isLoggedIn({ agent: s.agent, email: UCAN.email(s.email) }) : false;

    return /** @type {Msg} */ ({ type: "SET_LOGGED_IN", loggedIn });
  };
}

/** @returns {Promise<Msg>} */
async function claimAllShares() {
  const email = state().email;
  if (!email) throw new Error("Cannot claim shares if not logged in");

  const { agent, server } = state();
  const delegations = await UCAN.claimShares({ email: UCAN.email(email) }, { agent, server });

  return { type: "CLAIMED_SHARES", delegations };
}

/** @returns {Promise<Msg>} */
async function connect() {
  const { agent, clock, databaseSubscriptions, email, loggedIn, server } = state();
  const existingDatabase = state().database;

  if (existingDatabase) {
    await existingDatabase.close();
  }

  databaseSubscriptions.forEach((callback) => callback());

  const database = fireproof(clock.id.did());

  if (!email || (email && loggedIn)) {
    await UCAN.connect(database, {
      agent,
      clock,
      server,
      email: email && loggedIn ? UCAN.email(email) : undefined,
      poll: true,
    });
  }

  const disconnect = database.subscribe(() => {
    send({ type: "DATABASE_CONTENTS_CHANGED" });
  });

  return { type: "CONNECTED", database, disconnect };
}

/** @returns {Promise<Msg>} */
async function determineAgent() {
  const { server } = state();
  const agent = await UCAN.agent({ server });

  return { type: "SET_AGENT", agent };
}

/** @returns {Promise<Msg>} */
async function determineClock() {
  const { agent, clockIdInput, email, server } = state();

  const clock = clockIdInput
    ? UCAN.clockId(clockIdInput)
    : await UCAN.clock({ audience: email ? UCAN.email(email) : agent.agent });

  if (clock.isNew && email) {
    await UCAN.registerClock({ clock, server });
  }

  return { type: "SET_CLOCK", clock };
}

/** @returns {Promise<Msg>} */
async function determineServer() {
  const { serverInput } = state();
  const server = await UCAN.server(serverInput);

  return { type: "SET_SERVER", server };
}

/** @returns {Promise<Msg>} */
async function fetchDbContents() {
  const db = state().database;
  if (!db) return { type: "-" };

  /** @type {AllDocsResponse<{ text: string }>} */
  const docs = await db.allDocs();

  /** @type {[string, string][]} */
  const contents = docs.rows.map((row) => {
    return [row.value._id, row.value.text];
  });

  return { type: "SET_DATABASE_CONTENTS", contents: new Map(contents) };
}

/** @returns {Promise<Msg>} */
async function login() {
  const { agent, email } = state();

  if (!email) return { type: "-" };

  const promise = UCAN.login({
    agent,
    email: UCAN.email(email),
  });

  return { type: "WAIT_FOR_LOGIN", promise };
}

/** @returns {Msg} */
function saveConfig() {
  const { clock, email, server } = state();

  localStorage.setItem(
    "config",
    JSON.stringify({
      clockId: "storeName" in clock ? undefined : clock.id.did(),
      email,
      server: server.uri.toString(),
    })
  );

  return { type: "-" };
}

/** @param {`${string}@${string}`} toEmail */
function shareWithEmail(toEmail) {
  /** @returns {Promise<Msg>} */
  return async () => {
    const { agent, clock, email, server } = state();

    if (!email) throw new Error("Expected `state.email` to be defined.");
    if (!("storeName" in clock)) throw new Error("Expected a clock delegation to be present.");

    const { cid } = await UCAN.share(
      {
        from: UCAN.email(email),
        to: UCAN.email(toEmail),
      },
      {
        agent,
        clock,
        server,
      }
    );

    return { type: "SHARED_WITH_EMAIL", cid, email: toEmail };
  };
}

/** @param {Promise<unknown>} promise */
function waitForLogin(promise) {
  /** @returns {Promise<Msg>} */
  return async () => {
    await promise;
    return { type: "SET_LOGGED_IN", loggedIn: true };
  };
}

// Setup
// =====

const storedState = localStorage.getItem("config");

/** @type {Record<string, any> | undefined} */
const config = storedState ? JSON.parse(storedState) : undefined;

/** @type {State} */
const initialState = await (async () => {
  const server = await UCAN.server(config?.server).catch(async () => {
    return await UCAN.server();
  });

  const agent = await UCAN.agent({ server });
  const email = config?.email ? UCAN.email(config.email) : undefined;
  const clock = config?.clockId ? UCAN.clockId(config.clockId) : await UCAN.clock({ audience: email || agent.agent });

  if (clock.isNew && email) {
    await UCAN.registerClock({ clock, server });
  }

  return {
    agent,
    clock,
    clockIdInput: config?.clockId,
    databaseContents: "loading",
    databaseSubscriptions: [],
    loggedIn: email ? await UCAN.isLoggedIn({ agent, email }) : false,
    server,
    serverInput: server.id.did() !== (await UCAN.server()).id.did() ? server.uri.toString() : undefined,
    email: config?.email,
  };
})();

// Setup & export store
export const [state, send] = store({
  state: initialState,
  update,
  middleware: fxware(fx),
});

// Setup database & connect
send({ type: "CONNECT" });
