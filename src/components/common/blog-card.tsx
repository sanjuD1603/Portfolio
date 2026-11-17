import { ArrowUpRight } from "lucide-react";
import { Link } from "next-view-transitions";
import { cardSurface } from "@/components/common/card-styles";
import type { BlogPost } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Link card for one blog post: title, two-line summary and date, with an arrow that nudges on hover.
 * @param headingLevel - Heading element for the title; use `h3` when the card sits under an `h2` section.
 */
export default function BlogCard({
  post,
  headingLevel: Heading = "h2",
}: {
  post: BlogPost;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        cardSurface,
        "flex items-start justify-between gap-3 p-5 no-underline",
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <Heading className="text-lg leading-tight font-semibold transition-colors group-hover:text-primary">
          {post.title}
        </Heading>
        <p className="text-secondary line-clamp-2 text-sm leading-relaxed">
          {post.summary}
        </p>
        <span className="text-secondary mt-1 text-xs">
          {new Date(post.date).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary motion-reduce:transition-none" />
    </Link>
  );
}
