"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createEventWorkspace,
  eventPath,
  linkInvitationToEvent,
  permanentlyDeleteEventForUser,
  updateEventStatusForUser,
} from "@/lib/data/event-workspaces";
import { upsertUser } from "@/lib/data/users-db";

export async function createEventAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) redirect("/signin");

  await upsertUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  const name = String(formData.get("name") ?? "").trim();
  const event = await createEventWorkspace({
    userId: session.user.id,
    name: name || "Untitled event",
  });

  revalidatePath("/invitations");
  redirect(eventPath(event));
}

export async function linkInvitationToEventAction(
  eventId: string,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const invitationId = String(formData.get("invitationId") ?? "");
  if (!invitationId) redirect(`/invitations/${eventId}?error=design-required`);

  const event = await linkInvitationToEvent({
    userId: session.user.id,
    eventId,
    invitationId,
  });

  revalidatePath("/invitations");
  revalidatePath(eventPath(event));
  redirect(eventPath(event));
}

export async function setEventArchivedAction(
  eventId: string,
  archived: boolean,
): Promise<{ ok: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  try {
    await updateEventStatusForUser({
      userId: session.user.id,
      eventId,
      status: archived ? "archived" : "draft",
    });
    revalidatePath("/invitations");
    return { ok: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update event.",
    };
  }
}

export async function permanentlyDeleteEventAction(
  eventId: string,
): Promise<{ ok: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  try {
    const deleted = await permanentlyDeleteEventForUser({
      userId: session.user.id,
      eventId,
    });
    if (!deleted) return { error: "Event not found." };
    revalidatePath("/invitations");
    return { ok: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete event.",
    };
  }
}
