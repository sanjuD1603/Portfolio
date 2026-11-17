import { Section } from "@/components/section";
import { EVOLUTION } from "@/data/readme";

/** `/readme` page section: Evolution (Phase 2). Content is defined in `src/data/readme.ts`. */
export default function EvolutionSection() {
  return (
    <Section title="Evolution">
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        The short version of how this site went from nothing to what it is
        today.
      </p>
      <ol className="flex flex-col gap-6">
        {EVOLUTION.map((e, i) => (
          <li key={e.phase} className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{e.phase}</span>
              <p className="text-secondary text-sm leading-relaxed">{e.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
