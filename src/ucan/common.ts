import { importDAG } from "@ucanto/core/delegation";
import { Delegation } from "@ucanto/interface";
import type { AgentDataExport, DelegationMeta } from "@web3-storage/access/types";
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
