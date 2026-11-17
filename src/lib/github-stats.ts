/** One day of GitHub activity, as returned by the contributions API. */
export type DayActivity = { date: string; count: number; level: number };

/** Headline numbers derived from a year of daily contributions. */
export type ContributionSummary = {
  /** Sum of every day's contributions. */
  total: number;
  /** Number of days with at least one contribution. */
  activeDays: number;
  /** Consecutive active days ending today (or yesterday, if today has none yet). */
  currentStreak: number;
  /** Longest run of consecutive active days in the period. */
  longestStreak: number;
  /** The single most active day, or `null` when there was no activity. */
  busiestDay: { date: string; count: number } | null;
};

/**
 * Summarises daily contribution data into the numbers shown above the heatmap.
 *
 * The current streak is forgiving about "today": if the latest day has no contributions yet
 * the streak still counts back from yesterday, so it doesn't reset to zero every morning.
 *
 * @param days - Daily activity, oldest first (the order the API returns).
 */
export function summarizeContributions(
  days: DayActivity[],
): ContributionSummary {
  let total = 0;
  let activeDays = 0;
  let longestStreak = 0;
  let run = 0;
  let busiestDay: ContributionSummary["busiestDay"] = null;

  for (const day of days) {
    total += day.count;
    if (day.count > 0) {
      activeDays += 1;
      run += 1;
      longestStreak = Math.max(longestStreak, run);
      if (!busiestDay || day.count > busiestDay.count) {
        busiestDay = { date: day.date, count: day.count };
      }
    } else {
      run = 0;
    }
  }

  // Walk back from the newest day; skip a single empty "today" before counting.
  let currentStreak = 0;
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i -= 1;
  for (; i >= 0 && days[i].count > 0; i -= 1) currentStreak += 1;

  return { total, activeDays, currentStreak, longestStreak, busiestDay };
}

/**
 * Formats an ISO `YYYY-MM-DD` date as e.g. "Mar 4" (or "Mar 4, 2026" with `withYear`).
 * Parsed as UTC parts so the day never shifts with the viewer's time zone.
 */
export function formatDay(iso: string, withYear = false): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });
}
