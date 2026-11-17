import Image from "next/image";
import { cardSurface } from "@/components/common/card-styles";
import { Reveal } from "@/components/common/reveal";
import { PageHeader, Section } from "@/components/section";
import { assetPath } from "@/lib/assets";
import { education } from "@/lib/data";
import { cn } from "@/lib/utils";

/** Education: schools and degrees from `education.json`, as a grid of cards. */
export default function EducationPage() {
  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Academics"
        title="Education"
        subtitle="Where I studied."
      />
      <Section eager>
        <Reveal stagger className="grid gap-5 md:grid-cols-2">
          {education.map((e) => (
            <article
              key={e.school}
              className={cn(cardSurface, "flex items-start gap-5 p-6")}
            >
              <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/10">
                <Image
                  src={assetPath(e.logo)}
                  alt={`${e.school} logo`}
                  width={56}
                  height={56}
                  className="size-full object-cover"
                />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-secondary font-mono text-xs tracking-wide">
                  {e.period}
                </span>
                <h2 className="text-xl font-semibold">{e.school}</h2>
                <p className="text-sm text-muted-foreground">{e.degree}</p>
              </div>
            </article>
          ))}
        </Reveal>
      </Section>
    </main>
  );
}
