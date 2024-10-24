// The node polyfills we use don't have the `isDeepStrictEqual` method,
// so we have to get it from elsewhere.
import { promisify as pr } from "@jspm/core/nodelibs/util";

export * from "@jspm/core/nodelibs/util";
export { isDeepStrictEqual } from "is-deep-strict-equal-x";

export function promisify(fn) {
  // Don't attempt to promisify undefined functions
  return fn ? pr(fn) : undefined;
}
