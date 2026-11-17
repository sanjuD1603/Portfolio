import Container from "@/components/common/container";
import CountUp from "@/components/effects/count-up";
import { cn } from "@/lib/utils";

export type Stat = { label: string; value: number };

/**
 * Row of headline numbers that count up on scroll. The numbers are computed from the real
 * content (projects, roles, technologies, certificates) by the caller, so they cannot go stale.
 */
export default function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <Container className="pb-4">
      <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border bg-card/70 lg:grid-cols-4">
        {stats.map((stat, i) => (
          // The label (`dt`) comes first in the DOM, as a definition list requires;
          // `flex-col-reverse` shows the number above it.
          <div
            key={stat.label}
            className={cn(
              "flex flex-col-reverse justify-end gap-1 px-6 py-7",
              i % 2 === 1 && "border-l",
              i >= 2 && "border-t lg:border-t-0",
              i > 0 && "lg:border-l",
            )}
          >
            <dt className="text-secondary text-sm">{stat.label}</dt>
            <dd className="text-4xl font-semibold tracking-tight sm:text-5xl">
              <CountUp value={stat.value} className="text-gradient" />
            </dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}
