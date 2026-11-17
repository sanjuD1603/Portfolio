// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "../reveal";

// gsap's ScrollTrigger reads matchMedia the moment the module loads, i.e. before any test runs.
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

/** jsdom has no matchMedia; fake one that reports the visitor's motion preference. */
function stubMotionPreference(reduced: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    // "(prefers-reduced-motion: no-preference)" contains "reduce" too, so test that one first.
    matches: query.includes("no-preference")
      ? !reduced
      : query.includes("reduce")
        ? reduced
        : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
}

beforeEach(() => {
  // ScrollTrigger watches layout; a plain stub is enough here.
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

describe("Reveal", () => {
  it("hands over from the CSS pre-hydration hide to GSAP by setting data-revealed", () => {
    stubMotionPreference(false);
    render(<Reveal className="x">hello</Reveal>);
    const el = screen.getByText("hello");
    expect(el.hasAttribute("data-reveal")).toBe(true);
    expect(el.hasAttribute("data-revealed")).toBe(true);
  });

  it("hides the element itself (before it animates in) when not staggering", () => {
    stubMotionPreference(false);
    render(<Reveal>solo</Reveal>);
    expect(screen.getByText("solo").style.opacity).toBe("0");
  });

  it("with stagger, hides each child but leaves the wrapper visible", () => {
    stubMotionPreference(false);
    render(
      <Reveal stagger>
        <p>one</p>
        <p>two</p>
      </Reveal>,
    );
    const wrapper = screen.getByText("one").parentElement as HTMLElement;
    expect(wrapper.style.opacity).toBe("");
    expect(screen.getByText("one").style.opacity).toBe("0");
    expect(screen.getByText("two").style.opacity).toBe("0");
  });

  it("shows content untouched when the visitor prefers reduced motion", () => {
    stubMotionPreference(true);
    render(
      <Reveal stagger>
        <p>one</p>
      </Reveal>,
    );
    const child = screen.getByText("one");
    expect(child.style.opacity).toBe("");
    expect(child.style.transform).toBe("");
    expect(child.parentElement?.hasAttribute("data-revealed")).toBe(true);
  });

  it("still reveals when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    render(<Reveal>fallback</Reveal>);
    expect(screen.getByText("fallback").hasAttribute("data-revealed")).toBe(
      true,
    );
  });

  it("removes its animation (and inline styles) on unmount without throwing", () => {
    stubMotionPreference(false);
    const { unmount } = render(
      <Reveal stagger>
        <p>a</p>
      </Reveal>,
    );
    expect(() => unmount()).not.toThrow();
  });
});
