import { Hono } from "hono";
import { cors } from "hono/cors";
import { handleChat, handleHistory } from "./chat";
import type { Env } from "./env";
import { runScheduled } from "./followup";
import { PortfolioMCP } from "./mcp";
import { handleMessage } from "./messages";
import { handleCreateSession } from "./session";

// Wrangler's durable_objects binding (class_name: "PortfolioMCP") requires
// the class to be exported from this entry module.
export { PortfolioMCP };

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "https://dineshreddy016.com",
      // GitHub Pages serves every project of this account from one origin;
      // the /Portfolio sub-path is not part of an Origin header.
      "https://sanjud1603.github.io",
    ],
  }),
);

app.get("/", (c) => c.json({ status: "ok", service: "dinesh-portfolio-api" }));

app.post("/sessions", handleCreateSession);
app.post("/chat", handleChat);
app.get("/chat/history", handleHistory);
app.post("/messages", handleMessage);

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
