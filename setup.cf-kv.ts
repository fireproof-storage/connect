// import { registerS3StoreProtocol } from "./src/connect-s3/store-s3.js";
//
// registerS3StoreProtocol();
//
// const url = new URL("s3://testbucket/fp-test");
// url.searchParams.set("region", "eu-central-1");
// url.searchParams.set("accessKey", "minioadmin");
// url.searchParams.set("secretKey", "minioadmin");
// url.searchParams.set("ensureBucket", "true");
// url.searchParams.set("endpoint", "http://127.0.0.1:9000");
// const toSet = {
//   FP_STORAGE_URL: url.toString(),
//   // AWS_REGION: "eu-central-1",
//   // AWS_ACCESS_KEY_ID: "minioadmin",
//   // AWS_SECRET_ACCESS_KEY: "minioadmin",
//   // AWS_S3_ENDPOINT: "http://127.0.0.1:9000",
// };
// for (const [key, value] of Object.entries(toSet)) {
//   if (!process.env[key]) {
//     process.env[key] = value;
//   }
// }
