import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Link } from "next-view-transitions";
import Container from "@/components/common/container";
import { GithubIcon } from "@/components/icons/github";
import { Badge } from "@/components/ui/badge";
import { mdxOptions } from "@/lib/mdx";
import { getAllProjects, getProject } from "@/lib/project";

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

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
    <main className="flex-1">
      <Container className="border-b py-12">
        <Link
          href="/projects"
          className="text-secondary mb-6 inline-flex items-center gap-1 text-sm hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All projects
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {frontmatter.name}
        </h1>
        <p className="text-secondary mt-2 max-w-xl">{frontmatter.summary}</p>
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
      </Container>
      <Container className="prose dark:prose-invert max-w-none py-10">
        <MDXRemote source={content} options={mdxOptions} />
      </Container>
    </main>
  );
}
