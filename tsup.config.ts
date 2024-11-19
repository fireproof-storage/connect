import { defineConfig, Options } from "tsup";
import path from "path";
import { fileURLToPath } from "url";
import resolve from "esbuild-plugin-resolve";
import { replace } from "esbuild-plugin-replace";
// import { polyfillNode } from "esbuild-plugin-polyfill-node";

// Correctly resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Existing 'ourMultiformat' object or any other resolve mappings you have

function skipper(suffix: string, target: string) {
  function intercept(build) {
    const filter = new RegExp(suffix);
    build.onResolve({ filter }, async (args) => {
      //if (args.path.includes(suffix)) {
      //  console.log(">>>>>", args.path, target);
      //}
      return build.resolve(target, { kind: args.kind, resolveDir: args.resolveDir });
    });
  }
  return {
    name: "skipper",
    setup: (build) => {
      intercept(build);
    },
  };
}

const ourMultiformat = {
  /*
        "atomically": `${__dirname}/bundle-not-impl.js`,
        "memfs": `${__dirname}/bundle-not-impl.js`,
        "stubborn-fs": `${__dirname}/bundle-not-impl.js`,
        "conf": `${__dirname}/bundle-not-impl.js`,
        "fs/promises": `${__dirname}/bundle-not-impl.js`,
        "node:process": `${__dirname}/bundle-not-impl.js`,
        "node:fs/promises": `${__dirname}/bundle-not-impl.js`,
        "./node-filesystem.js": `${__dirname}/bundle-not-impl.js`,
        "./node.js": `${__dirname}/bundle-not-impl.js`,
        "@web3-storage/access/stores/store-conf": `${__dirname}/bundle-not-impl.js`,
        "env-paths": `${__dirname}/bundle-not-impl.js`,
        "stream": `${__dirname}/bundle-not-impl.js`,
*/
};

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
  external: ["@fireproof/core"],
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
      // polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      skipper("@fireproof/core", `${__dirname}/src/bundle-not-impl.js`),
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
      // polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        //        ...ourMultiformat,
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
      // polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        //        ...ourMultiformat,
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
      // polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      skipper("@fireproof/core", `${__dirname}/src/bundle-not-impl.js`),
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
      // polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        //        ...ourMultiformat,
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
      // polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      skipper("@fireproof/core", `${__dirname}/src/bundle-not-impl.js`),
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
      // polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        //        ...ourMultiformat,
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
      // polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      skipper("@fireproof/core", `${__dirname}/src/bundle-not-impl.js`),
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
      // polyfillNode(),
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        //        ...ourMultiformat,
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
    name: "@fireproof/ucan",
    entry: ["src/ucan/index.ts"],
    platform: "browser",
    outDir: "dist/ucan",
    esbuildPlugins: [
      // alias,
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      skipper("@fireproof/core", `${__dirname}/src/bundle-not-impl.js`),
      skipper("conf", `${__dirname}/src/bundle-not-impl.js`),
      resolve({
        ...ourMultiformat,
        //"node:fs/promises": `${__dirname}/bundle-not-impl.js`,
        // "node:util": path.join(__dirname, "node-util-polyfill.js"),
        //"./node.js": `${__dirname}/bundle-not-impl.js`,
        // "../../../ucan-cloud/store/state/node.js": "../../../ucan-cloud/store/state/browser.js",
      }),
      // polyfillNode(),
    ],
    dts: false, // No type declarations needed for IIFE build
  },
  // ESM and CJS builds without moduleReplacementPlugin
  {
    ...LIBRARY_BUNDLE_OPTIONS,
    format: ["esm", "cjs"],
    name: "@fireproof/ucan",
    entry: ["src/ucan/index.ts"],
    platform: "browser",
    outDir: "dist/ucan",
    esbuildPlugins: [
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      resolve({
        // ...ourMultiformat,
        // "node:util": path.join(__dirname, "node-util-polyfill.js"),
        // "../../../ucan-cloud/store/state/node.js": "../../../ucan-cloud/store/state/browser.js",
      }),
      // polyfillNode(),
    ],
    dts: {
      footer: "declare module '@fireproof/ucan",
    },
  },
  {
    ...LIBRARY_BUNDLE_OPTIONS,
    format: ["esm", "cjs"],
    name: "@fireproof/ucan/web",
    entry: ["src/ucan/index.ts"],
    platform: "browser",
    outDir: "dist/ucan/web",
    esbuildPlugins: [
      replace({
        __packageVersion__: packageVersion(),
        include: /version/,
      }),
      skipper("@fireproof/core", "use-fireproof"),
      skipper("skip-iife", `${__dirname}/src/bundle-not-impl.js`),
      // skipper("store-conf", `${__dirname}/src/bundle-not-impl.js`),

      resolve({
        // ...ourMultiformat,
        // "node:util": path.join(__dirname, "node-util-polyfill.js"),
        // "../../../ucan-cloud/store/state/node.js": "../../../ucan-cloud/store/state/browser.js",
      }),
      // polyfillNode(),
    ],
    dts: {
      footer: "declare module '@fireproof/ucan",
    },
  },
];

export default defineConfig(() => [...LIBRARY_BUNDLES]);
