import { Database } from "@fireproof/core";
import { AgentWithStoreName, Clock, ClockWithoutDelegation, Server } from "@fireproof/ucan";
import { Delegation } from "@ucanto/interface";

// 🪄

export type State = {
  agent: AgentWithStoreName;
  clock: Clock | ClockWithoutDelegation;
  clockIdInput?: `did:key:${string}`
  database?: Database
  databaseContents: Map<string, string> | "loading"
  email?: `${string}@${string}`
  loggedIn: boolean | "in-progress"
  server: Server
  serverInput?: string
  shareClaims?: Delegation[] | "loading"
  shareStatus?: { type: "SHARED"; cid: string; email: `${string}@${string}` } | { type: "LOADING" }
};

// 📣

export type Msg =
  | { type: "-" }
  | { type: "CLAIM_ALL_SHARES" }
  | { type: "CLAIMED_SHARES", delegations: Delegation[] }
  | { type: "CONNECT" }
  | { type: "CONNECTED"; database: Database }
  | { type: "LOGIN" }
  | { type: "DATABASE_CONTENTS_CHANGED" }
  | { type: "SET_AGENT"; agent: AgentWithStoreName }
  | { type: "SET_CLOCK"; clock: Clock | ClockWithoutDelegation }
  | { type: "SET_CLOCK_ID_INPUT"; clockId: string }
  | { type: "SET_DATABASE_CONTENTS"; contents: Map<string, string> }
  | { type: "SET_EMAIL"; email: string }
  | { type: "SET_LOGGED_IN"; loggedIn: State["loggedIn"] }
  | { type: "SET_SERVER"; server: Server }
  | { type: "SET_SERVER_INPUT"; server: string }
  | { type: "SHARE_WITH_EMAIL"; email: `${string}@${string}` }
  | { type: "SHARED_WITH_EMAIL"; cid: string; email: `${string}@${string}` }
  | { type: "WAIT_FOR_LOGIN"; promise: Promise<unknown> };
