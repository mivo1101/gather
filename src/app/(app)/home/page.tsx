import { HomeHub } from "@/components/app/HomeHub";
import { QuickActions } from "@/components/app/QuickActions";
import { RecentInvitations } from "@/components/app/RecentInvitations";
import { coverPageOnly } from "@/lib/data/invitation-content";
import { getInvitationsForUser } from "@/lib/data/invitations";
import { getCurrentUser, getGreeting } from "@/lib/data/user";

export const metadata = {
  title: "Home · Gather",
  description: "Create, manage and share beautiful invitations.",
};

export default async function HomePage() {
  const user = await getCurrentUser();
  const stored = await getInvitationsForUser(user.id, {
    sort: "updated_desc",
  });
  // The cards only render the cover page — don't ship the rest of the canvas.
  const invitations = stored.map((invitation) => ({
    ...invitation,
    content: coverPageOnly(invitation.content),
  }));

  return (
    <HomeHub user={user} greeting={getGreeting()} active="home">
      <div className="flex flex-col gap-8">
        <QuickActions />
        <RecentInvitations invitations={invitations} />
      </div>
    </HomeHub>
  );
}
