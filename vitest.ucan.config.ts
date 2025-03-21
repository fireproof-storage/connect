import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: "ucan",
    exclude: [
      //"node_modules/@fireproof/core/tests/react/**",
      //"node_modules/@fireproof/core/tests/fireproof/config.test.ts",
    ],
    include: [
      "src/ucan/*test.?(c|m)[jt]s?(x)",
      //"node_modules/@fireproof/core/tests/**/*test.?(c|m)[jt]s?(x)",
      //"src/connector.test.ts",
    ],
    globals: true,
    setupFiles: "./setup.ucan.ts",
    testTimeout: 25000,
  },
});
