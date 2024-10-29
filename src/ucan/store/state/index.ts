import { runtimeFn } from "@adviser/cement";

export default async function store(name: string) {
  if (runtimeFn().isNodeIsh) {
    const n = await import("./node@skip-iife.js");
    return n.default(name);
  } else {
    const b = await import("./browser.js");
    return b.default(name);
  }
}
