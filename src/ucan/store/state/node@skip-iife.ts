import { StoreConf } from "@web3-storage/access/stores/store-conf";

import type { AgentDataExport } from "@web3-storage/access/agent";
import type { Driver } from "@web3-storage/access/drivers/types";

export default function store(name: string): Driver<AgentDataExport> {
  return new StoreConf({ profile: name });
  // return undefined as unknown as Driver<AgentDataExport>;
}
