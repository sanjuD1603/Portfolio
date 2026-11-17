"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

/** Elements the ring should react to, as the visitor would expect a custom cursor to. */
const INTERACTIVE =
  'a[href], button, [role="button"], [role="option"], input, textarea, select, summary, label[for]';

/**
 * Cursor-driven effects for devices with a real pointer (mouse / trackpad):
 *
 * - **Spotlight**: any element with the `.spotlight` class gets `--mx` / `--my`
 *   (the cursor position inside it), which the CSS uses for a hover highlight.
 *   One delegated listener serves every card, so cards can stay server components.
 * - **Aurora glow**: a soft indigo/violet/teal light that trails the cursor, eased with GSAP
 *   so it drifts behind the pointer instead of being glued to it.
 * - **Ring**: a small outline that tracks the pointer tightly, grows over links and buttons,
 *   and shrinks while pressed. The native cursor stays; the ring only decorates it.
 *
 * The glow and ring are skipped when the visitor prefers reduced motion. Touch devices and
 * browsers without `matchMedia` get none of this; nothing depends on it.
 */
export default function PointerEffects() {
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      typeof window.matchMedia !== "function" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const glow = glowRef.current;
    const ring = ringRef.current;
    // quickTo reuses one tween per axis: cheap enough to call on every pointermove.
    const moveGlow =
      glow && !reduceMotion
        ? {
            x: gsap.quickTo(glow, "x", { duration: 0.9, ease: "power3.out" }),
            y: gsap.quickTo(glow, "y", { duration: 0.9, ease: "power3.out" }),
          }
        : null;
    const moveRing =
      ring && !reduceMotion
        ? {
            x: gsap.quickTo(ring, "x", { duration: 0.18, ease: "power3.out" }),
            y: gsap.quickTo(ring, "y", { duration: 0.18, ease: "power3.out" }),
          }
        : null;

    let frame = 0;
    let latest: PointerEvent | null = null;
    let seen = false;

    /** Card spotlight: needs layout reads, so it is batched to one per frame. */
    function flush() {
      frame = 0;
      const event = latest;
      if (!event) return;
      const target = event.target instanceof Element ? event.target : null;
      const card = target?.closest<HTMLElement>(".spotlight");
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }
    }

    function onMove(event: PointerEvent) {
      latest = event;
      if (frame === 0) frame = requestAnimationFrame(flush);
      if (!moveGlow || !moveRing || !glow || !ring) return;

      if (!seen) {
        // First move: start under the cursor instead of flying in from the corner.
        seen = true;
        gsap.set([glow, ring], { x: event.clientX, y: event.clientY });
        glow.dataset.active = "true";
        ring.dataset.active = "true";
      }
      moveGlow.x(event.clientX);
      moveGlow.y(event.clientY);
      moveRing.x(event.clientX);
      moveRing.y(event.clientY);

      const target = event.target instanceof Element ? event.target : null;
      const hovering = Boolean(target?.closest(INTERACTIVE));
      if ((ring.dataset.hover === "true") !== hovering) {
        ring.dataset.hover = String(hovering);
      }
    }

    function onDown() {
      if (ring) ring.dataset.pressed = "true";
    }
    function onUp() {
      if (ring) ring.dataset.pressed = "false";
    }
    function onLeave() {
      if (glow) glow.dataset.active = "false";
      if (ring) ring.dataset.active = "false";
      seen = false;
    }

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame !== 0) cancelAnimationFrame(frame);
      gsap.killTweensOf([glow, ring]);
    };
  }, []);

  return (
    <>
      <div ref={glowRef} aria-hidden="true" className="cursor-glow" />
      <div ref={ringRef} aria-hidden="true" className="cursor-ring" />
    </>
  );
}
