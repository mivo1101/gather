import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { InvitationPagePreview } from "@/components/app/InvitationPagePreview";
import { cardAspectRatio } from "@/components/editor/CanvasImageContent";
import { Button, PlusIcon } from "@/components/ui/Button";
import { linkInvitationToEventAction } from "@/lib/actions/events";
import {
  eventLocation,
  eventPath,
  getEventWorkspaceForUser,
  getUnlinkedInvitationsForUser,
} from "@/lib/data/event-workspaces";
import { getCurrentUser } from "@/lib/data/user";
import { formatEventDate, formatRelativeTime } from "@/lib/format";
import { invitationEditPath } from "@/lib/invitation-paths";

export const metadata = { title: "Event · Gather" };

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: routeKey } = await params;
  const user = await getCurrentUser();
  const workspace = await getEventWorkspaceForUser(user.id, routeKey);
  if (!workspace) notFound();
  if (routeKey !== workspace.slug) redirect(eventPath(workspace));

  const availableDesigns = workspace.invitation
    ? []
    : await getUnlinkedInvitationsForUser(user.id);
  const invitation = workspace.invitation;
  const firstPage = invitation?.content.pages[0];
  const shape = invitation?.content.shape ?? "landscape";
  const customSize = invitation?.content.customSize;
  const aspectRatio = invitation
    ? cardAspectRatio(shape, customSize)
    : 16 / 10;
  const location = eventLocation(workspace);
  const progress = Math.round(
    (workspace.progress.completed / workspace.progress.total) * 100,
  );
  const linkDesign = linkInvitationToEventAction.bind(null, workspace.id);

  return (
    <div className="animate-fade-up">
      <Link
        href="/invitations"
        className="text-sm font-semibold text-grey transition-colors hover:text-black"
      >
        ← All invitations
      </Link>

      <header className="mt-5 flex flex-col gap-5 border-b border-black/[0.07] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#fde8d8] px-2.5 py-1 text-[11px] font-semibold text-[#9a5a2a]">
              {workspace.status === "active"
                ? "Active"
                : workspace.status === "completed"
                  ? "Completed"
                  : "Draft"}
            </span>
            <span className="text-xs text-grey">
              Updated {formatRelativeTime(workspace.updatedAt)}
            </span>
          </div>
          <h1 className="mt-3 truncate text-3xl font-bold tracking-tight text-black md:text-4xl">
            {workspace.name}
          </h1>
          <p className="mt-2 text-base text-grey">
            {workspace.eventDate
              ? formatEventDate(workspace.eventDate)
              : "Date not confirmed"}
            <span className="px-2 text-black/20">·</span>
            {location || "Location not confirmed"}
          </p>
        </div>
        {invitation ? (
          <Button
            href={invitationEditPath(invitation)}
            size="md"
            className="self-start sm:self-auto"
          >
            Edit design
          </Button>
        ) : null}
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)]">
        <section className="rounded-[28px] border border-black/[0.07] bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)] sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-black">Invitation design</h2>
              <p className="mt-1 text-sm text-grey">
                {invitation
                  ? `${invitation.content.pages.length} ${invitation.content.pages.length === 1 ? "page" : "pages"}`
                  : "No design connected"}
              </p>
            </div>
            {invitation ? (
              <Button
                href={invitationEditPath(invitation)}
                variant="secondary"
                size="sm"
              >
                Continue editing
              </Button>
            ) : null}
          </div>

          {invitation && firstPage ? (
            <div className="flex min-h-[25rem] items-center justify-center overflow-hidden rounded-2xl bg-[#f2efed] p-7">
              <div
                className="relative max-h-[34rem] max-w-full overflow-hidden rounded-lg shadow-[0_18px_45px_rgba(0,0,0,0.15)]"
                style={{
                  aspectRatio: String(aspectRatio),
                  width: aspectRatio >= 1 ? "100%" : undefined,
                  height: aspectRatio < 1 ? "min(34rem, 70vh)" : undefined,
                }}
              >
                <InvitationPagePreview
                  page={firstPage}
                  shape={shape}
                  customSize={customSize}
                  className="h-full w-full"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-black/10 bg-soft-grey/60 px-6 py-12">
              <div className="mx-auto max-w-lg text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-signature/10 text-xl text-signature">
                  +
                </span>
                <h3 className="mt-4 text-base font-semibold text-black">
                  Connect an invitation design
                </h3>
                <p className="mt-2 text-sm leading-6 text-grey">
                  Choose an existing design for this event.
                </p>

                {availableDesigns.length > 0 ? (
                  <form action={linkDesign} className="mx-auto mt-6 max-w-md">
                    <label className="block text-left">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-grey">
                        Your designs
                      </span>
                      <select
                        name="invitationId"
                        required
                        defaultValue=""
                        className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/15"
                      >
                        <option value="" disabled>Select a design</option>
                        {availableDesigns.map((design) => (
                          <option key={design.id} value={design.id}>
                            {design.title} · {design.content.pages.length} {design.content.pages.length === 1 ? "page" : "pages"}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button
                      type="submit"
                      size="md"
                      className="mt-4 w-full"
                    >
                      Connect design
                    </Button>
                  </form>
                ) : (
                  <Button
                    href="/invitations/new"
                    size="md"
                    className="mt-6"
                  >
                    <PlusIcon />
                    Create a design
                  </Button>
                )}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="rounded-[24px] border border-black/[0.07] bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-black">Event setup</h2>
              <span className="text-xs font-semibold text-signature">{progress}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-soft-grey">
              <div className="h-full rounded-full bg-signature" style={{ width: `${progress}%` }} />
            </div>
            <ol className="mt-5 space-y-1.5">
              {([
                ["design", "Invitation design", "Connect and style every page"],
                ["details", "Event details", "Confirm date, time and location"],
                ["guests", "Guest list", "Add up to 10 recipients"],
                ["send", "Email and send", "Preview, test and schedule"],
              ] as const).map(([key, title, description], index) => {
                const complete = workspace.progress[key];
                return (
                  <li key={key} className="flex gap-3 rounded-2xl px-2 py-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${complete ? "bg-signature text-white" : "bg-soft-grey text-grey"}`}>
                      {complete ? "✓" : index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-black">{title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-grey">{description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="rounded-[24px] border border-black/[0.07] bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)]">
            <h2 className="text-base font-semibold text-black">Event details</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-grey">Date</dt>
                <dd className="mt-1 font-medium text-black">
                  {workspace.eventDate ? formatEventDate(workspace.eventDate) : "Not confirmed"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-grey">Location</dt>
                <dd className="mt-1 font-medium text-black">{location || "Not confirmed"}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
