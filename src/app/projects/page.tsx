import ProjectGrid from "@/components/project-grid";
import { PageHeader, Section } from "@/components/section";
import { getAllProjects } from "@/lib/content";

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <main className="flex-1">
      <PageHeader
        title="Projects"
        subtitle="Things I've built, from side projects to production apps."
      />
      <Section>
        <ProjectGrid projects={projects} />
      </Section>
    </main>
  );
}
