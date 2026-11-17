import { ArrowUpRight, Download, MapPin } from "lucide-react";
import { Link } from "next-view-transitions";
import CalBooking from "@/components/cal-booking";
import SocialLinks from "@/components/social-links";
import { assetPath } from "@/lib/assets";
import { profile } from "@/lib/data";
import { NAV_LINKS } from "@/lib/nav";

/** Full-width site footer: brand blurb, page links, contact details and a copyright line. */
export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/60 bg-card/40">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          <p className="text-lg font-semibold tracking-tight">{profile.name}</p>
          <p className="text-secondary max-w-sm text-sm leading-relaxed">
            {profile.role}. {profile.intro}
          </p>
          <SocialLinks />
        </div>

        <nav aria-label="Footer">
          <h2 className="eyebrow mb-4">Pages</h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm lg:grid-cols-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground hover:underline hover:underline-offset-4"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow mb-4">Contact</h2>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              {profile.location}
            </li>
            <li>
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1 break-all text-muted-foreground transition-colors hover:text-foreground hover:underline hover:underline-offset-4"
              >
                {profile.email}
                <ArrowUpRight className="size-3.5 shrink-0" />
              </a>
            </li>
            {profile.resumeUrl && (
              <li>
                <a
                  href={assetPath(profile.resumeUrl)}
                  download
                  className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground hover:underline hover:underline-offset-4"
                >
                  <Download className="size-3.5" />
                  Download resume
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="flex flex-col items-start gap-3">
          <h2 className="eyebrow">Let&apos;s talk</h2>
          <p className="text-secondary text-sm leading-relaxed">
            Book a short intro call, or use the chat in the corner to ask about
            my work.
          </p>
          <CalBooking variant="outline" className="btn-inner-shadow mt-0" />
        </div>
      </div>

      <div className="border-t border-border/60">
        <p className="text-secondary mx-auto w-full max-w-7xl px-6 py-5 text-xs">
          &copy; {new Date().getFullYear()} {profile.name}. Built with Next.js,
          Tailwind CSS and GSAP.
        </p>
      </div>
    </footer>
  );
}
