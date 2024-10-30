import { Delegation as DelegationClass, extract, importDAG } from "@ucanto/core/delegation";
import { Delegation } from "@ucanto/interface";
import { AgentDataExport, DelegationMeta } from "@web3-storage/access";
import { Block } from "multiformats/block";
import { CID } from "multiformats";

export async function extractDelegation(dataExport: AgentDataExport): Promise<Delegation | undefined> {
  const delegationKey = Array.from(dataExport.delegations.keys())[0];
  const delegationExport = delegationKey ? dataExport.delegations.get(delegationKey)?.delegation : undefined;

  if (delegationExport === undefined) {
    return undefined;
  }

  const blocks = delegationExport.map((e) => {
    return new Block({ cid: CID.parse(e.cid).toV1(), bytes: new Uint8Array(e.bytes), value: e.bytes });
  });

  return importDAG(blocks);
}

export function exportDelegation(del: Delegation): [
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
        bytes: b.bytes,
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
