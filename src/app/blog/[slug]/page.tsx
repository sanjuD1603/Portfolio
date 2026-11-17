import { notFound } from "next/navigation";
import { ContentDetail } from "@/components/content-detail";
import { getAllBlogPosts, getBlogPost } from "@/lib/content";

export function generateStaticParams() {
  return getAllBlogPosts().map((p) => ({ slug: p.slug }));
}

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
        <p className="text-secondary mt-2 text-sm">
          {new Date(frontmatter.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      }
      content={content}
    />
  );
}
