import { bs, SuperThis } from "@fireproof/core";
import { PartyKitGateway, PartyKitTestStore } from "./pk-gateway";
import { URI } from "@adviser/cement";

export function registerPartyKitStoreProtocol(protocol = "partykit:", overrideBaseURL?: string) {
  URI.protocolHasHostpart(protocol);
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
