import awardsData from "@/data/awards.json";
import certificatesData from "@/data/certificates.json";
import educationData from "@/data/education.json";
import experienceData from "@/data/experience.json";
import galleryData from "@/data/gallery.json";
import profileData from "@/data/profile.json";
import skillsData from "@/data/skills.json";

export type Profile = {
  name: string;
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

export const socialLinks = [
  { name: "GitHub", href: profile.github },
  { name: "LinkedIn", href: profile.linkedin },
  { name: "Email", href: `mailto:${profile.email}` },
];

export type Certificate = {
  title: string;
  date: string;
  image: string;
  link?: string;
};

export const certificates: Certificate[] = certificatesData;

export type GalleryEvent = {
  title: string;
  description: string;
  images: string[];
};

export const galleryEvents: GalleryEvent[] = galleryData;

export type Education = {
  school: string;
  degree: string;
  period: string;
  logo: string;
};

export const education: Education[] = educationData;

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

export type SkillGroup = {
  group: string;
  items: string[];
};

export const skills: SkillGroup[] = skillsData;

export type Award = {
  date: string;
  title: string;
};

export const awards: Award[] = awardsData;
