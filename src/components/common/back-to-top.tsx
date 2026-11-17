"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Floating button that appears after scrolling 400px and smooth-scrolls to the top. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={cn(
        "btn-inner-shadow fixed bottom-4 left-4 z-40 sm:left-6 flex size-10 items-center justify-center rounded-full border bg-background text-foreground/80 transition-all duration-300 hover:text-foreground",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <ArrowUp className="size-4" />
    </button>
  );
}
