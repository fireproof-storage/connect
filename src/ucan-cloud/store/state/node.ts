import { StoreConf } from "@web3-storage/access/stores/store-conf";

export default function (name: string) {
  return new StoreConf({ profile: name });
}
