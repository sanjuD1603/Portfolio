import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  handleMessage,
  MAX_MESSAGES_PER_DAY,
  MAX_MESSAGES_PER_IP_PER_HOUR,
} from "../messages";
import { createTestDb, harness } from "../test-helpers";

const baseEnv = { RESEND_API_KEY: "re_test", OWNER_EMAIL: "owner@example.test" };
const ip = { "CF-Connecting-IP": "203.0.113.7" };

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /messages", () => {
  it("stores the message in D1 and emails it via Resend", async () => {
    const { d1, sqlite } = createTestDb();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const post = harness("/messages", handleMessage, { ...baseEnv, DB: d1 });

    const res = await post({ name: "Ada", email: "ada@example.test", message: "Hello!" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ stored: true, emailed: true });
    expect(sqlite.prepare("SELECT name, email, message FROM messages").all()).toEqual([
      { name: "Ada", email: "ada@example.test", message: "Hello!" },
    ]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(JSON.parse(init.body)).toMatchObject({ to: "owner@example.test", text: "Hello!" });
    expect(init.headers.Authorization).toBe("Bearer re_test");
  });

  it("still reports success (stored: true) when email delivery fails - the lead is never lost", async () => {
    const { d1, sqlite } = createTestDb();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => "err" }));
    const post = harness("/messages", handleMessage, { ...baseEnv, DB: d1 });
    const res = await post({ message: "Hi" });
    expect(await res.json()).toEqual({ stored: true, emailed: false });
    expect(sqlite.prepare("SELECT COUNT(*) AS n FROM messages").get()).toEqual({ n: 1 });
  });

  it("survives a network error talking to Resend", async () => {
    const { d1 } = createTestDb();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const post = harness("/messages", handleMessage, { ...baseEnv, DB: d1 });
    expect(await (await post({ message: "Hi" })).json()).toEqual({ stored: true, emailed: false });
  });

  it("returns 500 and does not email when the database write fails", async () => {
    const { d1 } = createTestDb({ failWrites: true });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const post = harness("/messages", handleMessage, { ...baseEnv, DB: d1 });
    const res = await post({ message: "Hi" });
    expect(res.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rate-limits message sending per IP", async () => {
    const { d1 } = createTestDb();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    const post = harness("/messages", handleMessage, { ...baseEnv, DB: d1 });
    const body = { message: "Hi" };
    for (let i = 0; i < MAX_MESSAGES_PER_IP_PER_HOUR; i++) {
      expect((await post(body, { headers: ip })).status).toBe(200);
    }
    expect((await post(body, { headers: ip })).status).toBe(429);
    // a different IP is unaffected
    expect(
      (await post(body, { headers: { "CF-Connecting-IP": "198.51.100.1" } })).status,
    ).toBe(200);
  });

  it("trips a global daily cap once enough leads arrive, regardless of IP", async () => {
    const { d1 } = createTestDb();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    const post = harness("/messages", handleMessage, { ...baseEnv, DB: d1 });
    for (let i = 0; i < MAX_MESSAGES_PER_DAY; i++) {
      const res = await post(
        { message: "Hi" },
        { headers: { "CF-Connecting-IP": `203.0.113.${i % 255}` } },
      );
      expect(res.status).toBe(200);
    }
    const res = await post(
      { message: "Hi" },
      { headers: { "CF-Connecting-IP": "198.51.100.42" } },
    );
    expect(res.status).toBe(429);
  });

  it.each([
    ["an empty message", { message: "   " }],
    ["a missing message", { name: "Ada" }],
    ["an invalid email", { message: "Hi", email: "not-an-email" }],
    ["an over-long message", { message: "x".repeat(4001) }],
    ["malformed JSON", "{not json"],
  ])("rejects %s with 400 and touches nothing", async (_label, body) => {
    const { d1, sqlite } = createTestDb();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const post = harness("/messages", handleMessage, { ...baseEnv, DB: d1 });
    expect((await post(body)).status).toBe(400);
    expect(sqlite.prepare("SELECT COUNT(*) AS n FROM messages").get()).toEqual({ n: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
