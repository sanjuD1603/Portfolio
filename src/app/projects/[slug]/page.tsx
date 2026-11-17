import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { ContentDetail } from "@/components/content-detail";
import { GithubIcon } from "@/components/icons/github";
import { Badge } from "@/components/ui/badge";
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
        <p className="text-secondary mt-2 max-w-xl">{frontmatter.summary}</p>
      }
      headerExtra={
        <>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {frontmatter.stack.map((s) => (
              <Badge
                key={s}
                variant="secondary"
                className="tag-inner-shadow font-normal"
              >
                {s}
              </Badge>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {frontmatter.github && (
              <a
                href={frontmatter.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm hover:underline"
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
                className="inline-flex items-center gap-1 text-sm hover:underline"
              >
                Visit live site
                <ArrowUpRight className="size-4" />
              </a>
            )}
          </div>
        </>
      }
      content={content}
    />
  );
}
