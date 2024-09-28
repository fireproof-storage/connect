import { defineConfig, Options } from "tsup";
import resolve from "esbuild-plugin-resolve";
import { replace } from "esbuild-plugin-replace";

const external = [
  "path",
  "react",
  "fs",
  "fs/promises",
  "util",
  "os",
  "url",
  "node:fs",
  "node:path",
  "node:os",
  "node:url",
  "assert",
  "stream",
  "better-sqlite3",
];

// const stopFile = {
//   // "fs/promises": "../../../bundle-not-impl.js",
//   // "../runtime/store-file.js": "../../bundle-not-impl.js",
//   // "../runtime/gateways/file/gateway.js": "../bundle-not-impl.js",
//   // "./mem-filesystem.js": "../../../bundle-not-impl.js",
//   // "./gateways/file/gateway.js": "../bundle-not-impl.js",
//   // "./node-sys-container.js": "../bundle-not-impl.js",
//   // "./key-bag-file.js": "../bundle-not-impl.js",
// };

const ourMultiformat = {
  // "multiformats/block": `${__dirname}/src/runtime/multiformat/block.ts`
};

const LIBRARY_BUNDLE_OPTIONS: Options = {
  format: ["esm", "cjs"],
  target: ["esnext", "node18"],
  globalName: "Connect",
  external,
  clean: true,
  sourcemap: true,
  metafile: true,
  minify: false,
};

function packageVersion() {
  // return JSON.stringify(JSON.parse(fs.readFileSync(file, "utf-8")).version);
  let version = "refs/tags/v0.0.0-smoke";
  if (process.env.GITHUB_REF && process.env.GITHUB_REF.startsWith("refs/tags/v")) {
    version = process.env.GITHUB_REF;
  }
  version = version.split("/").slice(-1)[0].replace(/^v/, "");
  // console.log(`Patch version ${version} in package.json`);
  // packageJson.version = version;
  return JSON.stringify(version);
}

const LIBRARY_BUNDLES: readonly Options[] = [
  // {
  //   ...LIBRARY_BUNDLE_OPTIONS,
  //   format: ["iife"],
  //   name: "@fireproof/netlify",
  //   entry: ["src/connect-netlify/index.ts"],
  //   platform: "browser",
  //   outDir: "dist/netlify",
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
  //     footer: "declare module '@fireproof/netlify'",
  //   },
  // },
  {
    ...LIBRARY_BUNDLE_OPTIONS,
    format: ["esm", "cjs"],
    name: "@fireproof/netlify",
    entry: ["src/netlify/index.ts"],
    platform: "browser",
    outDir: "dist/netlify",
    esbuildPlugins: [
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
  // {
  //   ...LIBRARY_BUNDLE_OPTIONS,
  //   format: ["iife"],
  //   name: "@fireproof/partykit",
  //   entry: ["src/partykit/index.ts"],
  //   platform: "browser",
  //   outDir: "dist/partykit",
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
  //     footer: "declare module '@fireproof/partykit'",
  //   },
  // },
  {
    ...LIBRARY_BUNDLE_OPTIONS,
    format: ["esm", "cjs"],
    name: "@fireproof/partykit",
    entry: ["src/partykit/index.ts"],
    platform: "browser",
    outDir: "dist/partykit",
    esbuildPlugins: [
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
  // {
  //   ...LIBRARY_BUNDLE_OPTIONS,
  //   format: ["iife"],
  //   name: "@fireproof/partykit",
  //   entry: ["src/partykit/index.ts"],
  //   platform: "browser",
  //   outDir: "dist/partykit",
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
  //     footer: "declare module '@fireproof/partykit'",
  //   },
  // },
];

export default defineConfig((options) => [...LIBRARY_BUNDLES, ...(options.watch || [])]);
