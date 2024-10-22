import { StoreIndexedDB } from "@web3-storage/access/stores/store-indexeddb";

export default function (name: string) {
  return new StoreIndexedDB(name);
}
