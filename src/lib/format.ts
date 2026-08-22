/** Relative time labels for last-edited timestamps */
export function formatRelativeTime(iso: string, now = new Date()): string {
  const then = new Date(iso).getTime();
  const diffMs = Math.max(0, now.getTime() - then);
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Friendly event date, e.g. "18 Jul 2027" */
export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Countdown to an event, e.g. "Today", "Tomorrow", "in 12 days" */
export function formatCountdown(iso: string, now = new Date()): string | null {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;

  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const days = Math.round(
    (startOfDay(then) - startOfDay(now)) / 86_400_000,
  );

  if (days < 0) return null;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 14) return `in ${days} days`;
  if (days < 60) return `in ${Math.round(days / 7)} weeks`;
  return `in ${Math.round(days / 30)} months`;
}
