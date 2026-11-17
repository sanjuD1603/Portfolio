import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAll,
  getAllBlogPosts,
  getAllProjects,
  getBlogPost,
  getOne,
  getProject,
} from "../content";

let root: string;

/** Writes `src/data/<folder>/<slug>.mdx` under the temporary project root. */
function writeMdx(
  folder: string,
  slug: string,
  frontmatter: string,
  body = "Body",
) {
  const dir = path.join(root, "src/data", folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${slug}.mdx`),
    `---\n${frontmatter}\n---\n${body}\n`,
  );
}

describe("content loader (fixtures)", () => {
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "content-test-"));
    vi.spyOn(process, "cwd").mockReturnValue(root);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("returns an empty list when the collection folder does not exist", () => {
    expect(getAll("projects", "project")).toEqual([]);
  });

  it("loads entries with their slug and sorts newest first", () => {
    writeMdx("blog", "old", 'title: Old\ndate: "2024-01-01"\nsummary: s');
    writeMdx("blog", "new", 'title: New\ndate: "2025-06-01"\nsummary: s');
    const posts = getAll<{ slug: string }>("blog", "blog");
    expect(posts.map((p) => p.slug)).toEqual(["new", "old"]);
  });

  it("sorts entries without a date last, for projects too", () => {
    writeMdx("projects", "undated", "name: A\nsummary: s\nstack: [x]");
    writeMdx(
      "projects",
      "dated",
      'name: B\nsummary: s\nstack: [x]\ndate: "2025-01-01"',
    );
    expect(
      getAll<{ slug: string }>("projects", "project").map((p) => p.slug),
    ).toEqual(["dated", "undated"]);
  });

  it("returns frontmatter and body for a single entry", () => {
    writeMdx(
      "blog",
      "hello",
      'title: Hello\ndate: "2025-01-01"\nsummary: Hi',
      "# Heading",
    );
    const entry = getOne<{ title: string }>("blog", "hello", "blog");
    expect(entry?.frontmatter.title).toBe("Hello");
    expect(entry?.content).toContain("# Heading");
  });

  it("returns null for a slug that does not exist", () => {
    expect(getOne("blog", "missing", "blog")).toBeNull();
    expect(getBlogPost("missing")).toBeNull();
    expect(getProject("missing")).toBeNull();
  });

  it("rejects invalid frontmatter with an error naming the file and field", () => {
    writeMdx("blog", "broken", "title: No date or summary");
    expect(() => getAll("blog", "blog")).toThrow(
      /Invalid blog frontmatter in "broken"/,
    );
    expect(() => getAll("blog", "blog")).toThrow(/date/);
    expect(() => getOne("blog", "broken", "blog")).toThrow(/summary/);
  });

  it("rejects a project whose stack is not an array", () => {
    writeMdx("projects", "bad", "name: X\nsummary: s\nstack: react");
    expect(() => getAll("projects", "project")).toThrow(/stack/);
  });
});

describe("real portfolio content", () => {
  it("every project validates and has a stack", () => {
    const projects = getAllProjects();
    expect(projects.length).toBeGreaterThan(0);
    for (const p of projects) expect(p.stack.length).toBeGreaterThan(0);
  });

  it("blog posts are complete articles, not placeholders (peer-review Must item)", () => {
    const posts = getAllBlogPosts();
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      const entry = getBlogPost(post.slug);
      expect(entry?.content.length, post.slug).toBeGreaterThan(1500);
      expect(entry?.content, post.slug).not.toMatch(
        /lorem ipsum|placeholder|TODO/i,
      );
    }
  });
});
