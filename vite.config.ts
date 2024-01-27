import { defineConfig } from "vite";
import { vavite } from "vavite";
import { nodeLoaderPlugin } from "@vavite/node-loader/plugin";

export default defineConfig({
  plugins: [vavite({ handlerEntry: "/src/server/index.ts" }),  nodeLoaderPlugin()],
  server: {
    port: 8000
  }
});