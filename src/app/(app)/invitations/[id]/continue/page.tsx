import { notFound, redirect } from "next/navigation";
import { EventSetupFlow } from "@/components/app/EventSetupFlow";
import {
  defaultEmailCampaignDraft,
  getDeliveriesForEvent,
  getEmailCampaignForEvent,
  type EmailCampaignDraft,
  type EmailDelivery,
} from "@/lib/data/email-campaigns";
import {
  getEventByInvitationId,
  getLinkableEventsForInvitation,
} from "@/lib/data/event-workspaces";
import { getGuestsForEvent, type EventGuest } from "@/lib/data/guests";
import { getInvitationByRouteKeyForUser } from "@/lib/data/invitations";
import {
  listInvitationImageCandidates,
  invitationHeroImageUrl,
} from "@/lib/email/invite-email";
import { isEmailSendingConfigured } from "@/lib/email/send";
import { getCurrentUser } from "@/lib/data/user";
import { invitationContinuePath } from "@/lib/invitation-paths";

export const metadata = { title: "Continue setup · Gather" };

function decodeError(raw: string | undefined) {
  if (!raw) return null;
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    value = raw;
  }
  switch (value) {
    case "event-required":
      return "Choose an event to continue.";
    case "mode-required":
      return "Choose whether to create or select an event.";
    case "name-required":
      return "Event name is required.";
    case "date-required":
      return "Event date is required.";
    case "details-required":
      return "Name and date are required.";
    default:
      return value;
  }
}

export default async function InvitationContinuePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string; error?: string }>;
}) {
  const { id: routeKey } = await params;
  const { step: rawStep, error } = await searchParams;
  const user = await getCurrentUser();
  const invitation = await getInvitationByRouteKeyForUser(user.id, routeKey);

  if (!invitation) notFound();
  if (routeKey !== invitation.slug) {
    const qs = new URLSearchParams();
    if (rawStep) qs.set("step", rawStep);
    if (error) qs.set("error", error);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    redirect(`${invitationContinuePath(invitation)}${suffix}`);
  }

  const [linkedEvent, linkableEvents] = await Promise.all([
    getEventByInvitationId(user.id, invitation.id),
    getLinkableEventsForInvitation(user.id, invitation.id),
  ]);

  const requestedStep =
    rawStep === "email"
      ? "email"
      : rawStep === "guests"
        ? "guests"
        : rawStep === "details"
          ? "details"
          : "event";

  if (
    (requestedStep === "details" ||
      requestedStep === "guests" ||
      requestedStep === "email") &&
    !linkedEvent
  ) {
    redirect(`${invitationContinuePath(invitation)}?step=event`);
  }

  if (!rawStep && linkedEvent) {
    if (!linkedEvent.progress.details) {
      redirect(`${invitationContinuePath(invitation)}?step=details`);
    }
    if (!linkedEvent.progress.guests) {
      redirect(`${invitationContinuePath(invitation)}?step=guests`);
    }
    redirect(`${invitationContinuePath(invitation)}?step=email`);
  }

  let initialGuests: EventGuest[] = [];
  let missingGuestsTable = false;
  if (
    (requestedStep === "guests" || requestedStep === "email") &&
    linkedEvent
  ) {
    try {
      initialGuests = await getGuestsForEvent(linkedEvent.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("Missing guests table")) {
        missingGuestsTable = true;
      } else {
        throw err;
      }
    }
  }

  if (requestedStep === "email" && linkedEvent && !missingGuestsTable) {
    if (initialGuests.length === 0) {
      redirect(`${invitationContinuePath(invitation)}?step=guests`);
    }
  }

  let emailDraft: EmailCampaignDraft | null = null;
  let emailDeliveries: EmailDelivery[] = [];
  let missingEmailTable = false;
  const designImageUrls = listInvitationImageCandidates(invitation);
  const defaultHero =
    invitationHeroImageUrl(invitation) ?? designImageUrls[0] ?? "";

  if (requestedStep === "email" && linkedEvent) {
    emailDraft = defaultEmailCampaignDraft({
      eventName: linkedEvent.name,
      senderName:
        [user.firstName, user.lastName].filter(Boolean).join(" ") || "Host",
      replyTo: user.email,
      heroImageUrl: defaultHero,
    });
    try {
      const campaign = await getEmailCampaignForEvent(linkedEvent.id);
      if (campaign) {
        emailDraft = {
          subject: campaign.subject,
          previewText: campaign.previewText,
          senderName: campaign.senderName,
          replyTo: campaign.replyTo,
          greeting: campaign.greeting,
          body: campaign.body,
          ctaLabel: campaign.ctaLabel,
          includeCalendar: campaign.includeCalendar,
          // null means the host cleared the photo on purpose
          heroImageUrl: campaign.heroImageUrl ?? "",
        };
        emailDeliveries = await getDeliveriesForEvent(linkedEvent.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (
        message.includes("Missing email tables") ||
        message.includes("Missing email hero")
      ) {
        missingEmailTable = true;
        emailDraft = null;
      } else {
        throw err;
      }
    }
  }

  const initialStep =
    requestedStep === "email" && linkedEvent
      ? "email"
      : requestedStep === "guests" && linkedEvent
        ? "guests"
        : requestedStep === "details" && linkedEvent
          ? "details"
          : "event";

  return (
    <EventSetupFlow
      invitation={invitation}
      linkedEvent={linkedEvent}
      linkableEvents={linkableEvents}
      initialStep={initialStep}
      initialGuests={initialGuests}
      errorMessage={decodeError(error)}
      missingGuestsTable={missingGuestsTable}
      missingEmailTable={missingEmailTable}
      emailDraft={emailDraft}
      emailDeliveries={emailDeliveries}
      designImageUrls={designImageUrls}
      sendingConfigured={isEmailSendingConfigured()}
      defaultTestEmail={user.email}
    />
  );
}
