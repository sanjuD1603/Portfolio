export const profile = {
  name: "Mogili Dinesh Reddy",
  role: "Full Stack Developer",
  intro:
    "I build production-grade web apps with Next.js, TypeScript and edge infrastructure. Currently shipping a recruitment platform on Cloudflare Workers at SJDigitech.",
  email: "sanjudinesh169@gmail.com",
  phone: "+91 7989302843",
  github: "https://github.com/SanjuD1603",
  linkedin: "https://www.linkedin.com/in/mogili-dinesh-reddy",
  location: "Hyderabad, India",
  avatar: "/avatar.png" as string | null,
  resumeUrl: "/resume.pdf",
};

export const socialLinks = [
  { name: "GitHub", href: profile.github },
  { name: "LinkedIn", href: profile.linkedin },
  { name: "Email", href: `mailto:${profile.email}` },
];

export const certificates: {
  title: string;
  date: string;
  image: string;
  link?: string;
}[] = [
  {
    title: "NVIDIA Deep Learning Institute (DLI) — Deep Learning Fundamentals",
    date: "Mar 2024",
    image: "/certificates/placeholder.svg",
  },
  {
    title: "Cloud Computing Course Completion",
    date: "Oct 2024",
    image: "/certificates/placeholder.svg",
    link: "https://drive.google.com/file/d/17OpLzCgo4is3E56ATt5TJjHswR56Tdxx/view?usp=sharing",
  },
];

export const galleryEvents: {
  title: string;
  description: string;
  images: string[];
}[] = [
  {
    title: "Dev Fest",
    description:
      "Google Developer Groups DevFest — a day of talks, workshops and networking with the local developer community.",
    images: [
      "/dev-fest/01.png",
      "/dev-fest/02.png",
      "/dev-fest/03.png",
      "/dev-fest/04.png",
    ],
  },
];

export const education = [
  {
    school: "University of Limerick",
    degree: "MSc in Software Engineering",
    period: "2025 – 2026",
    logo: "/education/university-of-limerick.png",
  },
  {
    school: "IIIT Vadodara – ICD",
    degree: "Bachelor of Computer Science",
    period: "2021 – 2025",
    logo: "/education/iiit-vadodara.png",
  },
  {
    school: "Sri Chaitanya IIT Academy, Hyderabad",
    degree: "Telangana State Board of Intermediate Education",
    period: "2019 – 2021",
    logo: "/education/sri-chaitanya.png",
  },
];

export const experience = [
  {
    role: "Full Stack Developer",
    company: "SJ Digitech Pvt Ltd",
    period: "Aug 2025 – Aug 2026",
    location: "Hyderabad, India",
    link: "https://frontend-hrms.sjdigitech.workers.dev/login",
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
    points: [
      "Architected a production-grade recruitment platform using Next.js (SSR) and Hono.js on Cloudflare Workers, optimizing for edge-level performance and real-world user experience.",
      "Migrated and optimized the database from MySQL to Cloudflare D1 (SQLite), achieving a 99.9% reduction in storage (5.3 GB to 5 MB) through data cleanup and moving large assets to Cloudflare R2.",
      "Integrated Cloudflare R2 for resume storage to offload large binary files from the database, and built server-side paginated, filterable and virtualized data interfaces to handle 2K+ records.",
      "Developed and deployed a full-stack social welfare platform using Next.js and MongoDB, with secure donation workflows, volunteer recruitment and modern UI with Shadcn UI and Aceternity UI.",
    ],
  },
  {
    role: "Full Stack Developer (Intern)",
    company: "Oruphones, Mobilics India Private Limited",
    period: "Feb 2025 – Aug 2025",
    location: "Remote, India",
    link: "https://www.oruphones.com/",
    stack: [
      "Next.js",
      "Node.js",
      "Express",
      "MongoDB",
      "Tailwind CSS",
      "ShadCN UI",
    ],
    points: [
      "Redesigned core pages of Oruphones.com (Phase 2) with Next.js, Tailwind CSS and ShadCN, improving UI/UX, responsiveness, component reusability and page load performance.",
      "Strengthened backend reliability by fixing routing and search issues, resolving location-based 404 errors and implementing secure Google reCAPTCHA authentication.",
      "Delivered major SEO improvements (URL restructuring, canonical tags, 301 redirects, metadata) and fixed critical bugs using regex and state optimization.",
    ],
  },
  {
    role: "Research Intern – Electronic Health Records",
    company: "Dept. of CSE, National Institute of Technology Warangal",
    period: "May 2025 – Jul 2025",
    location: "Warangal, India",
    stack: [
      "React.js",
      "Solidity",
      "IPFS",
      "Pinata",
      "Web3.js",
      "MetaMask",
      "Ganache",
    ],
    points: [
      "Architected a decentralized health record system using Solidity and IPFS with Pinata for distributed storage, reducing record retrieval delays by 20%.",
      "Integrated RBAC and appointment booking through a responsive React.js interface with Web3-based smart contract communication for secure, role-specific interactions.",
    ],
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

export const awards = [
  {
    date: "2024",
    title:
      "Served as Indoor Club President, leading and organizing multiple events and initiatives.",
  },
  { date: "Oct 2024", title: "Cloud Computing course completion certificate." },
  {
    date: "Dec 2024",
    title: "Winner of the “Capture the Flag” technical competition.",
  },
  {
    date: "Mar 2024",
    title:
      "NVIDIA Deep Learning Institute (DLI) certification in deep learning fundamentals.",
  },
];
