import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Link } from "next-view-transitions";
import type { ReactNode } from "react";
import Container from "@/components/common/container";
import { mdxOptions } from "@/lib/mdx";

export function ContentDetail({
  backHref,
  backLabel,
  title,
  subtitle,
  headerExtra,
  content,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: ReactNode;
  headerExtra?: ReactNode;
  content: string;
}) {
  return (
    <main className="flex-1">
      <Container className="border-b py-12">
        <Link
          href={backHref}
          className="text-secondary mb-6 inline-flex items-center gap-1 text-sm hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {subtitle}
        {headerExtra}
      </Container>
      <Container className="prose dark:prose-invert max-w-none py-10">
        <MDXRemote source={content} options={mdxOptions} />
      </Container>
    </main>
  );
}
