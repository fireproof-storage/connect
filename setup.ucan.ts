import { registerUCANStoreProtocol } from "./src/ucan/ucan-gateway.ts";
import * as Connector from "./src/ucan/index.ts";

registerUCANStoreProtocol();

const dbName = "test";
const agent = await Connector.agent({ storeName: `fireproof/tests/ucan/${dbName}/agent` });
const clock = await Connector.createAndSaveClock({
  audience: agent.agent.issuer,
  databaseName: dbName,
  storeName: `fireproof/tests/ucan/${dbName}/clock`,
});

const serverId = "did:key:z6Mkj3oU3VKyLv1ZNdjC2oKgHPrZDCnzSJLczrefoq3ZQMVf";
const server = await Connector.server("http://localhost:8787", serverId);

const uri = server.uri
  .build()
  .protocol("ucan:")
  .setParam("agent-store", agent.storeName)
  .setParam("clock-id", clock.id.did())
  .setParam("clock-store", clock.storeName)
  .setParam("name", dbName)
  .setParam("server-host", server.uri.toString())
  .setParam("server-id", server.id.did())
  .setParam(
    "server-priv-key",
    process.env.UCAN_SERVER_PRIV_KEY ||
      "MgCZc476L5pn6Kiw5YdLHEy5CHZgw5gRWxNj/UcLRQoxaHu0BREgGEsI7N8cQxjO6fdgA/lEAphNmR/um1DEfmBTBByY"
  );

process.env.FP_STORAGE_URL = uri.toString();
process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-ucan?fs=mem&extractKey=_deprecated_internal_api";
