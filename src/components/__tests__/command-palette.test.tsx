// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CommandItem } from "@/lib/command-search";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const ITEMS: CommandItem[] = [
  { id: "p1", label: "Home", href: "/", group: "Pages" },
  { id: "p2", label: "Projects", href: "/projects", group: "Pages" },
  {
    id: "j1",
    label: "ChitOps",
    hint: "Chit fund management",
    href: "/projects/chitops",
    group: "Projects",
  },
  {
    id: "j2",
    label: "MovieMagic",
    hint: "Ticket booking",
    href: "/projects/moviemagic",
    group: "Projects",
  },
  {
    id: "b1",
    label: "Edge-first Next.js",
    hint: "Why I build on Cloudflare",
    href: "/blog/edge",
    group: "Blog",
  },
];

beforeEach(() => {
  // Reduced motion: skip the GSAP entrance so rows are immediately visible.
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("no-preference") ? false : query.includes("reduce"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  push.mockClear();
  vi.unstubAllGlobals();
});

async function openPalette() {
  const { default: CommandPalette } = await import("../command-palette");
  render(<CommandPalette items={ITEMS} />);
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: "Open command palette" }),
    );
  });
  return screen.getByRole("combobox", { name: "Search" });
}

const options = () => screen.getAllByRole("option");

// The palette is imported dynamically per test; allow for a cold import under a parallel run.
describe("CommandPalette", { timeout: 20_000 }, () => {
  it("opens with every entry grouped, with a count per group and a total", async () => {
    await openPalette();
    expect(options()).toHaveLength(5);
    expect(screen.getByRole("group", { name: "Pages" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Projects" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Blog" })).toBeTruthy();
    expect(screen.getByText("5 results")).toBeTruthy();
  });

  it("filters as you type and highlights what matched", async () => {
    const input = await openPalette();
    await act(async () => {
      fireEvent.change(input, { target: { value: "chit" } });
    });
    expect(options()).toHaveLength(1);
    // "chit" matches in both the label (ChitOps) and the hint (Chit fund management).
    const marks = within(options()[0]).getAllByText("Chit", {
      selector: "mark",
    });
    expect(marks).toHaveLength(2);
    expect(screen.getByText("1 result")).toBeTruthy();
  });

  it("narrows to one group with the filter chips, with counts for the current query", async () => {
    await openPalette();
    expect(screen.getByRole("button", { name: /Projects\s*2/ })).toBeTruthy();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Blog\s*1/ }));
    });
    expect(options()).toHaveLength(1);
    expect(options()[0].textContent).toContain("Edge-first Next.js");
  });

  it("moves the selection with the arrow keys (wrapping) and opens the selected entry on Enter", async () => {
    const input = await openPalette();
    expect(options()[0].getAttribute("aria-selected")).toBe("true");
    expect(input.getAttribute("aria-activedescendant")).toBe(options()[0].id);

    await act(async () => {
      fireEvent.keyDown(input, { key: "ArrowUp" }); // wraps to the last entry
    });
    expect(options()[4].getAttribute("aria-selected")).toBe("true");

    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
    });
    expect(push).toHaveBeenCalledWith("/blog/edge");
  });

  it("opens an entry when clicked", async () => {
    await openPalette();
    await act(async () => {
      fireEvent.click(screen.getByRole("option", { name: /ChitOps/ }));
    });
    expect(push).toHaveBeenCalledWith("/projects/chitops");
  });

  it("explains an empty search and offers suggestions that run a search", async () => {
    const input = await openPalette();
    await act(async () => {
      fireEvent.change(input, { target: { value: "zzzzqq" } });
    });
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText(/No results for/)).toBeTruthy();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Projects" }));
    });
    expect(options().length).toBeGreaterThan(0);
  });

  it("clears the query with the clear button", async () => {
    const input = (await openPalette()) as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: "home" } });
    });
    expect(options()).toHaveLength(1);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    });
    expect(input.value).toBe("");
    expect(options()).toHaveLength(5);
  });

  it("starts fresh every time it is reopened", async () => {
    const input = await openPalette();
    await act(async () => {
      fireEvent.change(input, { target: { value: "home" } });
      fireEvent.keyDown(document.activeElement ?? input, { key: "Escape" });
    });
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Open command palette" }),
      );
    });
    expect(
      (screen.getByRole("combobox", { name: "Search" }) as HTMLInputElement)
        .value,
    ).toBe("");
  });

  it("toggles with Ctrl+K from anywhere", async () => {
    const { default: CommandPalette } = await import("../command-palette");
    render(<CommandPalette items={ITEMS} />);
    expect(screen.queryByRole("combobox")).toBeNull();
    await act(async () => {
      fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    });
    expect(screen.getByRole("combobox", { name: "Search" })).toBeTruthy();
  });
});
