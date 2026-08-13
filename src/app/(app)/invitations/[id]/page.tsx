import { EmailSendSummary } from "@/components/app/EmailSendSummary";
import { EventDesignPreview } from "@/components/app/EventDesignPreview";
import { EventDetailsForm } from "@/components/app/EventDetailsForm";
import {
  EventHubTabs,
  parseEventHubTab,
} from "@/components/app/EventHubTabs";
import { EventRsvpSummary } from "@/components/app/EventRsvpSummary";
import { Button, PlusIcon } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { linkInvitationToEventAction } from "@/lib/actions/events";
import {
  getDeliveriesForEvent,
  getEmailCampaignForEvent,
  type EmailDelivery,
} from "@/lib/data/email-campaigns";
import {
  eventLocation,
  eventPath,
  getEventWorkspaceForUser,
  getUnlinkedInvitationsForUser,
} from "@/lib/data/event-workspaces";
import { getGuestsForEvent, type EventGuest } from "@/lib/data/guests";
import {
  getRsvpResponsesForEvent,
  type RsvpResponse,
} from "@/lib/data/rsvp-responses";
import { getCurrentUser } from "@/lib/data/user";
import { formatEventDate, formatRelativeTime } from "@/lib/format";
import {
  invitationContinuePath,
  invitationEditPath,
} from "@/lib/invitation-paths";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Event · Gather" };

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ setup?: string; error?: string; tab?: string }>;
}) {
  const { id: routeKey } = await params;
  const { setup, error, tab: rawTab } = await searchParams;
  const tab = parseEventHubTab(rawTab);
  const user = await getCurrentUser();
  const workspace = await getEventWorkspaceForUser(user.id, routeKey);
  if (!workspace) notFound();
  if (routeKey !== workspace.slug) {
    const qs = new URLSearchParams();
    if (rawTab) qs.set("tab", rawTab);
    if (setup) qs.set("setup", setup);
    if (error) qs.set("error", error);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    redirect(`${eventPath(workspace)}${suffix}`);
  }

  const availableDesigns = workspace.invitation
    ? []
    : await getUnlinkedInvitationsForUser(user.id);
  const invitation = workspace.invitation;
  const location = eventLocation(workspace);
  const progress = Math.round(
    (workspace.progress.completed / workspace.progress.total) * 100,
  );
  const linkDesign = linkInvitationToEventAction.bind(null, workspace.id);

  let guests: EventGuest[] = [];
  let missingGuestsTable = false;
  try {
    guests = await getGuestsForEvent(workspace.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("Missing guests table")) {
      missingGuestsTable = true;
    } else {
      throw err;
    }
  }

  let campaignSubject: string | null = null;
  let deliveries: EmailDelivery[] = [];
  let missingEmailTable = false;
  try {
    const campaign = await getEmailCampaignForEvent(workspace.id);
    if (campaign) {
      campaignSubject = campaign.subject;
      deliveries = await getDeliveriesForEvent(workspace.id);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (
      message.includes("Missing email tables") ||
      message.includes("Missing email hero")
    ) {
      missingEmailTable = true;
    } else {
      throw err;
    }
  }

  let rsvpResponses: RsvpResponse[] = [];
  let missingRsvpTable = false;
  try {
    rsvpResponses = await getRsvpResponsesForEvent(workspace.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("Missing RSVP table")) {
      missingRsvpTable = true;
    } else {
      throw err;
    }
  }

  const continueHref = invitation
    ? !workspace.progress.details
      ? `${invitationContinuePath(invitation)}?step=details`
      : !workspace.progress.guests
        ? `${invitationContinuePath(invitation)}?step=guests`
        : `${invitationContinuePath(invitation)}?step=email`
    : null;

  return (
    <div className="animate-fade-up">
      <Link
        href="/invitations"
        className="text-sm font-semibold text-grey transition-colors hover:text-black"
      >
        ← All invitations
      </Link>

      {setup === "guests-done" ? (
        <div className="mt-5 rounded-2xl border border-signature/20 bg-signature/10 px-4 py-3 text-sm text-black">
          Guest list saved.{" "}
          <Link
            href={`${eventPath(workspace)}?tab=email`}
            className="font-semibold underline underline-offset-2"
          >
            Open Email
          </Link>{" "}
          or continue setup to compose and send.
        </div>
      ) : null}
      {error ? (
        <div className="mt-5 rounded-2xl bg-[#fff1f1] px-4 py-3 text-sm text-[#9a2a2a]">
          {error}
        </div>
      ) : null}

      <header className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
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
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {invitation ? (
            <>
              <Button
                href={invitationEditPath(invitation)}
                variant="secondary"
                size="md"
              >
                Edit design
              </Button>
              {continueHref ? (
                <Button href={continueHref} size="md">
                  Continue setup
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      </header>

      <EventHubTabs
        eventSlug={workspace.slug}
        active={tab}
        guestCount={guests.length}
        rsvpResponded={rsvpResponses.length}
      />

      <div className="mt-6">
        {tab === "overview" ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)] lg:items-stretch">
            <section className="flex h-full min-h-0 flex-col rounded-[28px] border border-black/[0.07] bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)] sm:p-6">
              <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-black">
                    Invitation Design
                  </h2>
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

              {invitation ? (
                <EventDesignPreview invitation={invitation} guests={guests} />
              ) : (
                <div className="flex flex-1 items-center rounded-2xl border border-dashed border-black/10 bg-soft-grey/60 px-6 py-10">
                  <div className="mx-auto max-w-lg text-center">
                    <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-signature/10 text-xl text-signature">
                      +
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-black">
                      Connect an Invitation Design
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-grey">
                      Choose an existing design for this event.
                    </p>

                    {availableDesigns.length > 0 ? (
                      <form
                        action={linkDesign}
                        className="mx-auto mt-6 max-w-md"
                      >
                        <label className="block text-left">
                          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
                            Your designs
                          </span>
                          <Select
                            name="invitationId"
                            required
                            variant="field"
                            wrapperClassName="mt-2 block w-full"
                            className="w-full"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Select a design
                            </option>
                            {availableDesigns.map((design) => (
                              <option key={design.id} value={design.id}>
                                {design.title} ·{" "}
                                {design.content.pages.length}{" "}
                                {design.content.pages.length === 1
                                  ? "page"
                                  : "pages"}
                              </option>
                            ))}
                          </Select>
                        </label>
                        <Button type="submit" size="md" className="mt-4 w-full">
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

            <aside className="flex h-full flex-col gap-5">
              <section className="rounded-[24px] border border-black/[0.07] bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-black">
                    Event Setup
                  </h2>
                  <span className="text-xs font-semibold text-signature">
                    {progress}%
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-soft-grey">
                  <div
                    className="h-full rounded-full bg-signature"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <ol className="mt-5 space-y-1.5">
                  {(
                    [
                      [
                        "design",
                        "Invitation Design",
                        "Connect and style every page",
                      ],
                      [
                        "details",
                        "Event Details",
                        "Confirm date, time and location",
                      ],
                      ["guests", "Guest List", "Add up to 10 recipients"],
                      ["send", "Email and Send", "Compose, test and send"],
                    ] as const
                  ).map(([key, title, description], index) => {
                    const complete = workspace.progress[key];
                    const href =
                      key === "design" && invitation
                        ? invitationEditPath(invitation)
                        : key === "details" && invitation
                          ? `${invitationContinuePath(invitation)}?step=details`
                          : key === "guests" && invitation
                            ? `${invitationContinuePath(invitation)}?step=guests`
                            : key === "send" && invitation
                              ? `${invitationContinuePath(invitation)}?step=email`
                              : null;
                    const content = (
                      <>
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            complete
                              ? "bg-signature text-white"
                              : "bg-soft-grey text-grey"
                          }`}
                        >
                          {complete ? "✓" : index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-black">
                            {title}
                          </p>
                          <p className="mt-0.5 text-xs leading-5 text-grey">
                            {description}
                          </p>
                        </div>
                      </>
                    );
                    return (
                      <li key={key}>
                        {href ? (
                          <Link
                            href={href}
                            className="flex gap-3 rounded-2xl px-2 py-3 transition-colors hover:bg-soft-grey/70"
                          >
                            {content}
                          </Link>
                        ) : (
                          <div className="flex gap-3 rounded-2xl px-2 py-3">
                            {content}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>

              <section className="rounded-[24px] border border-black/[0.07] bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)]">
                <EventDetailsForm workspace={workspace} />
              </section>
            </aside>
          </div>
        ) : null}

        {tab === "guests" ? (
          <section className="rounded-[28px] border border-black/[0.07] bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)] sm:p-7">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-black">Guest List</h2>
                <p className="mt-1 text-sm text-grey">
                  {missingGuestsTable
                    ? "Database setup required"
                    : guests.length === 0
                      ? "No guests yet"
                      : `${guests.length} ${guests.length === 1 ? "recipient" : "recipients"}`}
                </p>
              </div>
              {invitation ? (
                <Button
                  href={`${invitationContinuePath(invitation)}?step=guests`}
                  variant="secondary"
                  size="sm"
                >
                  {guests.length > 0 ? "Edit guests" : "Add guests"}
                </Button>
              ) : null}
            </div>

            {missingGuestsTable ? (
              <p className="rounded-2xl bg-soft-grey px-4 py-3 text-sm text-black/75">
                Run{" "}
                <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                  supabase/migrations/005_event_guests.sql
                </code>{" "}
                in Supabase, then refresh.
              </p>
            ) : guests.length > 0 ? (
              <ul className="divide-y divide-black/[0.06] rounded-2xl border border-black/[0.06]">
                {guests.map((guest) => (
                  <li
                    key={guest.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-black">
                      {[guest.prefix, guest.displayName]
                        .filter(Boolean)
                        .join(" ")}
                    </span>
                    <span className="text-grey">{guest.email}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed border-black/10 bg-soft-grey/50 px-4 py-8 text-center text-sm text-grey">
                Add guests to personalise invitations and track RSVPs.
              </p>
            )}
          </section>
        ) : null}

        {tab === "email" ? (
          invitation ? (
            <EmailSendSummary
              invitation={invitation}
              eventSlug={workspace.slug}
              guests={guests}
              deliveries={deliveries}
              campaignSubject={campaignSubject}
              missingEmailTable={missingEmailTable}
            />
          ) : (
            <p className="rounded-[28px] border border-dashed border-black/10 bg-white px-4 py-10 text-center text-sm text-grey">
              Connect an invitation design before composing email.
            </p>
          )
        ) : null}

        {tab === "rsvps" ? (
          <EventRsvpSummary
            guests={guests}
            responses={rsvpResponses}
            missingTable={missingRsvpTable}
          />
        ) : null}
      </div>
    </div>
  );
}
