import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const projectFrontmatterSchema = z.object({
  name: z.string(),
  summary: z.string(),
  stack: z.array(z.string()),
  link: z.string().optional(),
  github: z.string().optional(),
  cover: z.string().optional(),
  date: z.string().optional(),
});

const blogFrontmatterSchema = z.object({
  title: z.string(),
  date: z.string(),
  summary: z.string(),
  tags: z.array(z.string()).optional(),
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;
export type ProjectEntry = ProjectFrontmatter & { slug: string };

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;
export type BlogPost = BlogFrontmatter & { slug: string };

type ContentType = "project" | "blog";

const SCHEMAS = {
  project: projectFrontmatterSchema,
  blog: blogFrontmatterSchema,
} satisfies Record<ContentType, z.ZodTypeAny>;

function contentDir(folder: string) {
  return path.join(process.cwd(), "src/data", folder);
}

function readSlugs(dir: string) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
}

function parseFrontmatter<T>(
  type: ContentType,
  slug: string,
  data: unknown,
): T {
  const result = SCHEMAS[type].safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"} - ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid ${type} frontmatter in "${slug}": ${issues}`);
  }
  return result.data as T;
}

function sortByDateDesc<T extends { date?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aTime = a.date
      ? new Date(a.date).getTime()
      : Number.NEGATIVE_INFINITY;
    const bTime = b.date
      ? new Date(b.date).getTime()
      : Number.NEGATIVE_INFINITY;
    return bTime - aTime;
  });
}

export function getAll<T extends { slug: string; date?: string }>(
  folder: string,
  type: ContentType,
): T[] {
  const dir = contentDir(folder);
  const entries = readSlugs(dir).map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    const frontmatter = parseFrontmatter<Record<string, unknown>>(
      type,
      slug,
      data,
    );
    return { slug, ...frontmatter } as T;
  });
  return sortByDateDesc(entries);
}

export function getOne<T>(
  folder: string,
  slug: string,
  type: ContentType,
): { frontmatter: T; content: string } | null {
  const dir = contentDir(folder);
  const filePath = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = parseFrontmatter<T>(type, slug, data);
  return { frontmatter, content };
}

export function getAllProjects(): ProjectEntry[] {
  return getAll<ProjectEntry>("projects", "project");
}

export function getProject(slug: string) {
  return getOne<ProjectFrontmatter>("projects", slug, "project");
}

export function getAllBlogPosts(): BlogPost[] {
  return getAll<BlogPost>("blog", "blog");
}

export function getBlogPost(slug: string) {
  return getOne<BlogFrontmatter>("blog", slug, "blog");
}
