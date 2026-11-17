import { Section } from "@/components/section";

export default function IterationTwoSection() {
  return (
    <Section title="Development (Iteration 2)">
      <p className="mb-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Once the pages existed, the second stage was about making them look and
        work properly. I styled everything with Tailwind CSS, which kept
        spacing, color and type consistent across the whole site without
        repeating styles by hand. I added a light and dark theme, layouts that
        adjust for phone and desktop screens, and smooth scrolling and page
        transitions so moving between pages feels less sudden.
      </p>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        On the routing side, I turned the simple pages from the first stage into
        something more flexible. One template now renders any project by reading
        its matching file, and the same approach is used for blog posts. The
        remaining pages, Blog, Gallery and Readme, were finished and linked into
        the navigation bar during this stage too.
      </p>
    </Section>
  );
}
