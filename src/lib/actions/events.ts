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
import {
  sendEventUpdateEmails,
  type EventDetailChange,
} from "@/lib/email/event-update";
import { isEmailSendingConfigured } from "@/lib/email/send";

function eventDateTimeLabel(value: string | null, timezone: string): string {
  if (!value) return "Not confirmed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  try {
    return date.toLocaleString("en-AU", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: timezone,
    });
  } catch {
    return date.toLocaleString("en-AU", {
      dateStyle: "long",
      timeStyle: "short",
    });
  }
}

function eventDetailChanges(
  previous: Awaited<ReturnType<typeof getEventWorkspaceForUser>>,
  next: Awaited<ReturnType<typeof updateEventDetailsForUser>>,
): EventDetailChange[] {
  if (!previous) return [];
  const changes: EventDetailChange[] = [];
  const add = (label: string, before: string, after: string) => {
    if (before.trim().toLowerCase() !== after.trim().toLowerCase()) {
      changes.push({ label, previous: before || "Not confirmed", next: after });
    }
  };

  add("Event", previous.name, next.name);
  const previousDate = eventDateTimeLabel(
    previous.eventDate,
    previous.timezone,
  );
  const nextDate = eventDateTimeLabel(next.eventDate, next.timezone);
  add("Date & Time", previousDate, nextDate);
  add("Venue", previous.venue ?? "", next.venue ?? "");
  add("Address", previous.address ?? "", next.address ?? "");
  return changes;
}

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
  if (!time) {
    redirect(`${continueBase}?step=details&error=time-required`);
  }
  if (!timezone) {
    redirect(`${continueBase}?step=details&error=timezone-required`);
  }
  if (!venue) {
    redirect(`${continueBase}?step=details&error=venue-required`);
  }
  if (!address) {
    redirect(`${continueBase}?step=details&error=address-required`);
  }

  const existingEvent = await getEventWorkspaceForUser(
    session.user.id,
    eventId,
  );
  if (!existingEvent) redirect("/invitations");
  if (existingEvent.status === "completed") {
    redirect(`${eventPath(existingEvent)}?reopen=1#event-details`);
  }

  const eventDate = new Date(`${date}T${time}:00`).toISOString();

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
): Promise<{ ok: true; message: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const event = await getEventWorkspaceForUser(session.user.id, eventId);
  if (!event) return { error: "Event not found." };

  const name = String(formData.get("name") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const notifyGuests = formData.get("notifyGuests") === "true";

  if (!name || !date || !time || !timezone || !venue || !address) {
    return { error: "Complete all required event details." };
  }
  if (notifyGuests && !isEmailSendingConfigured()) {
    return {
      error:
        "Email sending is not configured. Save without notifying, or add RESEND_API_KEY.",
    };
  }

  const eventDate = new Date(`${date}T${time}:00`).toISOString();
  try {
    let updated = await updateEventDetailsForUser({
      userId: session.user.id,
      eventId: event.id,
      name,
      eventDate,
      timezone: timezone || event.timezone,
      venue,
      address,
    });
    if (
      event.status === "completed" &&
      updated.status === "completed" &&
      eventDate > new Date().toISOString()
    ) {
      updated = await updateEventStatusForUser({
        userId: session.user.id,
        eventId: event.id,
        status: "active",
      });
    }
    const changes = eventDetailChanges(event, updated);
    let message = changes.length === 0 ? "No changes to save." : "Event details saved.";

    if (notifyGuests && changes.length > 0) {
      const result = await sendEventUpdateEmails({ event: updated, changes });
      if (result.sent > 0) {
        message = `Event details saved and ${result.sent} ${result.sent === 1 ? "guest was" : "guests were"} notified.`;
        if (result.threaded > 0) {
          message += ` ${result.threaded} ${result.threaded === 1 ? "update was" : "updates were"} linked to the original email thread.`;
        }
      } else {
        message = "Event details saved, but no guest update emails were sent.";
      }
      if (result.failed > 0) {
        message += ` ${result.failed} ${result.failed === 1 ? "email" : "emails"} failed.`;
      }
    }

    revalidatePath("/invitations");
    revalidatePath(eventPath(updated));
    return { ok: true, message };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not save event details.",
    };
  }
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
