import { AgentWithStoreName, Clock, ClockWithoutDelegation, Server } from "@fireproof/connect/ucan";

// 🪄

export type State = {
  agent: AgentWithStoreName;
  clock: Clock | ClockWithoutDelegation;
  databaseName: string;
  email?: string;
  server: Server;
};

// 📣

export type Msg =
  | { type: "-" }
  | { type: "SET_CLOCK"; clock: Clock | ClockWithoutDelegation }
  | { type: "SET_DATABASE_NAME"; name: string };
