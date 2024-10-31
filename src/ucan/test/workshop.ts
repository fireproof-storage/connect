import * as Connector from "../index";

///////////////////
// WORKSHOP TEAM //
///////////////////

const WORKSHOP_DB_NAME = "my-db";

export async function workshopSetup() {
  const agent = await Connector.agent();

  // Create clock
  const clock = await Connector.createAndSaveClock({
    audience: agent.agent,
    databaseName: WORKSHOP_DB_NAME,
  });

  // Return
  return { agent, clock };
}

export async function workshopDelegate(_participantAgentId: `did:${string}:${string}`) {
  const _agent = await Connector.agent();

  // Load clock
  const _clock = await Connector.loadSavedClock({
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
