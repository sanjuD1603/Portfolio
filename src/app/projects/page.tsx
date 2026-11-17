import OpenSourceList from "@/components/projects/open-source-list";
import ProjectShowcase from "@/components/projects/project-showcase";
import { PageHeader, Section } from "@/components/section";
import { getAllProjects } from "@/lib/content";
import { openSource } from "@/lib/data";
import { techCounts } from "@/lib/project-filter";

/** Projects index: numbered showcase rows with search, sort and a technology filter. */
export default function ProjectsPage() {
  const projects = getAllProjects();
  const technologies = techCounts(projects).length;
  const contributions = openSource.reduce(
    (n, p) => n + p.contributions.length,
    0,
  );

  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        subtitle="Things I've built, from side projects to production apps."
      >
        <dl className="flex gap-8">
          <div>
            <dd className="text-gradient text-4xl font-semibold tracking-tight">
              {projects.length}
            </dd>
            <dt className="text-secondary text-sm">Projects</dt>
          </div>
          <div>
            <dd className="text-gradient text-4xl font-semibold tracking-tight">
              {technologies}
            </dd>
            <dt className="text-secondary text-sm">Technologies</dt>
          </div>
          <div>
            <dd className="text-gradient text-4xl font-semibold tracking-tight">
              {contributions}
            </dd>
            <dt className="text-secondary text-sm">Open-source PRs</dt>
          </div>
        </dl>
      </PageHeader>
      <Section eager>
        <ProjectShowcase projects={projects} />
      </Section>
      <Section
        title="Open Source"
        description="Contributions to other people's projects, kept separate from the things I built myself."
      >
        <OpenSourceList items={openSource} />
      </Section>
    </main>
  );
}
