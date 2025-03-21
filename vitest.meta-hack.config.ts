import { defineConfig } from "vitest/config";

import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: "meta-hack",
    include: ["src/meta-key-hack.test.?(c|m)[jt]s?(x)"],
    globals: true,
    // setupFiles: "./setup.better-sqlite3.ts",
  },
});
