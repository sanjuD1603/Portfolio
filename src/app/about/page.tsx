import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { PageHeader, Section } from "@/components/section";
import SkillsGrid from "@/components/skills-grid";
import { awards, certificates, profile } from "@/lib/data";

export default function AboutPage() {
  return (
    <main className="flex-1">
      <PageHeader
        title="About"
        subtitle={`${profile.role} based in ${profile.location}.`}
      />
      <Section>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          {profile.intro} I&apos;ve worked across SSR web apps, edge-first
          backends, cross-platform mobile and Web3, with a focus on performance,
          clean data models and maintainable UI.
        </p>
        <ul className="mt-6 flex flex-col gap-2 text-sm">
          <li className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            {profile.location}
          </li>
          <li className="flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" />
            <a href={`mailto:${profile.email}`} className="hover:underline">
              {profile.email}
            </a>
          </li>
        </ul>
      </Section>
      <Section title="Skills">
        <SkillsGrid />
      </Section>
      <Section title="Awards & honors">
        <ul className="flex flex-col gap-3 text-sm">
          {awards.map((a) => (
            <li
              key={a.title}
              className="flex flex-col gap-0.5 sm:flex-row sm:gap-6"
            >
              <span className="w-20 shrink-0 text-muted-foreground">
                {a.date}
              </span>
              <span>{a.title}</span>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Certificates">
        <div className="grid gap-4 sm:grid-cols-2">
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
                className="skill-inner-shadow flex flex-col gap-3 overflow-hidden rounded-xl ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-foreground/25"
              >
                <div className="relative aspect-[4/3] w-full bg-muted">
                  <Image
                    src={cert.image}
                    alt={cert.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-0.5 px-4 pb-4">
                  <span className="font-medium">{cert.title}</span>
                  <span className="text-secondary text-sm">{cert.date}</span>
                </div>
              </Wrapper>
            );
          })}
        </div>
      </Section>
    </main>
  );
}
