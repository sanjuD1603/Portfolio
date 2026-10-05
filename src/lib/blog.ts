import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src/data/blog");

export type BlogFrontmatter = {
  title: string;
  date: string;
  summary: string;
  tags?: string[];
};

export type BlogPost = BlogFrontmatter & { slug: string };

function readSlugs() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
}

export function getAllBlogPosts(): BlogPost[] {
  return readSlugs()
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
      const { data } = matter(raw);
      return { slug, ...(data as BlogFrontmatter) };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(
  slug: string,
): { frontmatter: BlogFrontmatter; content: string } | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { frontmatter: data as BlogFrontmatter, content };
}
