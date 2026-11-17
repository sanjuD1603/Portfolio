/**
 * @file Generic MDX content loader for the `projects` and `blog` collections.
 *
 * Long-form content lives as `.mdx` files with YAML frontmatter under
 * `src/data/<folder>/`. Each file is read at build time (the site is a static
 * export), its frontmatter is validated against a Zod schema, and the entries
 * are returned sorted newest-first. One generic implementation serves both
 * collections so validation and error handling exist in exactly one place.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/** Required/optional frontmatter fields for a project page. */
const projectFrontmatterSchema = z.object({
  name: z.string(),
  summary: z.string(),
  stack: z.array(z.string()),
  link: z.string().optional(),
  github: z.string().optional(),
  cover: z.string().optional(),
  date: z.string().optional(),
});

/** Required/optional frontmatter fields for a blog post. */
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

/** Selects which frontmatter schema is used to validate a file. */
type ContentType = "project" | "blog";

const SCHEMAS = {
  project: projectFrontmatterSchema,
  blog: blogFrontmatterSchema,
} satisfies Record<ContentType, z.ZodTypeAny>;

/** Absolute path of a content collection (resolved from the current working directory). */
function contentDir(folder: string) {
  return path.join(process.cwd(), "src/data", folder);
}

/** Lists the `.mdx` filenames in `dir`; returns `[]` if the folder does not exist. */
function readSlugs(dir: string) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
}

/**
 * Validates raw frontmatter against the schema for `type`.
 *
 * @param type - Collection the file belongs to.
 * @param slug - Filename without extension; only used to make errors actionable.
 * @param data - Untrusted frontmatter object produced by gray-matter.
 * @returns The validated frontmatter.
 * @throws Error naming the file and every invalid field when validation fails,
 *   so a bad content file fails the build loudly instead of rendering blanks.
 */
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

/**
 * Returns a new array sorted newest-first by `date`.
 * Items without a date sort last, consistently for every collection.
 */
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

/**
 * Loads and validates every entry of a collection.
 *
 * @param folder - Subfolder of `src/data` (e.g. `"projects"`).
 * @param type - Schema to validate each file against.
 * @returns Entries (`slug` + frontmatter) sorted newest-first; `[]` if the folder is missing.
 * @throws Error if any file has invalid frontmatter.
 */
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

/**
 * Loads a single entry by slug.
 *
 * @param folder - Subfolder of `src/data`.
 * @param slug - Filename without the `.mdx` extension.
 * @param type - Schema to validate the frontmatter against.
 * @returns The validated frontmatter plus the raw MDX body, or `null` if no such file exists.
 * @throws Error if the file exists but its frontmatter is invalid.
 */
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

/** All projects, newest first. */
export function getAllProjects(): ProjectEntry[] {
  return getAll<ProjectEntry>("projects", "project");
}

/** One project by slug, or `null` if it does not exist. */
export function getProject(slug: string) {
  return getOne<ProjectFrontmatter>("projects", slug, "project");
}

/** All blog posts, newest first. */
export function getAllBlogPosts(): BlogPost[] {
  return getAll<BlogPost>("blog", "blog");
}

/** One blog post by slug, or `null` if it does not exist. */
export function getBlogPost(slug: string) {
  return getOne<BlogFrontmatter>("blog", slug, "blog");
}
