import { Section } from "@/components/section";
import { ENHANCEMENTS } from "@/data/readme";

/** `/readme` page section: Evaluation. Content is defined in `src/data/readme.ts`. */
export default function EvaluationSection() {
  return (
    <Section title="Evaluation">
      <h3 className="mb-3 text-sm font-semibold">Critical review</h3>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        This portfolio has grown a lot since the first review. Back then the
        site had no video gallery and the only way to reach me was a mailto
        popup. Both gaps are closed now: there's a video gallery next to the
        photo one, and an AI chat widget that answers questions about my work
        and can pull up Cal.com booking right inside the panel, so a visitor
        can go from "tell me about his experience" to "book a call" without
        leaving the chat. An earlier version also let the widget forward a
        written message straight to my inbox; once booking a call directly
        was in place that mode stopped earning its keep and was dropped from
        the UI, though the Worker API route behind it still exists and is
        rate-limited - a candidate to wire back in later, not a current gap.
        The chat widget talks to a separate Cloudflare Worker that I also had
        to think about defensively, since it's a public endpoint anyone can
        call - it now rate-limits requests per visitor and caps how many new
        chats and messages it will accept in a day, so one bad actor can't
        run up my AI usage. The approach of keeping short information in
        JSON and longer write-ups as separate text files has kept paying
        off: every new page this phase (videos, new projects, new blog
        posts) was a data change, not a rewrite.
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
