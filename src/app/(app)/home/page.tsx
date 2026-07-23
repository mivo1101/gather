import { AppTopBar } from "@/components/app/AppTopBar";
import { QuickActions } from "@/components/app/QuickActions";
import { RecentInvitations } from "@/components/app/RecentInvitations";
import { getInvitationsForUser } from "@/lib/data/invitations";
import { getCurrentUser, getGreeting } from "@/lib/data/user";

export const metadata = {
  title: "Home · Gather",
  description: "Create, manage and share beautiful invitations.",
};

export default async function HomePage() {
  const user = await getCurrentUser();
  const invitations = await getInvitationsForUser(user.id, {
    sort: "updated_desc",
  });

  return (
    <div className="flex flex-col gap-8">
      <AppTopBar user={user} />

      <header className="animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight text-black md:text-4xl">
          {getGreeting()}, {user.firstName}{" "}
          <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-2 text-base text-grey">
          Create, manage and share beautiful invitations.
        </p>
      </header>

      <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
        <QuickActions />
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "140ms" }}>
        <RecentInvitations invitations={invitations} />
      </div>
    </div>
  );
}
