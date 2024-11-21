import { importDAG } from "@ucanto/core/delegation";
import { Delegation } from "@ucanto/interface";
import type { Agent, AgentDataExport, DelegationMeta } from "@web3-storage/access/types";
import { Block } from "multiformats/block";
import { CID } from "multiformats";

import type { Service } from "./types.js";

export function agentProofs(
  agent: Agent<Service>,
  mailtoDID?: `did:mailto:${string}:${string}`
): { attestations: Delegation[]; delegations: Delegation[] } {
  const proofs = agent.proofs([{ with: /did:mailto:.*/, can: "*" }]);
  const delegations = proofs.filter(
    (p) => p.capabilities[0].can === "*" && (mailtoDID ? p.issuer.did() === mailtoDID : true)
  );

  const delegationCids = delegations.map((d) => d.cid.toString());
  const attestations = proofs.filter((p) => {
    const cap = p.capabilities[0];
    return (
      cap.can === "ucan/attest" &&
      delegationCids.includes((cap.nb as { proof: { toString(): string } }).proof.toString())
    );
  });

  return {
    delegations,
    attestations,
  };
}

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
