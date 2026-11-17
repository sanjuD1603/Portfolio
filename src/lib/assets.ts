/**
 * Deployment-aware paths for files in `public/`.
 *
 * The site is a static export. On a GitHub Pages *project* site it is served
 * from a sub-path (`/<repo>/`), while on a custom domain or `localhost` it is
 * served from `/`. `next/link` handles the sub-path automatically, but plain
 * `<a href>`, `<video src>` and `next/image` with `images.unoptimized` do not,
 * so every reference to a `public/` file goes through {@link assetPath}.
 *
 * The prefix comes from `NEXT_PUBLIC_BASE_PATH` (set only in the Pages
 * workflow, e.g. `/Portfolio`); when unset, paths are returned unchanged.
 */

/** Sub-path the site is served from, or `""` when served from the root. */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(
  /\/$/,
  "",
);

/**
 * Prefixes a root-relative `public/` path with the deployment base path.
 * Absolute URLs (`https://...`, `data:`) and already-prefixed paths are left alone.
 *
 * @param path - A path such as `"/avatar.png"`.
 * @param basePath - Override for tests; defaults to {@link BASE_PATH}.
 */
export function assetPath(path: string, basePath: string = BASE_PATH): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (basePath && (path === basePath || path.startsWith(`${basePath}/`)))
    return path;
  return `${basePath}${path}`;
}
