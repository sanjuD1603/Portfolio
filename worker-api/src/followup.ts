import { and, asc, eq, exists, inArray, isNull, lt } from "drizzle-orm";
import { type Db, getDb, schema } from "./db";
import { sendOwnerEmail } from "./email";
import type { Env } from "./env";

/** A chat counts as abandoned after this long without activity. */
export const INACTIVITY_MS = 30 * 60 * 1000;
/** Sessions (and their transcripts) are deleted after this long. */
export const RETENTION_MS = 60 * 24 * 60 * 60 * 1000;
/** Bounds the work and the email volume of a single cron run. */
const BATCH_SIZE = 20;

export function formatTranscript(
  session: { name: string; email: string; createdAt: string },
  turns: { role: string; content: string; createdAt: string }[],
): string {
  const lines = turns.map(
    (t) =>
      `[${t.createdAt}] ${t.role === "user" ? "Visitor" : "Assistant"}: ${t.content}`,
  );
  return [
    `${session.name} <${session.email}> (email is unverified, as typed by the visitor)`,
    `Chat started ${session.createdAt} and went quiet.`,
    "",
    ...lines,
  ].join("\n");
}

/**
 * Emails the owner a transcript of every chat that has gone quiet. A session
 * is marked `emailed_at` only after Resend accepts the mail, so a failed send
 * is retried on the next run; new visitor activity clears the mark.
 */
export async function emailAbandonedChats(
  env: Env,
  now = new Date(),
  db: Db = getDb(env.DB),
): Promise<number> {
  const cutoff = new Date(now.getTime() - INACTIVITY_MS).toISOString();
  const quiet = await db
    .select()
    .from(schema.sessions)
    .where(
      and(
        lt(schema.sessions.lastActivityAt, cutoff),
        isNull(schema.sessions.emailedAt),
        exists(
          db
            .select({ one: schema.chatMessages.id })
            .from(schema.chatMessages)
            .where(
              and(
                eq(schema.chatMessages.sessionId, schema.sessions.id),
                eq(schema.chatMessages.role, "user"),
              ),
            ),
        ),
      ),
    )
    .orderBy(asc(schema.sessions.lastActivityAt))
    .limit(BATCH_SIZE);

  let sent = 0;
  for (const session of quiet) {
    const turns = await db
      .select({
        role: schema.chatMessages.role,
        content: schema.chatMessages.content,
        createdAt: schema.chatMessages.createdAt,
      })
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.sessionId, session.id))
      .orderBy(asc(schema.chatMessages.id));

    const ok = await sendOwnerEmail(env, {
      subject: `Unfinished chat with ${session.name}`,
      text: formatTranscript(session, turns),
      replyTo: session.email,
    });
    if (!ok) continue;
    await db
      .update(schema.sessions)
      .set({ emailedAt: now.toISOString() })
      .where(eq(schema.sessions.id, session.id));
    sent++;
  }
  return sent;
}

/** Deletes sessions older than {@link RETENTION_MS} together with their transcripts. */
export async function purgeExpiredSessions(
  env: Env,
  now = new Date(),
  db: Db = getDb(env.DB),
): Promise<void> {
  const cutoff = new Date(now.getTime() - RETENTION_MS).toISOString();
  const old = db
    .select({ id: schema.sessions.id })
    .from(schema.sessions)
    .where(lt(schema.sessions.createdAt, cutoff));
  // Explicit child delete as well as ON DELETE CASCADE, so correctness doesn't hinge on FK enforcement.
  await db.batch([
    db
      .delete(schema.chatMessages)
      .where(inArray(schema.chatMessages.sessionId, old)),
    db.delete(schema.sessions).where(lt(schema.sessions.createdAt, cutoff)),
  ]);
}

/** Cron Trigger entry point (see `triggers.crons` in wrangler.jsonc). */
export async function runScheduled(env: Env): Promise<void> {
  try {
    await emailAbandonedChats(env);
  } catch (err) {
    console.error("emailAbandonedChats failed", err);
  }
  try {
    await purgeExpiredSessions(env);
  } catch (err) {
    console.error("purgeExpiredSessions failed", err);
  }
}
