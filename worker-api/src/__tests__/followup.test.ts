import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "../db";
import {
  emailAbandonedChats,
  INACTIVITY_MS,
  purgeExpiredSessions,
  RETENTION_MS,
} from "../followup";
import { createTestDb } from "../test-helpers";

const NOW = new Date("2026-06-01T12:00:00.000Z");
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const env = (d1: D1Database) =>
  ({ DB: d1, RESEND_API_KEY: "re_test", OWNER_EMAIL: "owner@example.test" }) as never;

function seed(
  sqlite: ReturnType<typeof createTestDb>["sqlite"],
  id: string,
  o: { lastActivity: string; created?: string; emailedAt?: string | null; turns?: [string, string][] },
) {
  sqlite
    .prepare(
      "INSERT INTO sessions (id, token_hash, name, email, ip_hash, created_at, expires_at, last_activity_at, emailed_at) VALUES (?,?,?,?,?,?,?,?,?)",
    )
    .run(id, `hash-${id}`, `Name ${id}`, `${id}@example.test`, "ip", o.created ?? o.lastActivity, "2099", o.lastActivity, o.emailedAt ?? null);
  for (const [role, content] of o.turns ?? [])
    sqlite
      .prepare("INSERT INTO chat_messages (session_id, role, content, created_at) VALUES (?,?,?,?)")
      .run(id, role, content, o.lastActivity);
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("emailAbandonedChats", () => {
  it("emails the transcript of a quiet chat once, replying-to the visitor but sending to the owner", async () => {
    const { d1, sqlite } = createTestDb();
    seed(sqlite, "a", { lastActivity: ago(INACTIVITY_MS + 1000), turns: [["user", "Is he available?"], ["assistant", "Yes, via the contact form."]] });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    expect(await emailAbandonedChats(env(d1), NOW)).toBe(1);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.to).toBe("owner@example.test");
    expect(body.reply_to).toBe("a@example.test");
    expect(body.subject).toBe("Unfinished chat with Name a");
    expect(body.text).toContain("Visitor: Is he available?");
    expect(body.text).toContain("Assistant: Yes, via the contact form.");

    // not sent a second time
    expect(await emailAbandonedChats(env(d1), NOW)).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("leaves active chats, already-emailed chats and chats with no visitor message alone", async () => {
    const { d1, sqlite } = createTestDb();
    const old = ago(INACTIVITY_MS + 1000);
    seed(sqlite, "active", { lastActivity: ago(1000), turns: [["user", "hi"]] });
    seed(sqlite, "done", { lastActivity: old, emailedAt: ago(500), turns: [["user", "hi"]] });
    seed(sqlite, "empty", { lastActivity: old });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    expect(await emailAbandonedChats(env(d1), NOW)).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("retries on the next run when Resend rejects the email", async () => {
    const { d1, sqlite } = createTestDb();
    seed(sqlite, "a", { lastActivity: ago(INACTIVITY_MS + 1000), turns: [["user", "hi"]] });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => "err" })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    expect(await emailAbandonedChats(env(d1), NOW)).toBe(0);
    expect(await emailAbandonedChats(env(d1), NOW)).toBe(1);
  });

  it("keeps a visitor's newline-laden name out of the email subject (no header injection)", async () => {
    const { d1, sqlite } = createTestDb();
    seed(sqlite, "a", { lastActivity: ago(INACTIVITY_MS + 1000), turns: [["user", "hi"]] });
    sqlite.exec("UPDATE sessions SET name = 'Eve\r\nBcc: attacker@example.test'");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    await emailAbandonedChats(env(d1), NOW);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).subject).not.toMatch(/[\r\n]/);
  });
});

describe("purgeExpiredSessions", () => {
  it("deletes sessions past retention along with their transcripts", async () => {
    const { d1, sqlite } = createTestDb();
    seed(sqlite, "old", { lastActivity: ago(RETENTION_MS + 1000), turns: [["user", "hi"]] });
    seed(sqlite, "fresh", { lastActivity: ago(1000), turns: [["user", "hi"]] });
    await purgeExpiredSessions(env(d1), NOW, getDb(d1));
    expect(sqlite.prepare("SELECT id FROM sessions").all()).toEqual([{ id: "fresh" }]);
    expect(sqlite.prepare("SELECT DISTINCT session_id FROM chat_messages").all()).toEqual([{ session_id: "fresh" }]);
  });
});
