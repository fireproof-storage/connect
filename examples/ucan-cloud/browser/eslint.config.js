import eslint from "@eslint/js";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { files: ["src/**/*.js", "src/**/*.d.ts"] },
  { languageOptions: { globals: globals.browser } },

  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        project: true,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      "unicorn/better-regex": "error",
      "unicorn/…": "error",
    },
  },
];
