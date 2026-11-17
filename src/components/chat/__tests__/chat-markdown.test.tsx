// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ChatMarkdown, isInternalHref } from "../chat-markdown";

afterEach(cleanup);

describe("isInternalHref", () => {
  it("accepts site paths and rejects protocol-relative and absolute URLs", () => {
    expect(isInternalHref("/projects/chitops")).toBe(true);
    expect(isInternalHref("//evil.example/x")).toBe(false);
    expect(isInternalHref("https://example.com")).toBe(false);
    expect(isInternalHref("#top")).toBe(false);
  });
});

describe("ChatMarkdown", () => {
  it("renders bold, lists and inline code", () => {
    render(
      <ChatMarkdown>
        {"**Ayoka** uses:\n\n- `NestJS`\n- `PostgreSQL`"}
      </ChatMarkdown>,
    );
    expect(screen.getByText("Ayoka").tagName).toBe("STRONG");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("NestJS").tagName).toBe("CODE");
  });

  it("links in-app paths as same-tab links (no target, no new window)", () => {
    render(<ChatMarkdown>{"See [ChitOps](/projects/chitops)."}</ChatMarkdown>);
    const link = screen.getByRole("link", { name: "ChitOps" });
    expect(link.getAttribute("href")).toBe("/projects/chitops");
    expect(link.getAttribute("target")).toBeNull();
  });

  it("opens external links in a new tab with noopener", () => {
    render(<ChatMarkdown>{"[Shop](https://betterbebaked.com/)"}</ChatMarkdown>);
    const link = screen.getByRole("link", { name: "Shop" });
    expect(link.getAttribute("href")).toBe("https://betterbebaked.com/");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("never renders raw HTML, scripts, images or javascript: links", () => {
    const { container } = render(
      <ChatMarkdown>
        {
          '<script>alert(1)</script><img src="x" onerror="alert(1)">\n\n![pic](https://x.test/a.png)\n\n[bad](javascript:alert(1))'
        }
      </ChatMarkdown>,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    const bad = screen.queryByRole("link", { name: "bad" });
    expect(bad?.getAttribute("href") ?? "").not.toMatch(/^javascript:/i);
  });
});
