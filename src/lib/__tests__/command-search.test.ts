import { describe, expect, it } from "vitest";
import { type CommandItem, filterCommands, scoreItem } from "../command-search";

const item = (
  label: string,
  hint?: string,
  group: CommandItem["group"] = "Pages",
): CommandItem => ({
  id: label,
  label,
  hint,
  href: `/${label}`,
  group,
});

const ITEMS = [
  item("Home"),
  item("Projects"),
  item("Blog"),
  item(
    "Migrating MySQL to Cloudflare D1",
    "A write-up of a real database migration",
    "Blog",
  ),
  item("ChitOps", "Chit fund management", "Projects"),
];

describe("filterCommands", () => {
  it("returns everything in original order for an empty query", () => {
    expect(filterCommands(ITEMS, "  ")).toEqual(ITEMS);
  });
  it("ranks label prefix above word prefix above substring", () => {
    const labels = filterCommands(
      [item("Say hello"), item("Chello"), item("Hello world")],
      "hello",
    ).map((i) => i.label);
    expect(labels).toEqual(["Hello world", "Say hello", "Chello"]);
  });
  it("is case-insensitive", () => {
    expect(filterCommands(ITEMS, "PROJ")[0].label).toBe("Projects");
  });
  it("matches inside the hint text", () => {
    expect(filterCommands(ITEMS, "fund").map((i) => i.label)).toEqual([
      "ChitOps",
    ]);
  });
  it("falls back to fuzzy in-order matching", () => {
    expect(filterCommands(ITEMS, "prjcts").map((i) => i.label)).toContain(
      "Projects",
    );
  });
  it("keeps each group contiguous so headings are not repeated", () => {
    const groups = filterCommands(
      [
        item("Cl A", undefined, "Blog"),
        item("Cl B", undefined, "Projects"),
        item("Cl C", undefined, "Blog"),
      ],
      "cl",
    ).map((i) => i.group);
    expect(groups).toEqual(["Projects", "Blog", "Blog"]);
  });
  it("returns nothing when there is no match", () => {
    expect(filterCommands(ITEMS, "zzzz")).toEqual([]);
  });
  it("does not fuzzy-match out-of-order characters", () => {
    expect(scoreItem(item("Blog"), "gbl")).toBeNull();
  });
});
