import { describe, expect, it } from "vitest";
import { DEFAULT_UMAMI_SRC, getUmamiConfig } from "../analytics";

describe("getUmamiConfig", () => {
  it("is disabled without a website id (no tracking by default)", () => {
    expect(getUmamiConfig({})).toBeNull();
    expect(getUmamiConfig({ NEXT_PUBLIC_UMAMI_WEBSITE_ID: "  " })).toBeNull();
  });
  it("uses Umami Cloud by default", () => {
    expect(getUmamiConfig({ NEXT_PUBLIC_UMAMI_WEBSITE_ID: "abc" })).toEqual({
      websiteId: "abc",
      src: DEFAULT_UMAMI_SRC,
    });
  });
  it("supports a self-hosted script URL", () => {
    expect(
      getUmamiConfig({
        NEXT_PUBLIC_UMAMI_WEBSITE_ID: "abc",
        NEXT_PUBLIC_UMAMI_SRC: "https://stats.example.test/script.js",
      })?.src,
    ).toBe("https://stats.example.test/script.js");
  });
});
