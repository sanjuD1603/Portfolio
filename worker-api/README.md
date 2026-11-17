# worker-api

Standalone Cloudflare Worker, independent of the Next.js app at the repo root. The root app is a
static export (deployed to GitHub Pages), so anything that needs a server — the chatbot's MCP tools,
the Workers AI call, and the D1-backed contact/lead storage — lives here instead.

## Routes (built incrementally)

- `GET /mcp` — MCP server (Agents SDK) exposing portfolio data as tools: `getProjects`, `getSkills`,
  `getExperience`, `getEducation`, `searchContent`.
- `POST /sessions` — `{ name, email }` → starts a chat session and returns an opaque bearer
  `sessionToken` (only its SHA-256 hash is stored). Limited to 5 new sessions per IP per hour.
- `POST /chat` — requires `Authorization: Bearer <sessionToken>`. Replays the session's stored
  history to Workers AI (tool-calling wired to the read-only portfolio tools above), stores both
  turns, and returns `{ reply }`. Max 50 visitor messages per session.
- `GET /chat/history` — same auth; returns `{ name, messages }` so the widget can resume after a reload.
- `POST /messages` — stores a "send to Dinesh" lead in D1 and emails it via Resend.
- **Cron (every 10 min)** — emails the owner a transcript of every chat idle for 30+ minutes
  (once per quiet spell; retried if Resend fails) and deletes sessions older than 60 days.

### Security model

- The session is resolved **server-side from the bearer token**, never from the request body or
  from anything the model says. History is loaded by that session id, so visitors can't read each
  other's chats.
- The model only has **read-only tools over public portfolio data**. It has no tool that touches
  sessions, the database or email, so prompt injection can't make it send mail or leak records.
  The follow-up email is sent by plain code, always **to the owner** - the visitor's (unverified)
  address is only used as `reply_to`.
- Visitor-supplied text is stripped of CR/LF before it reaches an email subject.
- Tokens are 256-bit random, expire after 24 h, and are stored hashed. IPs are stored hashed.

## Database (Drizzle + D1)

Schema lives in `src/db/schema.ts`. After changing it:

```bash
npm run db:generate          # writes a new SQL file to migrations/
npm run db:migrate:local     # apply to the local D1 used by `npm run dev`
npm run db:migrate:remote    # apply to the real D1 (CI does this before each deploy)
```

## Local development

```bash
npm install
npm run db:migrate:local   # once, creates the tables in the local D1
npm run dev                # wrangler dev, local Worker on http://localhost:8787
npm run typecheck
npm test
curl "http://localhost:8787/cdn-cgi/handler/scheduled"   # run the follow-up cron by hand
```

## Deployment

Deployed independently from the frontend via `.github/workflows/worker-api.yml`, triggered only on
changes under `worker-api/**`. Requires a `CLOUDFLARE_API_TOKEN` repo secret (and, once added, the AI
binding, D1 binding and `RESEND_API_KEY` secret for the chat/messages routes).

## Manual setup before going live

This code is written and typechecked, but cannot be deployed or tested against real Cloudflare
resources without account access. Before the chat/messages routes will work in production, a human
with Cloudflare account access needs to:

1. `npx wrangler login` — authenticate wrangler with the Cloudflare account that will host this.
2. `npx wrangler d1 create dinesh-portfolio-leads` — creates the D1 database; copy the returned
   `database_id` into `wrangler.jsonc`'s `d1_databases[0].database_id` (currently a placeholder:
   `REPLACE_WITH_REAL_D1_DATABASE_ID`).
3. `npm run db:migrate:remote` — creates the tables (`messages`, `sessions`, `chat_messages`).
4. Sign up for [Resend](https://resend.com), get an API key, then run
   `npx wrangler secret put RESEND_API_KEY` and paste it in. (The `from` address in
   `src/messages.ts` uses Resend's shared `onboarding@resend.dev` sender, which works without
   domain verification — swap it for a verified domain sender if one is set up later.)
5. The `AI` binding needs no setup — Workers AI is available by default on any Cloudflare account,
   with a free daily usage allocation.
6. `npm run deploy` (or let `.github/workflows/worker-api.yml` do it on push) to publish.
7. Once the static frontend's GitHub Pages URL is known, add it to the `cors()` origin list in
   `src/index.ts` (there's a comment marking where).

Until these steps are done, `/chat` and `/messages` will deploy but fail at runtime (missing D1
binding ID / secret) — the code fails loudly with a 500/502 rather than silently, by design.
