import GithubCalendar from "@/components/common/github-calendar";
import Hero from "@/components/hero";
import { Section } from "@/components/section";

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
