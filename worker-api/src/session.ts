import { and, count, eq, gt } from "drizzle-orm";
import type { Context } from "hono";
import { z } from "zod";
import { generateToken, sha256Hex } from "./crypto";
import { type Db, getDb, schema } from "./db";
import type { Env } from "./env";
import { startOfUtcDay } from "./rate-limit";

/** How long a visitor's token stays valid. */
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
/** Per-IP cap on new sessions per hour - stops one client minting unlimited sessions. */
export const MAX_SESSIONS_PER_IP_PER_HOUR = 5;
/** Global circuit breaker: once this many sessions start across all IPs today, the rest wait until tomorrow. */
export const MAX_SESSIONS_PER_DAY = 100;

const SESSION_REQUEST_SCHEMA = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
});

export type AuthedSession = typeof schema.sessions.$inferSelect;

/**
 * `POST /sessions` - starts a chat session for a visitor who gave a name and
 * email. Returns an opaque bearer token; only its hash is stored.
 */
export async function handleCreateSession(c: Context<{ Bindings: Env }>) {
  const body = await c.req.json().catch(() => null);
  const parsed = SESSION_REQUEST_SCHEMA.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      400,
    );
  }

  const db = getDb(c.env.DB);
  const now = new Date();
  const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
  const ipHash = await sha256Hex(ip);

  try {
    const [dailyTotal] = await db
      .select({ n: count() })
      .from(schema.sessions)
      .where(gt(schema.sessions.createdAt, startOfUtcDay(now)));
    if ((dailyTotal?.n ?? 0) >= MAX_SESSIONS_PER_DAY) {
      return c.json(
        { error: "Daily chat limit reached. Try again tomorrow." },
        429,
      );
    }

    const [recent] = await db
      .select({ n: count() })
      .from(schema.sessions)
      .where(
        and(
          eq(schema.sessions.ipHash, ipHash),
          gt(
            schema.sessions.createdAt,
            new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
          ),
        ),
      );
    if ((recent?.n ?? 0) >= MAX_SESSIONS_PER_IP_PER_HOUR) {
      return c.json({ error: "Too many chats started. Try again later." }, 429);
    }

    const token = generateToken();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
    await db.insert(schema.sessions).values({
      id: crypto.randomUUID(),
      tokenHash: await sha256Hex(token),
      name: parsed.data.name,
      email: parsed.data.email,
      ipHash,
      createdAt: now.toISOString(),
      expiresAt,
      lastActivityAt: now.toISOString(),
    });
    return c.json({ sessionToken: token, expiresAt }, 201);
  } catch (err) {
    console.error("failed to create session", err);
    return c.json({ error: "Could not start the chat. Try again." }, 500);
  }
}

/**
 * Resolves `Authorization: Bearer <token>` to a live session, or null.
 * The session is derived here on the server - it is never taken from the
 * request body or from anything the model produces.
 */
export async function authenticate(
  db: Db,
  authorization: string | undefined,
  now = new Date(),
): Promise<AuthedSession | null> {
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!match) return null;
  const [row] = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.tokenHash, await sha256Hex(match[1])))
    .limit(1);
  if (!row || row.expiresAt <= now.toISOString()) return null;
  return row;
}
