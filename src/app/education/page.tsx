import Image from "next/image";
import { PageHeader, Section } from "@/components/section";
import { education } from "@/lib/data";

export default function EducationPage() {
  return (
    <main className="flex-1">
      <PageHeader title="Education" subtitle="Where I studied." />
      <Section>
        <ol className="flex flex-col gap-8">
          {education.map((e) => (
            <li key={e.school} className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-foreground/10">
                <Image
                  src={e.logo}
                  alt={e.school}
                  width={40}
                  height={40}
                  className="size-full object-cover"
                />
              </span>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                  <h2 className="text-lg font-semibold">{e.school}</h2>
                  <span className="text-sm text-muted-foreground">
                    {e.period}
                  </span>
                </div>
                <p className="text-sm">{e.degree}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </main>
  );
}
