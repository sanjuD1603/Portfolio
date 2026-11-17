"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { type CommandItem, filterCommands } from "@/lib/command-search";
import { cn } from "@/lib/utils";

/**
 * Quick-navigation palette. Opens with Ctrl/⌘+K (or the trigger button), filters
 * pages, projects and blog posts as you type, and is fully keyboard driven:
 * ↑/↓ to move, Enter to go, Esc to close.
 *
 * @param items - Entries built on the server by `buildCommandItems()`.
 */
export default function CommandPalette({ items }: { items: CommandItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => filterCommands(items, query), [items, query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setQuery("");
      setActive(0);
    }
  }

  function go(item: CommandItem) {
    handleOpenChange(false);
    router.push(item.href);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="gap-2"
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border px-1 text-[10px] text-muted-foreground sm:inline">
          Ctrl K
        </kbd>
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="gap-3 p-3 sm:max-w-lg"
        >
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <DialogDescription className="sr-only">
            Search pages, projects and blog posts.
          </DialogDescription>
          <Input
            autoFocus
            placeholder="Search pages, projects, posts..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeyDown}
            aria-label="Search"
          />
          <ul className="max-h-72 overflow-y-auto">
            {results.length === 0 && (
              <li className="px-2 py-6 text-center text-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </li>
            )}
            {results.map((item, i) => (
              <li key={item.id}>
                {(i === 0 || results[i - 1].group !== item.group) && (
                  <p className="text-secondary px-2 pt-2 pb-1 text-xs uppercase tracking-wide">
                    {item.group}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => go(item)}
                  onMouseMove={() => setActive(i)}
                  className={cn(
                    "flex w-full flex-col rounded-md px-2 py-1.5 text-left",
                    i === active && "bg-muted",
                  )}
                >
                  <span className="font-medium">{item.label}</span>
                  {item.hint && (
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {item.hint}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
