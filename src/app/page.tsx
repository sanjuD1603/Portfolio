import dynamic from "next/dynamic";
import Hero from "@/components/hero";
import { Section } from "@/components/section";

const GithubCalendar = dynamic(
  () => import("@/components/common/github-calendar"),
  {
    loading: () => (
      <div className="h-[140px] w-full animate-pulse rounded-lg bg-muted" />
    ),
  },
);

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Section title="GitHub activity">
        <GithubCalendar username="SanjuD1603" />
      </Section>
    </main>
  );
}
