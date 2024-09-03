import { defineConfig } from "vitest/config";

import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: "node-sqlite3-wasm",
    exclude: [
      "node_modules/@fireproof/core/tests/react/**",
      "node_modules/@fireproof/core/tests/fireproof/config.test.ts",
    ],
    include: ["src/store-sql/**/*test.?(c|m)[jt]s?(x)", "node_modules/@fireproof/core/tests/**/*test.?(c|m)[jt]s?(x)"],
    globals: true,
    setupFiles: "./setup.node-sqlite3-wasm.ts",
  },
});
