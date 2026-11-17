# Dinesh Portfolio

Personal portfolio website: Home, About, Education, Experience, Projects, Blog, Gallery and a
Readme page documenting how the project itself was built. Content is separated from layout — most
pages read from structured data or MDX files rather than hardcoding text in components.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **Shadcn UI** for styling and interface components
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
└─ lib/                       Loaders that read the content above (data.ts, project.ts, blog.ts, mdx.ts)
```

`worker-api/` is a **separate, independently deployed** Cloudflare Worker (not part of the Next.js
app above) that hosts anything needing a server — an MCP server exposing portfolio data as tools,
a chat endpoint backed by Workers AI, and D1-backed contact/lead storage. See
[`worker-api/README.md`](./worker-api/README.md) for details; it has its own `package.json` and
deploys on its own CI/CD pipeline, independent of the static frontend.

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
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run Biome checks |
| `npm run format` | Auto-format with Biome |

## Adding content

- **New project**: add `src/data/projects/<slug>.mdx` with frontmatter (`name`, `summary`, `stack`,
  optionally `link`, `github`, `cover`, `date`) — it's picked up automatically, no new page needed.
- **New blog post**: add `src/data/blog/<slug>.mdx` with frontmatter (`title`, `date`, `summary`,
  optionally `tags`).
- **Profile/experience/skills/etc.**: edit the relevant file in `src/data/*.json`.
