import { invitationSlug, isInvitationUuid } from "@/lib/invitation-paths";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { countGuestsForEvent } from "./guests";
import {
  getInvitationForUser,
  getInvitationsForUser,
  INVITATION_COLUMNS,
  invitationFromDatabaseRow,
  type InvitationRow,
} from "./invitations";
import type { Invitation } from "./types";

export type {
  DesignLocationHints,
  EventSetupProgress,
  EventSetupStep,
  EventStatus,
  EventWorkspace,
} from "./event-workspace-utils";
export {
  designLocationFromInvitation,
  eventLocation,
  eventPath,
} from "./event-workspace-utils";
import {
  designLocationFromInvitation,
  type EventSetupProgress,
  type EventStatus,
  type EventWorkspace,
} from "./event-workspace-utils";


interface EventRow {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  status: EventStatus;
  event_date: string | null;
  timezone: string;
  venue: string | null;
  address: string | null;
  invitation_id: string | null;
  created_at: string;
  updated_at: string;
}

interface EventListRow extends EventRow {
  invitation: InvitationRow | null;
  event_guests: Array<{ id: string }> | null;
}

const EVENT_COLUMNS =
  "id, user_id, name, slug, status, event_date, timezone, venue, address, invitation_id, created_at, updated_at";

/** Keep events active for their full local calendar day, then complete them. */
function currentEventStatus(
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

function hasDesignedPage(invitation: Invitation | null): boolean {
  return Boolean(
    invitation?.content.pages.some(
      (page) =>
        page.elements.length > 0 ||
        page.kind === "location" ||
        page.kind === "rsvp",
    ),
  );
}

async function mapEvent(row: EventRow): Promise<EventWorkspace> {
  const invitation = row.invitation_id
    ? await getInvitationForUser(row.user_id, row.invitation_id)
    : null;
  const design = hasDesignedPage(invitation);
  const details = Boolean(
    row.name.trim() &&
      row.event_date &&
      row.timezone.trim() &&
      row.venue?.trim() &&
      row.address?.trim(),
  );
  const guestCount = await countGuestsForEvent(row.id);
  const guests = guestCount > 0;
  const status = currentEventStatus(row.status, row.event_date, row.timezone);
  const send = status === "active" || status === "completed";
  const values = [design, details, guests, send];

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    slug: row.slug,
    status,
    eventDate: row.event_date,
    timezone: row.timezone,
    venue: row.venue,
    address: row.address,
    invitationId: row.invitation_id,
    invitation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    progress: {
      design,
      details,
      guests,
      send,
      completed: values.filter(Boolean).length,
      total: values.length,
    },
  };
}

async function mapEventListRow(row: EventListRow): Promise<EventWorkspace> {
  const invitation = row.invitation
    ? await invitationFromDatabaseRow(row.invitation)
    : null;
  const design = hasDesignedPage(invitation);
  const details = Boolean(
    row.name.trim() &&
      row.event_date &&
      row.timezone.trim() &&
      row.venue?.trim() &&
      row.address?.trim(),
  );
  const guests = (row.event_guests?.length ?? 0) > 0;
  const status = currentEventStatus(row.status, row.event_date, row.timezone);
  const send = status === "active" || status === "completed";
  const values = [design, details, guests, send];

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    slug: row.slug,
    status,
    eventDate: row.event_date,
    timezone: row.timezone,
    venue: row.venue,
    address: row.address,
    invitationId: row.invitation_id,
    invitation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    progress: {
      design,
      details,
      guests,
      send,
      completed: values.filter(Boolean).length,
      total: values.length,
    },
  };
}

async function allocateEventSlug(
  userId: string,
  name: string,
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const base = invitationSlug(name).replace(/-invitation$/, "") || "event";

  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const { data, error } = await supabase
      .from("events")
      .select("id")
      .eq("user_id", userId)
      .eq("slug", candidate)
      .maybeSingle();

    if (error) throw new Error(formatEventDbError(error.message));
    if (!data) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}

