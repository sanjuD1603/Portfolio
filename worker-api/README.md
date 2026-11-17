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
