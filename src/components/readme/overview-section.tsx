import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { STACK } from "@/data/readme";

/** `/readme` page section: Overview. Content is defined in `src/data/readme.ts`. */
export default function OverviewSection() {
  return (
    <Section eager title="Overview">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        This is my personal portfolio site, built for the CS5709 Software
        Engineering Evolution module. Before writing any code, I looked at an
        example portfolio I was given, thought about what a software engineering
        portfolio actually needs to show, and used that to decide what this site
        should include.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Content is kept apart from layout. My profile, education and work
        history each live in their own small file, and longer pieces, like
        project write ups and blog posts, live as separate text files. Each
        page simply reads from that content and lays it out, so changing
        something on the site usually means editing a file rather than
        rewriting a page.
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {STACK.map((s) => (
          <Badge key={s} variant="secondary" className="tag-inner-shadow">
            {s}
          </Badge>
        ))}
      </div>
    </Section>
  );
}
