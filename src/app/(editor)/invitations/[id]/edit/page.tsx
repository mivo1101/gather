import { notFound, redirect } from "next/navigation";
import { InvitationEditor } from "@/components/editor/InvitationEditor";
import { getInvitationByRouteKeyForUser } from "@/lib/data/invitations";
import { getCurrentUser } from "@/lib/data/user";
import { invitationEditPath } from "@/lib/invitation-paths";

export const metadata = { title: "Edit Invitation · Gather" };

export default async function EditInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: routeKey } = await params;
  const user = await getCurrentUser();
  const invitation = await getInvitationByRouteKeyForUser(user.id, routeKey);

  if (!invitation) {
    notFound();
  }

  if (routeKey !== invitation.slug) {
    redirect(invitationEditPath(invitation));
  }

  return <InvitationEditor invitation={invitation} />;
}
