"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createEventWorkspace,
  designLocationFromInvitation,
  eventPath,
  getEventByInvitationId,
  getEventWorkspaceForUser,
  linkInvitationToEvent,
  permanentlyDeleteEventForUser,
  updateEventDetailsForUser,
  updateEventStatusForUser,
} from "@/lib/data/event-workspaces";
import { getInvitationForUser } from "@/lib/data/invitations";
import { invitationContinuePath } from "@/lib/invitation-paths";
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

/**
 * Connect a design to an existing event or create a new one, then continue
 * to the event details step.
 */
export async function connectDesignToEventAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) redirect("/signin");

  await upsertUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  const invitationId = String(formData.get("invitationId") ?? "").trim();
  const mode = String(formData.get("mode") ?? "").trim();
  const eventId = String(formData.get("eventId") ?? "").trim();
  const newName = String(formData.get("name") ?? "").trim();

  const invitation = await getInvitationForUser(session.user.id, invitationId);
  if (!invitation) redirect("/invitations");

  const continueBase = invitationContinuePath(invitation);
  const designLocation = designLocationFromInvitation(invitation);

  let event;
  try {
    if (mode === "existing") {
      if (!eventId) redirect(`${continueBase}?error=event-required`);
      event = await linkInvitationToEvent({
        userId: session.user.id,
        eventId,
        invitationId: invitation.id,
      });
    } else if (mode === "create") {
      const existing = await getEventByInvitationId(
        session.user.id,
        invitation.id,
      );
      if (existing) {
        event = existing;
      } else {
        event = await createEventWorkspace({
          userId: session.user.id,
          name: newName || invitation.title || "Untitled event",
          invitationId: invitation.id,
          eventDate: invitation.eventDate,
          venue: designLocation.venue,
          address: designLocation.address,
        });
      }
    } else {
      redirect(`${continueBase}?error=mode-required`);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not connect this design.";
    redirect(
      `${continueBase}?error=${encodeURIComponent(message)}`,
    );
  }

  revalidatePath("/invitations");
  revalidatePath(eventPath(event));
  redirect(`${continueBase}?step=details`);
}

export async function saveEventDetailsAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const eventId = String(formData.get("eventId") ?? "").trim();
  const invitationId = String(formData.get("invitationId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  const invitation = invitationId
    ? await getInvitationForUser(session.user.id, invitationId)
    : null;
  const continueBase = invitation
    ? invitationContinuePath(invitation)
    : "/invitations";

  if (!eventId) redirect(`${continueBase}?step=details&error=event-required`);
  if (!name) {
    redirect(`${continueBase}?step=details&error=name-required`);
  }
  if (!date) {
    redirect(`${continueBase}?step=details&error=date-required`);
  }

  const eventDate = time
    ? new Date(`${date}T${time}:00`).toISOString()
    : new Date(`${date}T12:00:00`).toISOString();

  let event;
  try {
    event = await updateEventDetailsForUser({
      userId: session.user.id,
      eventId,
      name,
      eventDate,
      timezone: timezone || "Australia/Melbourne",
      venue,
      address,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save event details.";
    redirect(
      `${continueBase}?step=details&error=${encodeURIComponent(message)}`,
    );
  }

  revalidatePath("/invitations");
  revalidatePath(eventPath(event));
  redirect(
    invitation
      ? `${invitationContinuePath(invitation)}?step=guests`
      : `${eventPath(event)}?setup=details-done`,
  );
}

export async function updateEventDetailsFromHubAction(
  eventId: string,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const event = await getEventWorkspaceForUser(session.user.id, eventId);
  if (!event) redirect("/invitations");

  const name = String(formData.get("name") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!name || !date) redirect(`${eventPath(event)}?error=details-required`);

  const eventDate = time
    ? new Date(`${date}T${time}:00`).toISOString()
    : new Date(`${date}T12:00:00`).toISOString();

  const updated = await updateEventDetailsForUser({
    userId: session.user.id,
    eventId: event.id,
    name,
    eventDate,
    timezone: timezone || event.timezone,
    venue,
    address,
  });

  revalidatePath("/invitations");
  revalidatePath(eventPath(updated));
  redirect(eventPath(updated));
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
