import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: "netlify",
    exclude: [
      "node_modules/@fireproof/core/tests/react/**",
      "node_modules/@fireproof/core/tests/fireproof/config.test.ts",
    ],
    include: [
      "src/connect-netlify/*test.?(c|m)[jt]s?(x)",
      "node_modules/@fireproof/core/tests/**/*test.?(c|m)[jt]s?(x)",
      "src/connector.test.ts",
    ],
    globals: true,
    setupFiles: "./setup.netlify.ts",
    testTimeout: 25000,
  },
});
