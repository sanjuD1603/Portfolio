/** One server-sent event from `POST /chat` (`step`, `delta`, `done` or `error`). */
export type SseEvent = { event: string; data: unknown };

/** Parses one SSE block (the text between blank lines) into an event, or null if it carries no data. */
export function parseSseBlock(block: string): SseEvent | null {
  let event = "message";
  const data: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).trim());
  }
  if (data.length === 0) return null;
  try {
    return { event, data: JSON.parse(data.join("\n")) };
  } catch {
    return null;
  }
}

/**
 * Reads a `text/event-stream` response body as it arrives.
 *
 * `fetch` + a reader rather than `EventSource`, because the chat request is a POST with a
 * bearer token. Events can be split across network chunks, so text is buffered until a blank
 * line completes an event.
 */
export async function* readSse(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SseEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
      let end = buffer.indexOf("\n\n");
      while (end !== -1) {
        const parsed = parseSseBlock(buffer.slice(0, end));
        buffer = buffer.slice(end + 2);
        if (parsed) yield parsed;
        end = buffer.indexOf("\n\n");
      }
    }
    const last = parseSseBlock(buffer);
    if (last) yield last;
  } finally {
    reader.releaseLock();
  }
}

export type Pacer = {
  /** Queue text to be revealed. */
  push(text: string): void;
  /** Resolves once everything queued so far has been revealed (speeding up to get there). */
  drain(): Promise<void>;
  /** Reveal everything queued right now, e.g. before showing an error. */
  flush(): void;
};

type PacerOptions = {
  /** Slowest reveal speed, in characters per second (a comfortable reading pace). */
  minCps?: number;
  /** Aim to have shown any backlog within this many seconds. */
  catchUpSeconds?: number;
  intervalMs?: number;
  now?: () => number;
};

/**
 * Smooths bursty streaming into a steady typewriter-style reveal.
 *
 * Workers AI delivers tokens in clumps (many at once, then a pause), which looks like the
 * reply stalling. Instead of showing each chunk on arrival, text goes into a queue that is
 * revealed at a steady pace: never slower than `minCps`, and fast enough to clear any backlog
 * within `catchUpSeconds`, so smoothing adds at most a fraction of a second of delay. Once the
 * stream has ended (`drain`) the remainder is revealed quickly.
 *
 * Time-based on `setTimeout` rather than `requestAnimationFrame`, which browsers pause in
 * background tabs; a throttled timer just reveals more characters per tick.
 */
export function createPacer(
  emit: (text: string) => void,
  {
    minCps = 70,
    catchUpSeconds = 0.5,
    intervalMs = 30,
    now = () => Date.now(),
  }: PacerOptions = {},
): Pacer {
  let queue = "";
  let timer: ReturnType<typeof setTimeout> | null = null;
  let last = 0;
  let credit = 0;
  let draining = false;
  let waiters: (() => void)[] = [];

  const settle = () => {
    if (queue) return;
    draining = false;
    const done = waiters;
    waiters = [];
    for (const resolve of done) resolve();
  };

  const tick = () => {
    timer = null;
    const t = now();
    const dt = Math.min((t - last) / 1000, 1);
    last = t;
    const backlogSeconds = draining ? 0.25 : catchUpSeconds;
    credit += Math.max(minCps, queue.length / backlogSeconds) * dt;
    let n = Math.min(Math.floor(credit), queue.length);
    if (n > 0) {
      // Never cut a surrogate pair (emoji, etc.) in half.
      const code = queue.charCodeAt(n - 1);
      if (code >= 0xd800 && code <= 0xdbff && n < queue.length) n += 1;
      credit -= n;
      const piece = queue.slice(0, n);
      queue = queue.slice(n);
      emit(piece);
    }
    if (queue) timer = setTimeout(tick, intervalMs);
    else {
      credit = 0;
      settle();
    }
  };

  return {
    push(text) {
      if (!text) return;
      queue += text;
      if (timer === null) {
        last = now();
        timer = setTimeout(tick, intervalMs);
      }
    },
    drain() {
      if (!queue) return Promise.resolve();
      draining = true;
      return new Promise<void>((resolve) => waiters.push(resolve));
    },
    flush() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
      const rest = queue;
      queue = "";
      credit = 0;
      if (rest) emit(rest);
      settle();
    },
  };
}
