// The node polyfills we use don't have the `isDeepStrictEqual` method,
// so we have to get it from elsewhere.
export * from "@jspm/core/nodelibs/util";
export { isDeepStrictEqual } from "is-deep-strict-equal-x";
