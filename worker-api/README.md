# worker-api

Standalone Cloudflare Worker, independent of the Next.js app at the repo root. The root app is a
static export (deployed to GitHub Pages), so anything that needs a server — the chatbot's MCP tools,
the Workers AI call, and the D1-backed contact/lead storage — lives here instead.

## Routes (built incrementally)

- `GET /mcp` — MCP server (Agents SDK) exposing portfolio data as tools: `getProjects`, `getSkills`,
  `getExperience`, `getEducation`, `searchContent`.
- `POST /chat` — MCP client: calls Workers AI with tool-calling wired to the MCP tools above.
- `POST /messages` — stores a "send to Dinesh" lead in D1 and emails it via Resend.

## Local development

```bash
npm install
npm run dev       # wrangler dev, local Worker on http://localhost:8787
npm run typecheck
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
3. `npx wrangler d1 execute dinesh-portfolio-leads --remote --file=./schema.sql` — creates the
   `messages` table.
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
