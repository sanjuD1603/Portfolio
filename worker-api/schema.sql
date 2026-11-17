-- Leads/messages sent via the chat widget's "send this to Dinesh" action.
-- Apply with: wrangler d1 execute dinesh-portfolio-leads --remote --file=./schema.sql
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);
