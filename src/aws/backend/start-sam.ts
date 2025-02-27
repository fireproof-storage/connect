import { Future } from "@adviser/cement";
import { $ } from "zx";

function getUpperCaseTransform() {
  return new Transform({
    transform(chunk, encoding, callback) {
      callback(null, String(chunk).toUpperCase());
    },
  });
}

async function main() {
  $.verbose = true;

  await $`mkdir -p dist/aws-backend`;
  await $`cp src/aws/backend/* dist/aws-backend`;
  await $`cd dist/aws-backend && sam build`;
  //const starting = $`cd dist/aws-backend && sam local start-api --docker-network tests_default --port 8017`
  // const future = new Future<void>();
  //for await (const line of starting.stderr) {
  //    console.error(">>>>>", line);
  //    if (line.includes("Running on http://")) {
  //        // break
  //    }
  // }
  // starting.run()
  // starting.then(() => {
  //     console.log("Started");
  // }).catch((e) => {
  //     console.error(e);
  //     process.exit(2);
  // })
  console.log("Started");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
