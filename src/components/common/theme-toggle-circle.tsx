"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
};

export default function ThemeToggleCircle({
  className = "",
}: {
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();

  async function handleToggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const doc = document as ViewTransitionDocument;

    if (
      !doc.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(next);
      return;
    }

    const { clientX: x, clientY: y } = event;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const style = document.createElement("style");
    style.textContent = `
      ::view-transition-new(root) {
        animation: circle-reveal 0.6s var(--expo-out);
        clip-path: circle(0px at ${x}px ${y}px);
      }
      @keyframes circle-reveal {
        to {
          clip-path: circle(${endRadius}px at ${x}px ${y}px);
        }
      }
    `;
    document.head.appendChild(style);
    document.documentElement.classList.add("theme-toggle-circle");

    const transition = doc.startViewTransition(() => setTheme(next));
    try {
      await transition.ready;
    } finally {
      document.documentElement.classList.remove("theme-toggle-circle");
      style.remove();
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Toggle theme"
      className={cn(
        "btn-inner-shadow cursor-pointer rounded-lg bg-secondary p-2 text-foreground/80 transition-colors hover:text-foreground",
        className,
      )}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
