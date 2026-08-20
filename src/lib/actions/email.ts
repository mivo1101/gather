"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  getDeliveriesForCampaign,
  upsertDeliveryRecord,
  upsertEmailCampaignForEvent,
  type EmailCampaignDraft,
} from "@/lib/data/email-campaigns";
import {
  eventPath,
  getEventWorkspaceForUser,
  updateEventStatusForUser,
  type EventWorkspace,
} from "@/lib/data/event-workspaces";
import { getGuestsForEvent } from "@/lib/data/guests";
import {
  absoluteUrl,
  renderInviteEmail,
} from "@/lib/email/invite-email";
import {
  isEmailSendingConfigured,
  sendTransactionalEmail,
} from "@/lib/email/send";
import { invitationContinuePath } from "@/lib/invitation-paths";

function draftFromForm(formData: FormData): EmailCampaignDraft {
  return {
    subject: String(formData.get("subject") ?? ""),
    previewText: String(formData.get("previewText") ?? ""),
    senderName: String(formData.get("senderName") ?? ""),
    replyTo: String(formData.get("replyTo") ?? ""),
    greeting: String(formData.get("greeting") ?? "Dear"),
    body: String(formData.get("body") ?? ""),
    ctaLabel: String(formData.get("ctaLabel") ?? "View invitation"),
    includeCalendar: formData.get("includeCalendar") === "on",
    heroImageUrl: String(formData.get("heroImageUrl") ?? ""),
  };
}

async function loadOwnedEvent(
  eventId: string,
): Promise<
  | {
      ok: true;
      userId: string;
      userEmail: string;
      userName: string | null;
      event: EventWorkspace;
    }
  | { ok: false; error: string }
> {
  const session = await auth();
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;
  if (!userId || !userEmail) {
    return { ok: false, error: "You must be signed in." };
  }

  const event = await getEventWorkspaceForUser(userId, eventId);
  if (!event || event.id !== eventId) {
    return { ok: false, error: "Event not found." };
  }

  return {
    ok: true,
    userId,
    userEmail,
    userName: session.user?.name ?? null,
    event,
  };
}

function campaignDraftFromSaved(campaign: {
  subject: string;
  previewText: string;
  senderName: string;
  replyTo: string;
  greeting: string;
  body: string;
  ctaLabel: string;
  includeCalendar: boolean;
  heroImageUrl: string | null;
}): EmailCampaignDraft {
  return {
    subject: campaign.subject,
    previewText: campaign.previewText,
    senderName: campaign.senderName,
    replyTo: campaign.replyTo,
    greeting: campaign.greeting,
    body: campaign.body,
    ctaLabel: campaign.ctaLabel,
    includeCalendar: campaign.includeCalendar,
    heroImageUrl: campaign.heroImageUrl ?? "",
  };
}

/** Empty hero means intentionally no photo - do not fall back to the design. */
function heroForSend(draft: EmailCampaignDraft): string | null {
  const chosen = draft.heroImageUrl.trim();
  return chosen ? absoluteUrl(chosen) : null;
}

function hasCompleteEventDetails(event: EventWorkspace): boolean {
  return Boolean(
    event.name.trim() &&
      event.eventDate &&
      event.timezone.trim() &&
      event.venue?.trim() &&
      event.address?.trim(),
  );
}

export async function saveEmailCampaignAction(
  eventId: string,
  formData: FormData,
): Promise<{ ok: true; message?: string } | { error: string }> {
  try {
    const owned = await loadOwnedEvent(eventId);
    if (!owned.ok) return { error: owned.error };

    await upsertEmailCampaignForEvent({
      eventId,
      userId: owned.userId,
      draft: draftFromForm(formData),
    });

    revalidatePath(eventPath(owned.event));
    if (owned.event.invitation) {
      revalidatePath(invitationContinuePath(owned.event.invitation));
    }
    return { ok: true, message: "Draft saved." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to save draft.",
    };
  }
}

