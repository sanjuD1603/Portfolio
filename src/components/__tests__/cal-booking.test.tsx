// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const calApi = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "dark" }),
}));
vi.mock("@calcom/embed-react", () => ({
  default: (props: { calLink: string; config: { theme: string } }) => (
    <div
      data-testid="cal-embed"
      data-link={props.calLink}
      data-theme={props.config.theme}
    />
  ),
  getCalApi: async () => calApi,
}));

import CalBooking from "../cal-booking";

afterEach(() => {
  cleanup();
  calApi.mockClear();
  vi.useRealTimers();
});

async function open() {
  render(<CalBooking />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Schedule a call/ }));
  });
}

describe("CalBooking", () => {
  it("does not load the booking calendar until the dialog is opened", () => {
    render(<CalBooking />);
    expect(screen.queryByTestId("cal-embed")).toBeNull();
    expect(
      screen.getByRole("button", { name: /Schedule a call/ }),
    ).toBeTruthy();
  });

  it("opens a titled dialog with the embed pointed at the booking link and the site theme", async () => {
    await open();
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText(/confirmation by email/i)).toBeTruthy();
    const embed = screen.getByTestId("cal-embed");
    expect(embed.getAttribute("data-link")).toBe("sanju-dinesh969-eospzn");
    expect(embed.getAttribute("data-theme")).toBe("dark");
  });

  it("brands the embed with the site colours and listens for it to finish loading", async () => {
    await open();
    expect(calApi).toHaveBeenCalledWith(
      "ui",
      expect.objectContaining({
        theme: "dark",
        cssVarsPerTheme: expect.objectContaining({
          light: expect.objectContaining({ "cal-brand": "#7c3aed" }),
        }),
      }),
    );
    expect(calApi).toHaveBeenCalledWith(
      "on",
      expect.objectContaining({ action: "linkReady" }),
    );
  });

  it("closes from the close button and unmounts the embed", async () => {
    await open();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
    });
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.queryByTestId("cal-embed")).toBeNull();
  });

  it("offers a plain link if the embed is still loading after the timeout", async () => {
    vi.useFakeTimers();
    await open();
    expect(screen.queryByText("Open booking page")).toBeNull();
    await act(async () => {
      vi.advanceTimersByTime(10_500);
    });
    const link = screen.getByText("Open booking page").closest("a");
    expect(link?.getAttribute("href")).toBe(
      "https://cal.com/sanju-dinesh969-eospzn",
    );
  });
});
