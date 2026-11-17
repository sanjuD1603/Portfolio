// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type ChatAction, chatReducer, initialState } from "../chat-provider";

const apply = (...actions: ChatAction[]) =>
  actions.reduce(chatReducer, initialState);

describe("chatReducer", () => {
  it("toggles, opens and closes the panel", () => {
    expect(apply({ type: "toggle" }).open).toBe(true);
    expect(apply({ type: "open" }, { type: "close" }).open).toBe(false);
  });

  it("appends the visitor's message and clears a previous error", () => {
    const state = apply(
      { type: "error", error: "boom" },
      { type: "send", message: { role: "user", content: "hi" } },
    );
    expect(state.messages).toEqual([{ role: "user", content: "hi" }]);
    expect(state.error).toBeNull();
  });

  it("receive appends the reply and stops loading", () => {
    const state = apply(
      { type: "loading", loading: true },
      { type: "receive", message: { role: "assistant", content: "hello" } },
    );
    expect(state.loading).toBe(false);
    expect(state.messages.at(-1)?.role).toBe("assistant");
  });

  it("error stops loading so the typing indicator cannot get stuck", () => {
    const state = apply(
      { type: "loading", loading: true },
      { type: "error", error: "x" },
    );
    expect(state).toMatchObject({ loading: false, error: "x" });
  });

  it("session sets the visitor; session null ends it and clears the transcript", () => {
    const started = apply(
      { type: "session", session: { name: "Ada" } },
      { type: "send", message: { role: "user", content: "hi" } },
    );
    expect(started.session).toEqual({ name: "Ada" });
    const ended = chatReducer(started, { type: "session", session: null });
    expect(ended.session).toBeNull();
    expect(ended.messages).toEqual([]);
  });

  it("restore rehydrates the session and transcript", () => {
    const state = apply({
      type: "restore",
      session: { name: "Ada" },
      messages: [{ role: "user", content: "hi" }],
    });
    expect(state).toMatchObject({ session: { name: "Ada" }, loading: false });
    expect(state.messages).toHaveLength(1);
  });

  it("stream creates the assistant reply on the first event, then grows it in place", () => {
    const state = apply(
      { type: "send", message: { role: "user", content: "q" } },
      { type: "loading", loading: true },
      {
        type: "stream",
        step: { tool: "getProjects", label: "Browsed projects" },
      },
      { type: "stream", delta: "Hel" },
      { type: "stream", delta: "lo" },
    );
    expect(state.messages).toHaveLength(2);
    expect(state.messages[1]).toEqual({
      role: "assistant",
      content: "Hello",
      streaming: true,
      steps: [{ tool: "getProjects", label: "Browsed projects" }],
    });
    expect(state.loading).toBe(true);
  });

  it("stream-end finishes the reply and stops loading", () => {
    const state = apply(
      { type: "loading", loading: true },
      { type: "stream", delta: "Done." },
      { type: "stream-end" },
    );
    expect(state.messages[0]).toEqual({ role: "assistant", content: "Done." });
    expect(state.loading).toBe(false);
  });

  it("error keeps text already streamed but drops a reply that never started", () => {
    const partial = apply(
      { type: "stream", delta: "Half" },
      { type: "error", error: "x" },
    );
    expect(partial.messages).toEqual([{ role: "assistant", content: "Half" }]);
    const empty = apply(
      { type: "send", message: { role: "user", content: "q" } },
      { type: "error", error: "x" },
    );
    expect(empty.messages).toHaveLength(1);
  });

  it("does not mutate the previous state", () => {
    const before = structuredClone(initialState);
    chatReducer(initialState, {
      type: "send",
      message: { role: "user", content: "a" },
    });
    expect(initialState).toEqual(before);
  });
});

