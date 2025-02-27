import { registerAWSStoreProtocol } from "./src/aws/gateway.ts";
import { URI } from "@adviser/cement";

registerAWSStoreProtocol();

const url = URI.from("aws://aws").build();
// url.setParam("region", "us-east-1");
// url.setParam("uploadUrl", "https://7leodn3dj2.execute-api.us-east-2.amazonaws.com/uploads");
url.setParam("getNeedsAuth", "true");
// url.setParam("uploadUrl", "http://127.0.0.1:3000/uploads");
url.setParam("uploadUrl", "http://127.0.0.1:18000/uploads");
url.setParam("webSocketUrl", "wss://fufauby0ii.execute-api.us-east-2.amazonaws.com/Prod");
// url.setParam("dataUrl", "https://fp1-uploads-201698179963.s3.us-east-2.amazonaws.com");

process.env.FP_STORAGE_URL = url.toString();
process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-aws?extractKey=_deprecated_internal_api";
