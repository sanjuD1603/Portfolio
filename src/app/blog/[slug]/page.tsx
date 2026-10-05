import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Link } from "next-view-transitions";
import Container from "@/components/common/container";
import { getAllBlogPosts, getBlogPost } from "@/lib/blog";
import { mdxOptions } from "@/lib/mdx";

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
    <main className="flex-1">
      <Container className="border-b py-12">
        <Link
          href="/blog"
          className="text-secondary mb-6 inline-flex items-center gap-1 text-sm hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All posts
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {frontmatter.title}
        </h1>
        <p className="text-secondary mt-2 text-sm">
          {new Date(frontmatter.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </Container>
      <Container className="prose dark:prose-invert max-w-none py-10">
        <MDXRemote source={content} options={mdxOptions} />
      </Container>
    </main>
  );
}
