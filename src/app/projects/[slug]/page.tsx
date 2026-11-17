import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import TechBadge from "@/components/common/tech-badge";
import { ContentDetail } from "@/components/content-detail";
import { GithubIcon } from "@/components/icons/github";
import { getAllProjects, getProject } from "@/lib/content";

/** Pre-renders one page per project at build time (required for static export). */
export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

/** Project page; 404s if the slug does not exist. */
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { frontmatter, content } = project;

  return (
    <ContentDetail
      backHref="/projects"
      backLabel="All projects"
      title={frontmatter.name}
      subtitle={
        <p className="text-secondary mt-4 max-w-2xl text-lg leading-relaxed">
          {frontmatter.summary}
        </p>
      }
      aside={
        <div className="flex flex-col gap-5 rounded-2xl border bg-card/70 p-5">
          <div>
            <h2 className="eyebrow mb-3">Tech stack</h2>
            <div className="flex flex-wrap gap-1.5">
              {frontmatter.stack.map((s) => (
                <TechBadge key={s} name={s} />
              ))}
            </div>
          </div>
          {(frontmatter.github || frontmatter.link) && (
            <div>
              <h2 className="eyebrow mb-3">Links</h2>
              <div className="flex flex-col gap-2.5">
                {frontmatter.github && (
                  <a
                    href={frontmatter.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm hover:underline"
                  >
                    <GithubIcon className="size-4" />
                    View on GitHub
                  </a>
                )}
                {frontmatter.link && (
                  <a
                    href={frontmatter.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm hover:underline"
                  >
                    <ArrowUpRight className="size-4" />
                    Visit live site
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      }
      content={content}
    />
  );
}
