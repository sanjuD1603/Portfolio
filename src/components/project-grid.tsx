"use client";

import { ArrowUpRight, FolderGit2 } from "lucide-react";
import { Link } from "next-view-transitions";
import { useMemo, useState } from "react";
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

export default function ProjectGrid({
  projects,
  limit,
}: {
  projects: ProjectEntry[];
  limit?: number;
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
      {allStacks.length > 0 && (
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
              className="tag-inner-shadow font-normal"
              render={
                <button
                  type="button"
                  onClick={() => setActiveStack(activeStack === s ? null : s)}
                />
              }
            >
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
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <Card
              key={p.slug}
              className="group/project transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-foreground/25"
            >
              <CardHeader>
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover/project:bg-primary group-hover/project:text-primary-foreground">
                    <FolderGit2 className="size-4" />
                  </span>
                  <div className="flex items-center gap-3">
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View source on GitHub"
                        className="text-secondary hover:text-foreground transition-colors"
                      >
                        <GithubIcon className="size-4" />
                      </a>
                    )}
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open live site"
                        className="text-secondary hover:text-foreground transition-colors"
                      >
                        <ArrowUpRight className="size-4" />
                      </a>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">
                  <Link
                    href={`/projects/${p.slug}`}
                    className="group-hover/project:text-primary inline-flex items-center gap-1 hover:underline"
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
                  <Badge
                    key={s}
                    variant="secondary"
                    className="tag-inner-shadow font-normal"
                  >
                    {s}
                  </Badge>
                ))}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
