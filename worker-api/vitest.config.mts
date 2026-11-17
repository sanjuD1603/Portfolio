import { defineConfig } from "vitest/config";

/** Worker API tests run in plain Node: handlers are exercised through Hono with fake AI/DB bindings. */
export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
