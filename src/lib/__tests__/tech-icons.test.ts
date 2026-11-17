import { describe, expect, it } from "vitest";
import { findTechIcon, needsThemeColor, techKey } from "../tech-icons";

describe("techKey", () => {
  it("ignores case, punctuation and a trailing .js", () => {
    expect(techKey("Next.js")).toBe("next");
    expect(techKey("Next JS")).toBe("next");
    expect(techKey("Hono.js")).toBe("hono");
    expect(techKey("Tailwind CSS")).toBe("tailwindcss");
  });

  it("keeps names that merely contain 'js' intact", () => {
    expect(techKey("JavaScript")).toBe("javascript");
    expect(techKey("Svelte")).toBe("svelte");
  });
});

describe("findTechIcon", () => {
  it("finds the same logo for every spelling used in the content", () => {
    expect(findTechIcon("Hono")).toBe(findTechIcon("Hono.js"));
    expect(findTechIcon("Express")).toBe(findTechIcon("Express.js"));
    expect(findTechIcon("ShadCN UI")).toBe(findTechIcon("Shadcn UI"));
    expect(findTechIcon("IPFS")).toBe(findTechIcon("Pinata IPFS"));
    expect(findTechIcon("Shadcn")).toBe(findTechIcon("ShadCN UI"));
    expect(findTechIcon("NestJS")?.title).toBe("NestJS");
    expect(findTechIcon("Cloudflare")?.title).toBe("Cloudflare");
  });

  it("handles C++ and labels with parentheses", () => {
    expect(findTechIcon("C++")?.title).toBe("C++");
    expect(findTechIcon("SQLite (Cloudflare D1)")?.title).toBe("SQLite");
  });

  it("returns undefined when there is no logo", () => {
    expect(findTechIcon("Hardhat")).toBeUndefined();
    expect(findTechIcon("Smart Contracts")).toBeUndefined();
  });
});

describe("needsThemeColor", () => {
  it("flags near-black and near-white brand colours, not mid-tones", () => {
    expect(needsThemeColor("000000")).toBe(true);
    expect(needsThemeColor("ECE8D1")).toBe(true);
    expect(needsThemeColor("3178C6")).toBe(false);
    expect(needsThemeColor("E36002")).toBe(false);
  });
});
