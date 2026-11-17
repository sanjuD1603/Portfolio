import type { PortfolioMCP } from "./mcp";

export type Env = {
  AI: Ai;
  DB: D1Database;
  PortfolioMCP: DurableObjectNamespace<PortfolioMCP>;
  RESEND_API_KEY: string;
  OWNER_EMAIL: string;
};
