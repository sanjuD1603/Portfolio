import { ArrowRight } from "lucide-react";
import { Link } from "next-view-transitions";
import ExperienceList from "@/components/experience-list";
import { PageHeader, Section } from "@/components/section";

/** Experience: full role history. Doubles as the brief's "Professional Knowledge" page. */
export default function ExperiencePage() {
  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Career"
        title="Experience"
        subtitle="Where I've worked and what I've built."
      />
      <Section
        eager
        title="Work"
        description="Roles, technology stacks and outcomes, newest first."
        action={
          <Link
            href="/projects"
            className="group inline-flex items-center gap-1.5 text-sm font-medium hover:underline hover:underline-offset-4"
          >
            See all projects
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </Link>
        }
      >
        <p className="text-secondary mb-8 max-w-2xl text-sm leading-relaxed">
          This page, together with Home, About and Education, makes up the
          Professional Knowledge section of this portfolio — covering the roles,
          technology stacks and outcomes that demonstrate my software
          engineering background.
        </p>
        <ExperienceList />
      </Section>
    </main>
  );
}
