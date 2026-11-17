/** Top-level pages, shared by the navbar and the command palette. */
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Experience", href: "/experience" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Education", href: "/education" },
  { label: "Gallery", href: "/gallery" },
  { label: "Readme", href: "/readme" },
];

/**
 * Whether the nav link `href` should be highlighted for the current `pathname`.
 * "/" matches only the home page; any other link also matches its nested routes,
 * so `/projects/chitops` keeps "Projects" highlighted. A trailing slash is ignored.
 */
export function isActiveLink(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}
