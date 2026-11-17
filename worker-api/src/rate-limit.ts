/** Start of the current UTC calendar day, as an ISO string - daily caps reset at UTC midnight. */
export function startOfUtcDay(now = new Date()): string {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}
