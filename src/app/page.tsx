import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { Link } from "next-view-transitions";
import BlogCard from "@/components/common/blog-card";
import { GithubCalendarSkeleton } from "@/components/common/github-calendar-skeleton";
import { Reveal } from "@/components/common/reveal";
import Marquee from "@/components/effects/marquee";
import ExperienceList from "@/components/experience-list";
import Hero from "@/components/hero";
import CtaBand from "@/components/home/cta-band";
import StatsStrip from "@/components/home/stats-strip";
import ProjectGrid from "@/components/project-grid";
import { Section } from "@/components/section";
import SkillsGrid from "@/components/skills-grid";
import { getAllBlogPosts, getAllProjects } from "@/lib/content";
import { certificates, experience, skills } from "@/lib/data";

const GithubCalendar = dynamic(
  () => import("@/components/common/github-calendar"),
  {
    loading: () => <GithubCalendarSkeleton />,
  },
);

/** "See all" style link used in the section rails. */
function SeeAll({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline hover:underline-offset-4"
    >
      {children}
      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
    </Link>
  );
}

/**
 * Home: full-width hero, live stats, a technology marquee, then a rail-and-content section
 * each for featured projects, experience, skills, latest writing and GitHub activity,
 * closing with a call to action. All figures are derived from the site's own content.
 */
export default function Home() {
  const projects = getAllProjects();
  const posts = getAllBlogPosts().slice(0, 2);
  const technologies = [...new Set(skills.flatMap((g) => g.items))];

  return (
    <main className="flex-1">
      <Hero />
      <StatsStrip
        stats={[
          { label: "Projects built", value: projects.length },
          { label: "Roles held", value: experience.length },
          { label: "Technologies", value: technologies.length },
          { label: "Certificates", value: certificates.length },
        ]}
      />

      <section
        aria-label="Technologies I work with"
        className="border-b border-border/60 py-10"
      >
        <Marquee items={technologies} logos />
      </section>

      <Section
        title="Selected work"
        description="A few things I've designed and shipped, from side projects to production apps."
        action={<SeeAll href="/projects">All projects</SeeAll>}
      >
        <ProjectGrid projects={projects} limit={4} filterable={false} />
      </Section>

      <Section
        title="Experience"
        description="Where I've worked and what I've built there."
        action={<SeeAll href="/experience">Full experience</SeeAll>}
      >
        <ExperienceList limit={2} maxPoints={2} />
      </Section>

      <Section
        title="Toolbox"
        description="The languages, frameworks and databases I reach for."
        action={<SeeAll href="/about">More about me</SeeAll>}
      >
        <SkillsGrid />
      </Section>

      {posts.length > 0 && (
        <Section
          title="Latest writing"
          description="Notes on what I build and learn."
          action={<SeeAll href="/blog">All posts</SeeAll>}
        >
          <Reveal stagger className="grid gap-5 md:grid-cols-2">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} headingLevel="h3" />
            ))}
          </Reveal>
        </Section>
      )}

      <Section
        title="GitHub activity"
        description="My public contributions over the last year."
      >
        <div className="rounded-2xl border bg-card/70 p-5">
          <GithubCalendar username="SanjuD1603" />
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