export async function sendTestInviteEmailAction(
  eventId: string,
  formData: FormData,
): Promise<{ ok: true; message: string } | { error: string }> {
  try {
    if (!isEmailSendingConfigured()) {
      return {
        error:
          "Add RESEND_API_KEY (and optionally EMAIL_FROM) to send emails.",
      };
    }

    const owned = await loadOwnedEvent(eventId);
    if (!owned.ok) return { error: owned.error };
    const { event, userId, userEmail } = owned;

    if (!event.invitation) {
      return { error: "Connect an invitation design before sending." };
    }
    if (!hasCompleteEventDetails(event)) {
      return { error: "Complete all required event details first." };
    }

    const guests = await getGuestsForEvent(event.id);
    if (guests.length === 0) {
      return { error: "Add at least one guest before sending a test." };
    }

    // Test sends always go to the signed-in account - avoids using others' inboxes.
    const recipient = userEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      return {
        error: "Your account needs a valid email address to send a test.",
      };
    }

    const campaign = await upsertEmailCampaignForEvent({
      eventId,
      userId,
      draft: draftFromForm(formData),
    });
    const draft = campaignDraftFromSaved(campaign);

    const previewGuest = guests[0]!;
    const rendered = renderInviteEmail({
      draft,
      event: {
        name: event.name,
        slug: event.slug,
        eventDate: event.eventDate,
        timezone: event.timezone,
        venue: event.venue,
        address: event.address,
      },
      guest: previewGuest,
      heroImageUrl: heroForSend(draft),
    });

    await sendTransactionalEmail({
      to: recipient,
      subject: `[Test] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
      replyTo: campaign.replyTo,
      fromName: campaign.senderName,
    });

    revalidatePath(eventPath(event));
    revalidatePath(invitationContinuePath(event.invitation));
    return {
      ok: true,
      message: `Test email sent to ${recipient}, previewing as ${rendered.previewGuestName}.`,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to send test.",
    };
  }
}

export async function sendInviteEmailsAction(
  eventId: string,
  formData: FormData,
): Promise<
  | { ok: true; message: string; sent: number; skipped: number; failed: number }
  | { error: string }
> {
  try {
    if (!isEmailSendingConfigured()) {
      return {
        error:
          "Add RESEND_API_KEY (and optionally EMAIL_FROM) to send emails.",
      };
    }

    const owned = await loadOwnedEvent(eventId);
    if (!owned.ok) return { error: owned.error };
    const { event, userId } = owned;

    if (!event.invitation) {
      return { error: "Connect an invitation design before sending." };
    }
    if (!hasCompleteEventDetails(event)) {
      return { error: "Complete all required event details first." };
    }

    const guests = await getGuestsForEvent(event.id);
    if (guests.length === 0) {
      return { error: "Add at least one guest before sending." };
    }

    const requestedGuestIds = Array.from(
      new Set(
        formData
          .getAll("guestId")
          .map((value) => String(value).trim())
          .filter(Boolean),
      ),
    );
    if (requestedGuestIds.length === 0) {
      return { error: "Select at least one guest to send to." };
    }

    const guestsById = new Map(guests.map((guest) => [guest.id, guest]));
    if (requestedGuestIds.some((guestId) => !guestsById.has(guestId))) {
      return { error: "One or more selected guests could not be found." };
    }
    const selectedGuests = requestedGuestIds.map(
      (guestId) => guestsById.get(guestId)!,
    );

    const campaign = await upsertEmailCampaignForEvent({
      eventId,
      userId,
      draft: draftFromForm(formData),
    });

    let sent = 0;
    let skipped = 0;
    let failed = 0;
    let firstFailure: string | null = null;

    const priorDeliveries = await getDeliveriesForCampaign(campaign.id);
    const alreadySent = new Set(
      priorDeliveries
        .filter((delivery) => delivery.status === "sent")
        .map((delivery) => delivery.guestId),
    );

    const draft = campaignDraftFromSaved(campaign);
    const heroImageUrl = heroForSend(draft);

    for (const guest of selectedGuests) {
      if (alreadySent.has(guest.id)) {
        skipped += 1;
        continue;
      }

      const rendered = renderInviteEmail({
        draft,
        event: {
          name: event.name,
          slug: event.slug,
          eventDate: event.eventDate,
          timezone: event.timezone,
          venue: event.venue,
          address: event.address,
        },
        guest,
        heroImageUrl,
      });

      try {
        const result = await sendTransactionalEmail({
          to: guest.email,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
          replyTo: campaign.replyTo,
          fromName: campaign.senderName,
        });

        await upsertDeliveryRecord({
          campaignId: campaign.id,
          guestId: guest.id,
          status: "sent",
          providerMessageId: result.id,
          error: null,
        });
        sent += 1;
      } catch (error) {
        failed += 1;
        const reason =
          error instanceof Error ? error.message : "Send failed.";
        if (!firstFailure) firstFailure = reason;
        await upsertDeliveryRecord({
          campaignId: campaign.id,
          guestId: guest.id,
          status: "failed",
          providerMessageId: null,
          error: reason,
        });
      }
    }

    if (sent > 0 && event.status === "draft") {
      await updateEventStatusForUser({
        userId,
        eventId: event.id,
        status: "active",
      });
    }

    revalidatePath("/invitations");
    revalidatePath(eventPath(event));
    revalidatePath(invitationContinuePath(event.invitation));

    const parts = [
      sent > 0 ? `Sent ${sent}` : null,
      skipped > 0 ? `skipped ${skipped} already sent` : null,
      failed > 0 ? `${failed} failed` : null,
    ].filter(Boolean);

    let message = parts.length ? parts.join(", ") + "." : "Nothing to send.";
    if (failed > 0 && firstFailure) {
      message += ` ${firstFailure}`;
    }

    return {
      ok: true,
      sent,
      skipped,
      failed,
      message,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to send invites.",
    };
  }
}
