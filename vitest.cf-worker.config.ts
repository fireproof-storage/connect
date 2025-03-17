import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineWorkersConfig({
  plugins: [tsconfigPaths() as Plugin],
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./src/v2-cloud/backend/wrangler.toml", environment: "test" },
      },
    },
    name: "cf-worker",
    exclude: ["node_modules/@fireproof/core/tests/react/**"],
    include: ["src/v2-cloud/meta-merger/*.test.ts"],
    globals: true,
    setupFiles: "./setup.cf-kv.ts",
  },
});
