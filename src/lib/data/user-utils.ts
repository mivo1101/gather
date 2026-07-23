import type { User } from "./types";

export function getDisplayName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
