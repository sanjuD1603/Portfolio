import { defineConfig } from "drizzle-kit";

/**
 * Only used to *generate* SQL migrations (`npm run db:generate`). They are
 * applied with Wrangler (`npm run db:migrate:local` / `db:migrate:remote`),
 * which tracks what has already run in D1.
 */
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./migrations",
});
