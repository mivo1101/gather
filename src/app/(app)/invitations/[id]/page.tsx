import { notFound, redirect } from "next/navigation";
import { ComingSoon } from "@/components/app/AppTopBar";
import { getInvitationByRouteKeyForUser } from "@/lib/data/invitations";
import { getCurrentUser } from "@/lib/data/user";
import { invitationViewPath } from "@/lib/invitation-paths";

export const metadata = { title: "Invitation · Gather" };

export default async function InvitationDetailPage({
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
    redirect(invitationViewPath(invitation));
  }

  return (
    <ComingSoon
      title="Invitation details"
      description={`A full view for “${invitation.title}” will live here soon.`}
    />
  );
}
