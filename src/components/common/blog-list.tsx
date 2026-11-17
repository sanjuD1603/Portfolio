"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import BlogCard from "@/components/common/blog-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { BlogPost } from "@/lib/content";

/**
 * Blog index with free-text search (title + summary) and a tag filter.
 * Both filters combine with AND and run client-side on the posts passed in.
 */
export default function BlogList({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of posts) {
      for (const t of p.tags ?? []) set.add(t);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchesQuery =
        q.length === 0 ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q);
      const matchesTag = !activeTag || (p.tags ?? []).includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [posts, query, activeTag]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="text-secondary pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant={activeTag === null ? "default" : "secondary"}
              className="tag-inner-shadow font-normal"
              render={
                <button type="button" onClick={() => setActiveTag(null)} />
              }
            >
              All
            </Badge>
            {allTags.map((t) => (
              <Badge
                key={t}
                variant={activeTag === t ? "default" : "secondary"}
                className="tag-inner-shadow font-normal"
                render={
                  <button
                    type="button"
                    onClick={() => setActiveTag(activeTag === t ? null : t)}
                  />
                }
              >
                {t}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-secondary text-sm">
          No posts match your search yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
