import rehypeShiki from "@shikijs/rehype";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

export const mdxOptions: MDXRemoteProps["options"] = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [rehypeShiki, { themes: { light: "github-light", dark: "github-dark" } }],
    ],
  },
};
