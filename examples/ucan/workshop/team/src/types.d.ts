import { AgentWithStoreName, Clock, ClockWithoutDelegation, Server } from "@fireproof/ucan";

// 🪄

export type State = {
  agent: AgentWithStoreName;
  clock: Clock;
  docIds: Set<string>;
  images: { url: string }[];
  server: Server;
};

// 📣

export type Msg = { type: "-" } | { type: "UPDATE_DOC_IDS"; set: Set<string> };
