import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Plain static build. The app needs no server: all the trip data is in the
 * bundle, the forecast is fetched from the browser, and your own edits live in
 * localStorage. `npm run build` writes docs/, which GitHub Pages serves.
 */
export default defineConfig({
  base: "./",
  plugins: [tsconfigPaths(), react(), tailwindcss()],
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
});
