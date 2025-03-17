import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: "netlify",
    include: [
      "src/netlify/*test.?(c|m)[jt]s?(x)",
      "src/connector.test.ts",
      //    "node_modules/@fireproof/core/tests/**/*test.?(c|m)[jt]s?(x)"
    ],
    exclude: [
      "node_modules/@fireproof/core/tests/react/**",
      "node_modules/@fireproof/core/tests/fireproof/config.test.ts",
      "node_modules/@fireproof/core/tests/fireproof/utils.test.ts",
      "node_modules/@fireproof/core/tests/blockstore/interceptor-gateway.test.ts",
      "node_modules/@fireproof/core/tests/gateway/indexeddb/loader-config.test.ts",
      "node_modules/@fireproof/core/tests/gateway/file/loader-config.test.ts",
      "node_modules/@fireproof/core/tests/blockstore/keyed-crypto-indexeddb-file.test.ts",
      "node_modules/@fireproof/core/tests/blockstore/keyed-crypto.test.ts",
    ],
    globals: true,
    setupFiles: "./setup.netlify.ts",
    testTimeout: 25000,
  },
});
