import {
  Code2,
  Database,
  FolderTree,
  Globe,
  LayoutGrid,
  type LucideIcon,
  Server,
} from "lucide-react";

export const STACK = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS 4",
  "Shadcn UI",
  "MDX for long form content",
  "Biome",
];

export const STRUCTURE = `src/
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

export const TOC: { page: string; detail: string }[] = [
  {
    page: "Home",
    detail:
      "A short introduction to the portfolio and a quick summary of who I am.",
  },
  {
    page: "About",
    detail:
      "My background, interests and the skills I bring to software engineering.",
  },
  {
    page: "Education",
    detail:
      "My academic history, including the postgraduate course I am on now and what I studied before it.",
  },
  {
    page: "Experience",
    detail:
      "My professional knowledge, shown through real roles, day to day work and the technology I have used.",
  },
  {
    page: "Projects",
    detail:
      "Individual software projects, each with its own page and a link to the code.",
  },
  {
    page: "Blog",
    detail:
      "Short articles about things I am learning or have learned while building software.",
  },
  {
    page: "Gallery",
    detail: "Photos from events and activities I have taken part in.",
  },
  {
    page: "Readme",
    detail:
      "This page, covering how the portfolio was discovered, designed, built and reviewed.",
  },
];

export const PHASE_ONE = [
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

export const PHASE_TWO = [
  "A real contact form with server-side validation (Zod) and email delivery via Resend, replacing the mailto popup",
  "A video gallery alongside the photo gallery, using the same carousel component",
  "Cal.com integration for automatic meeting and call scheduling, embedded directly in the contact flow",
  "Umami analytics integration to track page views and surface the most-visited sections",
  "A live chat or messaging widget",
  "Tag-based filtering and full-text search for blog posts",
  "Skill-based filtering for the projects grid",
  "CI checks (lint, type-check, build) that run automatically on every push before changes go live",
  "A Lighthouse-driven performance and accessibility pass targeting Core Web Vitals",
];

export const PIPELINE: { icon: LucideIcon; title: string; detail: string }[] = [
  {
    icon: Database,
    title: "Content files",
    detail: "Projects, blog posts and profile info",
  },
  {
    icon: Code2,
    title: "Helper scripts",
    detail: "Read the files and organise them",
  },
  {
    icon: LayoutGrid,
    title: "Pages",
    detail: "About, Projects, Blog and the rest",
  },
  {
    icon: FolderTree,
    title: "Reusable pieces",
    detail: "Navbar, cards and badges, shared by every page",
  },
  {
    icon: Globe,
    title: "What you see",
    detail: "The finished site in your browser",
  },
  {
    icon: Server,
    title: "Worker API + D1 (beyond the browser)",
    detail:
      "The chat widget and the lead form reach past the static site to a separate Cloudflare Worker (worker-api/), which reads and writes a D1 database - see the chatbot diagram below for the full path.",
  },
];

export const SITE_PAGES = [
  "About",
  "Education",
  "Experience",
  "Projects",
  "Blog",
  "Gallery",
  "Readme",
];

export const DEEPER_PAGES: { parent: string; child: string }[] = [
  { parent: "Projects", child: "A single project's page" },
  { parent: "Blog", child: "A single blog post" },
];

export const COMPONENT_ROOT = "Layout (root)";

export const STRUCTURAL_COMPONENTS = [
  "Navbar",
  "PageHeader",
  "Section",
  "ChatWidget",
];

export const CONTENT_COMPONENTS = ["Badge", "Card", "GalleryCarousel", "Hero"];

export const PAGE_SET_ONE = [
  "Home",
  "About",
  "Education",
  "Experience",
  "Projects",
];

export const EVOLUTION: { phase: string; text: string }[] = [
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

export const ENHANCEMENTS = [
  "Replace the mailto contact popup with a real form (Zod validation, Resend for delivery) and a Cal.com embed for direct meeting/call scheduling.",
  "Add a small video gallery alongside the photo gallery, reusing the existing GalleryCarousel component.",
  "Integrate Umami analytics to see which pages actually get traffic instead of guessing.",
  "Make the connection between the Experience page and the professional knowledge requirement clearer, maybe with a short note at the top of the page.",
  "Add CI checks (lint, type-check, build) that run on every push, so regressions are caught before they reach production.",
  "Run a Lighthouse pass targeting Core Web Vitals once the above ships, since performance work is more useful after the feature set stabilizes.",
  "Give someone who does not code a simple way to update small pieces of content without editing a file directly.",
];

/** A representative visitor, used to justify why each feature exists. */
export type Persona = {
  id: string;
  name: string;
  goal: string;
  scenario: string;
};

/**
 * Personas for requirements discovery. Each feature in {@link FEATURES} names
 * the persona(s) it serves, so every feature traces back to a user need.
 */
export const PERSONAS: Persona[] = [
  {
    id: "recruiter",
    name: "Recruiter",
    goal: "Decide in a couple of minutes whether to shortlist me.",
    scenario:
      "Opens the site from a CV link, skims experience and skills, downloads the resume and wants a quick way to get in touch.",
  },
  {
    id: "hiring-manager",
    name: "Hiring manager",
    goal: "Judge the depth of my technical work.",
    scenario:
      "Reads project write-ups and blog posts, filters projects by technology and asks the assistant about specific experience before booking a call.",
  },
  {
    id: "academic-reviewer",
    name: "Academic reviewer",
    goal: "Check the portfolio against the module's requirements and engineering practice.",
    scenario:
      "Reads the Readme page, inspects the repository, CI pipeline and tests, and verifies that peer-review feedback was acted on.",
  },
];

export type FeaturePriority = "Must" | "Should" | "Could";
export type FeatureStatus = "Done" | "In progress" | "Planned";

/** A feature with its MoSCoW priority, the personas it serves and its current status. */
export type Feature = {
  name: string;
  priority: FeaturePriority;
  personas: string[];
  status: FeatureStatus;
};

/** Persona ids used in {@link FEATURES}: R = recruiter, H = hiring manager, A = academic reviewer. */
export const FEATURES: Feature[] = [
  {
    name: "Experience, education and about pages",
    priority: "Must",
    personas: ["recruiter", "hiring-manager"],
    status: "Done",
  },
  {
    name: "Projects and blog with complete content",
    priority: "Must",
    personas: ["hiring-manager", "academic-reviewer"],
    status: "Done",
  },
  {
    name: "Photo and video gallery",
    priority: "Must",
    personas: ["academic-reviewer"],
    status: "Done",
  },
  {
    name: "Instant messaging (chat widget that reaches me)",
    priority: "Must",
    personas: ["recruiter", "hiring-manager"],
    status: "Done",
  },
  {
    name: "Light/dark mode, responsive layout, smooth transitions",
    priority: "Should",
    personas: ["recruiter", "hiring-manager"],
    status: "Done",
  },
  {
    name: "Project filter and blog search",
    priority: "Should",
    personas: ["hiring-manager"],
    status: "Done",
  },
  {
    name: "AI assistant grounded in portfolio data (MCP + Workers AI)",
    priority: "Should",
    personas: ["recruiter", "hiring-manager"],
    status: "Done",
  },
  {
    name: "Automated tests and CI checks on every push",
    priority: "Should",
    personas: ["academic-reviewer"],
    status: "In progress",
  },
  {
    name: "Live deployment (GitHub Pages + Worker API)",
    priority: "Should",
    personas: ["recruiter", "academic-reviewer"],
    status: "In progress",
  },
  {
    name: "Cal.com call scheduling",
    priority: "Could",
    personas: ["recruiter", "hiring-manager"],
    status: "In progress",
  },
  {
    name: "Command palette (Ctrl/⌘ K) across pages, projects and posts",
    priority: "Could",
    personas: ["recruiter", "hiring-manager"],
    status: "Done",
  },
  {
    name: "Umami analytics (opt-in; needs a website ID)",
    priority: "Could",
    personas: ["academic-reviewer"],
    status: "In progress",
  },
  {
    name: "Lighthouse CI performance and accessibility budget",
    priority: "Could",
    personas: ["academic-reviewer"],
    status: "In progress",
  },
];
