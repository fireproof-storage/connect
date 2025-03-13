import { SuperThis } from "@fireproof/core";
import type { BackendParams } from "./test-helper.js";

export function portForLocalTest(sthis: SuperThis): number {
  return wranglerParams(sthis).port;
}

export function wranglerParams(sthis: SuperThis): BackendParams {
  const cf_backend = sthis.env.get("FP_TEST_CF_BACKEND");
  if (!cf_backend) {
    return {
      port: 0,
      pid: 0,
      envName: "not-set",
    };
  }
  return JSON.parse(cf_backend) as BackendParams;
}

export function portRandom(): number {
  return process.env.FP_WRANGLER_PORT
    ? +process.env.FP_WRANGLER_PORT
    : 1024 + Math.floor(Math.random() * (65536 - 1024));
}
