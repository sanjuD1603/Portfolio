"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/common/reveal";
import TechLogo from "@/components/effects/tech-logo";
import ProjectRow from "@/components/projects/project-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectEntry } from "@/lib/content";
import {
  filterProjects,
  type ProjectSort,
  sortProjects,
  techCounts,
} from "@/lib/project-filter";
import { cn } from "@/lib/utils";

const SORTS: { value: ProjectSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "name", label: "A–Z" },
];

/**
 * The projects page body: a toolbar (search, sort, technology chips with counts) above a
 * list of numbered showcase rows. Search and technology combine with AND; the chips are
 * built from the projects' stacks, so a new project adds its technologies automatically.
 * A polite live region announces the result count, and an empty result offers a reset.
 *
 * @param projects - Validated projects from the content loader.
 */
export default function ProjectShowcase({
  projects,
}: {
  projects: ProjectEntry[];
}) {
  const [query, setQuery] = useState("");
  const [tech, setTech] = useState<string | null>(null);
  const [sort, setSort] = useState<ProjectSort>("newest");

  const chips = useMemo(() => techCounts(projects), [projects]);
  const visible = useMemo(
    () => sortProjects(filterProjects(projects, { query, tech }), sort),
    [projects, query, tech, sort],
  );
  const filtering = query.trim() !== "" || tech !== null;

  function reset() {
    setQuery("");
    setTech(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="text-secondary pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="search"
              aria-label="Search projects"
              placeholder="Search by name, topic or technology"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 rounded-lg pl-9"
            />
          </div>

          <fieldset className="m-0 inline-flex w-fit min-w-0 rounded-lg border bg-card/70 p-0.5">
            <legend className="sr-only">Sort projects</legend>
            {SORTS.map((s) => (
              <button
                key={s.value}
                type="button"
                aria-pressed={sort === s.value}
                onClick={() => setSort(s.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  sort === s.value
                    ? "bg-primary text-primary-foreground"
                    : "text-secondary hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </fieldset>
        </div>

        <fieldset className="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0">
          <legend className="sr-only">Filter by technology</legend>
          <TechChip
            active={tech === null}
            onClick={() => setTech(null)}
            label="All"
            count={projects.length}
          />
          {chips.map((c) => (
            <TechChip
              key={c.name}
              active={tech === c.name}
              onClick={() => setTech(tech === c.name ? null : c.name)}
              label={c.name}
              count={c.count}
              logo
            />
          ))}
        </fieldset>

        <div className="text-secondary flex items-center justify-between gap-3 text-sm">
          <p aria-live="polite">
            Showing {visible.length} of {projects.length}{" "}
            {projects.length === 1 ? "project" : "projects"}
          </p>
          {filtering && (
            <Button type="button" variant="ghost" size="xs" onClick={reset}>
              <X />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <p className="font-medium">No projects match that search</p>
          <p className="text-secondary max-w-sm text-sm">
            Try a different word, or clear the filters to see everything.
          </p>
          <Button type="button" variant="outline" onClick={reset}>
            Clear filters
          </Button>
        </div>
      ) : (
        <Reveal stagger className="flex flex-col gap-6">
          {visible.map((p, i) => (
            <ProjectRow key={p.slug} project={p} index={i} />
          ))}
        </Reveal>
      )}
    </div>
  );
}

/** One technology filter chip: optional logo, name and how many projects use it. */
function TechChip({
  label,
  count,
  active,
  onClick,
  logo = false,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  logo?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors",
        active
          ? "border-transparent bg-primary text-primary-foreground"
          : "bg-card/70 text-foreground/80 hover:border-brand-2/50 hover:text-foreground",
      )}
    >
      {logo && <TechLogo name={label} className="size-4" />}
      {label}
      <span
        className={cn(
          "rounded-md px-1.5 text-xs tabular-nums",
          active
            ? "bg-primary-foreground/20"
            : "bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}
