import type { CommandItem } from "@/lib/command-search";
import { getAllBlogPosts, getAllProjects } from "@/lib/content";
import { NAV_LINKS } from "@/lib/nav";

/**
 * Builds every palette entry (pages, projects, blog posts) from the same
 * sources the site itself uses, so a new MDX file shows up automatically.
 * Server-only: reads the content folders at build time.
 */
export function buildCommandItems(): CommandItem[] {
  return [
    ...NAV_LINKS.map((l) => ({
      id: `page:${l.href}`,
      label: l.label,
      href: l.href,
      group: "Pages" as const,
    })),
    ...getAllProjects().map((p) => ({
      id: `project:${p.slug}`,
      label: p.name,
      hint: p.summary,
      href: `/projects/${p.slug}`,
      group: "Projects" as const,
    })),
    ...getAllBlogPosts().map((b) => ({
      id: `blog:${b.slug}`,
      label: b.title,
      hint: b.summary,
      href: `/blog/${b.slug}`,
      group: "Blog" as const,
    })),
  ];
}
