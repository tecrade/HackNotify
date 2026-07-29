import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// VITE_BASE_PATH is set by the GitHub Pages deploy workflow to
// "/<repo-name>/" so built asset URLs resolve correctly on Pages.
// Defaults to "/" for local dev.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/",
});
