import { GitMerge, GitPullRequest } from "lucide-react";
import { cardSurface } from "@/components/common/card-styles";
import TechBadge from "@/components/common/tech-badge";
import { GithubIcon } from "@/components/icons/github";
import type { OpenSourceContribution, OpenSourceProject } from "@/lib/data";
import { formatProjectDate } from "@/lib/project-filter";
import { cn } from "@/lib/utils";

/** Label and icon for a contribution's state; merged work is highlighted. */
function StatusBadge({ c }: { c: OpenSourceContribution }) {
  const merged = c.status === "merged";
  const Icon = merged ? GitMerge : GitPullRequest;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-xs capitalize",
        merged
          ? "border-brand-2/40 text-brand-2"
          : "border-border text-secondary",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {c.status}
    </span>
  );
}

/**
 * Contributions to other people's repositories, grouped by upstream project. Kept apart from
 * the personal projects list so the two are never confused: nothing here is owned by the author.
 *
 * @param items - Upstream projects with their contributions.
 */
export default function OpenSourceList({
  items,
}: {
  items: OpenSourceProject[];
}) {
  return (
    <ul className="grid gap-4">
      {items.map((p) => (
        <li key={p.repo} className={cn(cardSurface, "p-5 sm:p-6")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">
                {p.project}
              </h3>
              <p className="text-secondary mt-1 max-w-xl text-sm leading-relaxed">
                {p.description}
              </p>
            </div>
            <a
              href={`https://github.com/${p.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-foreground inline-flex items-center gap-1.5 font-mono text-xs transition-colors"
            >
              <GithubIcon className="size-4" />
              {p.repo}
            </a>
          </div>

          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
            {p.stack.map((s) => (
              <li key={s}>
                <TechBadge name={s} />
              </li>
            ))}
          </ul>

          <ul className="mt-5 divide-y divide-border/60 border-t border-border/60">
            {p.contributions.map((c) => (
              <li key={c.url} className="flex flex-col gap-1.5 py-4 last:pb-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StatusBadge c={c} />
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary font-medium transition-colors"
                  >
                    {c.title}{" "}
                    <span className="text-secondary font-mono text-xs">
                      #{c.number}
                    </span>
                  </a>
                </div>
                <p className="text-secondary text-sm leading-relaxed">
                  {c.summary}
                </p>
                <p className="text-secondary font-mono text-xs">
                  <time dateTime={c.date}>{formatProjectDate(c.date)}</time>
                  {c.additions !== undefined && c.deletions !== undefined && (
                    <>
                      {" · "}
                      <span>+{c.additions}</span> <span>−{c.deletions}</span>
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
