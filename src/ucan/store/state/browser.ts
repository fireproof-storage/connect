import { StoreIndexedDB } from "@web3-storage/access/stores/store-indexeddb";

// import type { AgentDataExport } from "@web3-storage/access";
// import type { Driver } from "@web3-storage/access/drivers/types";

export default function store(name: string) {
  return new StoreIndexedDB(name);
}
