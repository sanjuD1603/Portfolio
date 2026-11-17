import Container from "@/components/common/container";
import { Reveal } from "@/components/common/reveal";
import { cn } from "@/lib/utils";

/** Lower-case, dash-separated version of a heading, used for stable in-page anchors. */
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Full-width banner at the top of every inner page: eyebrow, large gradient title and
 * subtitle on the left, optional `children` (stats, buttons) on the right at wide sizes.
 * The text enters with CSS-only animation so it is visible before JavaScript loads.
 */
export function PageHeader({
  title,
  subtitle,
  eyebrow,
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative border-b border-border/60">
      <div className="mx-auto grid w-full max-w-7xl items-end gap-8 px-6 py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:py-20">
        <div>
          {eyebrow && (
            <p
              className="eyebrow rise mb-4"
              style={{ "--d": "0ms" } as React.CSSProperties}
            >
              {eyebrow}
            </p>
          )}
          <h1
            className="rise text-gradient pb-1 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            style={{ "--d": "80ms" } as React.CSSProperties}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="rise text-secondary mt-4 max-w-2xl text-base leading-relaxed sm:text-lg"
              style={{ "--d": "160ms" } as React.CSSProperties}
            >
              {subtitle}
            </p>
          )}
        </div>
        {children && (
          <div
            className="rise"
            style={{ "--d": "240ms" } as React.CSSProperties}
          >
            {children}
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * Content section. With a `title` it uses a two-column editorial layout on large screens:
 * a sticky heading rail (title, description, optional action) on the left and the content
 * on the right. Without a title the content simply spans the full page width.
 *
 * @param eager - Render immediately instead of fading in on scroll. Use it for the first section of
 *   a page: content that is already on screen should never wait for JavaScript to hydrate (that
 *   delays Largest Contentful Paint).
 * @param title - Section heading (renders as an `h2`).
 * @param description - Short supporting text under the heading, in the rail.
 * @param action - Optional control shown under the description, e.g. a "See all" link.
 */
export function Section({
  title,
  description,
  action,
  eager = false,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  eager?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const id = title ? slugify(title) : undefined;
  const Wrapper = eager ? "div" : Reveal;

  if (!title) {
    return (
      <section
        className={cn("border-b border-border/60 py-12 lg:py-16", className)}
      >
        {eager ? (
          <div className="mx-auto w-full max-w-7xl px-6">{children}</div>
        ) : (
          <Container>{children}</Container>
        )}
      </section>
    );
  }

  return (
    <section
      aria-labelledby={id}
      className={cn("border-b border-border/60 py-12 lg:py-16", className)}
    >
      <Wrapper className="mx-auto grid w-full max-w-7xl gap-8 px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <span
            aria-hidden="true"
            className="mb-4 block h-1 w-10 rounded-full bg-linear-to-r from-brand-1 to-brand-3"
          />
          <h2
            id={id}
            className="text-2xl font-semibold tracking-tight lg:text-3xl"
          >
            {title}
          </h2>
          {description && (
            <p className="text-secondary mt-3 text-sm leading-relaxed">
              {description}
            </p>
          )}
          {action && <div className="mt-5">{action}</div>}
        </div>
        <div className="min-w-0">{children}</div>
      </Wrapper>
    </section>
  );
}
