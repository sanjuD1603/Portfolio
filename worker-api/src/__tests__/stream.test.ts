import { describe, expect, it } from "vitest";
import { chunkText, createThinkFilter, streamText } from "../stream";
import { sseStream } from "../test-helpers";

async function collect(gen: AsyncGenerator<string>) {
  const out: string[] = [];
  for await (const t of gen) out.push(t);
  return out;
}

describe("chunkText", () => {
  it("reads legacy and OpenAI-style chunks, ignoring reasoning and empty deltas", () => {
    expect(chunkText({ response: "a" })).toBe("a");
    expect(chunkText({ choices: [{ delta: { content: "b" } }] })).toBe("b");
    expect(chunkText({ choices: [{ text: "c" }] })).toBe("c");
    expect(chunkText({ choices: [{ delta: { reasoning_content: "secret thoughts" } }] })).toBe("");
    expect(chunkText(null)).toBe("");
  });
});

describe("createThinkFilter", () => {
  const run = (...chunks: string[]) => {
    const f = createThinkFilter();
    return chunks.map((c) => f.push(c)).join("") + f.flush();
  };

  it("passes plain text through untouched", () => {
    expect(run("Hello ", "world")).toBe("Hello world");
  });
  it("drops a whole think block", () => {
    expect(run("<think>plan</think>Answer")).toBe("Answer");
  });
  it("handles tags split across chunks", () => {
    expect(run("<th", "ink>plan</thi", "nk>Ans", "wer")).toBe("Answer");
  });
  it("keeps '<' that is not a think tag", () => {
    expect(run("a < b and <b>bold</b>")).toBe("a < b and <b>bold</b>");
  });
  it("drops an unterminated think block entirely", () => {
    expect(run("Hi <think>never closes")).toBe("Hi ");
  });
});

describe("streamText", () => {
  it("yields text from a legacy SSE stream and stops at [DONE]", async () => {
    const s = sseStream([{ response: "Hel" }, { response: "lo" }]);
    expect(await collect(streamText(s, () => ""))).toEqual(["Hel", "lo"]);
  });

  it("reassembles events split across network chunks and skips junk lines", async () => {
    const enc = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(enc.encode('data: {"response":"A"}\n\n: keep-alive\ndata: {"respo'));
        c.enqueue(enc.encode('nse":"B"}\n\ndata: not json\n\ndata: [DONE]\n\n'));
        c.close();
      },
    });
    expect((await collect(streamText(stream, () => ""))).join("")).toBe("AB");
  });

  it("ends cleanly when the stream closes without [DONE]", async () => {
    const s = sseStream([{ response: "x" }], { done: false });
    expect((await collect(streamText(s, () => ""))).join("")).toBe("x");
  });

  it("falls back to the finished object when the model did not stream", async () => {
    expect(await collect(streamText({ response: "whole" }, (r) => (r as { response: string }).response))).toEqual(["whole"]);
    expect(await collect(streamText({}, () => ""))).toEqual([]);
  });
});
