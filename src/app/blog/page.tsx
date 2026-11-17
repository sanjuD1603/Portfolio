import BlogList from "@/components/common/blog-list";
import { PageHeader, Section } from "@/components/section";
import { getAllBlogPosts } from "@/lib/content";

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <main className="flex-1">
      <PageHeader title="Blog" subtitle="Notes on what I build and learn." />
      <Section>
        {posts.length === 0 ? (
          <p className="text-secondary">No posts yet. Check back soon.</p>
        ) : (
          <BlogList posts={posts} />
        )}
      </Section>
    </main>
  );
}
