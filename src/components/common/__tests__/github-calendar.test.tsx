// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GithubCalendar from "../github-calendar";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));
vi.mock("react-activity-calendar", () => ({
  ActivityCalendar: ({ data }: { data: unknown[] }) => (
    <div data-testid="calendar">{data.length} days</div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("GithubCalendar", () => {
  it("shows a visible message when the API request fails (peer-review finding)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<GithubCalendar username="someone" />);
    expect(await screen.findByText(/couldn't be loaded/i)).toBeTruthy();
  });

  it("shows the same message for a non-OK HTTP response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    render(<GithubCalendar username="someone" />);
    expect(await screen.findByText(/couldn't be loaded/i)).toBeTruthy();
  });

  it("renders the calendar once data arrives", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          contributions: [{ date: "2026-01-01", count: 1, level: 1 }],
        }),
      }),
    );
    render(<GithubCalendar username="someone" />);
    await waitFor(() =>
      expect(screen.getByTestId("calendar").textContent).toBe("1 days"),
    );
  });
});
