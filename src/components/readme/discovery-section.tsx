import { CheckCircle2, Circle } from "lucide-react";
import { Section } from "@/components/section";
import { FEATURES, PERSONAS, PHASE_ONE, PHASE_TWO, TOC } from "@/data/readme";

/** `/readme` page section: Discovery. Content is defined in `src/data/readme.ts`. */
export default function DiscoverySection() {
  return (
    <Section title="Discovery">
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Discovery was about deciding what this portfolio needed before I started
        building it. I looked at the reference portfolio I was given, noted what
        worked well and what did not feel necessary for my own background, and
        grouped what I wanted into two phases: things to build first, and things
        to add once the basics were working.
      </p>

      <h3 className="mb-3 text-sm font-semibold">Table of contents</h3>
      <ol className="mb-8 flex flex-col gap-3">
        {TOC.map((t, i) => (
          <li key={t.page} className="flex gap-3 text-sm">
            <span className="text-secondary w-5 shrink-0">{i + 1}.</span>
            <span>
              <span className="font-medium">{t.page}:</span>{" "}
              <span className="text-muted-foreground">{t.detail}</span>
            </span>
          </li>
        ))}
      </ol>

      <h3 className="mb-3 text-sm font-semibold">Who it is for</h3>
      <ul className="mb-8 grid gap-4 sm:grid-cols-3">
        {PERSONAS.map((p) => (
          <li key={p.id} className="rounded-lg border p-4 text-sm">
            <p className="font-medium">{p.name}</p>
            <p className="mt-1 text-muted-foreground">
              <span className="font-medium text-foreground">Goal:</span>{" "}
              {p.goal}
            </p>
            <p className="mt-2 text-muted-foreground">{p.scenario}</p>
          </li>
        ))}
      </ul>

      <h3 className="mb-3 text-sm font-semibold">
        Feature priorities (Must / Should / Could)
      </h3>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-secondary text-xs uppercase tracking-wide">
            <tr>
              <th className="py-2 pr-4 font-medium">Feature</th>
              <th className="py-2 pr-4 font-medium">Priority</th>
              <th className="py-2 pr-4 font-medium">Serves</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {FEATURES.map((f) => (
              <tr key={f.name} className="border-t">
                <td className="py-2 pr-4 text-foreground">{f.name}</td>
                <td className="py-2 pr-4">{f.priority}</td>
                <td className="py-2 pr-4">
                  {f.personas
                    .map((id) => PERSONAS.find((p) => p.id === id)?.name ?? id)
                    .join(", ")}
                </td>
                <td className="py-2">{f.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-3 text-sm font-semibold">Build plan</h3>
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <span className="text-secondary text-xs uppercase tracking-wide">
            Phase 1
          </span>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
            {PHASE_ONE.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="text-secondary text-xs uppercase tracking-wide">
            Phase 2
          </span>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
            {PHASE_TWO.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
