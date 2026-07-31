import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";


export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors the "@/*" alias the app uses, so components import the same way
    // in tests as they do in the build.
    alias: { "@": new URL("./src", import.meta.url).pathname },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.mts"],
    include: ["src/**/*.spec.{js,jsx,ts,tsx}"],
    // Playwright specs live in e2e/ and are run by Playwright, not Vitest.
    exclude: ["node_modules", ".next", "e2e/**"],
  },
});
