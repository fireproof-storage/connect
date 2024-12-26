import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
  // Request,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
// import { IncomingRequestCfProperties, } from "@cloudflare/workers-types";
// Could import any other source file/function here
import worker from "./cf-index.js";
import { Env } from "./env.js";
import { base64pad } from "multiformats/bases/base64"

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Hello World worker", () => {
  it("binary put", async () => {
    const myEnv = env as Env;
    const ref = new Uint8Array(Array(256).fill(0).map((_, i) => i))
    await myEnv.STORAGE.put("test", base64pad.encode(ref));
    const res = base64pad.decode(await myEnv.STORAGE.get("test") || "");
    expect(res).toEqual(ref);
  })
  it("responds with Hello World!", async () => {
    console.log("Env", env);

    const request = new IncomingRequest("http://example.com");
    // Create an empty context to pass to `worker.fetch()`
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
    await waitOnExecutionContext(ctx);
    expect(await response.text()).toBe("Hello World!");
  });
});
