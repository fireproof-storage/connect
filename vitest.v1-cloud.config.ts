import { defineConfig } from "vitest/config";

import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: "v1-cloud",
    exclude: [
      "node_modules/@fireproof/core/tests/react/**",
      "node_modules/@fireproof/core/tests/fireproof/config.test.ts",
    ],
    include: [
      // "node_modules/@fireproof/core/tests/**/*test.?(c|m)[jt]s?(x)",
      // "node_modules/@fireproof/core/tests/**/*gateway.test.?(c|m)[jt]s?(x)",
      // "src/connector.test.ts",
      "src/v1-cloud/*test.?(c|m)[jt]s?(x)",
    ],
    globals: true,
    setupFiles: "./setup.v1-cloud.ts",
    testTimeout: 25000,
  },
});
