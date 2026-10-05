import { Link } from "next-view-transitions";
import ExperienceList from "@/components/experience-list";
import { PageHeader, Section } from "@/components/section";

export default function ExperiencePage() {
  return (
    <main className="flex-1">
      <PageHeader
        title="Experience"
        subtitle="Where I've worked and what I've built."
      />
      <Section title="Work">
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
