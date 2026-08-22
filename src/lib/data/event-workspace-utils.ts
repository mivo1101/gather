/**
 * Pure event-workspace helpers and types.
 *
 * Deliberately free of database imports: client components import from here so
 * that `event-workspaces.ts` (Supabase + node:crypto via ./guests) never gets
 * pulled into a browser bundle.
 */
import type { Invitation } from "./types";

export type EventStatus = "draft" | "active" | "completed" | "archived";
export type EventSetupStep = "design" | "details" | "guests" | "send";

/** Keep events active for their full local calendar day, then complete them. */
export function currentEventStatus(
  status: EventStatus,
  eventDate: string | null,
  timezone: string,
  now = Date.now(),
): EventStatus {
  if (status !== "active" || !eventDate) return status;
  const scheduledAt = Date.parse(eventDate);
  if (!Number.isFinite(scheduledAt)) return status;
  try {
    const dayKey = (value: number) => {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(value);
      const part = (type: "year" | "month" | "day") =>
        parts.find((item) => item.type === type)?.value ?? "";
      return `${part("year")}-${part("month")}-${part("day")}`;
    };
    return dayKey(now) > dayKey(scheduledAt) ? "completed" : status;
  } catch {
    return scheduledAt < now ? "completed" : status;
  }
}

export interface EventSetupProgress {
  design: boolean;
  details: boolean;
  guests: boolean;
  send: boolean;
  completed: number;
  total: number;
}

export interface EventWorkspace {
  id: string;
  userId: string;
  name: string;
  slug: string;
  status: EventStatus;
  eventDate: string | null;
  timezone: string;
  venue: string | null;
  address: string | null;
  invitationId: string | null;
  invitation: Invitation | null;
  createdAt: string;
  updatedAt: string;
  progress: EventSetupProgress;
}

export interface DesignLocationHints {
  venue: string | null;
  address: string | null;
  mapsQuery: string | null;
  /** Combined label for mismatch copy */
  label: string | null;
}

/** Prefill location from location pages and map widgets in the design. */
export function designLocationFromInvitation(
  invitation: Invitation | null | undefined,
): DesignLocationHints {
  if (!invitation) {
    return { venue: null, address: null, mapsQuery: null, label: null };
  }

  let venue: string | null = null;
  let address: string | null = null;
  let mapsQuery: string | null = null;

  for (const page of invitation.content.pages) {
    if (page.location?.venue?.trim()) venue ??= page.location.venue.trim();
    if (page.location?.address?.trim()) address ??= page.location.address.trim();
    if (page.location?.mapsQuery?.trim()) {
      mapsQuery ??= page.location.mapsQuery.trim();
    }
    for (const element of page.elements) {
      if (element.widget?.kind === "map" && element.widget.mapsQuery.trim()) {
        mapsQuery ??= element.widget.mapsQuery.trim();
      }
    }
  }

  if (!venue && invitation.location?.trim()) {
    venue = invitation.location.trim();
  }

  // Map search text often looks like "Venue, suburb" - split into fields.
  if (mapsQuery && (!venue || !address)) {
    const parts = mapsQuery
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      venue ??= parts[0] ?? null;
      address ??= parts.slice(1).join(", ") || null;
    } else if (parts.length === 1) {
      venue ??= parts[0] ?? null;
    }
  }

  const label =
    [venue, address].filter(Boolean).join(", ") || mapsQuery || null;

  return { venue, address, mapsQuery, label };
}

export function eventLocation(event: EventWorkspace): string | null {
  const parts = [event.venue, event.address].filter(
    (part): part is string => Boolean(part?.trim()),
  );
  return parts.length ? parts.join(", ") : null;
}

export function eventPath(event: Pick<EventWorkspace, "slug">): string {
  return `/invitations/${event.slug}`;
}
