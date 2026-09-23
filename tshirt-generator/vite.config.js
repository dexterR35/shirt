import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { PNG_PREVIEW } from "./src/lib/png-shirt.js";

/** Start downloading the shirt base while the app code is still loading. */
const preloadBase = {
  name: "preload-png-base",
  transformIndexHtml: () => [
    { tag: "link", attrs: { rel: "preload", as: "image", type: "image/webp", href: PNG_PREVIEW.path }, injectTo: "head" },
  ],
};

export default defineConfig({ plugins: [react(), preloadBase] });
