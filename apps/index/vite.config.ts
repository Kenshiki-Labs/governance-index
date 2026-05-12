import { resolve } from "node:path";

import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import remarkGfm from "remark-gfm";
import { defineConfig } from "vite";

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@specs": resolve(__dirname, "../../docs/specs"),
    },
  },
  plugins: [
    { enforce: "pre", ...mdx({ remarkPlugins: [remarkGfm] }) },
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
  ],
});

export default config;
