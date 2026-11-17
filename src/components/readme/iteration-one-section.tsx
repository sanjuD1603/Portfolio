import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { PAGE_SET_ONE } from "@/data/readme";

/** `/readme` page section: Iteration 1. Content is defined in `src/data/readme.ts`. */
export default function IterationOneSection() {
  return (
    <Section title="Development (Iteration 1)">
      <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        The first working version of the site had five pages: Home, About,
        Education, Experience and Projects. Alongside them I built the
        navigation bar as its own piece, shared by every page, and set up
        routing using the file based router that comes with Next.js, where each
        folder inside the app directory becomes a page on its own. Getting these
        five pages built and linked together through the navigation bar was the
        main goal of this stage.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {PAGE_SET_ONE.map((p) => (
          <Badge key={p} variant="secondary" className="tag-inner-shadow">
            {p}
          </Badge>
        ))}
      </div>
    </Section>
  );
}
