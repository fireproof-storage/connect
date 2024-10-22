import { defineConfig, Options } from "tsup";
import path from "path";
import { fileURLToPath } from "url";
import resolve from "esbuild-plugin-resolve";
import { replace } from "esbuild-plugin-replace";
import { polyfillNode } from "esbuild-plugin-polyfill-node";

// Correctly resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Existing 'ourMultiformat' object or any other resolve mappings you have
const ourMultiformat = {};

function packageVersion() {
  let version = "refs/tags/v0.0.0-smoke";
  if (process.env.GITHUB_REF && process.env.GITHUB_REF.startsWith("refs/tags/v")) {
    version = process.env.GITHUB_REF;
  }
  version = version.split("/").slice(-1)[0].replace(/^v/, "");
  return JSON.stringify(version);
}

const LIBRARY_BUNDLE_OPTIONS: Options = {
  target: ["esnext", "node18"],
  globalName: "Connect",
  clean: true,
  sourcemap: true,
  metafile: true,
  minify: false,
};

const LIBRARY_BUNDLES: Options[] = [
  // IIFE build with moduleReplacementPlugin
  {
    ...LIBRARY_BUNDLE_OPTIONS,
    format: ["iife"],
    name: "@fireproof/partykit",
    entry: ["src/partykit/index.ts"],
    platform: "browser",
    outDir: "dist/partykit",
    esbuildPlugins: [
      polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        ...ourMultiformat,
      }),
    ],
    dts: false, // No type declarations needed for IIFE build
  },
  // ESM and CJS builds without moduleReplacementPlugin
  {
    ...LIBRARY_BUNDLE_OPTIONS,
    format: ["esm", "cjs"],
    name: "@fireproof/partykit",
    entry: ["src/partykit/index.ts"],
    platform: "browser",
    outDir: "dist/partykit",
    esbuildPlugins: [
      polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        ...ourMultiformat,
      }),
    ],
    dts: {
      footer: "declare module '@fireproof/partykit'",
    },
  },
  // {
  //   ...LIBRARY_BUNDLE_OPTIONS,
  //   format: ["iife"],
  //   name: "@fireproof/s3",
  //   entry: ["src/s3/index.ts"],
  //   platform: "browser",
  //   outDir: "dist/s3",
  //   esbuildPlugins: [
  //     replace({
  //       __packageVersion__: packageVersion(),
  //       include: /version/,
  //     }),
  //     resolve({
  //       ...stopFile,
  //       ...ourMultiformat,
  //     }),
  //   ],
  //   dts: {
  //     footer: "declare module '@fireproof/s3'",
  //   },
  // },
  {
    ...LIBRARY_BUNDLE_OPTIONS,
    format: ["esm", "cjs"],
    name: "@fireproof/s3",
    entry: ["src/s3/index.ts"],
    platform: "browser",
    outDir: "dist/s3",
    esbuildPlugins: [
      polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        ...ourMultiformat,
      }),
    ],
    dts: {
      footer: "declare module '@fireproof/s3'",
    },
  },
  // IIFE build with moduleReplacementPlugin
  {
    ...LIBRARY_BUNDLE_OPTIONS,
    format: ["iife"],
    name: "@fireproof/netlify",
    entry: ["src/netlify/index.ts"],
    platform: "browser",
    outDir: "dist/netlify",
    esbuildPlugins: [
      polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        ...ourMultiformat,
      }),
    ],
    dts: false, // No type declarations needed for IIFE build
  },
  // ESM and CJS builds without moduleReplacementPlugin
  {
    ...LIBRARY_BUNDLE_OPTIONS,
    format: ["esm", "cjs"],
    name: "@fireproof/netlify",
    entry: ["src/netlify/index.ts"],
    platform: "browser",
    outDir: "dist/netlify",
    esbuildPlugins: [
      polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        ...ourMultiformat,
      }),
    ],
    dts: {
      footer: "declare module '@fireproof/netlify'",
    },
  },
  // IIFE build with moduleReplacementPlugin
  {
    ...LIBRARY_BUNDLE_OPTIONS,
    format: ["iife"],
    name: "@fireproof/aws",
    entry: ["src/aws/index.ts"],
    platform: "browser",
    outDir: "dist/aws",
    esbuildPlugins: [
      polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        ...ourMultiformat,
      }),
    ],
    dts: false, // No type declarations needed for IIFE build
  },
  // ESM and CJS builds without moduleReplacementPlugin
  {
    ...LIBRARY_BUNDLE_OPTIONS,
    format: ["esm", "cjs"],
    name: "@fireproof/aws",
    entry: ["src/aws/index.ts"],
    platform: "browser",
    outDir: "dist/aws",
    esbuildPlugins: [
      polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        ...ourMultiformat,
      }),
    ],
    dts: {
      footer: "declare module '@fireproof/aws'",
    },
  },
  // IIFE build with moduleReplacementPlugin
  {
    ...LIBRARY_BUNDLE_OPTIONS,
    format: ["iife"],
    name: "@fireproof/cloud",
    entry: ["src/cloud/index.ts"],
    platform: "browser",
    outDir: "dist/cloud",
    esbuildPlugins: [
      polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        ...ourMultiformat,
      }),
    ],
    dts: false, // No type declarations needed for IIFE build
  },
  // ESM and CJS builds without moduleReplacementPlugin
  {
    ...LIBRARY_BUNDLE_OPTIONS,
    format: ["esm", "cjs"],
    name: "@fireproof/cloud",
    entry: ["src/cloud/index.ts"],
    platform: "browser",
    outDir: "dist/cloud",
    esbuildPlugins: [
      polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        ...ourMultiformat,
      }),
    ],
    dts: {
      footer: "declare module '@fireproof/cloud'",
    },
  },
  // IIFE build with moduleReplacementPlugin
  {
    ...LIBRARY_BUNDLE_OPTIONS,
    format: ["iife"],
    name: "@fireproof/ucan-cloud",
    entry: ["src/ucan-cloud/index.ts"],
    platform: "browser",
    outDir: "dist/ucan-cloud",
    esbuildPlugins: [
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        ...ourMultiformat,
        "node:util": path.join(__dirname, "node-util-polyfill.js"),
      }),
      polyfillNode(),
    ],
    dts: false, // No type declarations needed for IIFE build
  },
  // ESM and CJS builds without moduleReplacementPlugin
  {
    ...LIBRARY_BUNDLE_OPTIONS,
    format: ["esm", "cjs"],
    name: "@fireproof/ucan-cloud",
    entry: ["src/ucan-cloud/index.ts"],
    platform: "browser",
    outDir: "dist/ucan-cloud",
    esbuildPlugins: [
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        ...ourMultiformat,
        "node:util": path.join(__dirname, "node-util-polyfill.js"),
      }),
      polyfillNode(),
    ],
    dts: {
      footer: "declare module '@fireproof/ucan-cloud'",
    },
  },
];

export default defineConfig((options) => [...LIBRARY_BUNDLES, ...(options.watch || [])]);
