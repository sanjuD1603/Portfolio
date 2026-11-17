import { Section } from "@/components/section";
import { ENHANCEMENTS } from "@/data/readme";

export default function EvaluationSection() {
  return (
    <Section title="Evaluation">
      <h3 className="mb-3 text-sm font-semibold">Critical review</h3>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Looking back at what the assignment asked for, this portfolio covers
        most of it but not quite all of it. It has a working Home, About,
        Education and Experience section, which together act as the professional
        knowledge page, along with a projects area, a blog and a photo gallery.
        What it does not have yet is a separate video gallery, and the way to
        get in touch is a mailto popup rather than a real contact form or a
        scheduling flow. The approach of keeping short information in one file
        and longer write ups as separate text files has worked well and made
        every later change easier, which suggests the early decisions were
        reasonable even though not every required feature made it in yet.
      </p>

      <h3 className="mb-3 text-sm font-semibold">Enhancement suggestions</h3>
      <ul className="ml-4 list-disc space-y-2 text-sm leading-relaxed text-muted-foreground">
        {ENHANCEMENTS.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </Section>
  );
}
