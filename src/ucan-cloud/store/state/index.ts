import { runtimeFn } from "@adviser/cement";

export default async function store(name: string) {
  if (runtimeFn().isNodeIsh) {
    const n = await import("../../../ucan-cloud/store/state/node.js");
    return n.default(name);
  } else {
    const b = await import("../../../ucan-cloud/store/state/node.js");
    return b.default(name);
  }
}
