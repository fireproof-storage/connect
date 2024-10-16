import { URI } from "@adviser/cement";
import { connect } from "@ucanto/client";
import { CAR } from "@ucanto/core";
import { Channel, ConnectionView, Delegation, DID, Link, Principal, Signer } from "@ucanto/interface";
import { ed25519 } from "@ucanto/principal";
import { CAR as CARTransport } from "@ucanto/transport";
import * as Block from "multiformats/block";
import { CID } from "multiformats/cid";
import * as CBOR from "@ipld/dag-cbor";
import * as Raw from "multiformats/codecs/raw";
import { sha256 } from "multiformats/hashes/sha2";

import * as ClockCaps from "./clock/capabilities";
import * as StoreCaps from "./store/capabilities";
import { Service } from "./types";

////////////////////////////////////////
// 🔮
////////////////////////////////////////

export interface Agent {
  attestation: Delegation;
  delegation: Delegation;
  signer: Signer<DID<"key">>;
}

export interface Clock {
  delegation: Delegation;
  did: () => DID<"key">;
  signer: () => Signer<DID<"key">>;
}

////////////////////////////////////////
// CLOCK
////////////////////////////////////////

export async function advanceClock({
  agent,
  clock,
  event,
  server,
  service,
}: {
  agent: Agent;
  clock: Clock;
  event: Link;
  server: Principal;
  service: ConnectionView<Service>;
}) {
  const invocation = ClockCaps.advance.invoke({
    issuer: agent.signer,
    audience: server,
    with: clock.did(),
    nb: { event },
    proofs: [agent.delegation, agent.attestation],
  });

  return await invocation.execute(service);
}

/**
 * Create a clock.
 * Audience is always a `did:mailto` DID.
 */
export async function createClock({ audience }: { audience: Principal }): Promise<Clock> {
  const signer = await ed25519.Signer.generate();
  const delegation = await ClockCaps.clock.delegate({
    issuer: signer,
    audience,
    with: signer.did(),
    expiration: Infinity,
  });

  return {
    delegation,
    did: () => signer.did(),
    signer: () => signer,
  };
}

/**
 * Create a clock event.
 */
export async function createClockEvent({ metadata }: { metadata: Uint8Array }) {
  const eventData = { metadata };
  const event = { parents: [], data: eventData };

  const block = await Block.encode({
    value: event,
    codec: CBOR,
    hasher: sha256,
  });

  return await CAR.write({
    roots: [block],
  });
}

export async function getClockHead({
  agent,
  clock,
  server,
  service,
}: {
  agent: Agent;
  clock: Clock;
  server: Principal;
  service: ConnectionView<Service>;
}) {
  const invocation = ClockCaps.head.invoke({
    issuer: agent.signer,
    audience: server,
    with: clock.did(),
    proofs: [agent.delegation, agent.attestation],
  });

  return await invocation.execute(service);
}

export async function metadataFromClockEvent(carBytes: Uint8Array): Uint8Array {
  const car = CAR.decode(carBytes);
  // const link = car.roots[0]
  // const block = car.blocks.get(link.toString())

  console.log(car.roots);
  console.log(car.blocks);
}

/**
 * Register a clock.
 */
export async function registerClock({
  clock,
  server,
  service,
}: {
  clock: Clock;
  server: Principal;
  service: ConnectionView<Service>;
}) {
  const invocation = ClockCaps.register.invoke({
    issuer: clock.signer(),
    audience: server,
    with: clock.did(),
    nb: { proof: clock.delegation.cid },
    proofs: [clock.delegation],
  });

  return await invocation.execute(service);
}

////////////////////////////////////////
// CONNECTION
////////////////////////////////////////

export const service = (server: { id: Principal; host: URI }) => {
  const url = server.host.toString();

  const channel: Channel<Service> = {
    async request({ headers, body }) {
      const response = await fetch(url, {
        headers,
        body,
        method: "POST",
      });

      if (!response.ok) throw new Error(`HTTP Request failed. ${"POST"} ${url} → ${response.status}`);
      const buffer = response.ok ? await response.arrayBuffer() : new Uint8Array();

      return {
        headers: response.headers.entries ? Object.fromEntries(response.headers.entries()) : {},
        body: new Uint8Array(buffer),
      };
    },
  };

  return connect<Service>({
    id: server.id,
    codec: CARTransport.outbound,
    channel,
  });
};

////////////////////////////////////////
// STORE
////////////////////////////////////////

export async function retrieve({
  agent,
  cid,
  server,
  service,
}: {
  agent: Signer;
  cid: CID<unknown, 514, number, 1>; // CAR cid
  server: Principal;
  service: ConnectionView<Service>;
}): Promise<Uint8Array | undefined> {
  const resp = await StoreCaps.get
    .invoke({
      issuer: agent,
      audience: server,
      with: agent.did(),
      nb: {
        link: cid,
      },
    })
    .execute(service);

  if (resp.out.error) throw resp.out.error;
  return resp.out.ok;
}

export async function store({
  agent,
  bytes,
  cid,
  server,
  service,
}: {
  agent: Signer;
  bytes: Uint8Array;
  cid?: Link;
  server: Principal;
  service: ConnectionView<Service>;
}) {
  let link: Link;
  let size: number;

  if (cid === undefined) {
    const block = await Block.encode({
      value: bytes,
      codec: Raw,
      hasher: sha256,
    });

    const car = await CAR.write({
      roots: [block],
    });

    link = car.cid;
    size = car.bytes.length;
    bytes = car.bytes;
  } else {
    link = cid;
    size = bytes.length;
  }

  // Invocation
  const resp = await StoreCaps.add
    .invoke({
      issuer: agent,
      audience: server,
      with: agent.did(),
      nb: {
        link,
        size,
      },
    })
    .execute(service);

  console.log("🚗", link);
  console.log(resp.out);

  if (resp.out.error) throw resp.out.error;

  // Store on R2
  const storeUrl = resp.out.ok.url;

  const r2 = await fetch(storeUrl, {
    method: "PUT",
    body: bytes,
  });

  console.log("STORED", r2.ok);

  if (!r2.ok) {
    throw new Error(`Failed to store data on Cloudflare R2: ${await r2.text()}`);
  }

  // Return
  return { cid: link };
}
