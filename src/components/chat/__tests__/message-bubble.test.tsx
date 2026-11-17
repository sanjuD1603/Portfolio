// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getInitials, MessageBubble } from "../message-bubble";
import { TypingIndicator } from "../typing-indicator";

afterEach(cleanup);

describe("MessageBubble", () => {
  it("shows the visitor's text verbatim (no Markdown) aligned to the end", () => {
    const { container } = render(
      <MessageBubble message={{ role: "user", content: "**not bold**" }} />,
    );
    expect(screen.getByText("**not bold**")).toBeTruthy();
    expect(
      container
        .querySelector("[data-slot=message]")
        ?.getAttribute("data-align"),
    ).toBe("end");
  });

  it("formats assistant replies as Markdown", () => {
    render(
      <MessageBubble
        message={{ role: "assistant", content: "Uses **Next.js**" }}
      />,
    );
    expect(screen.getByText("Next.js").tagName).toBe("STRONG");
  });

  it("shows a single lookup step inline", () => {
    render(
      <MessageBubble
        message={{
          role: "assistant",
          content: "ok",
          steps: [{ tool: "getProjects", label: "Browsed projects" }],
        }}
      />,
    );
    expect(screen.getByText("Browsed projects")).toBeTruthy();
  });

  it("collapses several lookup steps behind a summary", () => {
    render(
      <MessageBubble
        message={{
          role: "assistant",
          content: "ok",
          steps: [
            { tool: "getProjects", label: "Browsed projects" },
            { tool: "getSkills", label: "Checked skills" },
          ],
        }}
      />,
    );
    expect(screen.getByText("Looked through 2 sources")).toBeTruthy();
  });
});

describe("getInitials", () => {
  it("uses the first letters of the first and last word of a name", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
    expect(getInitials("  mogili dinesh reddy ")).toBe("MR");
    expect(getInitials("ada")).toBe("A");
    expect(getInitials("")).toBe("?");
    expect(getInitials(undefined)).toBe("?");
  });
});

describe("MessageBubble avatar and streaming", () => {
  it("labels the visitor's avatar with their initials instead of 'You'", () => {
    render(
      <MessageBubble
        message={{ role: "user", content: "hi" }}
        userName="Ada Lovelace"
      />,
    );
    expect(screen.getByText("AL")).toBeTruthy();
    expect(screen.queryByText("You")).toBeNull();
  });

  it("shows a 'Writing a reply' status until the first text arrives", () => {
    const { rerender } = render(
      <MessageBubble
        message={{ role: "assistant", content: "", streaming: true }}
      />,
    );
    expect(screen.getByRole("status").textContent).toContain("Writing a reply");
    rerender(
      <MessageBubble
        message={{ role: "assistant", content: "Hello", streaming: true }}
      />,
    );
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByText("Hello")).toBeTruthy();
  });
});

describe("TypingIndicator", () => {
  it("announces progress as a running status", () => {
    render(<TypingIndicator />);
    expect(screen.getByRole("status").textContent).toContain(
      "Looking through the portfolio",
    );
  });
});
