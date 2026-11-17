import type { Context } from "hono";
import { z } from "zod";
import { getDb, schema } from "./db";
import { sendOwnerEmail } from "./email";
import type { Env } from "./env";

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

  try {
    await getDb(c.env.DB)
      .insert(schema.messages)
      .values({
        name: name ?? null,
        email: email ?? null,
        message,
        createdAt: new Date().toISOString(),
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
