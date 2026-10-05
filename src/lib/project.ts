import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const PROJECTS_DIR = path.join(process.cwd(), "src/data/projects");

export type ProjectFrontmatter = {
  name: string;
  summary: string;
  stack: string[];
  link?: string;
  github?: string;
  cover?: string;
  date?: string;
};

export type ProjectEntry = ProjectFrontmatter & { slug: string };

function readSlugs() {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".mdx"));
}

export function getAllProjects(): ProjectEntry[] {
  return readSlugs()
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), "utf8");
      const { data } = matter(raw);
      return { slug, ...(data as ProjectFrontmatter) };
    })
    .sort((a, b) =>
      a.date && b.date
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : 0,
    );
}

export function getProject(
  slug: string,
): { frontmatter: ProjectFrontmatter; content: string } | null {
  const filePath = path.join(PROJECTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { frontmatter: data as ProjectFrontmatter, content };
}