export async function getEventWorkspacesForUser(
  userId: string,
): Promise<EventWorkspace[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("events")
    .select(
      `${EVENT_COLUMNS}, invitation:invitations (${INVITATION_COLUMNS}), event_guests (id)`,
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(formatEventDbError(error.message));
  return Promise.all(
    ((data as unknown as EventListRow[] | null) ?? []).map(mapEventListRow),
  );
}

export async function getEventWorkspaceForUser(
  userId: string,
  routeKey: string,
): Promise<EventWorkspace | null> {
  const supabase = getSupabaseAdmin();
  let decoded = routeKey;
  try {
    decoded = decodeURIComponent(routeKey);
  } catch {
    decoded = routeKey;
  }

  let request = supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("user_id", userId);

  request = isInvitationUuid(decoded)
    ? request.eq("id", decoded)
    : request.eq("slug", decoded);

  const { data, error } = await request.maybeSingle();
  if (error) throw new Error(formatEventDbError(error.message));
  return data ? mapEvent(data as EventRow) : null;
}

export async function createEventWorkspace(input: {
  userId: string;
  name: string;
  invitationId?: string | null;
  eventDate?: string | null;
  timezone?: string;
  venue?: string | null;
  address?: string | null;
}): Promise<EventWorkspace> {
  const supabase = getSupabaseAdmin();
  const name = input.name.trim() || "Untitled event";
  const slug = await allocateEventSlug(input.userId, name);
  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: input.userId,
      name,
      slug,
      invitation_id: input.invitationId ?? null,
      event_date: input.eventDate ?? null,
      timezone: input.timezone?.trim() || "Australia/Melbourne",
      venue: input.venue?.trim() || null,
      address: input.address?.trim() || null,
    })
    .select(EVENT_COLUMNS)
    .single();

  if (error || !data) {
    if (error?.message.toLowerCase().includes("unique")) {
      throw new Error("That design is already connected to another event.");
    }
    throw new Error(
      formatEventDbError(error?.message ?? "Failed to create event."),
    );
  }
  return mapEvent(data as EventRow);
}

export async function getEventByInvitationId(
  userId: string,
  invitationId: string,
): Promise<EventWorkspace | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("user_id", userId)
    .eq("invitation_id", invitationId)
    .maybeSingle();

  if (error) throw new Error(formatEventDbError(error.message));
  return data ? mapEvent(data as EventRow) : null;
}

/** Lightweight route/access lookup used before opening the invitation editor. */
export async function getEventRouteStateByInvitationIdForUser(
  userId: string,
  invitationId: string,
): Promise<Pick<EventWorkspace, "slug" | "status"> | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("events")
    .select("slug, status, event_date, timezone")
    .eq("user_id", userId)
    .eq("invitation_id", invitationId)
    .maybeSingle();

  if (error) throw new Error(formatEventDbError(error.message));
  if (!data) return null;
  return {
    slug: data.slug as string,
    status: currentEventStatus(
      data.status as EventStatus,
      data.event_date as string | null,
      data.timezone as string,
    ),
  };
}

/** Events that can still accept a design (or already hold this one). */
export async function getLinkableEventsForInvitation(
  userId: string,
  invitationId: string,
): Promise<EventWorkspace[]> {
  const events = await getEventWorkspacesForUser(userId);
  return events.filter(
    (event) =>
      (event.status === "draft" || event.status === "active") &&
      (!event.invitationId || event.invitationId === invitationId),
  );
}

export async function updateEventDetailsForUser(input: {
  userId: string;
  eventId: string;
  name?: string;
  eventDate?: string | null;
  timezone?: string;
  venue?: string | null;
  address?: string | null;
}): Promise<EventWorkspace> {
  const supabase = getSupabaseAdmin();
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.name !== undefined) {
    payload.name = input.name.trim() || "Untitled event";
  }
  if (input.eventDate !== undefined) {
    payload.event_date = input.eventDate;
  }
  if (input.timezone !== undefined) {
    payload.timezone = input.timezone.trim() || "Australia/Melbourne";
  }
  if (input.venue !== undefined) {
    payload.venue = input.venue?.trim() || null;
  }
  if (input.address !== undefined) {
    payload.address = input.address?.trim() || null;
  }

  const { data, error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", input.eventId)
    .eq("user_id", input.userId)
    .select(EVENT_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(
      formatEventDbError(error?.message ?? "Failed to update event details."),
    );
  }
  return mapEvent(data as EventRow);
}

