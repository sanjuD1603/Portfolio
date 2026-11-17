import { notFound } from "next/navigation";
import { ContentDetail } from "@/components/content-detail";
import { Badge } from "@/components/ui/badge";
import { getAllBlogPosts, getBlogPost } from "@/lib/content";

/** Pre-renders one page per blog post at build time (required for static export). */
export function generateStaticParams() {
  return getAllBlogPosts().map((p) => ({ slug: p.slug }));
}

/** Blog post page; 404s if the slug does not exist. */
export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const { frontmatter, content } = post;

  return (
    <ContentDetail
      backHref="/blog"
      backLabel="All posts"
      title={frontmatter.title}
      subtitle={
        <p className="text-secondary mt-4 max-w-2xl text-lg leading-relaxed">
          {frontmatter.summary}
        </p>
      }
      aside={
        <div className="flex flex-col gap-5 rounded-2xl border bg-card/70 p-5">
          <div>
            <h2 className="eyebrow mb-2">Published</h2>
            <p className="text-sm">
              {new Date(frontmatter.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div>
              <h2 className="eyebrow mb-3">Tags</h2>
              <div className="flex flex-wrap gap-1.5">
                {frontmatter.tags.map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="tag-inner-shadow font-normal"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      }
      content={content}
    />
  );
}
