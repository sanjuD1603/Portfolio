import type { Context, Next } from "hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { handleChat, handleHistory } from "./chat";
import type { Env } from "./env";
import { runScheduled } from "./followup";
import { PortfolioMCP } from "./mcp";
import { handleMessage } from "./messages";
import { ALLOWED_ORIGINS } from "./origins";
import { handleCreateSession } from "./session";

// Wrangler's durable_objects binding (class_name: "PortfolioMCP") requires
// the class to be exported from this entry module.
export { PortfolioMCP };

// Exported so tests can exercise routing/middleware (e.g. the Origin check) via `app.request(...)`.
export const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({ origin: ALLOWED_ORIGINS }));

/**
 * Server-side backstop behind CORS: a browser enforces CORS itself, but a script
 * calling the Worker directly (curl, another site's backend) ignores it entirely.
 * The front-end only ever calls this API cross-origin, so a real browser request
 * always carries a matching Origin header; anything else is rejected here. A
 * determined attacker can still fake this header - the rate limits and daily
 * caps below are the real backstop for API cost, this just stops casual abuse.
 */
function requireOrigin(c: Context<{ Bindings: Env }>, next: Next) {
  const origin = c.req.header("Origin");
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return c.json({ error: "Forbidden" }, 403);
  }
  return next();
}

app.get("/", (c) => c.json({ status: "ok", service: "dinesh-portfolio-api" }));

app.post("/sessions", requireOrigin, handleCreateSession);
app.post("/chat", requireOrigin, handleChat);
app.get("/chat/history", handleHistory);
app.post("/messages", requireOrigin, handleMessage);

app.all("/mcp/*", (c) =>
  // c.executionCtx and the Agents SDK's expected ExecutionContext<unknown> are the same
  // runtime object; the mismatch here is two slightly different @cloudflare/workers-types
  // ambient declarations, not an actual incompatibility.
  PortfolioMCP.serve("/mcp", { binding: "PortfolioMCP" }).fetch(
    c.req.raw,
    c.env,
    c.executionCtx as unknown as ExecutionContext,
  ),
);

export default {
  fetch: app.fetch,
  // Cron Trigger: emails transcripts of chats the visitor walked away from, and purges old ones.
  scheduled(_controller, env, ctx) {
    ctx.waitUntil(runScheduled(env));
  },
} satisfies ExportedHandler<Env>;
