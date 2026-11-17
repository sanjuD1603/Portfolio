import { vi } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { type Handler, Hono } from "hono";
import type { Env } from "./env";

const MIGRATIONS_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../migrations",
);

/** Every migration's SQL, in filename order - so tests run against the schema `wrangler d1 migrations apply` would produce. */
const MIGRATION_SQL = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => readFileSync(resolve(MIGRATIONS_DIR, f), "utf8"))
  .join("\n--> statement-breakpoint\n");

type Param = string | number | null;

/**
 * Real SQLite (node:sqlite) behind the slice of the D1 API that Drizzle uses,
 * with the actual migration applied - so tests exercise the real schema and SQL.
 */
export function createTestDb(opts: { failWrites?: boolean } = {}) {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  for (const stmt of MIGRATION_SQL.split("--> statement-breakpoint")) {
    sqlite.exec(stmt);
  }

  const prepare = (sql: string) => {
    let params: Param[] = [];
    const guard = () => {
      if (opts.failWrites && /^\s*(insert|update|delete)/i.test(sql))
        throw new Error("D1 unavailable");
    };
    const stmt = {
      bind(...p: Param[]) {
        params = p;
        return stmt;
      },
      async run() {
        guard();
        const r = sqlite.prepare(sql).run(...params);
        return { success: true, meta: { changes: Number(r.changes) } };
      },
      async all() {
        guard();
        const results = sqlite.prepare(sql).all(...params);
        return { success: true, results, meta: {} };
      },
      async raw() {
        guard();
        const s = sqlite.prepare(sql);
        s.setReturnArrays(true);
        return s.all(...params);
      },
      async first() {
        return (sqlite.prepare(sql).get(...params) as unknown) ?? null;
      },
    };
    return stmt;
  };

  const d1 = {
    prepare,
    async batch(stmts: { run: () => Promise<unknown> }[]) {
      const out = [];
      for (const s of stmts) out.push(await s.run());
      return out;
    },
  } as unknown as D1Database;

  return { d1, sqlite };
}

type HarnessOptions = { method?: "POST" | "GET"; headers?: Record<string, string> };

/** Mounts one handler on a throwaway Hono app and returns a `call(body, opts)` helper. */
export function harness(
  path: string,
  handler: Handler<{ Bindings: Env }>,
  env: Partial<Env>,
  method: "POST" | "GET" = "POST",
) {
  const app = new Hono<{ Bindings: Env }>();
  if (method === "POST") app.post(path, handler);
  else app.get(path, handler);
  return (body?: unknown, opts: HarnessOptions = {}) =>
    app.request(
      path,
      {
        method: opts.method ?? method,
        headers: { "Content-Type": "application/json", ...opts.headers },
        body:
          body === undefined || method === "GET"
            ? undefined
            : typeof body === "string"
              ? body
              : JSON.stringify(body),
      },
      env as Env,
    );
}

/** Turns payload objects into the SSE `ReadableStream` Workers AI returns for `stream: true`. */
export function sseStream(payloads: unknown[], opts: { done?: boolean; splitAt?: number } = {}) {
  const enc = new TextEncoder();
  let text = payloads.map((p) => `data: ${JSON.stringify(p)}\n\n`).join("");
  if (opts.done !== false) text += "data: [DONE]\n\n";
  const bytes = enc.encode(text);
  const cut = opts.splitAt ?? bytes.length;
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes.slice(0, cut));
      if (cut < bytes.length) controller.enqueue(bytes.slice(cut));
      controller.close();
    },
  });
}

export type FakeAiOptions = {
  /** Text the topic guard replies with (default "YES"). */
  verdict?: string;
  /** Legacy-shaped tool calls the tool-selection pass requests. */
  toolCalls?: { name: string; arguments: unknown }[];
  /** Raw result for the tool-selection pass (overrides `toolCalls`). */
  pick?: unknown;
  /** Visible answer, streamed as one chunk (default "ok"). */
  reply?: string;
  /** Raw SSE chunk payloads for the streamed answer (overrides `reply`). */
  chunks?: unknown[];
  /** Raw non-stream result for the answer call, for models that ignore `stream`. */
  streamResult?: unknown;
  /** Reject every call. */
  fail?: Error;
};

/**
 * Fake `env.AI.run` that tells the route's three kinds of call apart:
 * the topic guard (no tools, no stream), tool selection (`tools`) and the streamed answer (`stream`).
 */
export function fakeAi(o: FakeAiOptions = {}) {
  return vi.fn(async (_model: string, input: { tools?: unknown; stream?: boolean }) => {
    if (o.fail) throw o.fail;
    if (input.stream) {
      return o.streamResult ?? sseStream(o.chunks ?? [{ response: o.reply ?? "ok" }]);
    }
    if (input.tools) return o.pick ?? { response: null, tool_calls: o.toolCalls ?? [] };
    return { choices: [{ message: { content: null, reasoning_content: o.verdict ?? "YES" } }] };
  });
}

type RunCall = [string, { messages: { role: string; content: string }[]; tools?: unknown; stream?: boolean }];

/** The calls a `fakeAi` received, split by kind. */
export function callsByKind(run: { mock: { calls: unknown[][] } }) {
  const calls = run.mock.calls as unknown as RunCall[];
  return {
    guard: calls.filter((c) => !c[1].tools && !c[1].stream),
    pick: calls.filter((c) => c[1].tools),
    answer: calls.filter((c) => c[1].stream),
  };
}