describe("chat session + API connection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
    sessionStorage.clear();
  });

  /** Re-imports the module so the build-time env var is read afresh. */
  async function setup(apiUrl?: string) {
    vi.resetModules();
    if (apiUrl) vi.stubEnv("NEXT_PUBLIC_WORKER_API_URL", apiUrl);
    else vi.stubEnv("NEXT_PUBLIC_WORKER_API_URL", "");
    const { ChatProvider, useChat } = await import("../chat-provider");
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ChatProvider>{children}</ChatProvider>
    );
    return renderHook(() => useChat(), { wrapper });
  }

  const json = (body: unknown, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });

  /** Sets up the API URL and a started session; `fetchMock` then answers /chat calls. */
  async function started(fetchMock: ReturnType<typeof vi.fn>) {
    fetchMock.mockResolvedValueOnce(json({ sessionToken: "tok_123" }, 201));
    vi.stubGlobal("fetch", fetchMock);
    const hook = await setup("https://api.example.test");
    await act(async () => {
      await hook.result.current.startSession(" Ada ", " ada@example.test ");
    });
    return hook;
  }

  describe("startSession", () => {
    it("POSTs name and email to /sessions and opens the session", async () => {
      const fetchMock = vi.fn();
      const { result } = await started(fetchMock);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.test/sessions",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Ada", email: "ada@example.test" }),
        }),
      );
      expect(result.current.session).toEqual({ name: "Ada" });
      expect(result.current.error).toBeNull();
      expect(sessionStorage.getItem("portfolio-chat-token")).toBe("tok_123");
    });

    it.each([
      [400, /valid email/],
      [429, /Too many chats/],
      [500, /Couldn't start the chat/],
    ])("reports a friendly error for a %s response", async (status, message) => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, status)));
      const { result } = await setup("https://api.example.test");
      await act(async () => {
        expect(await result.current.startSession("Ada", "a@example.test")).toBe(
          false,
        );
      });
      expect(result.current.error).toMatch(message);
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it("explains a missing API URL", async () => {
      const { result } = await setup();
      await act(async () => {
        await result.current.startSession("Ada", "a@example.test");
      });
      expect(result.current.error).toMatch(/NEXT_PUBLIC_WORKER_API_URL/);
    });
  });

  describe("sendMessage", () => {
    it("shows a clear error when the API URL is not configured", async () => {
      const { result } = await setup();
      await act(() => result.current.sendMessage("hello"));
      expect(result.current.error).toMatch(/NEXT_PUBLIC_WORKER_API_URL/);
      expect(result.current.loading).toBe(false);
    });

    it("sends the bearer token and only the new message, then appends the reply", async () => {
      const fetchMock = vi.fn();
      const { result } = await started(fetchMock);
      fetchMock.mockResolvedValueOnce(
        json({ reply: "Dinesh builds on Cloudflare." }),
      );

      await act(() => result.current.sendMessage("  what does he build?  "));

      const [url, init] = fetchMock.mock.calls[1];
      expect(url).toBe("https://api.example.test/chat");
      expect(init.headers.Authorization).toBe("Bearer tok_123");
      expect(init.body).toBe(
        JSON.stringify({ message: "what does he build?" }),
      );
      expect(result.current.messages.map((m) => m.role)).toEqual([
        "user",
        "assistant",
      ]);
      expect(result.current.error).toBeNull();
    });

    it("keeps the lookup steps the Worker reports on the assistant message", async () => {
      const fetchMock = vi.fn();
      const { result } = await started(fetchMock);
      const steps = [{ tool: "getProjects", label: "Browsed projects" }];
      fetchMock.mockResolvedValueOnce(json({ reply: "Four projects.", steps }));

      await act(() => result.current.sendMessage("projects?"));

      expect(result.current.messages.at(-1)).toEqual({
        role: "assistant",
        content: "Four projects.",
        steps,
      });
    });

    /** A `fetch` Response whose body is a real event stream. */
    const sse = (
      events: [string, unknown][],
      opts: { failAfter?: boolean } = {},
    ) => {
      const enc = new TextEncoder();
      let sent = false;
      const text = events
        .map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`)
        .join("");
      return {
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "text/event-stream" }),
        body: new ReadableStream<Uint8Array>({
          // First read delivers the events; for a dropped connection the next read fails.
          pull(c) {
            if (!sent) {
              sent = true;
              c.enqueue(enc.encode(text));
              if (!opts.failAfter) c.close();
            } else {
              c.error(new Error("network dropped"));
            }
          },
        }),
      };
    };

    it("asks for an event stream and builds the reply from step and delta events", async () => {
      const fetchMock = vi.fn();
      const { result } = await started(fetchMock);
      fetchMock.mockResolvedValueOnce(
        sse([
          ["step", { tool: "getProjects", label: "Browsed projects" }],
          ["delta", { text: "Four " }],
          ["delta", { text: "projects." }],
          ["done", {}],
        ]),
      );

      await act(() => result.current.sendMessage("projects?"));

      expect(fetchMock.mock.calls[1][1].headers.Accept).toBe(
        "text/event-stream",
      );
      expect(result.current.messages.at(-1)).toEqual({
        role: "assistant",
        content: "Four projects.",
        steps: [{ tool: "getProjects", label: "Browsed projects" }],
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("shows the server's error event, keeping what had already streamed", async () => {
      const fetchMock = vi.fn();
      const { result } = await started(fetchMock);
      fetchMock.mockResolvedValueOnce(
        sse([
          ["delta", { text: "Partial" }],
          [
            "error",
            {
              error:
                "The assistant is temporarily unavailable. Try again shortly.",
            },
          ],
        ]),
      );
      await act(() => result.current.sendMessage("hi"));
      expect(result.current.error).toMatch(/temporarily unavailable/);
      expect(result.current.messages.at(-1)).toEqual({
        role: "assistant",
        content: "Partial",
      });
      expect(result.current.loading).toBe(false);
    });

    it("recovers when the connection drops mid-stream", async () => {
      const fetchMock = vi.fn();
      const { result } = await started(fetchMock);
      fetchMock.mockResolvedValueOnce(
        sse([["delta", { text: "Cut" }]], { failAfter: true }),
      );
      await act(() => result.current.sendMessage("hi"));
      expect(result.current.error).toMatch(/Couldn't reach the assistant/);
      expect(result.current.messages.at(-1)).toEqual({
        role: "assistant",
        content: "Cut",
      });
      expect(result.current.loading).toBe(false);
    });

    it("returns to the intro form when the Worker says the session expired (401)", async () => {
      const fetchMock = vi.fn();
      const { result } = await started(fetchMock);
      fetchMock.mockResolvedValueOnce(json({}, 401));

      await act(() => result.current.sendMessage("hello"));

      expect(result.current.session).toBeNull();
      expect(result.current.error).toMatch(/session expired/);
      expect(sessionStorage.getItem("portfolio-chat-token")).toBeNull();
    });

    it("explains the per-chat message limit (429) without dropping the session", async () => {
      const fetchMock = vi.fn();
      const { result } = await started(fetchMock);
      fetchMock.mockResolvedValueOnce(json({}, 429));
      await act(() => result.current.sendMessage("hello"));
      expect(result.current.error).toMatch(/message limit/);
      expect(result.current.session).not.toBeNull();
    });

    it("surfaces an error (and keeps the visitor's message) when the API fails", async () => {
      const fetchMock = vi.fn();
      const { result } = await started(fetchMock);
      fetchMock.mockResolvedValueOnce(json({}, 502));
      await act(() => result.current.sendMessage("hello"));
      expect(result.current.error).toMatch(/Couldn't reach the assistant/);
      expect(result.current.messages).toHaveLength(1);
    });

    it("ignores blank input without calling the API", async () => {
      const fetchMock = vi.fn();
      const { result } = await started(fetchMock);
      await act(() => result.current.sendMessage("   "));
      expect(fetchMock).toHaveBeenCalledTimes(1); // only the session request
    });
  });

  describe("resuming after a reload", () => {
    it("restores the session and transcript from the stored token", async () => {
      sessionStorage.setItem("portfolio-chat-token", "tok_old");
      const fetchMock = vi.fn().mockResolvedValue(
        json({
          name: "Ada",
          messages: [
            { role: "user", content: "hi" },
            { role: "assistant", content: "hello" },
          ],
        }),
      );
      vi.stubGlobal("fetch", fetchMock);
      const { result } = await setup("https://api.example.test");
      await waitFor(() =>
        expect(result.current.session).toEqual({ name: "Ada" }),
      );
      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://api.example.test/chat/history",
      );
      expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
        "Bearer tok_old",
      );
      expect(result.current.messages).toHaveLength(2);
    });

    it("forgets a stored token the Worker no longer accepts", async () => {
      sessionStorage.setItem("portfolio-chat-token", "tok_dead");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, 401)));
      const { result } = await setup("https://api.example.test");
      await waitFor(() =>
        expect(sessionStorage.getItem("portfolio-chat-token")).toBeNull(),
      );
      expect(result.current.session).toBeNull();
    });
  });
});
