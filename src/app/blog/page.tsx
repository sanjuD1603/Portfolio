import BlogCard from "@/components/common/blog-card";
import { PageHeader, Section } from "@/components/section";
import { getAllBlogPosts } from "@/lib/blog";

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <main className="flex-1">
      <PageHeader title="Blog" subtitle="Notes on what I build and learn." />
      <Section>
        {posts.length === 0 ? (
          <p className="text-secondary">No posts yet. Check back soon.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
