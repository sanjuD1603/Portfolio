import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleChat, handleHistory, MAX_USER_MESSAGES_PER_SESSION, REFUSAL } from "../chat";
import { handleCreateSession } from "../session";
import { callsByKind, createTestDb, fakeAi, harness, sseStream } from "../test-helpers";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

/** A DB with one live session; returns its bearer header. */
async function withSession() {
  const { d1, sqlite } = createTestDb();
  const create = harness("/sessions", handleCreateSession, { DB: d1 });
  const { sessionToken } = (await (
    await create({ name: "Ada", email: "ada@example.test" })
  ).json()) as { sessionToken: string };
  return { d1, sqlite, auth: { Authorization: `Bearer ${sessionToken}` } };
}

const transcript = (sqlite: ReturnType<typeof createTestDb>["sqlite"]) =>
  sqlite.prepare("SELECT role, content FROM chat_messages ORDER BY id").all();

const SSE = { Accept: "text/event-stream" };

/** Parses an SSE response body into `{ event, data }` records. */
async function readSse(res: Response) {
  const text = await res.text();
  return text
    .split("\n\n")
    .filter(Boolean)
    .map((block) => {
      const event = /^event: (.*)$/m.exec(block)?.[1] ?? "message";
      const data = JSON.parse(/^data: (.*)$/m.exec(block)?.[1] ?? "null");
      return { event, data };
    });
}

