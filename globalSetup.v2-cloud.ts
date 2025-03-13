import { ensureSuperThis } from "@fireproof/core";
import { setupBackend } from "./src/v2-cloud/test-helper.js";
import { wranglerParams } from "./src/v2-cloud/test-utils.js";

const sthis = ensureSuperThis();
export async function setup() {
  const r = await setupBackend(sthis);
  process.env[`FP_TEST_CF_BACKEND`] = JSON.stringify(r);
  // eslint-disable-next-line no-console
  console.log("Started wrangler process - ", wranglerParams(sthis).pid);
}

export async function teardown() {
  // eslint-disable-next-line no-console
  console.log("Stopping wrangler process - ", wranglerParams(sthis).pid);
  process.kill(wranglerParams(sthis).pid);
}