export function eventDetailsMismatches(input: {
  event: Pick<EventWorkspace, "eventDate" | "venue" | "address">;
  invitation: Invitation | null;
}): string[] {
  const warnings: string[] = [];
  const design = designLocationFromInvitation(input.invitation);
  const venue = input.event.venue?.trim() || "";
  const address = input.event.address?.trim() || "";

  if (design.venue && venue && !equalsLoose(venue, design.venue)) {
    warnings.push(
      `Venue differs from the design (“${design.venue}”).`,
    );
  }
  if (design.address && address && !equalsLoose(address, design.address)) {
    warnings.push(
      `Address differs from the design (“${design.address}”).`,
    );
  }
  if (
    design.mapsQuery &&
    venue &&
    address &&
    !equalsLoose(`${venue}, ${address}`, design.mapsQuery) &&
    !equalsLoose(venue, design.mapsQuery) &&
    !equalsLoose(address, design.mapsQuery)
  ) {
    warnings.push(
      `Location differs from the map in the design (“${design.mapsQuery}”).`,
    );
  }
  if (
    input.invitation?.eventDate &&
    input.event.eventDate &&
    !sameCalendarDay(input.invitation.eventDate, input.event.eventDate)
  ) {
    warnings.push("Date differs from the date saved on the invitation design.");
  }

  return warnings;
}

function equalsLoose(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function sameCalendarDay(a: string, b: string) {
  const left = new Date(a);
  const right = new Date(b);
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export async function getUnlinkedInvitationsForUser(
  userId: string,
): Promise<Invitation[]> {
  const supabase = getSupabaseAdmin();
  const [{ data, error }, invitations] = await Promise.all([
    supabase.from("events").select("invitation_id").eq("user_id", userId),
    getInvitationsForUser(userId, { sort: "updated_desc" }),
  ]);

  if (error) throw new Error(formatEventDbError(error.message));
  const linked = new Set(
    (data ?? [])
      .map((row) => row.invitation_id as string | null)
      .filter((id): id is string => Boolean(id)),
  );
  return invitations.filter(
    (invitation) =>
      invitation.status !== "archived" && !linked.has(invitation.id),
  );
}

export async function linkInvitationToEvent(input: {
  userId: string;
  eventId: string;
  invitationId: string;
}): Promise<EventWorkspace> {
  const [event, invitation] = await Promise.all([
    getEventWorkspaceForUser(input.userId, input.eventId),
    getInvitationForUser(input.userId, input.invitationId),
  ]);
  if (!event) throw new Error("Event not found.");
  if (event.status === "completed") {
    throw new Error("Reopen the completed event before changing its design.");
  }
  if (!invitation) throw new Error("Invitation design not found.");

  const designLocation = designLocationFromInvitation(invitation);
  const supabase = getSupabaseAdmin();
  const payload: Record<string, unknown> = {
    invitation_id: invitation.id,
    updated_at: new Date().toISOString(),
  };
  if (!event.eventDate && invitation.eventDate) {
    payload.event_date = invitation.eventDate;
  }
  if (!event.venue && designLocation.venue) {
    payload.venue = designLocation.venue;
  }
  if (!event.address && designLocation.address) {
    payload.address = designLocation.address;
  }
  if (!event.venue && !event.address && !designLocation.venue && invitation.location) {
    payload.venue = invitation.location;
  }

  const { data, error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", event.id)
    .eq("user_id", input.userId)
    .select(EVENT_COLUMNS)
    .single();

  if (error || !data) {
    if (error?.message.toLowerCase().includes("unique")) {
      throw new Error("That design is already connected to another event.");
    }
    throw new Error(
      formatEventDbError(error?.message ?? "Failed to connect design."),
    );
  }
  return mapEvent(data as EventRow);
}

export async function updateEventStatusForUser(input: {
  userId: string;
  eventId: string;
  status: EventStatus;
}): Promise<EventWorkspace> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("events")
    .update({
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.eventId)
    .eq("user_id", input.userId)
    .select(EVENT_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(
      formatEventDbError(error?.message ?? "Failed to update event."),
    );
  }
  return mapEvent(data as EventRow);
}

export async function permanentlyDeleteEventForUser(input: {
  userId: string;
  eventId: string;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("id", input.eventId)
    .eq("user_id", input.userId)
    .select("id");

  if (error) throw new Error(formatEventDbError(error.message));
  return Boolean(data?.length);
}

function formatEventDbError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("events") &&
    (lower.includes("does not exist") ||
      lower.includes("schema cache") ||
      lower.includes("could not find the table"))
  ) {
    return "Missing events table. Run supabase/migrations/004_event_workspaces.sql.";
  }
  return `Failed to load event data: ${message}`;
}
