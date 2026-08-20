import { invitationSlug, isInvitationUuid } from "@/lib/invitation-paths";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { countGuestsForEvent } from "./guests";
import {
  getInvitationForUser,
  getInvitationsForUser,
} from "./invitations";
import type { Invitation } from "./types";

export type EventStatus = "draft" | "active" | "completed" | "archived";
export type EventSetupStep = "design" | "details" | "guests" | "send";

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

const EVENT_COLUMNS =
  "id, user_id, name, slug, status, event_date, timezone, venue, address, invitation_id, created_at, updated_at";

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
  const send = row.status === "active" || row.status === "completed";
  const values = [design, details, guests, send];

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    slug: row.slug,
    status: row.status,
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
    .select(EVENT_COLUMNS)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(formatEventDbError(error.message));
  return Promise.all(((data as EventRow[] | null) ?? []).map(mapEvent));
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

/** Events that can still accept a design (or already hold this one). */
export async function getLinkableEventsForInvitation(
  userId: string,
  invitationId: string,
): Promise<EventWorkspace[]> {
  const events = await getEventWorkspacesForUser(userId);
  return events.filter(
    (event) =>
      event.status !== "archived" &&
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

  // Map search text often looks like "Venue, suburb" — split into fields.
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

export function eventLocation(event: EventWorkspace): string | null {
  const parts = [event.venue, event.address].filter(
    (part): part is string => Boolean(part?.trim()),
  );
  return parts.length ? parts.join(", ") : null;
}

export function eventPath(event: Pick<EventWorkspace, "slug">): string {
  return `/invitations/${event.slug}`;
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
