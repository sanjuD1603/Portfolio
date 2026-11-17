import type { ProjectEntry } from "@/lib/content";

/** How the projects list can be ordered. */
export type ProjectSort = "newest" | "name";

/** Active filters on the projects page. */
export type ProjectFilters = {
  /** Free text, matched against name, summary and technologies. */
  query: string;
  /** A single technology the project must use, or `null` for any. */
  tech: string | null;
};

/**
 * Keeps the projects that match every active filter.
 * The text query is case-insensitive and matches the name, summary or any technology;
 * the technology filter requires an exact stack entry. The two combine with AND.
 *
 * @param projects - All projects.
 * @param filters - The active query and technology.
 */
export function filterProjects(
  projects: ProjectEntry[],
  { query, tech }: ProjectFilters,
): ProjectEntry[] {
  const q = query.trim().toLowerCase();
  return projects.filter((p) => {
    const matchesTech = !tech || p.stack.includes(tech);
    const matchesQuery =
      q.length === 0 ||
      p.name.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.stack.some((s) => s.toLowerCase().includes(q));
    return matchesTech && matchesQuery;
  });
}

/**
 * Returns a sorted copy of the projects. "newest" orders by `date` descending, with undated
 * projects last; "name" is alphabetical. Neither mutates the input.
 */
export function sortProjects(
  projects: ProjectEntry[],
  sort: ProjectSort,
): ProjectEntry[] {
  const copy = [...projects];
  if (sort === "name") return copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

/**
 * Counts how many projects use each technology, most-used first (ties alphabetical).
 * Drives the filter chips, so a new project with a new technology adds a chip automatically.
 */
export function techCounts(
  projects: ProjectEntry[],
): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of projects) {
    for (const s of new Set(p.stack)) counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Formats an ISO date as "Feb 2025" (UTC, so it never shifts a month with the time zone). */
export function formatProjectDate(iso?: string): string | null {
  if (!iso) return null;
  const [y, m, d = 1] = iso.split("-").map(Number);
  if (!y || !m) return null;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
