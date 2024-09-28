import { defineConfig } from "vitest/config";

import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: "connector",
    include: ["src/*test.?(c|m)[jt]s?(x)"],
    globals: true,
    setupFiles: "./setup.connector.ts",
  },
});
