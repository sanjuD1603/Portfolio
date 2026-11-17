import { describe, expect, it } from "vitest";
import { openSource } from "../data";

describe("openSource data", () => {
  it("has at least one upstream project, each with contributions", () => {
    expect(openSource.length).toBeGreaterThan(0);
    for (const p of openSource) {
      expect(p.contributions.length).toBeGreaterThan(0);
    }
  });

  it("only lists repos owned by someone else", () => {
    for (const p of openSource) {
      expect(p.repo).toMatch(/^[^/]+\/[^/]+$/);
      expect(p.repo.toLowerCase().startsWith("sanjud1603/")).toBe(false);
    }
  });

  it("links every contribution to its upstream repo", () => {
    for (const p of openSource) {
      for (const c of p.contributions) {
        expect(c.url).toContain(`github.com/${p.repo}/`);
        expect(c.url.endsWith(`/${c.number}`)).toBe(true);
      }
    }
  });
});
