import Container from "@/components/common/container";

/** Page title block (h1 + optional subtitle) used at the top of every page. */
export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Container className="border-b py-12">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {subtitle && <p className="text-secondary mt-2 max-w-xl">{subtitle}</p>}
    </Container>
  );
}

/** Small label with an optional h2, for headings inside a section. */
export function SectionHeading({
  sub,
  heading,
}: {
  sub: string;
  heading?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-1">
      <span className="text-secondary text-sm">{sub}</span>
      {heading && <h2 className="text-2xl font-bold">{heading}</h2>}
    </div>
  );
}

/** Titled content section with consistent spacing. */
export function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="border-b py-10">
      {title && <SectionHeading sub={title} />}
      {children}
    </Container>
  );
}
