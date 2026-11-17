/**
 * Portfolio content owned by worker-api itself. worker-api is a separately
 * deployed Worker from the static frontend, so it keeps its own copy of the
 * data it needs to ground chatbot answers rather than importing across the
 * monorepo boundary at runtime. Keep this in sync with src/data/* by hand
 * when the portfolio content changes.
 */

export const profile = {
  name: "Mogili Dinesh Reddy",
  role: "Full Stack Developer",
  intro:
    "I build production-grade web apps with Next.js, TypeScript and edge infrastructure. Currently shipping a recruitment platform on Cloudflare Workers at SJDigitech.",
  email: "sanjudinesh169@gmail.com",
  github: "https://github.com/SanjuD1603",
  linkedin: "https://www.linkedin.com/in/mogili-dinesh-reddy-66023423a/",
  location: "Hyderabad, India",
};

export const education = [
  {
    school: "University of Limerick",
    degree: "MSc in Software Engineering",
    period: "2025 – 2026",
  },
  {
    school: "IIIT Vadodara – ICD",
    degree: "Bachelor of Computer Science",
    period: "2021 – 2025",
  },
  {
    school: "Sri Chaitanya IIT Academy, Hyderabad",
    degree: "Telangana State Board of Intermediate Education",
    period: "2019 – 2021",
  },
];

export const experience = [
  {
    role: "Full Stack Developer",
    company: "SJ Digitech Pvt Ltd",
    period: "Aug 2025 – Aug 2026",
    stack: [
      "Next.js",
      "Hono",
      "Cloudflare Workers",
      "Cloudflare D1",
      "Cloudflare R2",
      "TanStack Table",
      "Drizzle ORM",
      "Shadcn UI",
      "Tailwind CSS",
    ],
    summary:
      "Architected a production-grade recruitment platform using Next.js (SSR) and Hono.js on Cloudflare Workers. Migrated the database from MySQL to Cloudflare D1, cutting storage by 99.9% (5.3 GB to 5 MB), and built server-side paginated, filterable data interfaces handling 2K+ records.",
  },
  {
    role: "Full Stack Developer (Intern)",
    company: "Oruphones, Mobilics India Private Limited",
    period: "Feb 2025 – Aug 2025",
    stack: [
      "Next.js",
      "Node.js",
      "Express",
      "MongoDB",
      "Tailwind CSS",
      "ShadCN UI",
    ],
    summary:
      "Redesigned core pages of Oruphones.com with Next.js, Tailwind CSS and ShadCN. Fixed routing/search issues, resolved location-based 404 errors, added Google reCAPTCHA, and delivered SEO improvements (URL restructuring, canonical tags, redirects).",
  },
  {
    role: "Research Intern – Electronic Health Records",
    company: "Dept. of CSE, National Institute of Technology Warangal",
    period: "May 2025 – Jul 2025",
    stack: [
      "React.js",
      "Solidity",
      "IPFS",
      "Pinata",
      "Web3.js",
      "MetaMask",
      "Ganache",
    ],
    summary:
      "Architected a decentralized health record system using Solidity and IPFS with Pinata for distributed storage, reducing record retrieval delays by 20%. Integrated RBAC and appointment booking via Web3 smart contracts.",
  },
];

export const skills = [
  {
    group: "Languages",
    items: [
      "JavaScript",
      "TypeScript",
      "C++",
      "Solidity",
      "SQL",
      "Bash",
      "HTML",
      "CSS",
    ],
  },
  {
    group: "Frameworks",
    items: [
      "Next.js",
      "React.js",
      "Node.js",
      "Express.js",
      "Hono.js",
      "Tailwind CSS",
      "Drizzle ORM",
      "Zod",
      "TanStack Table",
    ],
  },
  {
    group: "Web3",
    items: [
      "Web3.js",
      "Ethers.js",
      "Hardhat",
      "Truffle",
      "Ganache",
      "Pinata IPFS",
      "Smart Contracts",
    ],
  },
  {
    group: "Databases",
    items: ["PostgreSQL", "MySQL", "SQLite (Cloudflare D1)", "MongoDB"],
  },
];

export const projects = [
  {
    name: "Ayoka — Skincare Assessment App",
    summary:
      "Cross-platform skincare analysis app with a 13-step multilingual questionnaire, animated onboarding and real-time AI analysis.",
    stack: ["React Native (Expo)", "NestJS", "PostgreSQL", "TypeScript"],
  },
  {
    name: "BetterBeBaked — E-Commerce",
    summary:
      "Full-stack bakery e-commerce platform with product variants, cart, wishlist, pre-orders and bulk orders.",
    stack: [
      "Next.js",
      "Shadcn",
      "Neon",
      "Drizzle ORM",
      "Better Auth",
      "Cloudflare",
    ],
    link: "https://betterbebaked.com/",
  },
  {
    name: "ChitOps — Chit Fund Management",
    summary:
      "Scalable chit fund backend supporting multiple chit types, slots, member participation and month-wise lifecycle tracking.",
    stack: [
      "Next.js",
      "Node.js",
      "Express.js",
      "Prisma ORM",
      "PostgreSQL",
      "Docker",
    ],
    github: "https://github.com/sanjuD1603/ChitOps",
  },
  {
    name: "MovieMagic",
    summary:
      "Movie ticket booking system on an optimized MySQL database with ER and relational schema design.",
    stack: ["HTML", "CSS", "JavaScript", "SQL", "Node.js", "Express.js"],
    github: "https://github.com/sanjuD1603/Movie-Magic",
  },
];

/** Case-insensitive substring search across projects, skills and experience. */
export function searchContent(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return { projects: [], skills: [], experience: [] };

  return {
    projects: projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.stack.some((s) => s.toLowerCase().includes(q)),
    ),
    skills: skills.filter(
      (g) =>
        g.group.toLowerCase().includes(q) ||
        g.items.some((i) => i.toLowerCase().includes(q)),
    ),
    experience: experience.filter(
      (e) =>
        e.role.toLowerCase().includes(q) ||
        e.company.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.stack.some((s) => s.toLowerCase().includes(q)),
    ),
  };
}
