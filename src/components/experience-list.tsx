import { ArrowUpRight } from "lucide-react";
import { cardSurface } from "@/components/common/card-styles";
import { Reveal } from "@/components/common/reveal";
import TechBadge from "@/components/common/tech-badge";
import { experience } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Work-experience timeline from `experience.json`: a gradient spine with one card per role.
 * Role titles are `h3`s, so render it inside a titled (`h2`) section.
 *
 * @param limit - Show only the most recent N roles (omit for all).
 * @param maxPoints - Show only the first N bullet points per role (omit for all); the Home preview uses this.
 */
export default function ExperienceList({
  limit,
  maxPoints,
}: {
  limit?: number;
  maxPoints?: number;
}) {
  return (
    <Reveal
      stagger
      className="relative flex flex-col gap-6 pl-8 before:absolute before:top-3 before:bottom-3 before:left-[7px] before:w-px before:bg-linear-to-b before:from-brand-1 before:via-brand-2 before:to-transparent"
    >
      {experience.slice(0, limit).map((job) => (
        <article
          key={job.company + job.role}
          className={cn(cardSurface, "flex flex-col gap-3 p-6")}
        >
          <span
            aria-hidden="true"
            className="absolute top-8 -left-[31px] size-3.5 rounded-full border-2 border-brand-2 bg-background shadow-[0_0_0_4px_var(--background)] transition-colors group-hover:bg-brand-2"
          />
          <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
            <h3 className="text-xl font-semibold">{job.role}</h3>
            <span className="text-secondary font-mono text-xs tracking-wide">
              {job.period}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {job.company} · {job.location}
          </p>
          {job.link && (
            <a
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary inline-flex w-fit items-center gap-1 text-sm hover:text-foreground hover:underline"
            >
              Visit site
              <ArrowUpRight className="size-4" />
            </a>
          )}
          <ul className="ml-4 list-disc space-y-2 text-sm leading-relaxed marker:text-brand-2">
            {job.points.slice(0, maxPoints).map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-1.5">
            {job.stack.map((s) => (
              <TechBadge key={s} name={s} />
            ))}
          </div>
        </article>
      ))}
    </Reveal>
  );
}
