import { describe, expect, it } from "vitest";
import { assetPath } from "../assets";

describe("assetPath", () => {
  it("prefixes root-relative paths with the base path", () => {
    expect(assetPath("/avatar.png", "/Portfolio")).toBe(
      "/Portfolio/avatar.png",
    );
  });
  it("returns the path unchanged when there is no base path (custom domain / localhost)", () => {
    expect(assetPath("/avatar.png", "")).toBe("/avatar.png");
  });
  it("leaves absolute and protocol-relative URLs alone", () => {
    expect(assetPath("https://example.test/a.png", "/Portfolio")).toBe(
      "https://example.test/a.png",
    );
    expect(assetPath("//cdn.example.test/a.png", "/Portfolio")).toBe(
      "//cdn.example.test/a.png",
    );
  });
  it("does not double-prefix", () => {
    expect(assetPath("/Portfolio/avatar.png", "/Portfolio")).toBe(
      "/Portfolio/avatar.png",
    );
  });
});
