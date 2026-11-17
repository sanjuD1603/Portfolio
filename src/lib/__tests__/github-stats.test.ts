import { describe, expect, it } from "vitest";
import { formatDay, summarizeContributions } from "../github-stats";

/** Builds consecutive days starting 2026-01-01 from a list of counts. */
function days(counts: number[]) {
  return counts.map((count, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, "0")}`,
    count,
    level: count > 0 ? 1 : 0,
  }));
}

describe("summarizeContributions", () => {
  it("totals contributions and counts active days", () => {
    const s = summarizeContributions(days([0, 3, 0, 2, 5]));
    expect(s.total).toBe(10);
    expect(s.activeDays).toBe(3);
  });

  it("finds the longest streak anywhere in the period", () => {
    expect(summarizeContributions(days([1, 1, 1, 0, 1, 1])).longestStreak).toBe(
      3,
    );
  });

  it("counts the current streak back from the latest day", () => {
    expect(summarizeContributions(days([0, 1, 1, 1])).currentStreak).toBe(3);
  });

  it("keeps the streak alive when today has no contributions yet", () => {
    expect(summarizeContributions(days([1, 1, 1, 0])).currentStreak).toBe(3);
  });

  it("resets the streak after a full empty day", () => {
    expect(summarizeContributions(days([1, 1, 0, 0])).currentStreak).toBe(0);
  });

  it("reports the busiest day (first one on a tie)", () => {
    expect(summarizeContributions(days([2, 7, 7, 1])).busiestDay).toEqual({
      date: "2026-01-02",
      count: 7,
    });
  });

  it("handles no activity and an empty list", () => {
    expect(summarizeContributions(days([0, 0])).busiestDay).toBeNull();
    expect(summarizeContributions([])).toEqual({
      total: 0,
      activeDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      busiestDay: null,
    });
  });
});

describe("formatDay", () => {
  it("formats a date without shifting it across time zones", () => {
    expect(formatDay("2026-03-04")).toBe("Mar 4");
    expect(formatDay("2026-03-04", true)).toBe("Mar 4, 2026");
  });
});
