/**
 * @file Typed loader for the portfolio's short, structured content.
 *
 * The raw data lives in `src/data/*.json` so it can be edited without touching
 * code; this module gives each file a TypeScript type and a named export.
 * (Long-form content - projects and blog posts - stays in MDX; see `content.ts`.)
 */
import awardsData from "@/data/awards.json";
import certificatesData from "@/data/certificates.json";
import educationData from "@/data/education.json";
import experienceData from "@/data/experience.json";
import galleryData from "@/data/gallery.json";
import openSourceData from "@/data/open-source.json";
import profileData from "@/data/profile.json";
import skillsData from "@/data/skills.json";

/** Owner details shown on the Home and About pages. `resumeUrl` is a path under `public/`. */
export type Profile = {
  name: string;
  /** Short form of `name` used for the navbar brand. */
  shortName: string;
  role: string;
  intro: string;
  email: string;
  github: string;
  linkedin: string;
  location: string;
  avatar: string | null;
  resumeUrl: string;
};

export const profile: Profile = profileData;

/** Links rendered in the hero; derived from {@link profile} so they cannot drift. */
export const socialLinks = [
  { name: "GitHub", href: profile.github },
  { name: "LinkedIn", href: profile.linkedin },
  { name: "Email", href: `mailto:${profile.email}` },
];

/** A certificate shown on the About page. */
export type Certificate = {
  title: string;
  date: string;
  image: string;
  link?: string;
};

export const certificates: Certificate[] = certificatesData;

/** A photo-gallery event: one carousel of `images` with a title and description. */
export type GalleryEvent = {
  title: string;
  description: string;
  images: string[];
};

export const galleryEvents: GalleryEvent[] = galleryData;

/** One entry on the Education page. `logo` is a path under `public/`. */
export type Education = {
  school: string;
  degree: string;
  period: string;
  logo: string;
};

export const education: Education[] = educationData;

/** One role on the Experience page. */
export type ExperienceEntry = {
  role: string;
  company: string;
  period: string;
  location: string;
  link?: string;
  stack: string[];
  points: string[];
};

export const experience: ExperienceEntry[] = experienceData;

/** A named group of skills (e.g. "Frontend") on the About page. */
export type SkillGroup = {
  group: string;
  items: string[];
};

export const skills: SkillGroup[] = skillsData;

/** An award shown on the About page. */
export type Award = {
  date: string;
  title: string;
};

export const awards: Award[] = awardsData;

/** One pull request or issue contributed to someone else's repository. */
export type OpenSourceContribution = {
  title: string;
  summary: string;
  url: string;
  /** Pull request or issue number in the upstream repo. */
  number: number;
  kind: "pull-request" | "issue";
  status: "merged" | "open" | "closed";
  /** ISO date the contribution was merged (or opened, if it was not merged). */
  date: string;
  additions?: number;
  deletions?: number;
};

/** An upstream project (not owned by the portfolio's author) with the contributions made to it. */
export type OpenSourceProject = {
  project: string;
  /** `owner/name` on GitHub. */
  repo: string;
  description: string;
  stack: string[];
  link?: string;
  contributions: OpenSourceContribution[];
};

export const openSource: OpenSourceProject[] =
  openSourceData as OpenSourceProject[];
