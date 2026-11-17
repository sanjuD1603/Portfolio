import { describe, expect, it } from "vitest";
import {
  type CommandItem,
  filterCommands,
  highlightParts,
  scoreItem,
} from "../command-search";

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

describe("highlightParts", () => {
  it("returns one plain run for an empty query or no match", () => {
    expect(highlightParts("Projects", "")).toEqual([
      { text: "Projects", match: false },
    ]);
    expect(highlightParts("Projects", "zzz")).toEqual([
      { text: "Projects", match: false },
    ]);
  });

  it("marks a substring match as a single run, case-insensitively, keeping original casing", () => {
    expect(highlightParts("Migrating MySQL", "mysql")).toEqual([
      { text: "Migrating ", match: false },
      { text: "MySQL", match: true },
    ]);
    expect(highlightParts("ChitOps", "chit")).toEqual([
      { text: "Chit", match: true },
      { text: "Ops", match: false },
    ]);
  });

  it("marks the characters of a fuzzy (subsequence) match", () => {
    expect(highlightParts("Projects", "prj")).toEqual([
      { text: "Pr", match: true },
      { text: "o", match: false },
      { text: "j", match: true },
      { text: "ects", match: false },
    ]);
  });

  it("can be limited to substring matches (used for hints, where fuzzy would be noise)", () => {
    expect(highlightParts("Projects", "prj", { fuzzy: false })).toEqual([
      { text: "Projects", match: false },
    ]);
  });

  it("always reassembles to the original text", () => {
    for (const [t, q] of [
      ["Cloudflare D1", "cfd"],
      ["a-b c", "b c"],
      ["Éclair", "écl"],
    ]) {
      expect(
        highlightParts(t, q)
          .map((p) => p.text)
          .join(""),
      ).toBe(t);
    }
  });
});
