import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Link } from "next-view-transitions";
import type { ReactNode } from "react";
import Container from "@/components/common/container";
import { mdxOptions } from "@/lib/mdx";

/**
 * Shared detail-page layout for MDX content (projects and blog posts): a full-width title
 * banner (back link, title, optional subtitle), then the rendered MDX article beside an
 * optional sticky `aside` (stack, links, tags, date) on large screens.
 * Both `[slug]` routes are thin wrappers around this component.
 *
 * @param aside - Sidebar content shown next to the article; stacks under it on small screens.
 * @param content - Raw MDX body (frontmatter already stripped).
 */
export function ContentDetail({
  backHref,
  backLabel,
  title,
  subtitle,
  aside,
  content,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: ReactNode;
  aside?: ReactNode;
  content: string;
}) {
  return (
    <main className="flex-1">
      <header className="border-b border-border/60">
        <div className="rise mx-auto w-full max-w-7xl px-6 py-12 lg:py-16">
          <Link
            href={backHref}
            className="text-secondary group mb-6 inline-flex items-center gap-1 text-sm hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none" />
            {backLabel}
          </Link>
          <h1 className="text-gradient max-w-4xl pb-1 text-3xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
          {subtitle}
        </div>
      </header>
      <Container className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14 lg:py-14">
        <article className="prose dark:prose-invert min-w-0 max-w-3xl prose-pre:overflow-x-auto">
          <MDXRemote source={content} options={mdxOptions} />
        </article>
        {aside && (
          <aside className="lg:sticky lg:top-24 lg:self-start">{aside}</aside>
        )}
      </Container>
    </main>
  );
}
