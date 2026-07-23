"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createInvitation,
  updateInvitationForUser,
} from "@/lib/data/invitations";
import type { InvitationContent } from "@/lib/data/invitation-content";
import type { Invitation } from "@/lib/data/types";
import { upsertUser } from "@/lib/data/users-db";

/** Ensure the user exists in Supabase, create a draft, then open the editor. */
export async function createInvitationAction() {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    redirect("/signin");
  }

  await upsertUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  const invitation = await createInvitation({
    userId: session.user.id,
  });

  redirect(`/invitations/${invitation.id}/edit`);
}

export async function saveInvitationAction(input: {
  invitationId: string;
  title: string;
  eventDate: string | null;
  location: string | null;
  content: InvitationContent;
  status?: Invitation["status"];
}): Promise<{ invitation: Invitation } | { error: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be signed in to save." };
  }

  try {
    const invitation = await updateInvitationForUser(
      session.user.id,
      input.invitationId,
      {
        title: input.title.trim() || "Untitled invitation",
        eventDate: input.eventDate,
        location: input.location,
        content: input.content,
        status: input.status,
      },
    );

    revalidatePath("/home");
    revalidatePath(`/invitations/${input.invitationId}/edit`);

    return { invitation };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to save invitation.",
    };
  }
}
