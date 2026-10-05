import ProjectGrid from "@/components/project-grid";
import { PageHeader, Section } from "@/components/section";

export default function ProjectsPage() {
  return (
    <main className="flex-1">
      <PageHeader
        title="Projects"
        subtitle="Things I've built, from side projects to production apps."
      />
      <Section>
        <ProjectGrid />
      </Section>
    </main>
  );
}
