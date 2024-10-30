import { fireproof } from "@fireproof/core";

import { ed25519 } from "@ucanto/principal";
import { Agent, AgentData, StoreIndexedDB } from "@web3-storage/access";

import * as Connector from "../index";

///////////////////
// WORKSHOP TEAM //
///////////////////

const WORKSHOP_DB_NAME = "my-db";

export async function workshopSetup() {
  const agent = await Connector.agent();

  // Create clock
  const clock = await Connector.createAndSaveClock({
    audience: agent,
    databaseName: WORKSHOP_DB_NAME,
  });

  // Return
  return { agent, clock };
}

export async function workshopDelegate(participantAgentId: `did:${string}:${string}`) {
  const agent = await Connector.agent();

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
