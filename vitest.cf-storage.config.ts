import tsconfigPaths from "vite-tsconfig-paths";
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

/*
export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./src/cf-storage/wrangler.toml" },
      },
    },
  },
});
*/

export default defineWorkersConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: "cf-storage",
    poolOptions: {
      workers: {
        wrangler: {
          configPath: "./src/cf-storage/wrangler.toml",
          environment: "test"
        },
      },
    },
    exclude: [
      "node_modules/@fireproof/core/tests/react/**",
      "node_modules/@fireproof/core/tests/fireproof/config.test.ts",
    ],
    include: [
      "src/cf-storage/*test.?(c|m)[jt]s?(x)",
      "node_modules/@fireproof/core/tests/**/*test.?(c|m)[jt]s?(x)",
      // "src/connector.test.ts",
    ],
    globals: true,
    setupFiles: "./setup.cf-storage.ts",
    testTimeout: 25000,
  },
});
