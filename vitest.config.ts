import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    pool: "vmThreads",
    setupFiles: ["./tests/setup.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      thresholds: { lines: 80, functions: 80, branches: 80 },
      exclude: ["tests/**", "app/**/*.tsx", "components/**", "*.config.*"],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./") },
  },
})
