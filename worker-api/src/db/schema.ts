import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Leads sent through the chat widget's "Message me" form (`POST /messages`). */
export const messages = sqliteTable(
  "messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name"),
    email: text("email"),
    message: text("message").notNull(),
    /** Nullable: rows written before this column existed have none. */
    ipHash: text("ip_hash"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("messages_ip_created_idx").on(t.ipHash, t.createdAt)],
);

/**
 * One row per chat visitor. The bearer token that proves ownership of a
 * session is never stored - only its SHA-256 hash - so a leaked table cannot
 * be used to hijack a live session. `email` is visitor-supplied and unverified.
 */
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    tokenHash: text("token_hash").notNull().unique(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    ipHash: text("ip_hash").notNull(),
    createdAt: text("created_at").notNull(),
    expiresAt: text("expires_at").notNull(),
    lastActivityAt: text("last_activity_at").notNull(),
    /** Set once the transcript has been emailed to the owner; cleared on new activity. */
    emailedAt: text("emailed_at"),
  },
  (t) => [
    index("sessions_last_activity_idx").on(t.lastActivityAt),
    index("sessions_ip_created_idx").on(t.ipHash, t.createdAt),
  ],
);

/** The chat transcript, one row per turn. */
export const chatMessages = sqliteTable(
  "chat_messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["user", "assistant"] }).notNull(),
    content: text("content").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("chat_messages_session_idx").on(t.sessionId, t.id)],
);
