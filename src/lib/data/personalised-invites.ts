import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { EventGuest } from "@/lib/data/guests";
import {
  normalizeContent,
  type InvitationContent,
} from "@/lib/data/invitation-content";
import type { Invitation } from "@/lib/data/types";
import { invitationSlug } from "@/lib/invitation-paths";

export interface PersonalisedInvite {
  event: {
    id: string;
    name: string;
    slug: string;
    eventDate: string | null;
    timezone: string;
    venue: string | null;
    address: string | null;
  };
  guest: EventGuest;
  invitation: Invitation;
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

interface EventRow {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  event_date: string | null;
  timezone: string;
  venue: string | null;
  address: string | null;
  invitation_id: string | null;
}

interface InvitationRow {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  status: Invitation["status"];
  cover_image: string | null;
  event_date: string | null;
  location: string | null;
  content?: InvitationContent | Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Resolve a guest invite by event alias + opaque token.
 * Token is the secret; slug must match the linked event.
 */
export async function getPersonalisedInvite(
  eventSlug: string,
  token: string,
): Promise<PersonalisedInvite | null> {
  const cleanToken = token.trim();
  const cleanSlug = eventSlug.trim();
  if (!cleanToken || !cleanSlug) return null;

  const supabase = getSupabaseAdmin();

  const { data: guestRow, error: guestError } = await supabase
    .from("event_guests")
    .select(
      "id, event_id, prefix, display_name, email, token, created_at, updated_at",
    )
    .eq("token", cleanToken)
    .maybeSingle();

  if (guestError) {
    throw new Error(`Failed to resolve invite: ${guestError.message}`);
  }
  if (!guestRow) return null;

  const guest = guestRow as GuestRow;

  const { data: eventRow, error: eventError } = await supabase
    .from("events")
    .select(
      "id, user_id, name, slug, event_date, timezone, venue, address, invitation_id",
    )
    .eq("id", guest.event_id)
    .maybeSingle();

  if (eventError) {
    throw new Error(`Failed to resolve invite event: ${eventError.message}`);
  }
  if (!eventRow) return null;

  const event = eventRow as EventRow;
  if (event.slug !== cleanSlug) return null;
  if (!event.invitation_id) return null;

  const { data: invitationRow, error: invitationError } = await supabase
    .from("invitations")
    .select(
      "id, user_id, title, slug, status, cover_image, event_date, location, content, created_at, updated_at",
    )
    .eq("id", event.invitation_id)
    .maybeSingle();

  if (invitationError) {
    throw new Error(
      `Failed to resolve invite design: ${invitationError.message}`,
    );
  }
  if (!invitationRow) return null;

  const row = invitationRow as InvitationRow;
  const invitation: Invitation = {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    slug: row.slug || invitationSlug(row.title),
    status: row.status,
    coverImage: row.cover_image,
    eventDate: row.event_date,
    location: row.location,
    content: normalizeContent(row.content, {
      title: row.title,
      location: row.location ?? undefined,
    }),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  return {
    event: {
      id: event.id,
      name: event.name,
      slug: event.slug,
      eventDate: event.event_date,
      timezone: event.timezone,
      venue: event.venue,
      address: event.address,
    },
    guest: {
      id: guest.id,
      eventId: guest.event_id,
      prefix: guest.prefix ?? "",
      displayName: guest.display_name,
      email: guest.email,
      token: guest.token,
      createdAt: guest.created_at,
      updatedAt: guest.updated_at,
    },
    invitation,
  };
}
