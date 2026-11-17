import Link from "next/link";
import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** A same-site path like `/projects/chitops` (a leading `//` would be protocol-relative, i.e. external). */
export function isInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

const linkClass =
  "font-medium underline decoration-current/40 underline-offset-2 transition-colors hover:decoration-current";

const components: Components = {
  // Internal paths go through next/link: client-side navigation that also honours the
  // GitHub Pages basePath. Everything else opens in a new tab.
  a({ href = "", children }) {
    if (isInternalHref(href)) {
      return (
        <Link href={href} className={linkClass}>
          {children}
        </Link>
      );
    }
    if (href.startsWith("#") || href.startsWith("mailto:")) {
      return (
        <a href={href} className={linkClass}>
          {children}
        </a>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {children}
      </a>
    );
  },
  p: ({ children }) => <p>{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="list-disc space-y-1 pl-4 marker:text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-4 marker:text-muted-foreground">
      {children}
    </ol>
  ),
  // Small models still emit headings now and then; keep them in-flow rather than page-sized.
  h1: ({ children }) => <p className="font-semibold">{children}</p>,
  h2: ({ children }) => <p className="font-semibold">{children}</p>,
  h3: ({ children }) => <p className="font-semibold">{children}</p>,
  h4: ({ children }) => <p className="font-semibold">{children}</p>,
  code: ({ className, children }) => (
    <code
      className={cn(
        "rounded bg-background/70 px-1 py-0.5 font-mono text-[0.85em]",
        className,
      )}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-md bg-background/70 p-2 font-mono text-xs [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b px-2 py-1 font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border-b px-2 py-1">{children}</td>,
  hr: () => <hr className="border-border" />,
  // The assistant has no business embedding remote images in a visitor's browser.
  img: () => null,
};

/**
 * Renders an assistant reply (Markdown, GFM) with chat-sized typography.
 *
 * react-markdown never renders raw HTML and strips `javascript:` URLs, so model output
 * can't inject markup. Links starting with `/` are in-app routes and navigate client-side.
 */
export const ChatMarkdown = memo(function ChatMarkdown({
  children,
}: {
  children: string;
}) {
  return (
    <div className="flex flex-col gap-2 [&>*]:m-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
});
