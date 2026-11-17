/**
 * Loading placeholder for the GitHub activity panel, shaped like the loaded layout so nothing
 * jumps when the data arrives. Kept in its own file so the home page can show it while the
 * (lazy-loaded) calendar bundle is still downloading.
 */
export function GithubCalendarSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="mb-5 flex items-center justify-between">
        <div className="h-9 w-44 rounded-full bg-muted" />
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders, never reordered
          <div key={i} className="h-[78px] rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-[170px] rounded-xl bg-muted" />
    </div>
  );
}
