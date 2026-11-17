import { Mail } from "lucide-react";
import { GithubIcon } from "@/components/icons/github";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { socialLinks } from "@/lib/data";
import { cn } from "@/lib/utils";

const SOCIAL_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Email: Mail,
};

/** Row of round icon links (GitHub, LinkedIn, email) built from `socialLinks`, so hero and footer never drift apart. */
export default function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn("flex items-center gap-3", className)}>
      {socialLinks.map((link) => {
        const Icon = SOCIAL_ICONS[link.name];
        const external = link.href.startsWith("http");
        return (
          <li key={link.name}>
            <a
              href={link.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              aria-label={link.name}
              className="btn-inner-shadow flex size-10 items-center justify-center rounded-full border bg-card/70 text-foreground/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-2/50 hover:text-foreground motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              {Icon && <Icon className="size-[18px]" />}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
