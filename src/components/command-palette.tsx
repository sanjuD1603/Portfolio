"use client";

import { gsap } from "gsap";
import {
  ArrowDown,
  ArrowUp,
  Compass,
  CornerDownLeft,
  FolderGit2,
  type LucideIcon,
  Notebook,
  Search,
  SearchX,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type CommandItem,
  filterCommands,
  type HighlightPart,
  highlightParts,
} from "@/lib/command-search";
import { cn } from "@/lib/utils";

type Group = CommandItem["group"];
type Scope = "All" | Group;

const GROUPS: Group[] = ["Pages", "Projects", "Blog"];
const GROUP_ICONS: Record<Group, LucideIcon> = {
  Pages: Compass,
  Projects: FolderGit2,
  Blog: Notebook,
};
/** Shown when nothing matches, so a dead end offers somewhere to go. */
const SUGGESTIONS = ["Projects", "Blog", "Experience"];

const LISTBOX_ID = "command-palette-listbox";
const optionId = (i: number) => `command-palette-option-${i}`;

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-5 items-center justify-center rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground">
      {children}
    </kbd>
  );
}

/** Renders text with the parts that matched the query emphasised. */
function Highlighted({ parts }: { parts: HighlightPart[] }) {
  let offset = 0;
  return (
    <>
      {parts.map((p) => {
        // Position in the text is a stable, unique key (parts never overlap).
        const key = offset;
        offset += p.text.length;
        return p.match ? (
          <mark
            key={key}
            className="bg-transparent font-semibold text-foreground underline decoration-foreground/40 underline-offset-2"
          >
            {p.text}
          </mark>
        ) : (
          <Fragment key={key}>{p.text}</Fragment>
        );
      })}
    </>
  );
}

/**
 * The palette's contents. Lives inside the dialog so it mounts fresh on every open:
 * query, scope and selection reset without any manual cleanup.
 */
