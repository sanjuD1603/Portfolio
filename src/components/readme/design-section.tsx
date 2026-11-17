import { ArrowDown } from "lucide-react";
import { Section } from "@/components/section";
import {
  CHATBOT_GATEWAY,
  CHATBOT_ROOT,
  CHATBOT_SERVICE_DETAILS,
  CHATBOT_SERVICES,
  COMPONENT_ROOT,
  CONTENT_COMPONENTS,
  DEEPER_PAGES,
  PIPELINE,
  SITE_PAGES,
  STRUCTURAL_COMPONENTS,
  STRUCTURE,
} from "@/data/readme";

/** `/readme` page section: Design. Content is defined in `src/data/readme.ts`. */
export default function DesignSection() {
  return (
    <Section title="Design">
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        How content reaches the screen, how visitors move around, and which
        pieces are shared.
      </p>

      <h3 className="mb-3 text-sm font-semibold">Content flow</h3>
      <div className="mb-8 flex flex-col items-stretch gap-1">
        {PIPELINE.map((step, i) => (
          <div key={step.title} className="flex flex-col items-center">
            <div className="skill-inner-shadow flex w-full max-w-xl items-center gap-3 rounded-xl p-4 ring-1 ring-foreground/10">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <step.icon className="size-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{step.title}</span>
                <span className="text-secondary text-xs">{step.detail}</span>
              </div>
            </div>
            {i < PIPELINE.length - 1 && (
              <ArrowDown className="text-secondary my-1 size-4 shrink-0" />
            )}
          </div>
        ))}
      </div>

      <h3 className="mb-3 text-sm font-semibold">How a visitor moves around</h3>
      <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        The navbar is on every page, so each page is one click away. Only single
        projects and posts sit one level deeper.
      </p>
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="skill-inner-shadow rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-foreground/10">
          Home
        </div>
        <ArrowDown className="text-secondary size-4" />
        <div className="flex flex-wrap justify-center gap-2">
          {SITE_PAGES.map((p) => (
            <div
              key={p}
              className="skill-inner-shadow rounded-xl px-3 py-1.5 text-xs ring-1 ring-foreground/10"
            >
              {p}
            </div>
          ))}
        </div>
        <ArrowDown className="text-secondary mt-2 size-4" />
        <div className="flex flex-wrap justify-center gap-2">
          {DEEPER_PAGES.map((d) => (
            <div
              key={d.parent}
              className="skill-inner-shadow rounded-xl px-3 py-1.5 text-xs ring-1 ring-foreground/10"
            >
              {d.child}
            </div>
          ))}
        </div>
      </div>

      <h3 className="mb-3 text-sm font-semibold">Component diagram</h3>
      <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Shared layout pieces wrap every page; smaller content pieces sit inside
        them.
      </p>
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="skill-inner-shadow rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-foreground/10">
          {COMPONENT_ROOT}
        </div>
        <ArrowDown className="text-secondary size-4" />
        <div className="flex flex-wrap justify-center gap-2">
          {STRUCTURAL_COMPONENTS.map((c) => (
            <div
              key={c}
              className="skill-inner-shadow rounded-xl px-3 py-1.5 text-xs font-medium ring-1 ring-foreground/10"
            >
              {c}
            </div>
          ))}
        </div>
        <ArrowDown className="text-secondary mt-2 size-4" />
        <div className="flex flex-wrap justify-center gap-2">
          {CONTENT_COMPONENTS.map((c) => (
            <div
              key={c}
              className="skill-inner-shadow rounded-xl px-3 py-1.5 text-xs ring-1 ring-foreground/10"
            >
              {c}
            </div>
          ))}
        </div>
      </div>
      <h3 className="mb-3 text-sm font-semibold">Folder layout</h3>
      <pre className="skill-inner-shadow overflow-x-auto rounded-xl p-4 text-xs leading-relaxed ring-1 ring-foreground/10 sm:text-sm">
        <code>{STRUCTURE}</code>
      </pre>
    </Section>
  );
}
