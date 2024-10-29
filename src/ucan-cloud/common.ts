import { URI } from "@adviser/cement";

import { API } from "@ucanto/core";
import { ConnectionView, Principal } from "@ucanto/interface";
import { DelegationMeta } from "@web3-storage/access";
import * as W3 from "@web3-storage/w3up-client";
import { Service as W3Service } from "@web3-storage/w3up-client/types";

import * as Client from "./client";
import stateStore from "./store/state";

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
  audience,
  databaseName,
  serverURI,
  serverId,
}: {
  audience: Principal;
  databaseName: string;
  serverURI: URI;
  serverId: `did:${string}:${string}`;
}): Promise<Client.Clock> {}

export function uint8ArrayToArrayBuffer(array: Uint8Array) {
  if (array.byteOffset === 0 && array.byteLength === array.buffer.byteLength) {
    return array.buffer;
  } else {
    return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset);
  }
}

export async function w3Client({
  serverHost,
  serverId,
  storeName,
}: {
  serverHost: URI;
  serverId: Principal;
  storeName: string;
}) {
  const service = Client.service({ host: serverHost, id: serverId });
  const w3Service = service as unknown as ConnectionView<W3Service>;
  const store = await stateStore(storeName);

  return await W3.create({
    store,
    serviceConf: {
      access: w3Service,
      filecoin: w3Service,
      upload: w3Service,
    },
  });
}
