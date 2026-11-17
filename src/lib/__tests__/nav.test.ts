import { describe, expect, it } from "vitest";
import { isActiveLink } from "../nav";

describe("isActiveLink", () => {
  it("matches the home link only on the home page", () => {
    expect(isActiveLink("/", "/")).toBe(true);
    expect(isActiveLink("/about", "/")).toBe(false);
  });
  it("matches a section link on its own page", () => {
    expect(isActiveLink("/about", "/about")).toBe(true);
    expect(isActiveLink("/blog", "/about")).toBe(false);
  });
  it("keeps the parent highlighted on nested routes", () => {
    expect(isActiveLink("/projects/chitops", "/projects")).toBe(true);
    expect(isActiveLink("/blog/why-i-like-edge-first-nextjs", "/blog")).toBe(
      true,
    );
  });
  it("does not match on a shared prefix that is a different route", () => {
    expect(isActiveLink("/projectsx", "/projects")).toBe(false);
  });
  it("ignores a trailing slash and a missing pathname", () => {
    expect(isActiveLink("/about/", "/about")).toBe(true);
    expect(isActiveLink(null, "/")).toBe(false);
  });
});
