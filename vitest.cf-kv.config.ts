import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineWorkersConfig({
  plugins: [tsconfigPaths()],
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
      },
    },
    name: "cf-kv",
    exclude: ["node_modules/@fireproof/core/tests/react/**"],
    include: ["src/cf-inde*.test.ts", "node_modules/@fireproof/core/tests/**/*test.?(c|m)[jt]s?(x)"],
    globals: true,
    setupFiles: "./setup.cf-kv.ts",
  },
});
