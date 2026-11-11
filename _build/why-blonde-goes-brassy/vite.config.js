import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works from any folder or host.
// Output lands at the repo root so work.jackiemiller.co serves it
// at /why-blonde-goes-brassy/.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "../../why-blonde-goes-brassy",
    emptyOutDir: true,
  },
});
