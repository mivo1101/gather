"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { eventPath } from "@/lib/data/event-workspaces";
import {
  replaceGuestsForEvent,
  type GuestDraft,
} from "@/lib/data/guests";

/** Save guests and continue to the email compose step. */
export async function saveEventGuestsAndContinueAction(input: {
  eventId: string;
  eventSlug: string;
  invitationSlug: string;
  guests: GuestDraft[];
  permissionConfirmed: boolean;
}): Promise<{ ok: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  if (!input.permissionConfirmed) {
    return {
      error:
        "Confirm you have permission to use these guest contact details.",
    };
  }

  try {
    await replaceGuestsForEvent({
      eventId: input.eventId,
      userId: session.user.id,
      guests: input.guests,
      requireAtLeastOne: true,
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to save guests.",
    };
  }

  revalidatePath("/invitations");
  revalidatePath(eventPath({ slug: input.eventSlug }));
  revalidatePath(`/invitations/${input.invitationSlug}/continue`);
  redirect(`/invitations/${input.invitationSlug}/continue?step=email`);
}
