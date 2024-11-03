import { AgentWithStoreName, Clock, ClockWithoutDelegation, Server } from "@fireproof/connect/ucan";

// 🪄

export type State = {
  agent: AgentWithStoreName;
  clock: Clock | ClockWithoutDelegation;
  databaseName: string;
  server: Server;
};

// 📣

export type Msg = "CREATE_NEW_CLOCK" | "USE_CLOCK_ID";
