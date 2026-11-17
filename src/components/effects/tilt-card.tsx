"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Wrapper that tilts towards the cursor in 3D and eases back when the pointer leaves.
 * Only active for a real pointer and when motion is allowed; otherwise it is a plain
 * `div`. The transform is written directly to the element (no React state) so
 * pointer moves never trigger a re-render.
 *
 * @param max - Maximum tilt in degrees.
 */
export default function TiltCard({
  children,
  className,
  max = 9,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      typeof window.matchMedia !== "function" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    function onMove(event: PointerEvent) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.transition = "transform 0.1s ease-out";
      el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
    }

    function onLeave() {
      if (!el) return;
      el.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.style.transform = "";
      el.style.transition = "";
    };
  }, [max]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
