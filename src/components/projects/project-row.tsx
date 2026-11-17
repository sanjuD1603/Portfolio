import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "next-view-transitions";
import { cardSurface } from "@/components/common/card-styles";
import TechBadge from "@/components/common/tech-badge";
import { GithubIcon } from "@/components/icons/github";
import ProjectArt from "@/components/projects/project-art";
import type { ProjectEntry } from "@/lib/content";
import { formatProjectDate } from "@/lib/project-filter";
import { cn } from "@/lib/utils";

/**
 * One project as a wide, numbered showcase card: artwork on one side, details on the other
 * (the sides alternate down the list on large screens). The whole card is a link to the case
 * study via a stretched link on the title; the GitHub and live-site buttons sit above it.
 *
 * @param project - The project to show.
 * @param index - Zero-based position in the *visible* list (drives the number and the side).
 */
export default function ProjectRow({
  project: p,
  index,
}: {
  project: ProjectEntry;
  index: number;
}) {
  const date = formatProjectDate(p.date);
  const flipped = index % 2 === 1;

  return (
    <article
      className={cn(
        cardSurface,
        "group/project grid items-center gap-6 p-4 sm:p-5 lg:grid-cols-2 lg:gap-10 lg:p-6",
      )}
    >
      <div className={cn(flipped && "lg:order-2")}>
        <ProjectArt project={p} index={index} />
      </div>

      <div className="flex flex-col gap-4 lg:py-2">
        <div className="text-secondary flex items-center gap-3 font-mono text-xs tracking-wider uppercase">
          <span className="text-gradient text-2xl font-semibold tracking-tight normal-case">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span aria-hidden="true" className="h-px w-8 bg-border" />
          {date && <time dateTime={p.date}>{date}</time>}
        </div>

        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          <Link
            href={`/projects/${p.slug}`}
            className="group-hover/project:text-primary transition-colors after:absolute after:inset-0 after:z-0 after:content-['']"
          >
            {p.name}
          </Link>
        </h2>

        <p className="text-secondary leading-relaxed">{p.summary}</p>

        <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
          {p.stack.map((s) => (
            <li key={s}>
              <TechBadge name={s} />
            </li>
          ))}
        </ul>

        <div className="relative z-10 mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
          <span className="inline-flex items-center gap-1.5">
            Read case study
            <ArrowRight className="size-4 transition-transform duration-200 group-hover/project:translate-x-1 motion-reduce:transition-none" />
          </span>
          {p.github && (
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
            >
              <GithubIcon className="size-4" />
              Source
            </a>
          )}
          {p.link && (
            <a
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
            >
              Live site
              <ArrowUpRight className="size-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
