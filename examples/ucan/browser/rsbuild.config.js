import { defineConfig } from "@rsbuild/core";
import { pluginNodePolyfill } from "@rsbuild/plugin-node-polyfill";

export default defineConfig({
  html: {
    template: "./src/index.html",
  },
  plugins: [pluginNodePolyfill()],
});
