import { ArrowRight, Notebook } from "lucide-react";
import { Link } from "next-view-transitions";
import type { BlogPost } from "@/lib/blog";

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group skill-inner-shadow flex flex-col gap-3 rounded-xl p-5 ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-foreground/25"
    >
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Notebook className="size-4" />
        </span>
        <span className="text-secondary text-xs">
          {new Date(post.date).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <h3 className="font-semibold group-hover:text-primary">{post.title}</h3>
      <p className="text-secondary line-clamp-2 text-sm leading-relaxed">
        {post.summary}
      </p>
      <span className="mt-1 inline-flex items-center gap-1 text-sm opacity-0 transition-opacity group-hover:opacity-100">
        Read post
        <ArrowRight className="size-3.5" />
      </span>
    </Link>
  );
}
