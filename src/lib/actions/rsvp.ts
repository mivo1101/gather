"use server";

import { revalidatePath } from "next/cache";
import {
  submitRsvpByInviteToken,
  type RsvpAnswerValue,
} from "@/lib/data/rsvp-responses";
import { eventPath } from "@/lib/data/event-workspaces";
import { getPersonalisedInvite } from "@/lib/data/personalised-invites";
import { auth } from "@/auth";

export async function submitGuestRsvpAction(input: {
  eventSlug: string;
  token: string;
  answers: Record<string, RsvpAnswerValue>;
}): Promise<{ ok: true } | { error: string }> {
  try {
    const session = await auth();
    if (session?.user?.id) {
      const invite = await getPersonalisedInvite(input.eventSlug, input.token);
      if (invite?.event.userId === session.user.id) {
        return {
          error:
            "RSVP changes are disabled while previewing as the organiser.",
        };
      }
    }

    await submitRsvpByInviteToken({
      eventSlug: input.eventSlug,
      token: input.token,
      answers: input.answers,
    });

    revalidatePath(`/invite/${input.eventSlug}`);
    revalidatePath(eventPath({ slug: input.eventSlug }));
    revalidatePath("/invitations");
    return { ok: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to save RSVP.",
    };
  }
}
