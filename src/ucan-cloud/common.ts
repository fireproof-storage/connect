import { extract } from "@ucanto/core/delegation";
import { Delegation } from "@ucanto/interface";
import { AgentDataExport, DelegationMeta } from "@web3-storage/access";

export async function extractClockDelegation(dataExport: AgentDataExport): Promise<Delegation | undefined> {
  const delegationKey = Array.from(dataExport.delegations.keys())[0];
  const delegationBytes = delegationKey ? dataExport.delegations.get(delegationKey)?.delegation?.[0] : undefined;

  if (delegationBytes === undefined) {
    return undefined;
  }

  const delegationResult = await extract(new Uint8Array(delegationBytes.bytes));
  if (delegationResult.error) {
    throw delegationResult.error;
  }

  return delegationResult.ok;
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