function PaletteBody({
  items,
  onNavigate,
}: {
  items: CommandItem[];
  onNavigate: (item: CommandItem) => void;
}) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("All");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  /** Scroll the selection into view only for keyboard moves; hover must not make the list jump. */
  const keyboardMove = useRef(false);

  const matches = useMemo(() => filterCommands(items, query), [items, query]);
  const counts = useMemo(() => {
    const c: Record<Group, number> = { Pages: 0, Projects: 0, Blog: 0 };
    for (const m of matches) c[m.group]++;
    return c;
  }, [matches]);

  // A scope with nothing left for this query falls back to everything rather than showing a blank list.
  const effectiveScope: Scope =
    scope === "All" || counts[scope] > 0 ? scope : "All";
  const results = useMemo(
    () =>
      effectiveScope === "All"
        ? matches
        : matches.filter((m) => m.group === effectiveScope),
    [matches, effectiveScope],
  );
  const sections = useMemo(
    () =>
      GROUPS.map((group) => ({
        group,
        rows: results
          .map((item, index) => ({ item, index }))
          .filter((r) => r.item.group === group),
      })).filter((s) => s.rows.length > 0),
    [results],
  );
  const current = Math.min(active, Math.max(results.length - 1, 0));

  useEffect(() => {
    if (!keyboardMove.current) return;
    keyboardMove.current = false;
    document
      .getElementById(optionId(current))
      ?.scrollIntoView?.({ block: "nearest" });
  }, [current]);

  // A short staggered entrance for the first rows; respects reduced motion.
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof window.matchMedia !== "function") return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const rows = Array.from(list.querySelectorAll('[role="option"]')).slice(
        0,
        8,
      );
      gsap.from(rows, {
        opacity: 0,
        y: 8,
        duration: 0.22,
        ease: "power2.out",
        stagger: 0.025,
        clearProps: "opacity,transform",
      });
    });
    return () => mm.revert();
  }, []);

  function move(delta: number) {
    if (results.length === 0) return;
    keyboardMove.current = true;
    setActive((current + delta + results.length) % results.length);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter" && results[current]) {
      e.preventDefault();
      onNavigate(results[current]);
    }
  }

  function changeQuery(value: string) {
    setQuery(value);
    setActive(0);
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b px-4">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          // biome-ignore lint/a11y/noAutofocus: the palette exists to be typed into the moment it opens
          autoFocus
          role="combobox"
          aria-expanded="true"
          aria-controls={LISTBOX_ID}
          aria-autocomplete="list"
          aria-activedescendant={results.length ? optionId(current) : undefined}
          aria-label="Search"
          placeholder="Search pages, projects, posts…"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => changeQuery(e.target.value)}
          onKeyDown={onKeyDown}
          className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              changeQuery("");
              inputRef.current?.focus();
            }}
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          <Kbd>Esc</Kbd>
        )}
      </div>

      <div
        className="flex flex-wrap gap-1.5 border-b px-3 py-2"
        role="toolbar"
        aria-label="Filter results"
      >
        {(["All", ...GROUPS] as Scope[]).map((s) => {
          const count = s === "All" ? matches.length : counts[s];
          const selected = effectiveScope === s;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={selected}
              disabled={count === 0}
              onClick={() => {
                setScope(s);
                setActive(0);
                inputRef.current?.focus();
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs transition-colors disabled:pointer-events-none disabled:opacity-40",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {s}
              <span
                className={cn(
                  "tabular-nums",
                  selected ? "text-background/70" : "text-muted-foreground/70",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={listRef}
        id={LISTBOX_ID}
        role="listbox"
        aria-label="Results"
        // Lenis (smooth scroll) otherwise hijacks the wheel and scrolls the page behind the dialog.
        data-lenis-prevent
        className="max-h-[min(22rem,48vh)] overflow-y-auto overscroll-contain p-2"
      >
        {results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SearchX className="size-5" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-medium">
                No results for &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground">
                Try a project name, a technology or a blog topic.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    changeQuery(s);
                    inputRef.current?.focus();
                  }}
                  className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          sections.map(({ group, rows }) => {
            const Icon = GROUP_ICONS[group];
            return (
              // biome-ignore lint/a11y/useSemanticElements: a <fieldset> carries form semantics; this is a labelled option group inside a listbox
              <div key={group} role="group" aria-label={group}>
                <p className="sticky top-0 z-10 flex items-center justify-between bg-popover/95 px-2 pt-2 pb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase backdrop-blur">
                  {group}
                  <span className="tabular-nums">{rows.length}</span>
                </p>
                {rows.map(({ item, index }) => {
                  const selected = index === current;
                  return (
                    <button
                      key={item.id}
                      id={optionId(index)}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => onNavigate(item)}
                      onMouseMove={() => {
                        if (index !== current) setActive(index);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                        selected && "bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors",
                          selected && "border-foreground/20 text-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium">
                          <Highlighted
                            parts={highlightParts(item.label, query)}
                          />
                        </span>
                        {item.hint && (
                          <span className="truncate text-xs text-muted-foreground">
                            <Highlighted
                              parts={highlightParts(item.hint, query, {
                                fuzzy: false,
                              })}
                            />
                          </span>
                        )}
                      </span>
                      <CornerDownLeft
                        aria-hidden="true"
                        className={cn(
                          "size-3.5 shrink-0 text-muted-foreground transition-opacity",
                          selected ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <div className="hidden items-center gap-3 sm:flex">
          <span className="flex items-center gap-1">
            <Kbd>
              <ArrowUp className="size-2.5" />
            </Kbd>
            <Kbd>
              <ArrowDown className="size-2.5" />
            </Kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd>
              <CornerDownLeft className="size-2.5" />
            </Kbd>
            open
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Esc</Kbd>
            close
          </span>
        </div>
        <span className="tabular-nums sm:ml-auto" aria-live="polite">
          {results.length} {results.length === 1 ? "result" : "results"}
        </span>
      </div>
    </>
  );
}

/**
 * Quick-navigation palette. Opens with Ctrl/⌘+K (or the search button in the navbar),
 * filters pages, projects and blog posts as you type - with highlighted matches, group
 * filters and live counts - and is fully keyboard driven: ↑/↓ to move (wrapping), Enter to
 * go, Esc to close. Exposed to assistive tech as a combobox + listbox.
 *
 * @param items - Entries built on the server by `buildCommandItems()`.
 */
export default function CommandPalette({ items }: { items: CommandItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Resolved after mount: the platform is unknown on the server, so rendering it would mismatch.
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.userAgent));
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(item: CommandItem) {
    setOpen(false);
    router.push(item.href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="flex h-8 items-center gap-2 rounded-lg border bg-muted/40 px-2.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:w-52 sm:justify-between"
      >
        <span className="flex items-center gap-2">
          <Search className="size-3.5" />
          <span className="hidden sm:inline">Search…</span>
        </span>
        <kbd className="hidden rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] leading-none sm:inline">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          data-lenis-prevent
          className="top-[12vh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
        >
          <DialogTitle className="sr-only">Search</DialogTitle>
          <DialogDescription className="sr-only">
            Search pages, projects and blog posts. Use the arrow keys to move,
            Enter to open, Escape to close.
          </DialogDescription>
          <PaletteBody items={items} onNavigate={go} />
        </DialogContent>
      </Dialog>
    </>
  );
}
