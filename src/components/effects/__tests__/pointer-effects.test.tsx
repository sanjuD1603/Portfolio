// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Every position GSAP was asked to move an element to, as [element class, axis, value]. */
const moves: [string, string, number][] = [];
const placed: { className: string; x: number; y: number }[] = [];

vi.mock("gsap", () => ({
  gsap: {
    quickTo: (el: Element, prop: string) => (value: number) =>
      moves.push([el.className, prop, value]),
    set: (targets: Element[], vars: { x: number; y: number }) => {
      for (const t of targets) placed.push({ className: t.className, ...vars });
    },
    killTweensOf: () => {},
  },
}));

import PointerEffects from "../pointer-effects";

/** Fake matchMedia: `finePointer` answers the hover/pointer query, `reduced` the motion one. */
function stubMedia({
  finePointer,
  reduced = false,
}: {
  finePointer: boolean;
  reduced?: boolean;
}) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("pointer: fine") ? finePointer : reduced,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
}

beforeEach(() => {
  moves.length = 0;
  placed.length = 0;
  // Run animation frames synchronously so the test can assert right after dispatching.
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function fire(el: Element | Document, type: string, x = 0, y = 0) {
  el.dispatchEvent(
    new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }),
  );
}

const glow = (c: HTMLElement) =>
  c.querySelector<HTMLElement>(".cursor-glow") as HTMLElement;
const ring = (c: HTMLElement) =>
  c.querySelector<HTMLElement>(".cursor-ring") as HTMLElement;

describe("PointerEffects", () => {
  it("writes the cursor position into the hovered .spotlight card", () => {
    stubMedia({ finePointer: true });
    const { container } = render(
      <>
        <PointerEffects />
        <div className="spotlight">
          <span>inside</span>
        </div>
      </>,
    );
    const card = container.querySelector<HTMLElement>(".spotlight");
    if (!card) throw new Error("card missing");
    card.getBoundingClientRect = () => ({ left: 100, top: 50 }) as DOMRect;

    fire(card.firstElementChild as Element, "pointermove", 130, 90);

    expect(card.style.getPropertyValue("--mx")).toBe("30px");
    expect(card.style.getPropertyValue("--my")).toBe("40px");
  });

  it("starts the glow and ring under the cursor, reveals them, then eases them after it", () => {
    stubMedia({ finePointer: true });
    const { container } = render(<PointerEffects />);
    expect(glow(container).dataset.active).toBeUndefined();

    fire(document.body, "pointermove", 200, 300);

    // Placed at the pointer first (no fly-in from the corner)...
    expect(placed.map((p) => [p.className, p.x, p.y])).toEqual([
      ["cursor-glow", 200, 300],
      ["cursor-ring", 200, 300],
    ]);
    expect(glow(container).dataset.active).toBe("true");
    expect(ring(container).dataset.active).toBe("true");
    // ...then both are driven toward it (GSAP supplies the easing: slow glow, tight ring).
    expect(moves).toEqual(
      expect.arrayContaining([
        ["cursor-glow", "x", 200],
        ["cursor-glow", "y", 300],
        ["cursor-ring", "x", 200],
        ["cursor-ring", "y", 300],
      ]),
    );

    fire(document.body, "pointermove", 210, 320);
    expect(placed).toHaveLength(2); // placed once, not on every move
    expect(moves).toContainEqual(["cursor-ring", "x", 210]);
  });

  it("grows the ring over links and buttons and relaxes it elsewhere", () => {
    stubMedia({ finePointer: true });
    const { container } = render(
      <>
        <PointerEffects />
        <a href="/x">link</a>
        <p>text</p>
      </>,
    );
    const link = container.querySelector("a") as Element;
    const text = container.querySelector("p") as Element;

    fire(link, "pointermove", 5, 5);
    expect(ring(container).dataset.hover).toBe("true");
    fire(text, "pointermove", 50, 5);
    expect(ring(container).dataset.hover).toBe("false");
  });

  it("shrinks the ring while pressed", () => {
    stubMedia({ finePointer: true });
    const { container } = render(<PointerEffects />);
    fire(document.body, "pointermove", 1, 1);
    fire(document.body, "pointerdown");
    expect(ring(container).dataset.pressed).toBe("true");
    fire(document.body, "pointerup");
    expect(ring(container).dataset.pressed).toBe("false");
  });

  it("hides both when the pointer leaves the window, and re-places them on return", () => {
    stubMedia({ finePointer: true });
    const { container } = render(<PointerEffects />);
    fire(document.body, "pointermove", 10, 10);
    document.documentElement.dispatchEvent(new Event("pointerleave"));
    expect(glow(container).dataset.active).toBe("false");
    expect(ring(container).dataset.active).toBe("false");

    fire(document.body, "pointermove", 400, 200);
    expect(glow(container).dataset.active).toBe("true");
    expect(placed.at(-1)).toMatchObject({ x: 400, y: 200 });
  });

  it("keeps the spotlight but shows no glow or ring when motion is reduced", () => {
    stubMedia({ finePointer: true, reduced: true });
    const { container } = render(
      <>
        <PointerEffects />
        <div className="spotlight" />
      </>,
    );
    const card = container.querySelector<HTMLElement>(".spotlight");
    if (!card) throw new Error("card missing");
    card.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect;

    fire(card, "pointermove", 10, 20);

    expect(card.style.getPropertyValue("--mx")).toBe("10px");
    expect(glow(container).dataset.active).toBeUndefined();
    expect(ring(container).dataset.active).toBeUndefined();
    expect(moves).toHaveLength(0);
  });

  it("does nothing on touch devices (no fine pointer)", () => {
    stubMedia({ finePointer: false });
    const { container } = render(
      <>
        <PointerEffects />
        <div className="spotlight" />
      </>,
    );
    const card = container.querySelector<HTMLElement>(".spotlight");
    if (!card) throw new Error("card missing");

    fire(card, "pointermove", 10, 20);

    expect(card.style.getPropertyValue("--mx")).toBe("");
    expect(glow(container).dataset.active).toBeUndefined();
    expect(moves).toHaveLength(0);
  });
});
