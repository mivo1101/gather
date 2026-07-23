import { notFound } from "next/navigation";
import { InvitationEditor } from "@/components/editor/InvitationEditor";
import { getInvitationForUser } from "@/lib/data/invitations";
import { getCurrentUser } from "@/lib/data/user";

export const metadata = { title: "Edit Invitation · Gather" };

export default async function EditInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const invitation = await getInvitationForUser(user.id, id);

  if (!invitation) {
    notFound();
  }

  return <InvitationEditor invitation={invitation} />;
}
