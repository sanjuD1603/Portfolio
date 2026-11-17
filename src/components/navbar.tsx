"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";
import { useEffect, useState } from "react";
import CalBooking from "@/components/cal-booking";
import BrandMark from "@/components/common/brand-mark";
import ThemeToggleCircle from "@/components/common/theme-toggle-circle";
import { Button } from "@/components/ui/button";
import { profile } from "@/lib/data";
import { isActiveLink, NAV_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * Full-width sticky navigation bar: brand mark on the left, page links in the middle,
 * actions on the right (`children` slot for the command palette, plus the call-booking
 * button and theme toggle). It turns more opaque and gains a shadow once the page is
 * scrolled. Below `lg` the links move into a slide-down menu that closes on navigation
 * and on Escape.
 */
export default function Navbar({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      className={cn(
        "glass sticky top-0 z-40 border-b transition-[box-shadow,background-color] duration-300 motion-reduce:transition-none",
        scrolled
          ? "border-border shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)]"
          : "border-border/50",
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-6"
      >
        <Link
          href="/"
          className="group mr-2 flex shrink-0 items-center gap-3 rounded-xl"
        >
          <BrandMark className="size-9 shrink-0 rounded-[10px] shadow-md shadow-brand-2/25 transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:transform-none" />
          {/* The name is the link's accessible name at every width; the text is only visually hidden below xl. */}
          <span className="sr-only flex-col leading-tight xl:not-sr-only xl:flex">
            <span className="text-base font-semibold tracking-tight">
              {profile.shortName}
            </span>
            <span className="text-muted-foreground font-mono text-[0.65rem] tracking-wider uppercase">
              {profile.role}
            </span>
          </span>
        </Link>

        <ul className="mx-auto hidden items-center gap-0.5 text-sm lg:flex">
          {NAV_LINKS.map((link) => {
            const active = isActiveLink(pathname, link.href);
            return (
              <li key={link.href} className="shrink-0">
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative block rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-muted/70 hover:text-foreground",
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-3 -bottom-px h-0.5 origin-center rounded-full bg-linear-to-r from-brand-1 via-brand-2 to-brand-3 transition-transform duration-300 ease-out motion-reduce:transition-none",
                      active ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {children}
          <CalBooking
            variant="default"
            className="btn-inner-shadow shine mt-0 hidden xl:inline-flex"
          />
          <ThemeToggleCircle />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden"
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="border-t bg-background/95 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <ul className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-6 py-3 text-sm">
            {NAV_LINKS.map((link) => {
              const active = isActiveLink(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 transition-colors hover:bg-muted hover:text-foreground",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              <CalBooking
                variant="default"
                className="btn-inner-shadow mt-0 w-full"
              />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
