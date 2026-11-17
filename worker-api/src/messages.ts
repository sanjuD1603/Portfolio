import type { Context } from "hono";
import { z } from "zod";
import { profile } from "./data";
import type { Env } from "./env";

const MESSAGE_REQUEST_SCHEMA = z.object({
  name: z.string().trim().max(200).optional(),
  email: z.string().trim().email().optional(),
  message: z.string().trim().min(1).max(4000),
});

/**
 * "Send this to Dinesh" action from the chat widget — the real fix for the
 * Phase 1 instant-messaging gap. Always stores the lead in D1 first; email
 * delivery via Resend is best-effort and must not lose the lead if it fails.
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

  let stored = false;
  try {
    await c.env.DB.prepare(
      "INSERT INTO messages (name, email, message, created_at) VALUES (?, ?, ?, ?)",
    )
      .bind(name ?? null, email ?? null, message, new Date().toISOString())
      .run();
    stored = true;
  } catch (err) {
    console.error("failed to store message in D1", err);
    return c.json(
      { error: "Could not save your message. Please try again." },
      500,
    );
  }

  let emailed = false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio chat <onboarding@resend.dev>",
        to: c.env.OWNER_EMAIL || profile.email,
        reply_to: email,
        subject: `New portfolio message${name ? ` from ${name}` : ""}`,
        text: message,
      }),
    });
    emailed = res.ok;
    if (!res.ok)
      console.error("resend delivery failed", res.status, await res.text());
  } catch (err) {
    console.error("resend request failed", err);
  }

  return c.json({ stored, emailed });
}
