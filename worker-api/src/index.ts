import { Hono } from "hono";
import { cors } from "hono/cors";
import { handleChat } from "./chat";
import type { Env } from "./env";
import { PortfolioMCP } from "./mcp";
import { handleMessage } from "./messages";

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
      // Add the GitHub Pages origin (https://<username>.github.io) once the
      // repo name/basePath for the static site deployment is finalised.
    ],
  }),
);

app.get("/", (c) => c.json({ status: "ok", service: "dinesh-portfolio-api" }));

app.post("/chat", handleChat);
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

export default app;
