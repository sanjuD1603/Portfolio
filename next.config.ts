import type { NextConfig } from "next";

/**
 * Sub-path for GitHub Pages project sites (e.g. "/Portfolio"). Unset for local
 * development and for a custom domain served from the root.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  basePath,
  reactCompiler: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  agentRules: false,
};

export default nextConfig;
