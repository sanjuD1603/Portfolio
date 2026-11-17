"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Number that counts up from 0 to `value` the first time it scrolls into view.
 *
 * The final value is in the server-rendered HTML, so it is correct with JavaScript
 * off, for screen readers and for visitors who prefer reduced motion (they never see
 * the count). While animating, the text is written straight to the DOM node, which
 * avoids a React re-render on every frame; cleanup puts the final value back.
 */
export default function CountUp({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const counter = { n: 0 };
    el.textContent = "0";
    const tween = gsap.to(counter, {
      n: value,
      duration: 1.6,
      ease: "power2.out",
      snap: { n: 1 },
      onUpdate: () => {
        el.textContent = String(counter.n);
      },
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      el.textContent = String(value);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
