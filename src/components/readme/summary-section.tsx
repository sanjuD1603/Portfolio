import { Section } from "@/components/section";

/** `/readme` page section: Summary. Content is defined in `src/data/readme.ts`. */
export default function SummarySection() {
  return (
    <Section title="Summary">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        This site started out as a plain starter template and slowly turned
        into a real portfolio, with each piece of information kept in its own
        file so every page stays in sync. The early work was about getting
        each section built, then tidying things up, removing pages that
        repeated each other, and making the content that was already there
        more useful, like adding real links and logos. The most recent stage
        went further than tidying: it added an AI chat assistant backed by
        its own server, protected that server against misuse now that it is
        public, and wired up automated tests and deployment so a mistake gets
        caught before it reaches visitors. A couple of things are still
        genuinely open, noted honestly in Evaluation above rather than
        hidden, and the plan from here is less about adding new pages and
        more about closing those last gaps and keeping the site easy to
        update.
      </p>
    </Section>
  );
}
