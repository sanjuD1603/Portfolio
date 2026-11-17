"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { type Activity, ActivityCalendar } from "react-activity-calendar";

/**
 * GitHub contribution heatmap for the last year.
 *
 * Data comes from a public contributions API (browser-side fetch). States:
 * skeleton while loading, the calendar on success, and a visible message on
 * failure so the section never silently disappears. The `cancelled` flag stops
 * a late response from updating state after unmount or a username change.
 *
 * @param username - GitHub username to display.
 */
export default function GithubCalendar({ username }: { username: string }) {
  const { resolvedTheme } = useTheme();
  const [data, setData] = useState<Activity[] | null>(null);
  const [error, setError] = useState(false);

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

  if (error) {
    return (
      <p className="text-secondary text-sm">
        GitHub activity couldn&apos;t be loaded right now. Try refreshing the
        page.
      </p>
    );
  }
  if (!data) {
    return (
      <div className="h-[140px] w-full animate-pulse rounded-lg bg-muted" />
    );
  }

  return (
    <div className="overflow-x-auto">
      <ActivityCalendar
        data={data}
        colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
        theme={{
          light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
          dark: ["#2d2d2d", "#0e4429", "#006d32", "#26a641", "#39d353"],
        }}
        blockSize={11}
        blockMargin={3}
        fontSize={12}
        showColorLegend={false}
        showTotalCount
        labels={{ totalCount: "{{count}} activities in the last year" }}
      />
    </div>
  );
}
