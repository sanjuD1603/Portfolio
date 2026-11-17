import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPacer, parseSseBlock, readSse } from "../chat-stream";

function bodyOf(...chunks: string[]) {
  const enc = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(c) {
      for (const chunk of chunks) c.enqueue(enc.encode(chunk));
      c.close();
    },
  });
}

async function collect(body: ReadableStream<Uint8Array>) {
  const out = [];
  for await (const ev of readSse(body)) out.push(ev);
  return out;
}

describe("parseSseBlock", () => {
  it("reads the event name and JSON data", () => {
    expect(parseSseBlock('event: delta\ndata: {"text":"hi"}')).toEqual({
      event: "delta",
      data: { text: "hi" },
    });
  });
  it("defaults the event name and ignores blocks without usable data", () => {
    expect(parseSseBlock('data: {"a":1}')).toEqual({
      event: "message",
      data: { a: 1 },
    });
    expect(parseSseBlock(": comment only")).toBeNull();
    expect(parseSseBlock("event: delta\ndata: not json")).toBeNull();
  });
});

describe("readSse", () => {
  it("yields events in order", async () => {
    const events = await collect(
      bodyOf('event: step\ndata: {"n":1}\n\nevent: delta\ndata: {"n":2}\n\n'),
    );
    expect(events.map((e) => e.event)).toEqual(["step", "delta"]);
  });

  it("reassembles events split across chunks and handles CRLF", async () => {
    const events = await collect(
      bodyOf(
        'event: delta\r\ndata: {"te',
        'xt":"split"}\r\n\r\nevent: done\r\ndata: {}\r\n\r\n',
      ),
    );
    expect(events).toEqual([
      { event: "delta", data: { text: "split" } },
      { event: "done", data: {} },
    ]);
  });

  it("flushes a final event that has no trailing blank line", async () => {
    expect(await collect(bodyOf("event: done\ndata: {}"))).toEqual([
      { event: "done", data: {} },
    ]);
  });
});

describe("createPacer", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  /** Collects what the pacer reveals, with the (fake) time of each reveal. */
  function setup() {
    const shown: { at: number; text: string }[] = [];
    const pacer = createPacer((text) => shown.push({ at: Date.now(), text }));
    const all = () => shown.map((s) => s.text).join("");
    return { pacer, shown, all };
  }

  it("reveals everything, in order, and drain() resolves once it has", async () => {
    const { pacer, all } = setup();
    pacer.push("Hello, ");
    pacer.push("world.");
    const done = pacer.drain();
    await vi.advanceTimersByTimeAsync(2000);
    await done;
    expect(all()).toBe("Hello, world.");
  });

  it("does not dump a burst at once: it is spread over time yet cleared within a couple of seconds", async () => {
    const { pacer, shown, all } = setup();
    const burst = "x".repeat(600);
    pacer.push(burst);
    await vi.advanceTimersByTimeAsync(100);
    expect(all().length).toBeGreaterThan(0);
    expect(all().length).toBeLessThan(600);
    await vi.advanceTimersByTimeAsync(2500);
    expect(all()).toBe(burst);
    expect(shown.length).toBeGreaterThan(10);
  });

  it("keeps text flowing through the pauses between bursts (no visible stalls)", async () => {
    const { pacer, shown, all } = setup();
    // Bursts of 90 chars every 500ms (~180 chars/s on average) like the measured Workers AI output.
    let sent = "";
    for (let i = 0; i < 6; i++) {
      const chunk = String(i).repeat(90);
      sent += chunk;
      pacer.push(chunk);
      await vi.advanceTimersByTimeAsync(500);
    }
    const done = pacer.drain();
    await vi.advanceTimersByTimeAsync(2000);
    await done;
    expect(all()).toBe(sent);
    const gaps = shown.slice(1).map((s, i) => s.at - shown[i].at);
    expect(Math.max(...gaps)).toBeLessThanOrEqual(100);
  });

  it("shows a lone character almost immediately", async () => {
    const { pacer, all } = setup();
    pacer.push("a".repeat(5));
    await vi.advanceTimersByTimeAsync(100);
    expect(all().length).toBeGreaterThan(0);
  });

  it("never splits a surrogate pair (emoji)", async () => {
    const { pacer, shown } = setup();
    pacer.push("ab😀cd😀ef😀".repeat(20));
    const done = pacer.drain();
    await vi.advanceTimersByTimeAsync(3000);
    await done;
    for (const { text } of shown) {
      const last = text.charCodeAt(text.length - 1);
      // A high surrogate at the end of a piece would mean the emoji was cut in half.
      expect(last >= 0xd800 && last <= 0xdbff).toBe(false);
    }
  });

  it("flush() reveals the rest immediately and releases waiters", async () => {
    const { pacer, all } = setup();
    pacer.push("y".repeat(400));
    const done = pacer.drain();
    pacer.flush();
    await done;
    expect(all()).toBe("y".repeat(400));
  });
});
