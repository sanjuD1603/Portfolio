import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Frontend test configuration. Tests run in Node by default; component tests
 * opt in to jsdom with a `// @vitest-environment jsdom` pragma. The Worker API
 * has its own config and test script in `worker-api/`.
 */
export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
