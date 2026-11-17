import { Download, GraduationCap, Mail, MapPin, UserRound } from "lucide-react";
import Image from "next/image";
import CalBooking from "@/components/cal-booking";
import { cardSurface } from "@/components/common/card-styles";
import { Reveal } from "@/components/common/reveal";
import { PageHeader, Section } from "@/components/section";
import SkillsGrid from "@/components/skills-grid";
import { Button } from "@/components/ui/button";
import { assetPath } from "@/lib/assets";
import { awards, certificates, education, profile } from "@/lib/data";
import { cn } from "@/lib/utils";

/** About: intro with quick facts, resume download, call booking, skills, awards and certificates. */
export default function AboutPage() {
  const studying = education[0];

  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Who I am"
        title="About"
        subtitle={`${profile.role} based in ${profile.location}.`}
      >
        <div className="flex flex-wrap gap-3">
          {profile.resumeUrl && (
            <Button
              size="lg"
              className="btn-inner-shadow shine h-11 px-5 text-base"
              // biome-ignore lint/a11y/useAnchorContent: Button injects its children into the rendered <a>.
              render={<a href={assetPath(profile.resumeUrl)} download />}
              nativeButton={false}
            >
              <Download />
              Download resume
            </Button>
          )}
          <CalBooking className="btn-inner-shadow mt-0 h-11 px-5 text-base" />
        </div>
      </PageHeader>

      <Section eager>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <p className="eyebrow mb-4">Introduction</p>
            <p className="text-lg leading-relaxed text-foreground/90 sm:text-xl">
              {profile.intro}
            </p>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              I&apos;ve worked across SSR web apps, edge-first backends,
              cross-platform mobile and Web3, with a focus on performance, clean
              data models and maintainable UI.
            </p>
          </div>

          <aside
            aria-label="Quick facts"
            className={cn(cardSurface, "flex flex-col gap-5 p-6")}
          >
            {profile.avatar && (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
                <Image
                  src={assetPath(profile.avatar)}
                  alt={profile.name}
                  fill
                  sizes="(min-width: 1024px) 24rem, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-start gap-3">
                <UserRound className="mt-0.5 size-4 shrink-0 text-brand-2" />
                <span>{profile.role}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-2" />
                <span>{profile.location}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-2" />
                <a
                  href={`mailto:${profile.email}`}
                  className="break-all hover:underline"
                >
                  {profile.email}
                </a>
              </li>
              {studying && (
                <li className="flex items-start gap-3">
                  <GraduationCap className="mt-0.5 size-4 shrink-0 text-brand-2" />
                  <span>
                    {studying.degree}
                    <span className="text-secondary block">
                      {studying.school}
                    </span>
                  </span>
                </li>
              )}
            </ul>
          </aside>
        </div>
      </Section>

      <Section
        title="Skills"
        description="Languages, frameworks and databases I work with."
      >
        <SkillsGrid />
      </Section>

      <Section
        title="Awards & honors"
        description="Recognition from competitions and events."
      >
        <Reveal stagger>
          <ol className="divide-y overflow-hidden rounded-2xl border bg-card/70">
            {awards.map((a) => (
              <li
                key={a.title}
                className="flex flex-col gap-1 px-5 py-4 text-sm sm:flex-row sm:items-baseline sm:gap-6"
              >
                <span className="text-secondary w-24 shrink-0 font-mono text-xs tracking-wide">
                  {a.date}
                </span>
                <span className="font-medium">{a.title}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </Section>

      <Section
        title="Certificates"
        description="Courses and credentials I've completed."
      >
        <Reveal stagger className="grid gap-5 sm:grid-cols-2">
          {certificates.map((cert) => {
            const Wrapper = cert.link ? "a" : "div";
            return (
              <Wrapper
                key={cert.title}
                {...(cert.link
                  ? {
                      href: cert.link,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {})}
                className={cn(
                  cardSurface,
                  "flex flex-col gap-3 overflow-hidden",
                )}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <Image
                    src={assetPath(cert.image)}
                    alt={cert.title}
                    fill
                    sizes="(min-width: 640px) 28rem, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
                  />
                </div>
                <div className="flex flex-col gap-0.5 px-5 pb-5">
                  <span className="font-medium">{cert.title}</span>
                  <span className="text-secondary text-sm">{cert.date}</span>
                </div>
              </Wrapper>
            );
          })}
        </Reveal>
      </Section>
    </main>
  );
}
