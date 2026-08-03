import { notFound, redirect } from "next/navigation";
import { InvitationEditor } from "@/components/editor/InvitationEditor";
import { getInvitationByRouteKeyForUser } from "@/lib/data/invitations";
import { getCurrentUser } from "@/lib/data/user";
import { invitationEditPath } from "@/lib/invitation-paths";

export const metadata = { title: "Edit Invitation · Gather" };

export default async function EditInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ customizeSize?: string }>;
}) {
  const { id: routeKey } = await params;
  const { customizeSize } = await searchParams;
  const user = await getCurrentUser();
  const invitation = await getInvitationByRouteKeyForUser(user.id, routeKey);

  if (!invitation) {
    notFound();
  }

  if (routeKey !== invitation.slug) {
    const qs = customizeSize === "1" ? "?customizeSize=1" : "";
    redirect(`${invitationEditPath(invitation)}${qs}`);
  }

  return (
    <InvitationEditor
      invitation={invitation}
      openCustomSize={customizeSize === "1"}
    />
  );
}
