"use client";

import { ArrowUpRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Activity, ActivityCalendar } from "react-activity-calendar";
import { GithubCalendarSkeleton } from "@/components/common/github-calendar-skeleton";
import { GithubIcon } from "@/components/icons/github";
import { formatDay, summarizeContributions } from "@/lib/github-stats";

/** Brand-violet intensity scales (level 0 = no activity) for each colour scheme. */
const THEME = {
  light: ["#ece9f5", "#d4c6fb", "#a98bf5", "#7c4fe0", "#4c25a8"],
  dark: ["#262626", "#3a2d63", "#5b3fb0", "#8461e6", "#b9a2ff"],
};

/** One headline number above the heatmap. */
function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-background/60 px-4 py-3">
      <dt className="text-secondary text-xs">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight">{value}</dd>
      {hint && <p className="text-secondary mt-0.5 text-xs">{hint}</p>}
    </div>
  );
}

/**
 * GitHub contribution heatmap for the last year, with a summary row.
 *
 * Data comes from a public contributions API (browser-side fetch). States:
 * a layout-matched skeleton while loading, the full panel on success, and a visible
 * message on failure so the section never silently disappears. The `cancelled` flag stops
 * a late response from updating state after unmount or a username change.
 *
 * The panel shows a profile header, four summary tiles (total, current streak, longest
 * streak, busiest day) computed by `summarizeContributions`, and the heatmap in the site's
 * brand colours with hover tooltips and a Less/More legend. On narrow screens the heatmap
 * scrolls sideways and starts at the most recent weeks.
 *
 * @param username - GitHub username to display.
 */
export default function GithubCalendar({ username }: { username: string }) {
  const { resolvedTheme } = useTheme();
  const [data, setData] = useState<Activity[] | null>(null);
  const [error, setError] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json.contributions ?? []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  // Once the (wider-than-screen) heatmap renders, show the newest weeks first.
  useEffect(() => {
    if (data && scroller.current) {
      scroller.current.scrollLeft = scroller.current.scrollWidth;
    }
  }, [data]);

  const summary = useMemo(
    () => (data ? summarizeContributions(data) : null),
    [data],
  );

  if (error) {
    return (
      <p className="text-secondary text-sm">
        GitHub activity couldn&apos;t be loaded right now. Try refreshing the
        page.
      </p>
    );
  }
  if (!data || !summary) return <GithubCalendarSkeleton />;

  const plural = (n: number, word: string) =>
    `${n.toLocaleString("en-US")} ${word}${n === 1 ? "" : "s"}`;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-2.5 text-sm font-medium"
        >
          <span className="flex size-9 items-center justify-center rounded-full border bg-background">
            <GithubIcon className="size-5" />
          </span>
          <span>
            @{username}
            <span className="text-secondary block text-xs font-normal">
              {plural(summary.activeDays, "active day")} in the last year
            </span>
          </span>
          <ArrowUpRight className="text-secondary size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
        </a>
      </div>

      <dl className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Contributions"
          value={summary.total.toLocaleString("en-US")}
          hint="last 12 months"
        />
        <StatTile
          label="Current streak"
          value={plural(summary.currentStreak, "day")}
        />
        <StatTile
          label="Longest streak"
          value={plural(summary.longestStreak, "day")}
        />
        <StatTile
          label="Busiest day"
          value={summary.busiestDay ? String(summary.busiestDay.count) : "—"}
          hint={
            summary.busiestDay
              ? formatDay(summary.busiestDay.date, true)
              : "no activity yet"
          }
        />
      </dl>

      <div
        ref={scroller}
        className="overflow-x-auto rounded-xl border bg-background/60 p-4 pb-3"
      >
        <ActivityCalendar
          data={data}
          colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
          theme={THEME}
          blockSize={13}
          blockMargin={4}
          blockRadius={4}
          fontSize={12}
          showWeekdayLabels={["mon", "wed", "fri"]}
          showTotalCount={false}
          labels={{ legend: { less: "Less", more: "More" } }}
          tooltips={{
            activity: {
              text: (a) =>
                `${plural(a.count, "contribution")} on ${formatDay(a.date, true)}`,
            },
          }}
        />
      </div>
    </div>
  );
}
