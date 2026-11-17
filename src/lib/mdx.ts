import rehypeShiki from "@shikijs/rehype";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

/**
 * Shared `next-mdx-remote` options for every MDX page: GitHub-flavoured
 * markdown (tables, task lists) and Shiki syntax highlighting with light/dark themes.
 */
export const mdxOptions: MDXRemoteProps["options"] = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [rehypeShiki, { themes: { light: "github-light", dark: "github-dark" } }],
    ],
  },
};
