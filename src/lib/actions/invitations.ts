"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  clearTrashedInvitationsForUser,
  createInvitation,
  permanentlyDeleteInvitationsForUser,
  updateInvitationForUser,
} from "@/lib/data/invitations";
import type { InvitationContent } from "@/lib/data/invitation-content";
import {
  contentFromTemplate,
  getTemplateById,
} from "@/lib/data/invitation-templates";
import type { Invitation } from "@/lib/data/types";
import { upsertUser } from "@/lib/data/users-db";
import { invitationEditPath } from "@/lib/invitation-paths";

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

  redirect(invitationEditPath(invitation));
}

/** Create a draft from a catalog template and open the editor. */
export async function createInvitationFromTemplateAction(
  templateId: string,
) {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    redirect("/signin");
  }

  const template = getTemplateById(templateId);
  if (!template) {
    redirect("/templates");
  }

  await upsertUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  const invitation = await createInvitation({
    userId: session.user.id,
    title: template.title,
    content: contentFromTemplate(template),
  });

  redirect(invitationEditPath(invitation));
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
    revalidatePath(invitationEditPath(invitation));

    return { invitation };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to save invitation.",
    };
  }
}

/** Rename an invitation from the home card menu. */
export async function renameInvitationAction(
  invitationId: string,
  title: string,
): Promise<{ invitation: Invitation } | { error: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  try {
    const invitation = await updateInvitationForUser(
      session.user.id,
      invitationId,
      {
        title: title.trim() || "Untitled invitation",
      },
    );

    revalidatePath("/home");
    revalidatePath(invitationEditPath(invitation));

    return { invitation };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to rename invitation.",
    };
  }
}

/** Soft-delete: mark invitation as archived (Trash). */
export async function moveInvitationToTrashAction(
  invitationId: string,
): Promise<{ ok: true } | { error: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  try {
    await updateInvitationForUser(session.user.id, invitationId, {
      status: "archived",
    });
    revalidatePath("/home");
    revalidatePath(`/invitations/${invitationId}/edit`);
    return { ok: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to move invitation to trash.",
    };
  }
}

/** Permanently delete one or more invitations that are already in Trash. */
export async function permanentlyDeleteInvitationsAction(
  invitationIds: string[],
): Promise<{ deleted: number } | { error: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  try {
    const deleted = await permanentlyDeleteInvitationsForUser(
      session.user.id,
      invitationIds,
    );
    revalidatePath("/home");
    return { deleted };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to permanently delete invitations.",
    };
  }
}

/** Permanently delete every invitation currently in Trash. */
export async function clearTrashAction(): Promise<
  { deleted: number } | { error: string }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  try {
    const deleted = await clearTrashedInvitationsForUser(session.user.id);
    revalidatePath("/home");
    return { deleted };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to empty trash.",
    };
  }
}
