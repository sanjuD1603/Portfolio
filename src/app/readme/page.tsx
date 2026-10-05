import {
  ArrowDown,
  CheckCircle2,
  Circle,
  Code2,
  Database,
  FolderTree,
  Globe,
  LayoutGrid,
} from "lucide-react";
import { PageHeader, Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";

const STACK = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS 4",
  "Shadcn UI",
  "MDX for long form content",
  "Biome",
];

const STRUCTURE = `src/
├─ app/                     Every page on the site
│  ├─ page.tsx               Home page
│  ├─ about/                 About, skills, awards, certificates
│  ├─ education/             Education page
│  ├─ experience/            Work experience
│  ├─ projects/               Projects page
│  │  └─ [slug]/              One project's own page
│  ├─ blog/                   Blog post list
│  │  └─ [slug]/              One blog post
│  ├─ gallery/                Photo gallery
│  └─ readme/                 This page
├─ components/                Buttons, cards, the navbar and other shared pieces
├─ data/
│  ├─ projects/                A text file per project
│  └─ blog/                    A text file per blog post
├─ lib/                       Small scripts that read and organize the content
│  └─ data.ts                  My info: profile, education, experience, skills, awards
└─ app/globals.css            Colors, fonts and overall look`;

const TOC = [
  {
    page: "Home",
    detail: "A short introduction to the portfolio and a quick summary of who I am.",
  },
  {
    page: "About",
    detail: "My background, interests and the skills I bring to software engineering.",
  },
  {
    page: "Education",
    detail: "My academic history, including the postgraduate course I am on now and what I studied before it.",
  },
  {
    page: "Experience",
    detail: "My professional knowledge, shown through real roles, day to day work and the technology I have used.",
  },
  {
    page: "Projects",
    detail: "Individual software projects, each with its own page and a link to the code.",
  },
  {
    page: "Blog",
    detail: "Short articles about things I am learning or have learned while building software.",
  },
  {
    page: "Gallery",
    detail: "Photos from events and activities I have taken part in.",
  },
  {
    page: "Readme",
    detail: "This page, covering how the portfolio was discovered, designed, built and reviewed.",
  },
];

const PHASE_ONE = [
  "An intro section with my photo, title and social links",
  "A work experience list, with links to live sites",
  "A projects page with a link to each GitHub repo",
  "A blog with full written posts",
  "An education page with school logos",
  "An about page with skills, awards and certificates",
  "A photo gallery",
  "Light and dark mode",
  "A GitHub activity calendar",
  "A simple contact popup with email and a copy button",
  "Smooth scrolling and page transitions",
];

const PHASE_TWO = [
  "A real contact form with server-side validation (Zod) and email delivery via Resend, replacing the mailto popup",
  "A video gallery alongside the photo gallery, using the same carousel component",
  "Cal.com integration for automatic meeting and call scheduling, embedded directly in the contact flow",
  "Umami analytics integration to track page views and surface the most-visited sections",
  "A live chat or messaging widget",
  "Tag-based filtering and full-text search for blog posts",
  "Skill-based filtering for the projects grid",
  "An MDX or lightweight CMS driven content pipeline so content can be added without touching component code",
  "CI checks (lint, type-check, build) that run automatically on every push before changes go live",
  "A Lighthouse-driven performance and accessibility pass targeting Core Web Vitals",
];

const PIPELINE = [
  {
    icon: Database,
    title: "Content files",
    detail: "Project write ups, blog posts, and my basic info, like name and skills",
  },
  {
    icon: Code2,
    title: "Helper scripts",
    detail: "Small scripts that read those files and organize the info",
  },
  {
    icon: LayoutGrid,
    title: "Pages",
    detail: "About, Education, Experience, Projects, Blog, Gallery, and more",
  },
  {
    icon: FolderTree,
    title: "Reusable pieces",
    detail: "Buttons, cards and the navbar. Shared across every page.",
  },
  {
    icon: Globe,
    title: "What you see",
    detail: "The finished site, in your browser",
  },
];

