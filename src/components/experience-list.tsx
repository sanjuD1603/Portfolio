import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { experience } from "@/lib/data";

export default function ExperienceList({ limit }: { limit?: number }) {
  return (
    <div className="flex flex-col gap-10">
      {experience.slice(0, limit).map((job) => (
        <article key={job.company + job.role} className="flex flex-col gap-3">
          <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
            <h3 className="text-lg font-semibold">{job.role}</h3>
            <span className="text-sm text-muted-foreground">{job.period}</span>
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
          <ul className="ml-4 list-disc space-y-2 text-sm leading-relaxed">
            {job.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-1.5">
            {job.stack.map((s) => (
              <Badge key={s} variant="secondary" className="tag-inner-shadow">
                {s}
              </Badge>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
