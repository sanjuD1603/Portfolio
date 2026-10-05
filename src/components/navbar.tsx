import { Link } from "next-view-transitions";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Experience", href: "/experience" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Education", href: "/education" },
  { label: "Gallery", href: "/gallery" },
  { label: "Readme", href: "/readme" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-sm">
      <ul className="flex items-center justify-center gap-6 overflow-x-auto px-6 py-4 text-sm">
        {LINKS.map((link) => (
          <li key={link.href} className="shrink-0">
            <Link
              href={link.href}
              className="text-muted-foreground transition-all duration-300 ease-in-out hover:text-foreground hover:underline hover:decoration-2 hover:underline-offset-4"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
