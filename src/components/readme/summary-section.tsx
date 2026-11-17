import { Section } from "@/components/section";

export default function SummarySection() {
  return (
    <Section title="Summary">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        This site started out as a plain starter template and slowly turned into
        a real portfolio, with one place holding all my information so every
        page stays in sync. The early work was about getting each section built.
        More recently I have focused on tidying things up, removing pages that
        repeated each other, and making the content that is already there more
        useful, like adding real links and logos. What comes next is less about
        adding new pages and more about closing the gaps this review pointed
        out, and making the site easier to keep updated.
      </p>
    </Section>
  );
}
