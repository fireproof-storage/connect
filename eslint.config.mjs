import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  //   ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    ignores: [
      "babel.config.cjs",
      "jest.config.js",
      "**/dist/",
      "**/pubdir/",
      "**/node_modules/",
      "**/scripts/",
      "**/examples/",
      "smoke/react/",
      "tests/connect-netlify/app/**/*.js",
    ],
  },
  {
    rules: {
      "no-console": ["warn"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  }
);
