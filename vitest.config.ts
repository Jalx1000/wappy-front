import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests only. Playwright e2e specs (e2e/**/*.spec.ts) are run separately via
// `npm run test:e2e` and must be excluded so vitest doesn't try to load them.
export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules/**", ".next/**", "e2e/**", "playwright/**"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
