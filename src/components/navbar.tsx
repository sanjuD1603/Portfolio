"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isActiveLink, NAV_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * Sticky top navigation. Horizontal links on desktop; a hamburger menu on
 * small screens (replaces the Phase 1 horizontally-scrolling bar).
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-6 py-4 sm:justify-center">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden"
        >
          {open ? <X /> : <Menu />}
        </Button>
        <ul className="hidden items-center gap-6 text-sm sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={
                  isActiveLink(pathname, link.href) ? "page" : undefined
                }
                className={cn(
                  "text-muted-foreground transition-all duration-300 ease-in-out hover:text-foreground hover:underline hover:decoration-2 hover:underline-offset-4",
                  isActiveLink(pathname, link.href) &&
                    "font-medium text-foreground underline decoration-2 underline-offset-4",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {open && (
        <ul className="flex flex-col gap-1 border-t px-6 py-3 text-sm sm:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={
                  isActiveLink(pathname, link.href) ? "page" : undefined
                }
                className={cn(
                  "block rounded-md px-2 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  isActiveLink(pathname, link.href) &&
                    "bg-muted font-medium text-foreground",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