const SITE_PAGES = [
  "About",
  "Education",
  "Experience",
  "Projects",
  "Blog",
  "Gallery",
  "Readme",
];

const DEEPER_PAGES = [
  { parent: "Projects", child: "A single project's page" },
  { parent: "Blog", child: "A single blog post" },
];

const COMPONENT_ROOT = "Layout (root)";

const STRUCTURAL_COMPONENTS = ["Navbar", "PageHeader", "Section"];

const CONTENT_COMPONENTS = ["Badge", "Card", "GalleryCarousel", "Hero"];

const COMPONENTS = [
  {
    name: "Navbar",
    detail: "The navigation bar at the top of the site. Rendered once in the root layout, so every page gets it for free.",
  },
  {
    name: "PageHeader and Section",
    detail: "Keep each page's title and spacing consistent. Used on every page except Home, which uses Hero instead of PageHeader.",
  },
  {
    name: "Badge",
    detail: "A small label, used for skills, certificates, project tags and the notes on this page.",
  },
  {
    name: "Card",
    detail: "Used to lay out each entry on the projects page and inside the gallery carousel.",
  },
];

const PAGE_SET_ONE = ["Home", "About", "Education", "Experience", "Projects"];

const EVOLUTION = [
  {
    phase: "Basic stage",
    text: "At the start, the site was just the default Next.js starter page. There was no real content and no separate sections, just the basic setup.",
  },
  {
    phase: "First improvement",
    text: "I added one place to store my information and built out the main pages, About, Education, Experience, Projects, Blog and Gallery, so each page had real content instead of being empty.",
  },
  {
    phase: "Getting tidier",
    text: "As more pages were added, a few started repeating each other. I removed the ones that were not needed, like an old Journey page, and made the Home page shorter so it stopped repeating what the other pages already showed.",
  },
  {
    phase: "Making it useful",
    text: "After that, the focus moved from adding pages to making the existing content better. I added real links to live sites and GitHub repos, school logos on Education, and a linked certificate.",
  },
  {
    phase: "Mobile navigation",
    text: "The navbar originally squeezed all eight links into a single horizontally scrolling row, which was easy to miss on a phone. I rebuilt it so the full link list still shows on larger screens, but on mobile it collapses behind a hamburger button that opens a vertical menu instead.",
  },
  {
    phase: "Where it stands now",
    text: "The site today is simpler and more complete than when it started. There are fewer repeated sections, more working links, and this page to explain how it all came together.",
  },
];

const ENHANCEMENTS = [
  "Replace the mailto contact popup with a real form (Zod validation, Resend for delivery) and a Cal.com embed for direct meeting/call scheduling.",
  "Add a small video gallery alongside the photo gallery, reusing the existing GalleryCarousel component.",
  "Integrate Umami analytics to see which pages actually get traffic instead of guessing.",
  "Make the connection between the Experience page and the professional knowledge requirement clearer, maybe with a short note at the top of the page.",
  "Add CI checks (lint, type-check, build) that run on every push, so regressions are caught before they reach production.",
  "Run a Lighthouse pass targeting Core Web Vitals once the above ships, since performance work is more useful after the feature set stabilizes.",
  "Give someone who does not code a simple way to update small pieces of content without editing a file directly.",
];

