import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
// import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: "cloud",
    exclude: [
      "node_modules/@fireproof/core/tests/react/**",
      "node_modules/@fireproof/core/tests/fireproof/config.test.ts",
      "node_modules/@fireproof/core/tests/blockstore/keyed-crypto*",
      "node_modules/@fireproof/core/tests/**/utils.test.ts",
    ],
    include: [
      // "node_modules/@fireproof/core/tests/**/*test.?(c|m)[jt]s?(x)",
      // "node_modules/@fireproof/core/tests/**/*gateway.test.?(c|m)[jt]s?(x)",
      // "src/connector.test.ts",
      "src/cloud/**/*test.?(c|m)[jt]s?(x)",
    ],
    globals: true,
    setupFiles: "./setup.cloud.ts",
    testTimeout: 25000,
    //    poolOptions: {
    //      workers: { wrangler: { configPath: './src/cloud/backend/wrangler.toml' } },
    //    },
  },
});
