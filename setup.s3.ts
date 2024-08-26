import { registerS3StoreProtocol } from "./src/s3/s3-store.ts";
import { URI } from "@adviser/cement";

const unreg = registerS3StoreProtocol();

const url = URI.from("s3://testbucket/fp-test").build();
url.setParam("region", "eu-central-1");
url.setParam("accessKey", "minioadmin");
url.setParam("secretKey", "minioadmin");
url.setParam("ensureBucket", "true");
url.setParam("endpoint", "http://127.0.0.1:9000");
const toSet = {
  FP_STORAGE_URL: url.toString(),
  FP_TEST_VERSION: unreg.version,
};
for (const [key, value] of Object.entries(toSet)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}
