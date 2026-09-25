import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { PNG_PREVIEW } from "./src/lib/png-shirt.js";

/** Start downloading the shirt base while the app code is still loading. */
const preloadBase = {
  name: "preload-png-base",
  transformIndexHtml: () => [
    // Fetched by the page and decoded in the render worker, so it is preloaded as a fetch.
    { tag: "link", attrs: { rel: "preload", as: "fetch", type: "image/webp", crossorigin: "anonymous", href: PNG_PREVIEW.path }, injectTo: "head" },
  ],
};

export default defineConfig({
  plugins: [react(), preloadBase],
  // The render worker loads the AVIF encoder on demand, which needs an ES module worker.
  worker: { format: "es" },
  // The encoder finds its .wasm next to itself; pre-bundling would move it in development.
  optimizeDeps: { exclude: ["@jsquash/avif"] },
  // three.js is one lazy chunk (about 650 kB), loaded only when the 3D view is switched on.
  build: { chunkSizeWarningLimit: 700 },
});
