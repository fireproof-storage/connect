import { URI } from "@adviser/cement";
import { registerUCANStoreProtocol } from "./src/ucan-cloud/ucan-gateway.ts";
import { createNewClock } from "./src/ucan-cloud/common.ts";

registerUCANStoreProtocol();

const email = "example@fireproof.storage";
const protocol = "http://";
const host = "localhost:8787";
const confProfile = "fireproof";
const serverId = "did:key:z6Mkj3oU3VKyLv1ZNdjC2oKgHPrZDCnzSJLczrefoq3ZQMVf";

const clock = await createNewClock({
  databaseName: "test",
  email,
  serverURI: URI.from(protocol + host),
  serverId,
});

const uri = URI.from(`ucan://${host}`).build();
uri.setParam("email", email);
uri.setParam("clock-id", clock.did());
uri.setParam("conf-profile", confProfile);
uri.setParam("server-host", protocol + host);
uri.setParam("server-id", serverId);

process.env.FP_STORAGE_URL = uri.toString();
process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-ucan?fs=mem&extractKey=_deprecated_internal_api";
