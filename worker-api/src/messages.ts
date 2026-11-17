import { count, eq, and, gt } from "drizzle-orm";
import type { Context } from "hono";
import { z } from "zod";
import { sha256Hex } from "./crypto";
import { getDb, schema } from "./db";
import { sendOwnerEmail } from "./email";
import type { Env } from "./env";
import { startOfUtcDay } from "./rate-limit";

/** Per-IP cap on leads per hour - stops one client flooding the owner's inbox. */
export const MAX_MESSAGES_PER_IP_PER_HOUR = 5;
/** Global circuit breaker: once this many leads arrive across all IPs today, the rest wait until tomorrow. */
export const MAX_MESSAGES_PER_DAY = 50;

const MESSAGE_REQUEST_SCHEMA = z.object({
  name: z.string().trim().max(200).optional(),
  email: z.string().trim().email().optional(),
  message: z.string().trim().min(1).max(4000),
});

/**
 * "Send this to Dinesh" action from the chat widget. Always stores the lead
 * in D1 first; email delivery via Resend is best-effort and must not lose
 * the lead if it fails.
 */
export async function handleMessage(c: Context<{ Bindings: Env }>) {
  const body = await c.req.json().catch(() => null);
  const parsed = MESSAGE_REQUEST_SCHEMA.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      400,
    );
  }

  const { name, email, message } = parsed.data;
  const db = getDb(c.env.DB);
  const now = new Date();
  const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
  const ipHash = await sha256Hex(ip);

  try {
    const [dailyTotal] = await db
      .select({ n: count() })
      .from(schema.messages)
      .where(gt(schema.messages.createdAt, startOfUtcDay(now)));
    if ((dailyTotal?.n ?? 0) >= MAX_MESSAGES_PER_DAY) {
      return c.json(
        { error: "Daily message limit reached. Try again tomorrow." },
        429,
      );
    }

    const [recent] = await db
      .select({ n: count() })
      .from(schema.messages)
      .where(
        and(
          eq(schema.messages.ipHash, ipHash),
          gt(
            schema.messages.createdAt,
            new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
          ),
        ),
      );
    if ((recent?.n ?? 0) >= MAX_MESSAGES_PER_IP_PER_HOUR) {
      return c.json({ error: "Too many messages sent. Try again later." }, 429);
    }

    await db.insert(schema.messages).values({
      name: name ?? null,
      email: email ?? null,
      message,
      ipHash,
      createdAt: now.toISOString(),
    });
  } catch (err) {
    console.error("failed to store message in D1", err);
    return c.json(
      { error: "Could not save your message. Please try again." },
      500,
    );
  }

  const emailed = await sendOwnerEmail(c.env, {
    subject: `New portfolio message${name ? ` from ${name}` : ""}`,
    text: message,
    replyTo: email,
  });

  return c.json({ stored: true, emailed });
}
