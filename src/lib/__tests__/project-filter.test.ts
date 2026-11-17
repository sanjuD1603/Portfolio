import { describe, expect, it } from "vitest";
import type { ProjectEntry } from "../content";
import {
  filterProjects,
  formatProjectDate,
  sortProjects,
  techCounts,
} from "../project-filter";

const projects: ProjectEntry[] = [
  {
    slug: "a",
    name: "Alpha Shop",
    summary: "An online store",
    stack: ["Next.js", "PostgreSQL"],
    date: "2025-02-01",
  },
  {
    slug: "b",
    name: "Beta Ledger",
    summary: "Chit fund backend",
    stack: ["Node.js", "PostgreSQL"],
    date: "2024-11-01",
  },
  {
    slug: "c",
    name: "Gamma",
    summary: "Movie search",
    stack: ["React.js"],
  },
];

describe("filterProjects", () => {
  it("returns everything when no filter is active", () => {
    expect(filterProjects(projects, { query: "", tech: null })).toHaveLength(3);
  });

  it("matches the query against name, summary and technologies, ignoring case", () => {
    const slugs = (query: string) =>
      filterProjects(projects, { query, tech: null }).map((p) => p.slug);
    expect(slugs("ALPHA")).toEqual(["a"]);
    expect(slugs("chit fund")).toEqual(["b"]);
    expect(slugs("react")).toEqual(["c"]);
  });

  it("requires the exact technology when one is selected", () => {
    const result = filterProjects(projects, { query: "", tech: "PostgreSQL" });
    expect(result.map((p) => p.slug)).toEqual(["a", "b"]);
  });

  it("combines the query and the technology with AND", () => {
    const result = filterProjects(projects, {
      query: "ledger",
      tech: "PostgreSQL",
    });
    expect(result.map((p) => p.slug)).toEqual(["b"]);
    expect(
      filterProjects(projects, { query: "movie", tech: "PostgreSQL" }),
    ).toEqual([]);
  });
});

describe("sortProjects", () => {
  it("orders newest first with undated projects last, without mutating", () => {
    const input = [projects[2], projects[1], projects[0]];
    expect(sortProjects(input, "newest").map((p) => p.slug)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(input.map((p) => p.slug)).toEqual(["c", "b", "a"]);
  });

  it("orders alphabetically by name", () => {
    expect(sortProjects(projects, "name").map((p) => p.name)).toEqual([
      "Alpha Shop",
      "Beta Ledger",
      "Gamma",
    ]);
  });
});

describe("techCounts", () => {
  it("counts projects per technology, most used first then alphabetical", () => {
    expect(techCounts(projects)).toEqual([
      { name: "PostgreSQL", count: 2 },
      { name: "Next.js", count: 1 },
      { name: "Node.js", count: 1 },
      { name: "React.js", count: 1 },
    ]);
  });
});

describe("formatProjectDate", () => {
  it("formats month and year, and tolerates a missing date", () => {
    expect(formatProjectDate("2025-02-01")).toBe("Feb 2025");
    expect(formatProjectDate(undefined)).toBeNull();
  });
});