describe("POST /chat", () => {
  it("requires a session", async () => {
    const { d1 } = createTestDb();
    const run = fakeAi();
    const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });
    expect((await post({ message: "hello" })).status).toBe(401);
    expect(
      (await post({ message: "hello" }, { headers: { Authorization: "Bearer bogus" } })).status,
    ).toBe(401);
    expect(run).not.toHaveBeenCalled();
  });

  it("answers, and stores both turns against the session", async () => {
    const { d1, sqlite, auth } = await withSession();
    const run = fakeAi({ reply: "Hi there!" });
    const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });

    const res = await post({ message: "hello" }, { headers: auth });

    expect(await res.json()).toEqual({ reply: "Hi there!" });
    expect(transcript(sqlite)).toEqual([
      { role: "user", content: "hello" },
      { role: "assistant", content: "Hi there!" },
    ]);
  });

  it("replays stored history to the model - the client never sends it", async () => {
    const { d1, auth } = await withSession();
    const run = fakeAi();
    const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });

    await post({ message: "first" }, { headers: auth });
    await post({ message: "second" }, { headers: auth });

    const sent = callsByKind(run).answer[1][1].messages.map((m) => [m.role, m.content]);
    expect(sent.slice(1)).toEqual([
      ["user", "first"],
      ["assistant", "ok"],
      ["user", "second"],
    ]);
  });

  it("isolates sessions: one visitor's history never reaches another's prompt", async () => {
    const { d1, auth } = await withSession();
    const create = harness("/sessions", handleCreateSession, { DB: d1 });
    const other = (await (await create({ name: "Eve", email: "eve@example.test" })).json()) as {
      sessionToken: string;
    };
    const run = fakeAi();
    const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });

    await post({ message: "ada secret" }, { headers: auth });
    await post({ message: "eve here" }, { headers: { Authorization: `Bearer ${other.sessionToken}` } });

    const prompt = JSON.stringify(callsByKind(run).answer[1][1].messages);
    expect(prompt).not.toContain("ada secret");
  });

  it("marks activity and clears emailed_at so a resumed chat is followed up again", async () => {
    const { d1, sqlite, auth } = await withSession();
    sqlite.exec("UPDATE sessions SET emailed_at = '2000-01-01T00:00:00.000Z', last_activity_at = '2000-01-01T00:00:00.000Z'");
    const post = harness("/chat", handleChat, { AI: { run: fakeAi() } as never, DB: d1 });
    await post({ message: "back again" }, { headers: auth });
    const row = sqlite.prepare("SELECT emailed_at, last_activity_at FROM sessions").get() as Record<string, string | null>;
    expect(row.emailed_at).toBeNull();
    expect((row.last_activity_at ?? "") > "2020").toBe(true);
  });

  describe("tools", () => {
    it("executes requested tools and feeds real data into the answer", async () => {
      const { d1, auth } = await withSession();
      const run = fakeAi({
        toolCalls: [{ name: "getProjects", arguments: {} }],
        reply: "He built several projects.",
      });
      const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });

      const res = await post({ message: "what has he built?" }, { headers: auth });

      expect(await res.json()).toEqual({
        reply: "He built several projects.",
        steps: [{ tool: "getProjects", label: "Browsed projects" }],
      });
      const msgs = callsByKind(run).answer[0][1].messages;
      const context = msgs.find((m) => m.role === "system" && m.content.includes("getProjects"));
      expect(context?.content).toContain("stack");
      expect(context?.content).toContain("/projects/chitops");
    });

    it("handles OpenAI-style tool calls (string arguments) and strips <think> from the stream, even split across chunks", async () => {
      const { d1, auth } = await withSession();
      const run = fakeAi({
        pick: {
          choices: [
            {
              message: {
                content: null,
                tool_calls: [
                  { id: "call_abc", type: "function", function: { name: "searchContent", arguments: '{"query":"react"}' } },
                ],
              },
            },
          ],
        },
        chunks: [
          { choices: [{ delta: { content: "<thi" } }] },
          { choices: [{ delta: { content: "nk>hmm</think>He uses " } }] },
          { choices: [{ delta: { content: "React." } }] },
        ],
      });
      const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });

      const res = await post({ message: "does he use react?" }, { headers: auth });

      expect(await res.json()).toEqual({
        reply: "He uses React.",
        steps: [{ tool: "searchContent", label: 'Searched for "react"' }],
      });
    });

    it("omits steps when no tool was used", async () => {
      const { d1, auth } = await withSession();
      const post = harness("/chat", handleChat, { AI: { run: fakeAi({ reply: "Hello!" }) } as never, DB: d1 });
      expect(await (await post({ message: "hi" }, { headers: auth })).json()).toEqual({ reply: "Hello!" });
    });

    it("gives the model only read-only portfolio tools - nothing touching sessions, DB or email", async () => {
      const { d1, auth } = await withSession();
      const run = fakeAi();
      const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });
      await post({ message: "hi" }, { headers: auth });
      const tools = callsByKind(run).pick[0][1].tools as { function: { name: string } }[];
      expect(tools.map((t) => t.function.name).sort()).toEqual(
        ["getEducation", "getExperience", "getProfile", "getProjects", "getSkills", "searchContent"].sort(),
      );
    });
  });

  describe("guardrails", () => {
    it("refuses off-topic questions with fixed text and never calls the answering model", async () => {
      const { d1, sqlite, auth } = await withSession();
      const run = fakeAi({ verdict: "NO", toolCalls: [{ name: "getProjects", arguments: {} }] });
      const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });

      const res = await post({ message: "write me a python script" }, { headers: auth });

      expect(await res.json()).toEqual({ reply: REFUSAL });
      expect(callsByKind(run).answer).toHaveLength(0);
      expect(transcript(sqlite)).toEqual([
        { role: "user", content: "write me a python script" },
        { role: "assistant", content: REFUSAL },
      ]);
    });

    it.each(["NO", "no.", "Maybe", "", "I think so, YES"])(
      "treats anything but an explicit YES (%j) as off-topic",
      async (verdict) => {
        const { d1, auth } = await withSession();
        const run = fakeAi({ verdict });
        const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });
        expect(await (await post({ message: "x" }, { headers: auth })).json()).toEqual({ reply: REFUSAL });
        expect(callsByKind(run).answer).toHaveLength(0);
      },
    );

    it("lets on-topic messages through, including a lenient YES", async () => {
      const { d1, auth } = await withSession();
      const run = fakeAi({ verdict: "Yes.", reply: "Sure!" });
      const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });
      expect(await (await post({ message: "what has he built" }, { headers: auth })).json()).toEqual({ reply: "Sure!" });
    });

    it("gives the guard the previous assistant reply so follow-ups like 'tell me more' pass", async () => {
      const { d1, auth } = await withSession();
      const run = fakeAi({ reply: "Ayoka is a skincare app." });
      const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });
      await post({ message: "what has he built" }, { headers: auth });
      await post({ message: "tell me more about the first one" }, { headers: auth });
      const guard = callsByKind(run).guard[1][1].messages;
      expect(guard[1].content).toContain("Ayoka is a skincare app.");
      expect(guard[1].content).toContain("tell me more about the first one");
    });

    it("an unavailable tool pass does not break a refusal", async () => {
      const { d1, auth } = await withSession();
      const run = vi.fn(async (_m: string, input: { tools?: unknown }) => {
        if (input.tools) throw new Error("tool pass down");
        return { choices: [{ message: { content: "NO" } }] };
      });
      const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });
      expect(await (await post({ message: "capital of France?" }, { headers: auth })).json()).toEqual({ reply: REFUSAL });
    });
  });

  describe("prompt", () => {
    it("is strict about scope, confident in tone, and asks for Markdown with in-app links", async () => {
      const { d1, auth } = await withSession();
      const run = fakeAi();
      const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });
      await post({ message: "hi" }, { headers: auth });
      const system = callsByKind(run).answer[0][1].messages[0].content;
      expect(system).toContain("SCOPE (strict)");
      expect(system).toContain("Never hedge or apologise");
      expect(system).toContain("'not listed'");
      expect(system).toContain("Markdown");
      expect(system).toContain("/projects");
      expect(system).toContain("must start with a single `/`");
    });

    it("tells the model not to point out gaps in the facts it was given", async () => {
      const { d1, auth } = await withSession();
      const run = fakeAi({ toolCalls: [{ name: "getSkills", arguments: {} }] });
      const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });
      await post({ message: "skills?" }, { headers: auth });
      const msgs = callsByKind(run).answer[0][1].messages;
      const facts = msgs.find((m) => m.role === "system" && m.content.startsWith("Facts about Dinesh"));
      expect(facts?.content).toMatch(/confidently/);
      expect(facts?.content).toMatch(/do not\s+point out anything absent/);
    });
  });

  describe("streaming (Accept: text/event-stream)", () => {
    it("emits step, delta and done events and stores the full reply", async () => {
      const { d1, sqlite, auth } = await withSession();
      const run = fakeAi({
        toolCalls: [{ name: "getEducation", arguments: {} }],
        chunks: [{ response: "He studied " }, { response: "at Limerick." }],
      });
      const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });

      const res = await post({ message: "where did he study?" }, { headers: { ...auth, ...SSE } });

      expect(res.headers.get("content-type")).toContain("text/event-stream");
      expect(await readSse(res)).toEqual([
        { event: "step", data: { tool: "getEducation", label: "Checked education" } },
        { event: "delta", data: { text: "He studied " } },
        { event: "delta", data: { text: "at Limerick." } },
        { event: "done", data: {} },
      ]);
      const rows = transcript(sqlite);
      expect(rows[rows.length - 1]).toEqual({ role: "assistant", content: "He studied at Limerick." });
    });

    it("reads OpenAI-style stream chunks and tolerates SSE lines split mid-event", async () => {
      const { d1, auth } = await withSession();
      const run = fakeAi({
        streamResult: sseStream(
          [{ choices: [{ delta: { role: "assistant", content: "" } }] }, { choices: [{ delta: { content: "Hello" } }] }, { choices: [{ delta: { content: " there" } }] }],
          { splitAt: 37 },
        ),
      });
      const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });
      const events = await readSse(await post({ message: "hi" }, { headers: { ...auth, ...SSE } }));
      expect(events.filter((e) => e.event === "delta").map((e) => e.data.text).join("")).toBe("Hello there");
    });

    it("streams the fixed refusal for off-topic questions", async () => {
      const { d1, auth } = await withSession();
      const run = fakeAi({ verdict: "NO" });
      const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });
      const events = await readSse(await post({ message: "joke?" }, { headers: { ...auth, ...SSE } }));
      expect(events).toEqual([
        { event: "delta", data: { text: REFUSAL } },
        { event: "done", data: {} },
      ]);
    });

    it("sends an error event (not a broken stream) when Workers AI fails, and stores only the visitor's message", async () => {
      const { d1, sqlite, auth } = await withSession();
      const post = harness("/chat", handleChat, { AI: { run: fakeAi({ fail: new Error("AI down") }) } as never, DB: d1 });
      const events = await readSse(await post({ message: "hello" }, { headers: { ...auth, ...SSE } }));
      expect(events[0].event).toBe("error");
      expect(events[0].data.error).toMatch(/temporarily unavailable/);
      expect(transcript(sqlite)).toEqual([{ role: "user", content: "hello" }]);
    });

    it("works with models that ignore stream:true and return a finished object", async () => {
      const { d1, auth } = await withSession();
      const run = fakeAi({ streamResult: { response: "All at once." } });
      const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });
      const events = await readSse(await post({ message: "hi" }, { headers: { ...auth, ...SSE } }));
      expect(events.filter((e) => e.event === "delta")).toEqual([{ event: "delta", data: { text: "All at once." } }]);
    });
  });

  it("returns 502 when Workers AI fails, but keeps the visitor's message for the owner's transcript", async () => {
    const { d1, sqlite, auth } = await withSession();
    const post = harness("/chat", handleChat, { AI: { run: fakeAi({ fail: new Error("AI down") }) } as never, DB: d1 });
    const res = await post({ message: "hello" }, { headers: auth });
    expect(res.status).toBe(502);
    expect(((await res.json()) as { error: string }).error).toMatch(/temporarily unavailable/);
    expect(transcript(sqlite)).toEqual([{ role: "user", content: "hello" }]);
  });

  it("asks to rephrase instead of replying with nothing when the model returns no text", async () => {
    const { d1, auth } = await withSession();
    const run = fakeAi({ streamResult: {} });
    const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });
    expect(((await (await post({ message: "hello" }, { headers: auth })).json()) as { reply: string }).reply).toMatch(/rephrase/i);
  });

  it("enforces the per-session message cap before calling the model", async () => {
    const { d1, sqlite, auth } = await withSession();
    const sid = (sqlite.prepare("SELECT id FROM sessions").get() as { id: string }).id;
    const ins = sqlite.prepare("INSERT INTO chat_messages (session_id, role, content, created_at) VALUES (?, 'user', 'x', 'now')");
    for (let i = 0; i < MAX_USER_MESSAGES_PER_SESSION; i++) ins.run(sid);
    const run = fakeAi();
    const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });
    expect((await post({ message: "one more" }, { headers: auth })).status).toBe(429);
    expect(run).not.toHaveBeenCalled();
  });

  it.each([
    ["an empty message", { message: "" }],
    ["a missing message", {}],
    ["an over-long message", { message: "x".repeat(2001) }],
    ["malformed JSON", "{oops"],
  ])("rejects %s with 400 without calling the model", async (_l, body) => {
    const { d1, auth } = await withSession();
    const run = fakeAi();
    const post = harness("/chat", handleChat, { AI: { run } as never, DB: d1 });
    expect((await post(body, { headers: auth })).status).toBe(400);
    expect(run).not.toHaveBeenCalled();
  });
});

describe("GET /chat/history", () => {
  it("returns the visitor's name and transcript, and requires a session", async () => {
    const { d1, auth } = await withSession();
    const run = fakeAi({ reply: "hey" });
    await harness("/chat", handleChat, { AI: { run } as never, DB: d1 })({ message: "hi" }, { headers: auth });

    const get = harness("/chat/history", handleHistory, { DB: d1 }, "GET");
    expect(await (await get(undefined, { headers: auth })).json()).toEqual({
      name: "Ada",
      messages: [
        { role: "user", content: "hi" },
        { role: "assistant", content: "hey" },
      ],
    });
    expect((await get()).status).toBe(401);
  });
});
