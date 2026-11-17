import { Hono } from "hono";
import { cors } from "hono/cors";

export type Env = {
  // Bindings (AI, D1, secrets) are added as the chat/messages/mcp routes are built.
};

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://dineshreddy016.com"],
  }),
);

app.get("/", (c) => c.json({ status: "ok", service: "dinesh-portfolio-api" }));

export default app;
