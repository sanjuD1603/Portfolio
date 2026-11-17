/** Where Umami's tracker script is loaded from when `NEXT_PUBLIC_UMAMI_SRC` is not set. */
export const DEFAULT_UMAMI_SRC = "https://cloud.umami.is/script.js";

/**
 * Reads the Umami settings from the environment.
 * Analytics is strictly opt-in: with no website ID this returns `null`, and the
 * site loads no tracking script at all (so local dev and forks stay clean).
 *
 * @param env - Environment object (defaults to `process.env`; injectable for tests).
 */
export function getUmamiConfig(
  env: Record<string, string | undefined> = process.env,
): { websiteId: string; src: string } | null {
  const websiteId = env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
  if (!websiteId) return null;
  return {
    websiteId,
    src: env.NEXT_PUBLIC_UMAMI_SRC?.trim() || DEFAULT_UMAMI_SRC,
  };
}
