import { API } from "@ucanto/core";
import { ConnectionView } from "@ucanto/interface";
import { DelegationMeta } from "@web3-storage/access";
import * as W3 from "@web3-storage/w3up-client";
import { Service as W3Service } from "@web3-storage/w3up-client/types";

import * as Client from "./client";
import stateStore from "./store/state";
import { Server } from "./types";

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

export function uint8ArrayToArrayBuffer(array: Uint8Array) {
  if (array.byteOffset === 0 && array.byteLength === array.buffer.byteLength) {
    return array.buffer;
  } else {
    return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset);
  }
}

export async function w3Client({ server, storeName }: { server: Server; storeName: string }) {
  const service = Client.service(server);
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
