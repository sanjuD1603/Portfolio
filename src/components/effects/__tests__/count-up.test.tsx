// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CountUp from "../count-up";

// gsap's ScrollTrigger reads matchMedia as soon as the module loads, before any test runs.
vi.hoisted(() => {
  (globalThis as { matchMedia?: unknown }).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  });
});

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("CountUp", () => {
  it("renders the final value up front (server HTML, no-JS and screen readers)", () => {
    vi.stubGlobal("matchMedia", undefined);
    render(<CountUp value={28} />);
    expect(screen.getByText("28")).toBeTruthy();
  });

  it("keeps the final value for visitors who prefer reduced motion", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
    }));
    render(<CountUp value={4} />);
    expect(screen.getByText("4")).toBeTruthy();
  });

  it("restores the final value when unmounted mid-animation", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
    }));
    const { container, unmount } = render(<CountUp value={9} />);
    const el = container.querySelector("span");
    // Motion allowed: the count starts from 0 until it scrolls into view.
    expect(el?.textContent).toBe("0");
    unmount();
    expect(el?.textContent).toBe("9");
  });
});
