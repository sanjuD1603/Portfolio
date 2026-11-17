// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Marquee from "../marquee";

afterEach(cleanup);

describe("Marquee", () => {
  it("renders every item twice so the loop is seamless", () => {
    render(<Marquee items={["React", "Next.js", "Hono"]} />);
    expect(screen.getAllByText("React")).toHaveLength(2);
    expect(screen.getAllByText("Next.js")).toHaveLength(2);
    expect(screen.getAllByText("Hono")).toHaveLength(2);
  });

  it("hides only the duplicate copy from assistive tech", () => {
    const { container } = render(<Marquee items={["React", "Hono"]} />);
    const lists = container.querySelectorAll("ul");
    expect(lists).toHaveLength(2);
    expect(lists[0].getAttribute("aria-hidden")).toBeNull();
    expect(lists[1].getAttribute("aria-hidden")).toBe("true");
    // Screen readers therefore see each item exactly once.
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("flags the reverse direction for the stylesheet", () => {
    const { container, rerender } = render(<Marquee items={["A"]} />);
    expect(container.firstElementChild?.getAttribute("data-reverse")).toBe(
      "false",
    );
    rerender(<Marquee items={["A"]} reverse />);
    expect(container.firstElementChild?.getAttribute("data-reverse")).toBe(
      "true",
    );
  });
});
