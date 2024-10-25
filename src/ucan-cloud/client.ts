import { URI } from "@adviser/cement";
import { connect } from "@ucanto/client";
import { Channel, ConnectionView, Delegation, DID, Link, Principal, Signer } from "@ucanto/interface";
import { ed25519 } from "@ucanto/principal";
import { CAR as CARTransport } from "@ucanto/transport";
import * as Block from "multiformats/block";
import { CID } from "multiformats/cid";
import * as CBOR from "@ipld/dag-cbor";
import { sha256 } from "multiformats/hashes/sha2";

import * as ClockCaps from "./clock/capabilities";
import * as StoreCaps from "./store/capabilities";
import { Service } from "./types";

////////////////////////////////////////
// 🔮
////////////////////////////////////////

export interface Agent {
  readonly attestation: Delegation;
  readonly delegation: Delegation;
  readonly signer: Signer<DID<"key">>;
}

export interface Clock {
  readonly delegation: Delegation;
  did(): DID<"key">;
  signer(): Signer<DID<"key">>;
}

////////////////////////////////////////
// CLOCK
////////////////////////////////////////

export async function advanceClock({
  agent,
  clockId,
  event,
  server,
  service,
}: {
  agent: Agent;
  clockId: `did:key:${string}`;
  event: Link;
  server: Principal;
  service: ConnectionView<Service>;
}) {
  const invocation = ClockCaps.advance.invoke({
    issuer: agent.signer,
    audience: server,
    with: clockId,
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

  return block;
}

export async function getClockHead({
  agent,
  clockId,
  server,
  service,
}: {
  agent: Agent;
  clockId: `did:key:${string}`;
  server: Principal;
  service: ConnectionView<Service>;
}) {
  const invocation = ClockCaps.head.invoke({
    issuer: agent.signer,
    audience: server,
    with: clockId,
    proofs: [agent.delegation, agent.attestation],
  });

  return await invocation.execute(service);
}

export async function metadataFromClockEvent(eventBytes: Uint8Array): Promise<Uint8Array> {
  const block = await Block.decode<{ data: { metadata: Uint8Array } }, 113, 18>({
    bytes: eventBytes,
    codec: CBOR,
    hasher: sha256,
  });

  return block.value.data.metadata;
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

export function service(server: { id: Principal; host: URI }) {
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
}

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
  cid: CID;
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
  cid: Link;
  server: Principal;
  service: ConnectionView<Service>;
}) {
  const link: Link = cid;
  const size: number = bytes.length;

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

  if (resp.out.error) throw resp.out.error;

  // Store on R2
  const storeUrl = resp.out.ok.url;

  const r2 = await fetch(storeUrl, {
    method: "PUT",
    body: bytes,
  });

  if (!r2.ok) {
    throw new Error(`Failed to store data on Cloudflare R2`);
  }
}
