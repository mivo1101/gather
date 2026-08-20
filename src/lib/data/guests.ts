import { randomBytes, randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Free-plan recipient limit. Count unique emails, not people. */
export const FREE_RECIPIENT_LIMIT = 10;

export const GUEST_PREFIX_OPTIONS = [
  "",
  "Mr",
  "Mrs",
  "Ms",
  "Miss",
  "Mx",
  "Dr",
] as const;

export type GuestPrefix = (typeof GUEST_PREFIX_OPTIONS)[number];

export interface EventGuest {
  id: string;
  eventId: string;
  prefix: string;
  displayName: string;
  email: string;
  token: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestDraft {
  id?: string;
  prefix: string;
  displayName: string;
  email: string;
}

export interface GuestFieldError {
  row: number;
  field: "prefix" | "displayName" | "email" | "form";
  message: string;
}

export interface GuestValidationResult {
  ok: boolean;
  errors: GuestFieldError[];
  recipientCount: number;
  guests: GuestDraft[];
}

interface GuestRow {
  id: string;
  event_id: string;
  prefix: string;
  display_name: string;
  email: string;
  token: string;
  created_at: string;
  updated_at: string;
}

const GUEST_COLUMNS =
  "id, event_id, prefix, display_name, email, token, created_at, updated_at";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapGuest(row: GuestRow): EventGuest {
  return {
    id: row.id,
    eventId: row.event_id,
    prefix: row.prefix ?? "",
    displayName: row.display_name,
    email: row.email,
    token: row.token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createEmptyGuestDraft(): GuestDraft {
  return { prefix: "", displayName: "", email: "" };
}

export function guestRecipientCount(guests: GuestDraft[]): number {
  const emails = new Set(
    guests
      .map((guest) => guest.email.trim().toLowerCase())
      .filter(Boolean),
  );
  return emails.size;
}

export function validateGuestDrafts(
  drafts: GuestDraft[],
  options?: { limit?: number; requireAtLeastOne?: boolean },
): GuestValidationResult {
  const limit = options?.limit ?? FREE_RECIPIENT_LIMIT;
  const errors: GuestFieldError[] = [];
  const normalised: GuestDraft[] = [];
  const seenEmails = new Map<string, number>();

  drafts.forEach((draft, index) => {
    const prefix = draft.prefix.trim();
    const displayName = draft.displayName.trim();
    const email = draft.email.trim();
    const blank = !prefix && !displayName && !email;

    if (blank) return;

    if (!displayName) {
      errors.push({
        row: index,
        field: "displayName",
        message: "Display name is required.",
      });
    }

    if (!email) {
      errors.push({
        row: index,
        field: "email",
        message: "Email is required.",
      });
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.push({
        row: index,
        field: "email",
        message: "Enter a valid email address.",
      });
    } else {
      const key = email.toLowerCase();
      const prior = seenEmails.get(key);
      if (prior !== undefined) {
        errors.push({
          row: index,
          field: "email",
          message: "This email is already used by another guest.",
        });
      } else {
        seenEmails.set(key, index);
      }
    }

    normalised.push({
      id: draft.id,
      prefix,
      displayName,
      email,
    });
  });

  const recipientCount = seenEmails.size;
  if (recipientCount > limit) {
    errors.push({
      row: -1,
      field: "form",
      message: `Free accounts can invite up to ${limit} email recipients.`,
    });
  }

  if (options?.requireAtLeastOne && normalised.length === 0) {
    errors.push({
      row: -1,
      field: "form",
      message: "Add at least one guest to continue.",
    });
  }

  return {
    ok: errors.length === 0,
    errors,
    recipientCount,
    guests: normalised,
  };
}

function createGuestToken(): string {
  return randomBytes(9).toString("base64url");
}

export async function countGuestsForEvent(eventId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("event_guests")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (error) {
    if (isMissingGuestsTable(error.message)) return 0;
    throw new Error(formatGuestDbError(error.message));
  }
  return count ?? 0;
}

export async function getGuestsForEvent(
  eventId: string,
): Promise<EventGuest[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("event_guests")
    .select(GUEST_COLUMNS)
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(formatGuestDbError(error.message));
  return ((data as GuestRow[] | null) ?? []).map(mapGuest);
}

/** Guest IDs with an invitation that was successfully sent. */
export async function getSentGuestIdsForEvent(
  eventId: string,
): Promise<Set<string>> {
  const supabase = getSupabaseAdmin();
  const { data: guests, error: guestError } = await supabase
    .from("event_guests")
    .select("id")
    .eq("event_id", eventId);

  if (guestError) throw new Error(formatGuestDbError(guestError.message));

  const guestIds = ((guests as Array<{ id: string }> | null) ?? []).map(
    (guest) => guest.id,
  );
  if (guestIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from("event_email_deliveries")
    .select("guest_id")
    .eq("status", "sent")
    .in("guest_id", guestIds);

  // No invitation can have been sent before the email tables exist.
  if (error && isMissingEmailDeliveriesTable(error.message)) return new Set();
  if (error) throw new Error(`Failed to load invitation status: ${error.message}`);

  return new Set(
    ((data as Array<{ guest_id: string }> | null) ?? []).map(
      (delivery) => delivery.guest_id,
    ),
  );
}

export async function replaceGuestsForEvent(input: {
  eventId: string;
  userId: string;
  guests: GuestDraft[];
  requireAtLeastOne?: boolean;
}): Promise<EventGuest[]> {
  const validation = validateGuestDrafts(input.guests, {
    requireAtLeastOne: input.requireAtLeastOne,
  });
  if (!validation.ok) {
    const first = validation.errors[0];
    throw new Error(first?.message ?? "Guest list is invalid.");
  }

  const supabase = getSupabaseAdmin();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", input.eventId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (eventError) throw new Error(formatGuestDbError(eventError.message));
  if (!event) throw new Error("Event not found.");

  const existing = await getGuestsForEvent(input.eventId);
  const existingById = new Map(existing.map((guest) => [guest.id, guest]));
  const existingByEmail = new Map(
    existing.map((guest) => [guest.email.toLowerCase(), guest]),
  );

  const sentGuestIds = await getSentGuestIdsForEvent(input.eventId);
  for (const sentGuestId of sentGuestIds) {
    const prior = existingById.get(sentGuestId);
    const submitted = validation.guests.find(
      (guest) => guest.id === sentGuestId,
    );
    if (
      !prior ||
      !submitted ||
      submitted.prefix !== prior.prefix ||
      submitted.displayName !== prior.displayName ||
      submitted.email.toLowerCase() !== prior.email.toLowerCase()
    ) {
      throw new Error(
        "This invitation has already been sent. This guest’s details can no longer be changed or removed.",
      );
    }
  }

  const now = new Date().toISOString();
  const keepIds = new Set<string>();

  const rows = validation.guests.map((guest) => {
    const prior =
      (guest.id ? existingById.get(guest.id) : undefined) ??
      existingByEmail.get(guest.email.toLowerCase());
    const id = prior?.id ?? randomUUID();
    keepIds.add(id);
    return {
      id,
      event_id: input.eventId,
      prefix: guest.prefix,
      display_name: guest.displayName,
      email: guest.email.toLowerCase(),
      token: prior?.token ?? createGuestToken(),
      updated_at: now,
      created_at: prior?.createdAt ?? now,
    };
  });

  const removeIds = existing
    .filter((guest) => !keepIds.has(guest.id))
    .map((guest) => guest.id);

  if (removeIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("event_guests")
      .delete()
      .eq("event_id", input.eventId)
      .in("id", removeIds);
    if (deleteError) throw new Error(formatGuestDbError(deleteError.message));
  }

  if (rows.length === 0) {
    await supabase
      .from("events")
      .update({ updated_at: now })
      .eq("id", input.eventId)
      .eq("user_id", input.userId);
    return [];
  }

  const { data, error } = await supabase
    .from("event_guests")
    .upsert(rows, { onConflict: "id" })
    .select(GUEST_COLUMNS)
    .order("created_at", { ascending: true });

  if (error || !data) {
    throw new Error(
      formatGuestDbError(error?.message ?? "Failed to save guests."),
    );
  }

  await supabase
    .from("events")
    .update({ updated_at: now })
    .eq("id", input.eventId)
    .eq("user_id", input.userId);

  return (data as GuestRow[]).map(mapGuest);
}

function isMissingGuestsTable(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("event_guests") &&
    (lower.includes("does not exist") ||
      lower.includes("schema cache") ||
      lower.includes("could not find the table"))
  );
}

function isMissingEmailDeliveriesTable(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("event_email_deliveries") &&
    (lower.includes("does not exist") ||
      lower.includes("schema cache") ||
      lower.includes("could not find the table"))
  );
}

function formatGuestDbError(message: string): string {
  if (isMissingGuestsTable(message)) {
    return "Missing guests table. Run supabase/migrations/005_event_guests.sql.";
  }
  const lower = message.toLowerCase();
  if (lower.includes("event_guests_event_email") || lower.includes("unique")) {
    return "Each guest email must be unique for this event.";
  }
  return `Failed to save guests: ${message}`;
}
