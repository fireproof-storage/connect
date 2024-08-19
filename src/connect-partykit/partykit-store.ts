import { bs, Logger } from "@fireproof/core";
import { PartyKitGateway, PartyKitTestStore } from "./partykit-gateway";

export function registerPartyKitStoreProtocol(protocol = "partykit:", overrideBaseURL?: string) {
  return bs.registerStoreProtocol({
    protocol,
    overrideBaseURL,
    gateway: async (logger) => {
      return new PartyKitGateway(logger);
    },
    test: async (logger: Logger) => {
      const gateway = new PartyKitGateway(logger);
      return new PartyKitTestStore(gateway, logger);
    },
  });
}
