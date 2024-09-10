import { defineConfig } from "vitest/config";

import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        name: "partykit",
        exclude: [
            "node_modules/@fireproof/core/tests/react/**",
            "node_modules/@fireproof/core/tests/fireproof/config.test.ts"
        ],
        include: [
            "node_modules/@fireproof/core/tests/**/*test.?(c|m)[jt]s?(x)"
        ],
        globals: true,
        setupFiles: "./setup.partykit.ts",
    },
});