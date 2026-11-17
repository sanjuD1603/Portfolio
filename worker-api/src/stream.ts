/**
 * Helpers for consuming a Workers AI `stream: true` response.
 *
 * The binding returns a `ReadableStream` of server-sent events. Depending on the model each
 * `data:` line is either legacy (`{"response":"tok"}`) or OpenAI-style
 * (`{"choices":[{"delta":{"content":"tok"}}]}`), terminated by `data: [DONE]`.
 */

/** Text carried by one decoded SSE JSON chunk, whichever shape the model uses. */
export function chunkText(chunk: unknown): string {
  const c = (chunk ?? {}) as {
    response?: unknown;
    choices?: { delta?: { content?: unknown }; text?: unknown }[];
  };
  if (typeof c.response === "string") return c.response;
  const choice = c.choices?.[0];
  if (typeof choice?.delta?.content === "string") return choice.delta.content;
  if (typeof choice?.text === "string") return choice.text;
  return "";
}

const OPEN = "<think>";
const CLOSE = "</think>";

/** How many trailing chars of `text` could be the start of `tag` (so we hold them back until we know). */
function partialTagLength(text: string, tag: string) {
  for (let k = Math.min(tag.length - 1, text.length); k > 0; k--) {
    if (text.endsWith(tag.slice(0, k))) return k;
  }
  return 0;
}

/**
 * Stateful filter that removes `<think>…</think>` spans from a token stream, even when a tag is
 * split across chunks. Reasoning models can emit their chain of thought inline; visitors must
 * never see it. Call `push` per chunk and `flush` once at the end.
 */
export function createThinkFilter() {
  let pending = "";
  let inThink = false;

  return {
    push(chunk: string): string {
      pending += chunk;
      let out = "";
      for (;;) {
        if (inThink) {
          const end = pending.indexOf(CLOSE);
          if (end === -1) {
            pending = pending.slice(pending.length - partialTagLength(pending, CLOSE));
            return out;
          }
          pending = pending.slice(end + CLOSE.length);
          inThink = false;
          continue;
        }
        const start = pending.indexOf(OPEN);
        if (start !== -1) {
          out += pending.slice(0, start);
          pending = pending.slice(start + OPEN.length);
          inThink = true;
          continue;
        }
        const hold = partialTagLength(pending, OPEN);
        out += pending.slice(0, pending.length - hold);
        pending = pending.slice(pending.length - hold);
        return out;
      }
    },
    flush(): string {
      const rest = inThink ? "" : pending;
      pending = "";
      return rest;
    },
  };
}

/**
 * Yields the visible text of a Workers AI response as it arrives.
 *
 * If the binding returns a finished object instead of a stream (some models ignore `stream`,
 * and unit-test fakes do), `fallback` extracts its text and it is yielded in one piece.
 */
export async function* streamText(
  result: unknown,
  fallback: (result: unknown) => string,
): AsyncGenerator<string> {
  if (!(result instanceof ReadableStream)) {
    const text = fallback(result);
    if (text) yield text;
    return;
  }

  const filter = createThinkFilter();
  const reader = (result as ReadableStream<Uint8Array>).getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        newline = buffer.indexOf("\n");
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") {
          const tail = filter.flush();
          if (tail) yield tail;
          return;
        }
        let parsed: unknown;
        try {
          parsed = JSON.parse(payload);
        } catch {
          continue;
        }
        const visible = filter.push(chunkText(parsed));
        if (visible) yield visible;
      }
    }
    const tail = filter.flush();
    if (tail) yield tail;
  } finally {
    reader.releaseLock();
  }
}
