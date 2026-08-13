import Link from "next/link";
import { EventWorkspaces } from "@/components/app/EventWorkspaces";
import { Button, PlusIcon } from "@/components/ui/Button";
import { getEventWorkspacesForUser } from "@/lib/data/event-workspaces";
import { getCurrentUser } from "@/lib/data/user";

export const metadata = { title: "Invitations · Gather" };

export default async function InvitationsPage() {
  const user = await getCurrentUser();
  let workspaces;
  try {
    workspaces = await getEventWorkspacesForUser(user.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Missing events table")) {
      return (
        <div className="mx-auto max-w-2xl animate-fade-up">
          <div className="rounded-[30px] border border-black/[0.07] bg-white p-7 shadow-[0_18px_50px_rgba(0,0,0,0.07)] sm:p-9">
            <h1 className="text-3xl font-bold tracking-tight text-black">
              Connect the Event Hub
            </h1>
            <p className="mt-3 text-sm leading-6 text-grey">
              Complete the database setup to start creating events.
            </p>
            <div className="mt-6 rounded-2xl bg-soft-grey px-4 py-4 text-sm leading-6 text-black/75">
              <p className="font-semibold text-black">In Supabase:</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Open SQL Editor and create a new query.</li>
                <li>Paste the contents of <code className="rounded bg-white px-1.5 py-0.5 text-xs">supabase/migrations/004_event_workspaces.sql</code>.</li>
                <li>Run the query, then refresh this page.</li>
              </ol>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/invitations"
                className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-black/85"
              >
                Refresh event hub
              </Link>
              <Link
                href="/home"
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-grey hover:bg-soft-grey hover:text-black"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
    throw error;
  }

  return (
    <div className="animate-fade-up">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black md:text-4xl">
            Invitations
          </h1>
          <p className="mt-2 max-w-2xl text-base text-grey">
            Keep each design, event detail, guest list and response together.
          </p>
        </div>
        <Button
          href="/invitations/new-event"
          size="md"
          className="self-start sm:self-auto"
        >
          <PlusIcon />
          Create event
        </Button>
      </header>

      <EventWorkspaces workspaces={workspaces} />
    </div>
  );
}
