import BlogList from "@/components/common/blog-list";
import { PageHeader, Section } from "@/components/section";
import { getAllBlogPosts } from "@/lib/content";

/** Blog index (search + tag filter) built from the MDX posts. */
export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Writing"
        title="Blog"
        subtitle="Notes on what I build and learn."
      />
      <Section eager>
        {posts.length === 0 ? (
          <p className="text-secondary">No posts yet. Check back soon.</p>
        ) : (
          <BlogList posts={posts} />
        )}
      </Section>
    </main>
  );
}
