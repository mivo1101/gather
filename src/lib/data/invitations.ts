import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  invitationIdFromLegacyRouteKey,
  invitationSlug,
  isInvitationUuid,
} from "@/lib/invitation-paths";
import {
  createDefaultContent,
  normalizeContent,
  type InvitationContent,
} from "./invitation-content";
import type {
  Invitation,
  InvitationQuery,
  InvitationSort,
  InvitationStatus,
  InvitationUpdate,
} from "./types";

export interface InvitationRow {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  status: InvitationStatus;
  cover_image: string | null;
  event_date: string | null;
  location: string | null;
  content?: InvitationContent | Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export const INVITATION_COLUMNS =
  "id, user_id, title, slug, status, cover_image, event_date, location, content, created_at, updated_at";

function mapInvitation(row: InvitationRow): Invitation {
  return {
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
}

/** Map an embedded Supabase invitation row and retain legacy slug upgrades. */
export async function invitationFromDatabaseRow(
  row: InvitationRow,
): Promise<Invitation> {
  return maybeUpgradeSlug(mapInvitation(row));
}

function sortInvitations(
  invitations: Invitation[],
  sort: InvitationSort = "updated_desc",
): Invitation[] {
  const list = [...invitations];

  switch (sort) {
    case "updated_asc":
      return list.sort(
        (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      );
    case "title_asc":
      return list.sort((a, b) => a.title.localeCompare(b.title));
    case "event_asc":
      return list.sort((a, b) => {
        if (!a.eventDate && !b.eventDate) return 0;
        if (!a.eventDate) return 1;
        if (!b.eventDate) return -1;
        return (
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        );
      });
    case "updated_desc":
    default:
      return list.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }
}

async function allocateUniqueSlug(
  baseTitle: string,
  excludeId?: string,
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const base = invitationSlug(baseTitle);

  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    let request = supabase
      .from("invitations")
      .select("id")
      .eq("slug", candidate);

    if (excludeId) {
      request = request.neq("id", excludeId);
    }

    const { data, error } = await request.maybeSingle();
    if (error) {
      throw new Error(formatInvitationDbError(error.message));
    }
    if (!data) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Drop migration suffixes like `the-big-one-39aeabaf` when the clean
 * title slug is free. Collisions become `the-big-one-2`, not random ids.
 */
async function maybeUpgradeSlug(invitation: Invitation): Promise<Invitation> {
  const preferred = invitationSlug(invitation.title);
  if (invitation.slug === preferred) return invitation;

  const generatedPattern = new RegExp(
    `^${escapeRegExp(preferred)}-([0-9a-f]{8}|\\d+)$`,
    "i",
  );
  if (!generatedPattern.test(invitation.slug)) return invitation;

  const next = await allocateUniqueSlug(invitation.title, invitation.id);
  if (next === invitation.slug) return invitation;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("invitations")
    .update({ slug: next })
    .eq("id", invitation.id)
    .eq("user_id", invitation.userId)
    .select(INVITATION_COLUMNS)
    .single();

  if (error || !data) {
    // Keep serving the existing slug if upgrade fails (e.g. race).
    return invitation;
  }

  return mapInvitation(data as InvitationRow);
}

/** Fetch invitations for a signed-in user from Supabase. */
export async function getInvitationsForUser(
  userId: string,
  query: InvitationQuery = {},
): Promise<Invitation[]> {
  const supabase = getSupabaseAdmin();

  let request = supabase
    .from("invitations")
    .select(INVITATION_COLUMNS)
    .eq("user_id", userId);

  if (query.status && query.status !== "all") {
    request = request.eq("status", query.status);
  }

  if (query.search?.trim()) {
    request = request.ilike("title", `%${query.search.trim()}%`);
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(formatInvitationDbError(error.message));
  }

  return sortInvitations(
    await Promise.all(
      ((data as InvitationRow[] | null)?.map(mapInvitation) ?? []).map(
        maybeUpgradeSlug,
      ),
    ),
    query.sort,
  );
}

/** Fetch a single invitation owned by the user (by UUID). */
export async function getInvitationForUser(
  userId: string,
  invitationId: string,
): Promise<Invitation | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("invitations")
    .select(INVITATION_COLUMNS)
    .eq("id", invitationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(formatInvitationDbError(error.message));
  }

  return data ? maybeUpgradeSlug(mapInvitation(data as InvitationRow)) : null;
}

/**
 * Resolve an invitation from a route key:
 * - canonical slug (`emma-lucas-wedding`)
 * - legacy UUID
 * - legacy `title--uuid`
 */
export async function getInvitationByRouteKeyForUser(
  userId: string,
  routeKey: string,
): Promise<Invitation | null> {
  const supabase = getSupabaseAdmin();
  let decoded = routeKey;
  try {
    decoded = decodeURIComponent(routeKey);
  } catch {
    decoded = routeKey;
  }

  if (!isInvitationUuid(decoded)) {
    const { data, error } = await supabase
      .from("invitations")
      .select(INVITATION_COLUMNS)
      .eq("user_id", userId)
      .eq("slug", decoded)
      .maybeSingle();

    if (error) {
      throw new Error(formatInvitationDbError(error.message));
    }
    if (data) {
      return maybeUpgradeSlug(mapInvitation(data as InvitationRow));
    }
  }

  const legacyId = invitationIdFromLegacyRouteKey(decoded);
  if (!legacyId) return null;
  return getInvitationForUser(userId, legacyId);
}

/** Create a draft invitation for the user and return it. */
export async function createInvitation(input: {
  userId: string;
  title?: string;
  content?: InvitationContent;
}): Promise<Invitation> {
  const supabase = getSupabaseAdmin();
  const title = input.title?.trim() || "Untitled invitation";
  const content = input.content ?? createDefaultContent({ title });
  const slug = await allocateUniqueSlug(title);

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      user_id: input.userId,
      title,
      slug,
      status: "draft",
      cover_image: null,
      content,
    })
    .select(INVITATION_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(
      formatInvitationDbError(
        error?.message ?? "Failed to create invitation.",
      ),
    );
  }

  return mapInvitation(data as InvitationRow);
}

/** Update an invitation owned by the user. */
export async function updateInvitationForUser(
  userId: string,
  invitationId: string,
  update: InvitationUpdate,
): Promise<Invitation> {
  const supabase = getSupabaseAdmin();

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (update.title !== undefined) {
    const title = update.title;
    payload.title = title;

    const current = await getInvitationForUser(userId, invitationId);
    if (!current) {
      throw new Error("Invitation not found.");
    }
    if (title !== current.title || !current.slug) {
      payload.slug = await allocateUniqueSlug(title, invitationId);
    }
  }
  if (update.status !== undefined) payload.status = update.status;
  if (update.coverImage !== undefined) payload.cover_image = update.coverImage;
  if (update.eventDate !== undefined) payload.event_date = update.eventDate;
  if (update.location !== undefined) payload.location = update.location;
  if (update.content !== undefined) payload.content = update.content;

  const { data, error } = await supabase
    .from("invitations")
    .update(payload)
    .eq("id", invitationId)
    .eq("user_id", userId)
    .select(INVITATION_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(
      formatInvitationDbError(
        error?.message ?? "Failed to update invitation.",
      ),
    );
  }

  return mapInvitation(data as InvitationRow);
}

/** Permanently delete archived invitations owned by the user. */
export async function permanentlyDeleteInvitationsForUser(
  userId: string,
  invitationIds: string[],
): Promise<number> {
  const ids = [...new Set(invitationIds.filter(Boolean))];
  if (ids.length === 0) return 0;

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("invitations")
    .delete()
    .eq("user_id", userId)
    .eq("status", "archived")
    .in("id", ids)
    .select("id");

  if (error) {
    throw new Error(formatInvitationDbError(error.message));
  }

  return data?.length ?? 0;
}

/** Permanently delete every archived invitation for the user. */
export async function clearTrashedInvitationsForUser(
  userId: string,
): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("invitations")
    .delete()
    .eq("user_id", userId)
    .eq("status", "archived")
    .select("id");

  if (error) {
    throw new Error(formatInvitationDbError(error.message));
  }

  return data?.length ?? 0;
}

function formatInvitationDbError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("content") && lower.includes("does not exist")) {
    return (
      "Missing invitations.content column. In Supabase → SQL Editor, run: " +
      "alter table public.invitations add column if not exists content jsonb not null default '{}'::jsonb;"
    );
  }
  if (lower.includes("slug") && lower.includes("does not exist")) {
    return (
      "Missing invitations.slug column. In Supabase → SQL Editor, run the SQL in " +
      "supabase/migrations/003_invitation_slug.sql"
    );
  }

  return `Failed to load invitation data: ${message}`;
}