export default function ReadmePage() {
  return (
    <main className="flex-1">
      <PageHeader
        title="Readme"
        subtitle="A plain explanation of how I discovered, designed, built and reviewed this portfolio."
      />

      <Section title="Overview">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          This is my personal portfolio site, built for the CS5709 Software
          Engineering Evolution module. Before writing any code, I looked at
          an example portfolio I was given, thought about what a software
          engineering portfolio actually needs to show, and used that to
          decide what this site should include.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Most of the content lives in one place. My profile, education and
          work history sit in a single file, and longer pieces, like project
          write ups and blog posts, live as separate text files. Each page
          simply reads from that content and lays it out, so changing
          something on the site usually means editing a file rather than
          rewriting a page.
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {STACK.map((s) => (
            <Badge key={s} variant="secondary" className="tag-inner-shadow">
              {s}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Discovery">
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Discovery was about deciding what this portfolio needed before I
          started building it. I looked at the reference portfolio I was
          given, noted what worked well and what did not feel necessary for
          my own background, and grouped what I wanted into two phases:
          things to build first, and things to add once the basics were
          working.
        </p>

        <h3 className="mb-3 text-sm font-semibold">Table of contents</h3>
        <ol className="mb-8 flex flex-col gap-3">
          {TOC.map((t, i) => (
            <li key={t.page} className="flex gap-3 text-sm">
              <span className="text-secondary w-5 shrink-0">{i + 1}.</span>
              <span>
                <span className="font-medium">{t.page}:</span>{" "}
                <span className="text-muted-foreground">{t.detail}</span>
              </span>
            </li>
          ))}
        </ol>

        <h3 className="mb-3 text-sm font-semibold">Build plan</h3>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <span className="text-secondary text-xs uppercase tracking-wide">
              Phase 1
            </span>
            <ul className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
              {PHASE_ONE.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-secondary text-xs uppercase tracking-wide">
              Phase 2
            </span>
            <ul className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
              {PHASE_TWO.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Design">
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          This section covers the architecture of the portfolio: how content
          moves through it, how a visitor gets from one page to another, and
          which pieces are shared across the site.
        </p>

        <h3 className="mb-3 text-sm font-semibold">Content flow</h3>
        <div className="mb-8 flex flex-col items-stretch gap-1">
          {PIPELINE.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center">
              <div className="skill-inner-shadow flex w-full max-w-xl items-center gap-3 rounded-xl p-4 ring-1 ring-foreground/10">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <step.icon className="size-4" />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{step.title}</span>
                  <span className="text-secondary text-xs">
                    {step.detail}
                  </span>
                </div>
              </div>
              {i < PIPELINE.length - 1 && (
                <ArrowDown className="text-secondary my-1 size-4 shrink-0" />
              )}
            </div>
          ))}
        </div>

        <h3 className="mb-3 text-sm font-semibold">
          How a visitor moves around
        </h3>
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The navigation bar sits on every page, so most pages are one click
          away from each other. The only exceptions are the project and blog
          post pages, which open one level deeper, after picking an item on
          the Projects or Blog page.
        </p>
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="skill-inner-shadow rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-foreground/10">
            Home
          </div>
          <ArrowDown className="text-secondary size-4" />
          <div className="flex flex-wrap justify-center gap-2">
            {SITE_PAGES.map((p) => (
              <div
                key={p}
                className="skill-inner-shadow rounded-xl px-3 py-1.5 text-xs ring-1 ring-foreground/10"
              >
                {p}
              </div>
            ))}
          </div>
          <ArrowDown className="text-secondary mt-2 size-4" />
          <div className="flex flex-wrap justify-center gap-2">
            {DEEPER_PAGES.map((d) => (
              <div
                key={d.parent}
                className="skill-inner-shadow rounded-xl px-3 py-1.5 text-xs ring-1 ring-foreground/10"
              >
                {d.child}
              </div>
            ))}
          </div>
        </div>

        <h3 className="mb-3 text-sm font-semibold">Component diagram</h3>
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          How shared components sit under the root layout. The structural
          layer wraps every page's content; the content layer is made up of
          smaller pieces those pages render inside that structure.
        </p>
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="skill-inner-shadow rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-foreground/10">
            {COMPONENT_ROOT}
          </div>
          <ArrowDown className="text-secondary size-4" />
          <div className="flex flex-wrap justify-center gap-2">
            {STRUCTURAL_COMPONENTS.map((c) => (
              <div
                key={c}
                className="skill-inner-shadow rounded-xl px-3 py-1.5 text-xs font-medium ring-1 ring-foreground/10"
              >
                {c}
              </div>
            ))}
          </div>
          <ArrowDown className="text-secondary mt-2 size-4" />
          <div className="flex flex-wrap justify-center gap-2">
            {CONTENT_COMPONENTS.map((c) => (
              <div
                key={c}
                className="skill-inner-shadow rounded-xl px-3 py-1.5 text-xs ring-1 ring-foreground/10"
              >
                {c}
              </div>
            ))}
          </div>
        </div>
        <ul className="mb-8 flex flex-col gap-3 text-sm">
          {COMPONENTS.map((c) => (
            <li key={c.name}>
              <span className="font-medium">{c.name}:</span>{" "}
              <span className="text-muted-foreground">{c.detail}</span>
            </li>
          ))}
        </ul>

        <h3 className="mb-3 text-sm font-semibold">Folder layout</h3>
        <pre className="skill-inner-shadow overflow-x-auto rounded-xl p-4 text-xs leading-relaxed ring-1 ring-foreground/10 sm:text-sm">
          <code>{STRUCTURE}</code>
        </pre>
      </Section>

      <Section title="Development (Iteration 1)">
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The first working version of the site had five pages: Home, About,
          Education, Experience and Projects. Alongside them I built the
          navigation bar as its own piece, shared by every page, and set up
          routing using the file based router that comes with Next.js, where
          each folder inside the app directory becomes a page on its own.
          Getting these five pages built and linked together through the
          navigation bar was the main goal of this stage.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PAGE_SET_ONE.map((p) => (
            <Badge key={p} variant="secondary" className="tag-inner-shadow">
              {p}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Development (Iteration 2)">
        <p className="mb-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Once the pages existed, the second stage was about making them look
          and work properly. I styled everything with Tailwind CSS, which
          kept spacing, color and type consistent across the whole site
          without repeating styles by hand. I added a light and dark theme,
          layouts that adjust for phone and desktop screens, and smooth
          scrolling and page transitions so moving between pages feels less
          sudden.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          On the routing side, I turned the simple pages from the first stage
          into something more flexible. One template now renders any project
          by reading its matching file, and the same approach is used for
          blog posts. The remaining pages, Blog, Gallery and Readme, were
          finished and linked into the navigation bar during this stage too.
        </p>
      </Section>

      <Section title="Evolution">
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The short version of how this site went from nothing to what it is
          today.
        </p>
        <ol className="flex flex-col gap-6">
          {EVOLUTION.map((e, i) => (
            <li key={e.phase} className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1">
                <span className="font-medium">{e.phase}</span>
                <p className="text-secondary text-sm leading-relaxed">
                  {e.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Evaluation">
        <h3 className="mb-3 text-sm font-semibold">Critical review</h3>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Looking back at what the assignment asked for, this portfolio
          covers most of it but not quite all of it. It has a working Home,
          About, Education and Experience section, which together act as the
          professional knowledge page, along with a projects area, a blog
          and a photo gallery. What it does not have yet is a separate video
          gallery, and the way to get in touch is a mailto popup rather than
          a real contact form or a scheduling flow. The approach of
          keeping short information in one file and longer write ups as
          separate text files has worked well and made every later change
          easier,
          which suggests the early decisions were reasonable even though not
          every required feature made it in yet.
        </p>

        <h3 className="mb-3 text-sm font-semibold">
          Enhancement suggestions
        </h3>
        <ul className="ml-4 list-disc space-y-2 text-sm leading-relaxed text-muted-foreground">
          {ENHANCEMENTS.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </Section>

      <Section title="Summary">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          This site started out as a plain starter template and slowly
          turned into a real portfolio, with one place holding all my
          information so every page stays in sync. The early work was about
          getting each section built. More recently I have focused on
          tidying things up, removing pages that repeated each other, and
          making the content that is already there more useful, like adding
          real links and logos. What comes next is less about adding new
          pages and more about closing the gaps this review pointed out, and
          making the site easier to keep updated.
        </p>
      </Section>
    </main>
  );
}
