import { defineConfig } from "vitest/config";

import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: "s3",
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
    include: ["src/s3/*test.?(c|m)[jt]s?(x)", "node_modules/@fireproof/core/tests/**/*test.?(c|m)[jt]s?(x)"],
    globals: true,
    setupFiles: "./setup.s3.ts",
  },
});
