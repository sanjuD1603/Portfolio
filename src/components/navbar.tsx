"use client";

import { Menu, X } from "lucide-react";
import { Link } from "next-view-transitions";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Experience", href: "/experience" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Education", href: "/education" },
  { label: "Gallery", href: "/gallery" },
  { label: "Readme", href: "/readme" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

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
          {LINKS.map((link) => (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                className="text-muted-foreground transition-all duration-300 ease-in-out hover:text-foreground hover:underline hover:decoration-2 hover:underline-offset-4"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {open && (
        <ul className="flex flex-col gap-1 border-t px-6 py-3 text-sm sm:hidden">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-2 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
