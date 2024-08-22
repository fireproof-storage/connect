import { registerPartyKitStoreProtocol } from "./src/connect-partykit/partykit-store";
import { URI } from "@adviser/cement";

registerPartyKitStoreProtocol();
const url = URI.from("partykit://localhost:1999").build();
url.setParam("insecure", "true");
const toSet = {
  FP_STORAGE_URL: url.toString(),
};
for (const [key, value] of Object.entries(toSet)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}
