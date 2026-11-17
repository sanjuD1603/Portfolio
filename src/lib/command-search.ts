/**
 * @file Ranking for the command palette (⌘K).
 *
 * Pure and dependency-free so it can be unit-tested and reused. Matching is
 * forgiving: a query matches when it is a prefix, a word-prefix, a substring,
 * or - as a last resort - an in-order subsequence of the label ("prj" finds
 * "Projects"). Better matches sort first.
 */

/** One selectable entry in the palette. */
export type CommandItem = {
  id: string;
  label: string;
  /** Secondary text shown (and searched) beside the label, e.g. a project summary. */
  hint?: string;
  href: string;
  group: "Pages" | "Projects" | "Blog";
};

/** True when every character of `needle` appears in `haystack` in order. */
function isSubsequence(needle: string, haystack: string): boolean {
  let i = 0;
  for (const ch of haystack) {
    if (ch === needle[i]) i++;
    if (i === needle.length) return true;
  }
  return needle.length === 0;
}

/**
 * Scores how well `query` matches `item`; `null` means no match. Lower is better.
 * 0 label prefix, 1 word prefix, 2 label substring, 3 hint substring, 4 fuzzy.
 */
export function scoreItem(item: CommandItem, query: string): number | null {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const label = item.label.toLowerCase();
  if (label.startsWith(q)) return 0;
  if (label.split(/[\s\-_/]+/).some((w) => w.startsWith(q))) return 1;
  if (label.includes(q)) return 2;
  if (item.hint?.toLowerCase().includes(q)) return 3;
  if (isSubsequence(q, label)) return 4;
  return null;
}

/** Display order of the groups, so each heading appears exactly once. */
const GROUP_ORDER: CommandItem["group"][] = ["Pages", "Projects", "Blog"];

/**
 * Filters and ranks `items` for `query`. An empty query returns every item in
 * its original order. Otherwise results are kept contiguous by group (so the UI
 * shows each heading once) and ranked best-first within each group. Ties keep
 * their original order.
 */
export function filterCommands(
  items: CommandItem[],
  query: string,
): CommandItem[] {
  if (!query.trim()) return items;
  return items
    .map((item, index) => ({ item, index, score: scoreItem(item, query) }))
    .filter(
      (r): r is { item: CommandItem; index: number; score: number } =>
        r.score !== null,
    )
    .sort(
      (a, b) =>
        GROUP_ORDER.indexOf(a.item.group) - GROUP_ORDER.indexOf(b.item.group) ||
        a.score - b.score ||
        a.index - b.index,
    )
    .map((r) => r.item);
}
