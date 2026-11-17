# Dinesh Portfolio

Personal portfolio website: Home, About, Education, Experience, Projects, Blog, Gallery and a
Readme page documenting how the project itself was built. Content is separated from layout — most
pages read from structured data or MDX files rather than hardcoding text in components.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **Shadcn UI** for styling and interface components
- **GSAP** (+ ScrollTrigger) for hero/scroll-triggered reveals and the chat widget's open/close and
  message animations
- **MDX** (`next-mdx-remote`, `gray-matter`, Shiki syntax highlighting) for long-form project and
  blog content
- **Biome** for linting and formatting
- Built as a **static export** (`output: "export"` in `next.config.ts`) for GitHub Pages hosting

## Project structure

```
src/
├─ app/                      Every page on the site (Next.js file-based routing)
│  ├─ page.tsx                 Home
│  ├─ about/, education/,
│  │  experience/, gallery/,
│  │  readme/                  One folder per top-level page
│  ├─ projects/
│  │  ├─ page.tsx               Projects list
│  │  └─ [slug]/page.tsx        One project's detail page (reads its MDX file)
│  └─ blog/
│     ├─ page.tsx               Blog list
│     └─ [slug]/page.tsx        One blog post (reads its MDX file)
├─ components/                Reusable UI: navbar, cards, gallery carousel, shadcn primitives (ui/)
├─ data/
│  ├─ *.json                   Structured data: profile, education, experience, skills, awards,
│  │                           certificates, gallery — loaded via src/lib/data.ts
│  ├─ projects/*.mdx            One file per project (frontmatter + long-form write-up)
│  └─ blog/*.mdx                One file per blog post (frontmatter + long-form article)
└─ lib/                       Loaders for the content above: data.ts (JSON), content.ts (MDX + Zod
                             validation), mdx.ts (render options), assets.ts (base-path aware URLs)
```

`worker-api/` is a **separate, independently deployed** Cloudflare Worker (not part of the Next.js
app above) that hosts anything needing a server — an MCP server exposing portfolio data as tools,
a chat endpoint backed by Workers AI, and D1-backed contact/lead storage. Because this API is
public, it rate-limits new sessions/messages per IP, enforces a global daily cap as a circuit
breaker on API spend, and checks the request's `Origin` header against known front-ends — see
[`worker-api/README.md`](./worker-api/README.md)'s "Security model" section for the full picture;
it has its own `package.json` and deploys on its own CI/CD pipeline, independent of the static
frontend.

## Getting started

```bash
npm install
npm run dev       # start the dev server at http://localhost:3000
```

### Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build (static export to `out/`) |
| `npm run typecheck` | Generate Next route types, then run `tsc --noEmit` |
| `npm test` | Run the Vitest unit tests |
| `npm run lint` | Run Biome checks |
| `npm run format` | Auto-format with Biome |

## Environment variables

Copy `.env.local.example` to `.env.local` for the frontend, and `worker-api/.dev.vars.example` to
`worker-api/.dev.vars` for the Worker's local secrets. Both real files are gitignored.

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_WORKER_API_URL` | URL of the deployed Worker API; powers the chat widget (see `.env.local.example`) |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Optional. Enables Umami analytics; with no value no tracking script is loaded. `NEXT_PUBLIC_UMAMI_SRC` overrides the script URL for a self-hosted Umami |
| `NEXT_PUBLIC_BASE_PATH` | Sub-path when served from a GitHub Pages project site (e.g. `/Portfolio`). Leave unset locally and on a custom domain |

## Testing

`npm test` runs Vitest (frontend) and `cd worker-api && npm test` runs the Worker API tests.
They cover:

- **Content loading** - frontmatter validation (invalid metadata is rejected with an error naming
  the file and field), newest-first sorting, missing files, and that the real blog posts are complete.
- **Chat** - the state reducer, and the API round trip including failure paths.
- **API-failure handling** - the GitHub calendar shows a message instead of disappearing.
- **Worker API** - `/chat` (tool calls, model failure, input validation), `/messages` (D1 write,
  email delivery, "stored even if email fails", input validation), the per-IP and daily rate
  limits on `/sessions` and `/messages`, and the `Origin` check on state-changing routes.

## CI/CD

Three GitHub Actions workflows in `.github/workflows/`:

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `ci.yml` | Every push to `main` and every pull request | **Frontend:** `biome check`, typecheck, unit tests, static build. **Worker API:** typecheck, unit tests, `wrangler deploy --dry-run` bundle. Nothing is deployed. |
| `pages.yml` | Push to `main` (ignored when only `worker-api/` or Markdown changed) | Runs the tests, builds the static export with `NEXT_PUBLIC_BASE_PATH=/<repo>`, and deploys `out/` to GitHub Pages. |
| `ci.yml` > `lighthouse` job | After the frontend job passes | Builds the site and runs Lighthouse CI on four pages (`lighthouserc.json`). Fails if Performance < 90, Accessibility < 95 or SEO < 90; Best Practices < 90 only warns. Reports are kept as a workflow artifact, never uploaded publicly. |
| `worker-api.yml` | Push to `main` that touches `worker-api/` | Typechecks, tests, then `wrangler deploy` to Cloudflare Workers. |

The split is deliberate: the frontend is fully static, so it needs no server and is hosted on
GitHub Pages; only the chat, messaging and MCP features need a backend, so those live in a
separate Worker with its own deploy pipeline and secrets.

**One-time setup** (cannot be done from code):

1. Repository **Settings > Pages**: set *Source* to **GitHub Actions**.
2. Repository **Settings > Secrets and variables > Actions**:
   - secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (for `worker-api.yml`);
   - variable `WORKER_API_URL` - the deployed Worker's URL (for `pages.yml`).
3. Worker setup (`wrangler login`, create the D1 database, set the `RESEND_API_KEY` secret) is
   documented in [`worker-api/README.md`](./worker-api/README.md).

## Extras

- **Command palette:** press `Ctrl/⌘ + K` (or the Search button) to jump to any page, project or
  blog post. Fuzzy matching lives in `src/lib/command-search.ts` and is unit-tested.
- **Lighthouse CI:** see the CI/CD table above. Run it locally with `npm run build` then
  `npx @lhci/cli autorun`.
- **Umami analytics:** opt-in via `NEXT_PUBLIC_UMAMI_WEBSITE_ID` (see Environment variables).

## Adding content

- **New project**: add `src/data/projects/<slug>.mdx` with frontmatter (`name`, `summary`, `stack`,
  optionally `link`, `github`, `cover`, `date`) — it's picked up automatically, no new page needed.
- **New blog post**: add `src/data/blog/<slug>.mdx` with frontmatter (`title`, `date`, `summary`,
  optionally `tags`).
- **Profile/experience/skills/etc.**: edit the relevant file in `src/data/*.json`.
