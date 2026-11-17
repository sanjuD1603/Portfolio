import { Link } from "next-view-transitions";
import ExperienceList from "@/components/experience-list";
import { PageHeader, Section } from "@/components/section";

/** Experience: full role history. Doubles as the brief's "Professional Knowledge" page. */
export default function ExperiencePage() {
  return (
    <main className="flex-1">
      <PageHeader
        title="Experience"
        subtitle="Where I've worked and what I've built."
      />
      <Section title="Work">
        <p className="text-secondary mb-6 text-sm leading-relaxed">
          This page, together with Home, About and Education, makes up the
          Professional Knowledge section of this portfolio — covering the roles,
          technology stacks and outcomes that demonstrate my software
          engineering background.
        </p>
        <ExperienceList />
        <Link
          href="/projects"
          className="text-secondary mt-6 inline-block text-sm underline-offset-4 hover:underline"
        >
          See all projects →
        </Link>
      </Section>
    </main>
  );
}
