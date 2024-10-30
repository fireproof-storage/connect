import { fireproof } from "@fireproof/core";

import { ed25519 } from "@ucanto/principal";
import { Agent, AgentData, StoreIndexedDB } from "@web3-storage/access";

import * as Connector from "./index";

///////////////////
// WORKSHOP TEAM //
///////////////////

const WORKSHOP_DB_NAME = "my-db";

export async function workshopSetup() {
  // Agent
  const store = new StoreIndexedDB("my-agent");
  await store.open();

  const principal = await ed25519.generate();
  const agentData: Partial<AgentData> = {
    meta: { name: "my-browser-agent", type: "app" },
    principal,
  };

  const agent = await Agent.create(agentData, { store });

  // Create clock
  const clock = await Connector.createAndSaveClock({
    audience: agent,
    databaseName: WORKSHOP_DB_NAME,
  });

  // Return
  return { agent, clock };
}

export async function workshopDelegate(participantAgentId: `did:${string}:${string}`) {
  // Load agent
  const store = new StoreIndexedDB("my-agent");
  await store.open();

  const data = await store.load();
  if (!data) throw new Error("Run setup first");
  const agent = Agent.from(data, { store });

  // Load clock
  const clock = await Connector.loadSavedClock({
    databaseName: WORKSHOP_DB_NAME,
  });

  // Delegate clock to `participantAgentId`
  // TODO

  // Export delegation to file to provide back to participant
  // TODO
}

/////////////////
// PARTICIPANT //
/////////////////
