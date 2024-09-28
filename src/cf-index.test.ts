// import { createExecutionContext, waitOnExecutionContext, } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import { add } from "./cf-index.js";
// import worker from "./cf-index.js";

describe("Hello World worker", () => {
  it("adds two numbers", async () => {
    expect(add(2, 3)).toBe(5);
  });
  // it("sends request (unit style)", async () => {
  //   const request = new Request("http://example.com/?a=3&b=4");
  //   const ctx = createExecutionContext();
  //   const response = await worker.fetch(request/*, env, ctx*/);
  //   await waitOnExecutionContext(ctx);
  //   expect(await response.text()).toMatchInlineSnapshot(`"7"`);
  // });
});
