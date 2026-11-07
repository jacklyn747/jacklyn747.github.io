import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
export default defineConfig({
  base: "/digital-literacy/",
  plugins: [react()],
  build: { outDir: "dist", rollupOptions: { input: { main: resolve(__dirname, "index.html"), desktop: resolve(__dirname, "desktop/index.html") } } },
});
