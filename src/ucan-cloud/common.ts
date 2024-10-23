import { URI } from "@adviser/cement";

import { API, DID } from "@ucanto/core";
import { Absentee } from "@ucanto/principal";
import * as DidMailto from "@web3-storage/did-mailto";
import { AgentDataExport, DelegationMeta } from "@web3-storage/access";

import * as Client from "./client";
import stateStore from "./store/state";

export function clockStoreName({ databaseName }: { databaseName: string }) {
  return `fireproof/${databaseName}/clock`;
}

export function exportDelegation(del: API.Delegation): [
  string,
  {
    meta: DelegationMeta;
    delegation: { cid: string; bytes: ArrayBuffer }[];
  },
] {
  return [
    del.cid.toString(),
    {
      meta: {},
      delegation: [...del.export()].map((b) => ({
        cid: b.cid.toString(),
        bytes: uint8ArrayToArrayBuffer(b.bytes),
      })),
    },
  ];
}

export async function createNewClock({
  databaseName,
  email,
  serverHost,
  serverId,
}: {
  databaseName: string;
  email: `${string}@${string}`;
  serverHost: string;
  serverId: `did:${string}:${string}`;
}): Promise<Client.Clock> {
  const audience = Absentee.from({ id: DidMailto.fromEmail(email) });
  const storeName = clockStoreName({ databaseName });
  const clockStore = await stateStore(storeName);
  const clock = await Client.createClock({ audience });

  const raw: AgentDataExport = {
    meta: { name: storeName, type: "service" },
    principal: clock.signer().toArchive(),
    spaces: new Map(),
    delegations: new Map([]),
    // delegations: new Map([exportDelegation(clock.delegation)]),
  };

  await clockStore.save(raw);

  const server = DID.parse(serverId);
  const serverHostURI = URI.from(serverHost);
  if (!serverHostURI) throw new Error("`server-host` is not a valid URL");

  const service = Client.service({ host: serverHostURI, id: server });
  const registration = await Client.registerClock({ clock, server, service });
  if (registration.out.error) throw registration.out.error;

  return clock;
}

export function uint8ArrayToArrayBuffer(array: Uint8Array) {
  if (array.byteOffset === 0 && array.byteLength === array.buffer.byteLength) {
    return array.buffer;
  } else {
    return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset);
  }
}
