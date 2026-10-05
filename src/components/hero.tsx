import { ArrowRight, Mail } from "lucide-react";
import { Link } from "next-view-transitions";
import Image from "next/image";
import Container from "@/components/common/container";
import { GithubIcon } from "@/components/icons/github";
import { Button } from "@/components/ui/button";
import { profile, socialLinks } from "@/lib/data";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 72"
      className={className}
      aria-hidden="true"
    >
      <g fill="none" fillRule="evenodd">
        <path
          d="M8,72 L64,72 C68.418278,72 72,68.418278 72,64 L72,8 C72,3.581722 68.418278,-8.11624501e-16 64,0 L8,0 C3.581722,8.11624501e-16 -5.41083001e-16,3.581722 0,8 L0,64 C5.41083001e-16,68.418278 3.581722,72 8,72 Z"
          fill="#007EBB"
        />
        <path
          d="M62,62 L51.315625,62 L51.315625,43.8021149 C51.315625,38.8127542 49.4197917,36.0245323 45.4707031,36.0245323 C41.1746094,36.0245323 38.9300781,38.9261103 38.9300781,43.8021149 L38.9300781,62 L28.6333333,62 L28.6333333,27.3333333 L38.9300781,27.3333333 L38.9300781,32.0029283 C38.9300781,32.0029283 42.0260417,26.2742151 49.3825521,26.2742151 C56.7356771,26.2742151 62,30.7644705 62,40.051212 L62,62 Z M16.349349,22.7940133 C12.8420573,22.7940133 10,19.9296567 10,16.3970067 C10,12.8643566 12.8420573,10 16.349349,10 C19.8566406,10 22.6970052,12.8643566 22.6970052,16.3970067 C22.6970052,19.9296567 19.8566406,22.7940133 16.349349,22.7940133 Z M11.0325521,62 L21.769401,62 L21.769401,27.3333333 L11.0325521,27.3333333 L11.0325521,62 Z"
          fill="#FFF"
        />
      </g>
    </svg>
  );
}

const SOCIAL_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Email: Mail,
};

export default function Hero() {
  return (
    <Container className="flex flex-col items-center gap-6 border-b py-24 text-center sm:py-32">
      {profile.avatar ? (
        <Image
          src={profile.avatar}
          alt={profile.name}
          width={160}
          height={160}
          className="size-40 rounded-full border object-cover"
          priority
        />
      ) : (
        <div className="flex size-24 items-center justify-center rounded-full border bg-muted text-2xl font-semibold text-muted-foreground">
          MD
        </div>
      )}
      <p className="text-secondary text-sm">Hi, I&apos;m</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
        {profile.name}
      </h1>
      <p className="text-secondary text-lg sm:text-xl">{profile.role}</p>
      <p className="text-secondary max-w-xl">{profile.intro}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          className="btn-inner-shadow"
          render={<Link href="/experience" />}
          nativeButton={false}
        >
          View experience
          <ArrowRight />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="btn-inner-shadow"
          render={<Link href="/about" />}
          nativeButton={false}
        >
          About me
        </Button>
      </div>
      <div className="mt-4 flex gap-4">
        {socialLinks.map((link) => {
          const Icon = SOCIAL_ICONS[link.name];
          return (
            <a
              key={link.name}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={
                link.href.startsWith("http") ? "noopener noreferrer" : undefined
              }
              aria-label={link.name}
              className="text-secondary hover:text-foreground transition-colors"
            >
              {Icon && <Icon className="size-5" />}
            </a>
          );
        })}
      </div>
    </Container>
  );
}
