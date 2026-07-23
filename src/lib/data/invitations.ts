import { getSupabaseAdmin } from "@/lib/supabase/admin";
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

interface InvitationRow {
  id: string;
  user_id: string;
  title: string;
  status: InvitationStatus;
  cover_image: string | null;
  event_date: string | null;
  location: string | null;
  content?: InvitationContent | Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

const INVITATION_COLUMNS =
  "id, user_id, title, status, cover_image, event_date, location, content, created_at, updated_at";

function mapInvitation(row: InvitationRow): Invitation {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
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
    (data as InvitationRow[] | null)?.map(mapInvitation) ?? [],
    query.sort,
  );
}

/** Fetch a single invitation owned by the user. */
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

  return data ? mapInvitation(data as InvitationRow) : null;
}

/** Create a draft invitation for the user and return it. */
export async function createInvitation(input: {
  userId: string;
  title?: string;
}): Promise<Invitation> {
  const supabase = getSupabaseAdmin();
  const title = input.title?.trim() || "Untitled invitation";
  const content = createDefaultContent({ title });

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      user_id: input.userId,
      title,
      status: "draft",
      cover_image: "/images/flowers/flower-8.png",
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

  if (update.title !== undefined) payload.title = update.title;
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

function formatInvitationDbError(message: string): string {
  if (message.toLowerCase().includes("content") && message.toLowerCase().includes("does not exist")) {
    return (
      "Missing invitations.content column. In Supabase → SQL Editor, run: " +
      "alter table public.invitations add column if not exists content jsonb not null default '{}'::jsonb;"
    );
  }

  return `Failed to load invitation data: ${message}`;
}
