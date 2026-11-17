import { profile } from "./data";
import type { Env } from "./env";

/** Strips CR/LF so visitor-controlled text can never inject extra email headers. */
export function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/**
 * Emails the portfolio owner via Resend. The recipient is always the owner -
 * visitor-supplied addresses are only ever used as `reply_to`, because they
 * are unverified and must never become a "to" address.
 * Returns whether Resend accepted the message; never throws.
 */
export async function sendOwnerEmail(
  env: Pick<Env, "RESEND_API_KEY" | "OWNER_EMAIL">,
  mail: { subject: string; text: string; replyTo?: string | null },
): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio chat <onboarding@resend.dev>",
        to: env.OWNER_EMAIL || profile.email,
        reply_to: mail.replyTo ?? undefined,
        subject: singleLine(mail.subject),
        text: mail.text,
      }),
    });
    if (!res.ok)
      console.error("resend delivery failed", res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error("resend request failed", err);
    return false;
  }
}
