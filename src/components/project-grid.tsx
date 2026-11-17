"use client";

import { ArrowUpRight, FolderGit2 } from "lucide-react";
import { Link } from "next-view-transitions";
import { useMemo, useState } from "react";
import { cardSurface } from "@/components/common/card-styles";
import { Reveal } from "@/components/common/reveal";
import TechBadge from "@/components/common/tech-badge";
import TechLogo from "@/components/effects/tech-logo";
import { GithubIcon } from "@/components/icons/github";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectEntry } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Grid of project cards with an optional technology filter.
 * The filter badges are derived from the projects' `stack` fields, so adding a
 * project with a new technology adds a filter automatically. Each whole card is
 * clickable (a stretched link on the title); the GitHub / live-site icons sit above it.
 *
 * @param projects - Projects to show (already validated by the content loader).
 * @param limit - Maximum cards to show after filtering (e.g. the Home page preview).
 * @param filterable - Show the technology filter (default true); the Home preview turns it off.
 */
export default function ProjectGrid({
  projects,
  limit,
  filterable = true,
}: {
  projects: ProjectEntry[];
  limit?: number;
  filterable?: boolean;
}) {
  const [activeStack, setActiveStack] = useState<string | null>(null);

  const allStacks = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      for (const s of p.stack) set.add(s);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filtered = useMemo(() => {
    const list = activeStack
      ? projects.filter((p) => p.stack.includes(activeStack))
      : projects;
    return list.slice(0, limit);
  }, [projects, activeStack, limit]);

  return (
    <div className="flex flex-col gap-6">
      {filterable && allStacks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={activeStack === null ? "default" : "secondary"}
            className="tag-inner-shadow font-normal"
            render={
              <button type="button" onClick={() => setActiveStack(null)} />
            }
          >
            All
          </Badge>
          {allStacks.map((s) => (
            <Badge
              key={s}
              variant={activeStack === s ? "default" : "secondary"}
              className="tag-inner-shadow h-6 gap-1.5 px-2.5 font-normal [&>svg]:size-3.5!"
              render={
                <button
                  type="button"
                  onClick={() => setActiveStack(activeStack === s ? null : s)}
                />
              }
            >
              <TechLogo name={s} className="size-3.5" />
              {s}
            </Badge>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-secondary text-sm">
          No projects use {activeStack} yet.
        </p>
      ) : (
        <Reveal stagger className="grid gap-5 md:grid-cols-2">
          {filtered.map((p) => (
            <Card
              key={p.slug}
              className={cn(
                cardSurface,
                "group/project gap-4 py-5 shadow-none ring-0",
              )}
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-brand-1 via-brand-2 to-brand-3 transition-transform duration-500 ease-out group-hover/project:scale-x-100 motion-reduce:transition-none"
              />
              <CardHeader>
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover/project:bg-primary group-hover/project:text-primary-foreground">
                    <FolderGit2 className="size-[18px]" />
                  </span>
                  <div className="relative z-10 flex items-center gap-3">
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${p.name} source on GitHub`}
                        className="text-secondary hover:text-foreground transition-colors"
                      >
                        <GithubIcon className="size-[18px]" />
                      </a>
                    )}
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${p.name} live site`}
                        className="text-secondary hover:text-foreground transition-colors"
                      >
                        <ArrowUpRight className="size-[18px]" />
                      </a>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl">
                  <Link
                    href={`/projects/${p.slug}`}
                    className="group-hover/project:text-primary inline-flex items-center gap-1 after:absolute after:inset-0 after:content-['']"
                  >
                    {p.name}
                  </Link>
                </CardTitle>
                <CardDescription className="leading-relaxed">
                  {p.summary}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1" />
              <CardFooter className="flex flex-wrap gap-1.5 border-t-0 bg-transparent pt-0">
                {p.stack.map((s) => (
                  <TechBadge key={s} name={s} />
                ))}
              </CardFooter>
            </Card>
          ))}
        </Reveal>
      )}
    </div>
  );
}
