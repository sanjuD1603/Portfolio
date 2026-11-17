import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sha256Hex } from "../crypto";
import { getDb } from "../db";
import {
  authenticate,
  handleCreateSession,
  MAX_SESSIONS_PER_DAY,
  MAX_SESSIONS_PER_IP_PER_HOUR,
} from "../session";
import { createTestDb, harness } from "../test-helpers";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

const ip = { "CF-Connecting-IP": "203.0.113.7" };

describe("POST /sessions", () => {
  it("creates a session and stores only the token's hash", async () => {
    const { d1, sqlite } = createTestDb();
    const post = harness("/sessions", handleCreateSession, { DB: d1 });

    const res = await post({ name: " Ada ", email: "ada@example.test" }, { headers: ip });
    const { sessionToken } = (await res.json()) as { sessionToken: string };

    expect(res.status).toBe(201);
    expect(sessionToken.length).toBeGreaterThanOrEqual(43);
    const row = sqlite.prepare("SELECT * FROM sessions").get() as Record<string, string>;
    expect(row.name).toBe("Ada");
    expect(row.token_hash).toBe(await sha256Hex(sessionToken));
    expect(JSON.stringify(row)).not.toContain(sessionToken);
    expect(row.ip_hash).toBe(await sha256Hex("203.0.113.7")); // raw IP never stored
  });

  it("issues a different token each time", async () => {
    const { d1 } = createTestDb();
    const post = harness("/sessions", handleCreateSession, { DB: d1 });
    const body = { name: "Ada", email: "ada@example.test" };
    const a = (await (await post(body)).json()) as { sessionToken: string };
    const b = (await (await post(body)).json()) as { sessionToken: string };
    expect(a.sessionToken).not.toBe(b.sessionToken);
  });

  it("rate-limits session creation per IP", async () => {
    const { d1 } = createTestDb();
    const post = harness("/sessions", handleCreateSession, { DB: d1 });
    const body = { name: "Ada", email: "ada@example.test" };
    for (let i = 0; i < MAX_SESSIONS_PER_IP_PER_HOUR; i++) {
      expect((await post(body, { headers: ip })).status).toBe(201);
    }
    expect((await post(body, { headers: ip })).status).toBe(429);
    // a different IP is unaffected
    expect((await post(body, { headers: { "CF-Connecting-IP": "198.51.100.1" } })).status).toBe(201);
  });

  it("trips a global daily cap once enough sessions start, regardless of IP", async () => {
    const { d1 } = createTestDb();
    const post = harness("/sessions", handleCreateSession, { DB: d1 });
    const body = { name: "Ada", email: "ada@example.test" };
    for (let i = 0; i < MAX_SESSIONS_PER_DAY; i++) {
      const res = await post(body, {
        headers: { "CF-Connecting-IP": `203.0.113.${i % 255}` },
      });
      expect(res.status).toBe(201);
    }
    const res = await post(body, {
      headers: { "CF-Connecting-IP": "198.51.100.42" },
    });
    expect(res.status).toBe(429);
  });

  it.each([
    ["a missing name", { email: "a@example.test" }],
    ["a blank name", { name: "  ", email: "a@example.test" }],
    ["an invalid email", { name: "Ada", email: "nope" }],
    ["malformed JSON", "{oops"],
  ])("rejects %s with 400", async (_l, body) => {
    const { d1, sqlite } = createTestDb();
    const post = harness("/sessions", handleCreateSession, { DB: d1 });
    expect((await post(body)).status).toBe(400);
    expect(sqlite.prepare("SELECT COUNT(*) AS n FROM sessions").get()).toEqual({ n: 0 });
  });

  it("returns 500 when the database is unavailable", async () => {
    const { d1 } = createTestDb({ failWrites: true });
    const post = harness("/sessions", handleCreateSession, { DB: d1 });
    expect((await post({ name: "Ada", email: "a@example.test" })).status).toBe(500);
  });
});

describe("authenticate", () => {
  async function seeded() {
    const { d1 } = createTestDb();
    const post = harness("/sessions", handleCreateSession, { DB: d1 });
    const { sessionToken } = (await (
      await post({ name: "Ada", email: "a@example.test" })
    ).json()) as { sessionToken: string };
    return { db: getDb(d1), sessionToken };
  }

  it("resolves a valid bearer token to its session", async () => {
    const { db, sessionToken } = await seeded();
    expect((await authenticate(db, `Bearer ${sessionToken}`))?.name).toBe("Ada");
  });

  it.each([
    ["no header", undefined],
    ["a non-bearer scheme", "Basic abc"],
    ["an unknown token", "Bearer not-a-real-token"],
  ])("rejects %s", async (_l, header) => {
    const { db } = await seeded();
    expect(await authenticate(db, header)).toBeNull();
  });

  it("rejects an expired session", async () => {
    const { db, sessionToken } = await seeded();
    const later = new Date(Date.now() + 25 * 60 * 60 * 1000);
    expect(await authenticate(db, `Bearer ${sessionToken}`, later)).toBeNull();
  });
});
