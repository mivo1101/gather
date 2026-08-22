/**
 * Pure helpers for the status a card shows. No database imports: client
 * components filter and label with these.
 */
import type { Invitation } from "./types";

export type InvitationDisplayStatus =
  | "draft"
  | "published"
  | "active"
  | "completed"
  | "trash";

export type InvitationDisplayFilter = "all" | InvitationDisplayStatus;

export const invitationDisplayStatusLabels: Record<
  InvitationDisplayStatus,
  string
> = {
  draft: "Draft",
  published: "Published",
  active: "Active",
  completed: "Completed",
  trash: "Trash",
};

/**
 * What an invitation card should say.
 *
 * Once a design is connected to an event, the event owns the lifecycle - that
 * is what the event hub reports, and it moves on its own as the date passes -
 * so the invitation's own draft/published flag only speaks for designs that
 * have not been connected yet. Trash is the exception: it is a fact about the
 * invitation, so it wins over whatever the event is doing. An archived event
 * falls back to the design's flag, since the invitation itself is not trashed.
 */
export function invitationDisplayStatus(
  invitation: Invitation,
): InvitationDisplayStatus {
  if (invitation.status === "archived") return "trash";

  switch (invitation.linkedEventStatus) {
    case "completed":
      return "completed";
    case "active":
      return "active";
    default:
      return invitation.status === "published" ? "published" : "draft";
  }
}
