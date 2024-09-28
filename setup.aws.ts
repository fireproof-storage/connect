import { registerAWSStoreProtocol } from "./src/aws/gateway.ts";
import { URI } from "@adviser/cement";

registerAWSStoreProtocol();

const url = URI.from("aws://aws").build();
url.setParam("region", "us-east-2");
url.setParam("uploadUrl", "https://7leodn3dj2.execute-api.us-east-2.amazonaws.com/uploads");
url.setParam("webSocketUrl", "wss://fufauby0ii.execute-api.us-east-2.amazonaws.com/Prod");
url.setParam("dataUrl", "https://fp1-uploads-201698179963.s3.us-east-2.amazonaws.com");

console.log("Setting up AWS store with URL:", url.toString());

process.env.FP_STORAGE_URL = url.toString();
process.env.FP_KEYBAG_URL = "file://./dist/kb-dir-aws?fs=mem&extractKey=_deprecated_internal_api";
