import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../test-helpers";

// mcp.ts pulls in `agents/mcp`, which imports the `cloudflare:workers` module - only
// available inside the real Workers runtime, not plain Node. index.ts only touches
// PortfolioMCP inside the /mcp/* handler, so a dummy export is enough to import it here.
vi.mock("../mcp", () => ({ PortfolioMCP: class {} }));

const { app } = await import("../index");

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

const ALLOWED_ORIGIN = "https://dineshreddy016.com";

describe("Origin check on state-changing routes", () => {
  it.each([
    ["no Origin header", undefined],
    ["an unrecognised Origin", "https://evil.example"],
  ])("rejects POST /sessions with %s", async (_label, origin) => {
    const { d1 } = createTestDb();
    const res = await app.request(
      "/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(origin ? { Origin: origin } : {}),
        },
        body: JSON.stringify({ name: "Ada", email: "ada@example.test" }),
      },
      { DB: d1 },
    );
    expect(res.status).toBe(403);
  });

  it("accepts POST /sessions from an allowed Origin", async () => {
    const { d1 } = createTestDb();
    const res = await app.request(
      "/sessions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: ALLOWED_ORIGIN },
        body: JSON.stringify({ name: "Ada", email: "ada@example.test" }),
      },
      { DB: d1 },
    );
    expect(res.status).toBe(201);
  });

  it("rejects POST /messages from an unrecognised Origin", async () => {
    const { d1 } = createTestDb();
    const res = await app.request(
      "/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://evil.example",
        },
        body: JSON.stringify({ message: "Hi" }),
      },
      { DB: d1 },
    );
    expect(res.status).toBe(403);
  });

  it("does not require an Origin for GET /", async () => {
    const res = await app.request("/", { method: "GET" }, {});
    expect(res.status).toBe(200);
  });
});
