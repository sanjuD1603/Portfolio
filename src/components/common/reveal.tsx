"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/** `useLayoutEffect` warns during SSR; the server has nothing to lay out, so fall back to `useEffect` there. */
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Reveal the direct children one after another instead of the wrapper as a whole. */
  stagger?: boolean;
  /** Seconds to wait before starting (on top of any stagger). */
  delay?: number;
  /** Distance in px the content slides up from. */
  y?: number;
};

/**
 * Slide-up-and-fade entrance, played once when the element scrolls into view (GSAP + ScrollTrigger).
 *
 * - `stagger` reveals each direct child 50ms after the previous, for lists and grids.
 * - Targets are hidden *before* paint (a CSS rule keyed on `data-reveal` covers the moment
 *   before hydration, `data-revealed` hands over to GSAP), so there is no flash of visible content.
 * - Honours `prefers-reduced-motion`: content simply shows, with no movement.
 * - Children added later (e.g. after filtering a list) are left alone and show immediately.
 */
export function Reveal({
  children,
  className,
  stagger = false,
  delay = 0,
  y = 20,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Without matchMedia (very old browsers, bare test DOMs) there is nothing to animate with.
    if (typeof window.matchMedia !== "function") {
      el.setAttribute("data-revealed", "");
      return;
    }

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const targets = stagger ? Array.from(el.children) : [el];
      if (targets.length === 0) {
        el.setAttribute("data-revealed", "");
        return;
      }
      // Hide the real targets, then hand over from the CSS rule that was hiding the wrapper.
      gsap.set(targets, { opacity: 0, y });
      el.setAttribute("data-revealed", "");
      const tween = gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out",
        stagger: 0.05,
        delay,
        clearProps: "opacity,transform",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(targets, { clearProps: "opacity,transform" });
      };
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      el.setAttribute("data-revealed", "");
    });
    return () => mm.revert();
  }, [stagger, delay, y]);

  return (
    <div ref={ref} data-reveal="" className={cn(className)}>
      {children}
    </div>
  );
}
