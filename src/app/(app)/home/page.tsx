import { HomeHub } from "@/components/app/HomeHub";
import { RecentInvitations } from "@/components/app/RecentInvitations";
import { UpNext } from "@/components/app/UpNext";
import { getEventWorkspacesForUser } from "@/lib/data/event-workspaces";
import { coverPageOnly } from "@/lib/data/invitation-content";
import { getInvitationsWithEventDetailsForUser } from "@/lib/data/invitations";
import { pickUpNextEvent } from "@/lib/data/up-next";
import { getCurrentUser, getGreeting } from "@/lib/data/user";

export const metadata = {
  title: "Home · Gather",
  description: "Create, manage and share beautiful invitations.",
};

export default async function HomePage() {
  const user = await getCurrentUser();
  const [stored, events] = await Promise.all([
    getInvitationsWithEventDetailsForUser(user.id, { sort: "updated_desc" }),
    // Home should still render if the event tables are not set up yet.
    getEventWorkspacesForUser(user.id).catch(() => []),
  ]);
  // The cards only render the cover page - don't ship the rest of the canvas.
  const invitations = stored.map((invitation) => ({
    ...invitation,
    content: coverPageOnly(invitation.content),
  }));

  const upNext = pickUpNextEvent(events);
  const upNextEvent = upNext?.invitation
    ? {
        ...upNext,
        invitation: {
          ...upNext.invitation,
          content: coverPageOnly(upNext.invitation.content),
        },
      }
    : upNext;

  return (
    <HomeHub user={user} greeting={getGreeting()} active="home">
      <div className="flex flex-col gap-10">
        <UpNext event={upNextEvent} />
        <RecentInvitations invitations={invitations} />
      </div>
    </HomeHub>
  );
}
