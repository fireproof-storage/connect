import { bs, SuperThis } from "@fireproof/core";
import { PartyKitGateway, PartyKitTestStore } from "./partykit-gateway";

export function registerPartyKitStoreProtocol(protocol = "partykit:", overrideBaseURL?: string) {
  return bs.registerStoreProtocol({
    protocol,
    overrideBaseURL,
    gateway: async (logger) => {
      return new PartyKitGateway(logger);
    },
    test: async (sthis: SuperThis) => {
      const gateway = new PartyKitGateway(sthis);
      return new PartyKitTestStore(gateway, sthis);
    },
  });
}
