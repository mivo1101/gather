"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  connectDesignToEventAction,
  saveEventDetailsAction,
} from "@/lib/actions/events";
import {
  designLocationFromInvitation,
  eventPath,
  type EventWorkspace,
} from "@/lib/data/event-workspaces";
import type { EventGuest } from "@/lib/data/guests";
import type { Invitation } from "@/lib/data/types";
import type { EmailCampaignDraft } from "@/lib/data/email-campaigns";
import { formatEventDate } from "@/lib/format";
import { invitationEditPath } from "@/lib/invitation-paths";
import { Button } from "@/components/ui/Button";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { Select } from "@/components/ui/Select";
import { EmailInviteComposer } from "./EmailInviteComposer";
import { GuestListEditor } from "./GuestListEditor";

export type EventSetupStepId = "event" | "details" | "guests" | "email";

const TIMEZONES = [
  "Australia/Melbourne",
  "Australia/Sydney",
  "Australia/Brisbane",
  "Australia/Adelaide",
  "Australia/Perth",
  "Pacific/Auckland",
  "UTC",
] as const;

interface EventSetupFlowProps {
  invitation: Invitation;
  linkedEvent: EventWorkspace | null;
  linkableEvents: EventWorkspace[];
  initialStep: EventSetupStepId;
  initialGuests?: EventGuest[];
  sentGuestIds?: string[];
  errorMessage?: string | null;
  missingGuestsTable?: boolean;
  missingEmailTable?: boolean;
  emailDraft?: EmailCampaignDraft | null;
  designImageUrls?: string[];
  sendingConfigured?: boolean;
  defaultTestEmail?: string;
}

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

function StepRail({
  step,
  linked,
  detailsDone,
  guestsDone,
  emailDone,
}: {
  step: EventSetupStepId;
  linked: boolean;
  detailsDone: boolean;
  guestsDone: boolean;
  emailDone: boolean;
}) {
  const items = [
    {
      id: "event" as const,
      label: "Event",
      done: linked,
      href: "?step=event" as string | null,
    },
    {
      id: "details" as const,
      label: "Details",
      done: detailsDone,
      href: linked ? "?step=details" : null,
    },
    {
      id: "guests" as const,
      label: "Guests",
      done: guestsDone,
      href: linked && detailsDone ? "?step=guests" : null,
    },
    {
      id: "email" as const,
      label: "Email",
      done: emailDone,
      href: linked && detailsDone && guestsDone ? "?step=email" : null,
    },
  ];

  const pillClass = (active: boolean, done: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
      active
        ? "bg-black text-white"
        : done
          ? "bg-signature/10 text-signature hover:bg-signature/20"
          : "bg-soft-grey text-grey hover:bg-black/[0.08] hover:text-black"
    }`;

  return (
    <ol className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => {
        const active = item.id === step;
        const content = (
          <>
            <span aria-hidden="true">
              {item.done && !active ? "✓" : index + 1}
            </span>
            {item.label}
          </>
        );
        return (
          <li key={item.id} className="flex items-center gap-2">
            {index > 0 ? (
              <span className="text-black/20" aria-hidden="true">
                →
              </span>
            ) : null}
            {item.href ? (
              <Link
                href={item.href}
                aria-current={active ? "step" : undefined}
                className={pillClass(active, item.done)}
              >
                {content}
              </Link>
            ) : (
              <span className={`${pillClass(active, item.done)} opacity-60`}>
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function toDateInputValue(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toTimeInputValue(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

function ChooseEventStep({
  invitation,
  linkableEvents,
  errorMessage,
}: {
  invitation: Invitation;
  linkableEvents: EventWorkspace[];
  errorMessage?: string | null;
}) {
  const [mode, setMode] = useState<"create" | "existing">(
    linkableEvents.length > 0 ? "existing" : "create",
  );

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold tracking-tight text-black">
        Which Event Is This Invitation For?
      </h2>
      <p className="mt-2 text-sm leading-6 text-grey">
        Connect “{invitation.title}” to an event workspace so details, guests
        and RSVPs stay together.
      </p>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl bg-[#fff1f1] px-4 py-3 text-sm text-[#9a2a2a]">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("create")}
          className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
            mode === "create"
              ? "border-black bg-black text-white"
              : "border-black/10 bg-white text-black hover:border-black/20"
          }`}
        >
          <span className="text-sm font-semibold">Create new event</span>
          <span
            className={`mt-1 block text-xs leading-5 ${
              mode === "create" ? "text-white/70" : "text-grey"
            }`}
          >
            Start a fresh workspace from this design.
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode("existing")}
          disabled={linkableEvents.length === 0}
          className={`rounded-2xl border px-4 py-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
            mode === "existing"
              ? "border-black bg-black text-white"
              : "border-black/10 bg-white text-black hover:border-black/20"
          }`}
        >
          <span className="text-sm font-semibold">Select existing event</span>
          <span
            className={`mt-1 block text-xs leading-5 ${
              mode === "existing" ? "text-white/70" : "text-grey"
            }`}
          >
            {linkableEvents.length > 0
              ? `${linkableEvents.length} available`
              : "No open events yet"}
          </span>
        </button>
      </div>

      <form action={connectDesignToEventAction} className="mt-6 space-y-5">
        <input type="hidden" name="invitationId" value={invitation.id} />
        <input type="hidden" name="mode" value={mode} />

        {mode === "create" ? (
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
              Event name
              <RequiredMark />
            </span>
            <input
              name="name"
              required
              aria-required="true"
              maxLength={90}
              defaultValue={invitation.title}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-soft-grey/60 px-4 py-3.5 text-sm text-black outline-none placeholder:text-grey focus:border-signature/40 focus:bg-white focus:ring-2 focus:ring-signature/15"
            />
          </label>
        ) : (
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
              Your events
            </span>
            <Select
              name="eventId"
              required
              variant="field"
              wrapperClassName="mt-2 block w-full"
              className="w-full"
              defaultValue={
                linkableEvents.find((e) => e.invitationId === invitation.id)
                  ?.id ?? ""
              }
            >
              <option value="" disabled>
                Select an event
              </option>
              {linkableEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                  {event.eventDate
                    ? ` · ${formatEventDate(event.eventDate)}`
                    : ""}
                  {event.invitationId === invitation.id ? " · linked" : ""}
                </option>
              ))}
            </Select>
          </label>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link
            href={invitationEditPath(invitation)}
            className="text-sm font-semibold text-grey transition-colors hover:text-black"
          >
            ← Back to editor
          </Link>
          <SubmitButton
            label={mode === "create" ? "Create and continue" : "Connect and continue"}
            pendingLabel="Connecting…"
          />
        </div>
      </form>
    </div>
  );
}

function EventDetailsStep({
  invitation,
  event,
  errorMessage,
}: {
  invitation: Invitation;
  event: EventWorkspace;
  errorMessage?: string | null;
}) {
  const design = useMemo(
    () => designLocationFromInvitation(invitation),
    [invitation],
  );
  const designVenue = design.venue ?? "";
  const designAddress = design.address ?? "";

  const [date, setDate] = useState(
    toDateInputValue(event.eventDate ?? invitation.eventDate),
  );
  const [time, setTime] = useState(toTimeInputValue(event.eventDate));
  const [timezone, setTimezone] = useState(
    event.timezone || "Australia/Melbourne",
  );
  const [venue, setVenue] = useState(event.venue?.trim() || designVenue);
  const [address, setAddress] = useState(event.address?.trim() || designAddress);

  const notifyIfDifferent = (
    field: "venue" | "address",
    value: string,
    designValue: string,
  ) => {
    if (!designValue.trim()) return;
    if (equalsLoose(value, designValue)) return;
    window.alert(
      field === "venue"
        ? `This venue is different from the design (“${designValue}”). Guests will see the value you enter here.`
        : `This address is different from the design (“${designValue}”). Guests will see the value you enter here.`,
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold tracking-tight text-black">
        Confirm Event Details
      </h2>
      <p className="mt-2 text-sm leading-6 text-grey">
        Date, time and location for this event. Venue and address are prefilled
        from your design when possible - edit them if needed.
      </p>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl bg-[#fff1f1] px-4 py-3 text-sm text-[#9a2a2a]">
          {errorMessage}
        </p>
      ) : null}

      <form action={saveEventDetailsAction} className="mt-6 space-y-5">
        <input type="hidden" name="eventId" value={event.id} />
        <input type="hidden" name="invitationId" value={invitation.id} />
        <input type="hidden" name="name" value={event.name} />

        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
            Event name
            <RequiredMark />
          </span>
          <p className="mt-2 rounded-2xl border border-black/[0.06] bg-soft-grey/70 px-4 py-3.5 text-sm font-medium text-black">
            {event.name}
          </p>
          <p className="mt-1.5 text-xs text-grey">
            Set in the previous step. Go back to Event if you need to rename it.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
              Date
              <RequiredMark />
            </span>
            <input
              type="date"
              name="date"
              required
              aria-required="true"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm text-black outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/15"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
              Time
              <RequiredMark />
            </span>
            <input
              type="time"
              name="time"
              required
              aria-required="true"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm text-black outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/15"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
            Time zone
            <RequiredMark />
          </span>
          <Select
            name="timezone"
            required
            aria-required="true"
            variant="field"
            wrapperClassName="mt-2 block w-full"
            className="w-full"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            {TIMEZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
            Venue
            <RequiredMark />
          </span>
          <input
            name="venue"
            required
            aria-required="true"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            onBlur={() => notifyIfDifferent("venue", venue, designVenue)}
            placeholder="e.g. The Glasshouse"
            className="mt-2 w-full rounded-2xl border border-black/10 bg-soft-grey/60 px-4 py-3.5 text-sm text-black outline-none placeholder:text-grey focus:border-signature/40 focus:bg-white focus:ring-2 focus:ring-signature/15"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
            Address
            <RequiredMark />
          </span>
          <input
            name="address"
            required
            aria-required="true"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={() => notifyIfDifferent("address", address, designAddress)}
            placeholder="Street, suburb, city"
            className="mt-2 w-full rounded-2xl border border-black/10 bg-soft-grey/60 px-4 py-3.5 text-sm text-black outline-none placeholder:text-grey focus:border-signature/40 focus:bg-white focus:ring-2 focus:ring-signature/15"
          />
        </label>

        <div className="flex justify-end pt-2">
          <SubmitButton label="Save details" pendingLabel="Saving…" />
        </div>
      </form>
    </div>
  );
}

function equalsLoose(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function EventSetupFlow({
  invitation,
  linkedEvent,
  linkableEvents,
  initialStep,
  initialGuests = [],
  sentGuestIds = [],
  errorMessage,
  missingGuestsTable = false,
  missingEmailTable = false,
  emailDraft = null,
  designImageUrls = [],
  sendingConfigured = false,
  defaultTestEmail = "",
}: EventSetupFlowProps) {
  const step: EventSetupStepId =
    initialStep === "email" && linkedEvent
      ? "email"
      : initialStep === "guests" && linkedEvent
        ? "guests"
        : initialStep === "details" && linkedEvent
          ? "details"
          : "event";

  const title =
    step === "email"
      ? "Compose and Send"
      : step === "guests"
        ? "Who Are You Inviting?"
        : step === "details"
          ? "Confirm Date and Location"
          : "Set Up Your Event";
  const subtitle =
    step === "email"
      ? "Add a photo, tailor the message, then send."
      : step === "guests"
        ? "Type guests in or upload a CSV. Display name is what appears on the invitation."
        : step === "details"
          ? "These details are stored on the event workspace and used for invites, calendar links and RSVPs."
          : "Connect this design to an event, then confirm the details guests will see.";

  return (
    <div
      className={`mx-auto animate-fade-up ${
        step === "email" ? "max-w-5xl" : "max-w-2xl"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {linkedEvent ? (
          <Link
            href={eventPath(linkedEvent)}
            className="text-sm font-semibold text-grey transition-colors hover:text-black"
          >
            ← Back to event hub
          </Link>
        ) : (
          <Link
            href={invitationEditPath(invitation)}
            className="text-sm font-semibold text-grey transition-colors hover:text-black"
          >
            ← Back to editor
          </Link>
        )}
      </div>

      <div className="mt-6 rounded-[30px] border border-black/[0.07] bg-white p-7 shadow-[0_18px_50px_rgba(0,0,0,0.07)] sm:p-9">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-grey">{subtitle}</p>

        <div className="mt-6">
          <StepRail
            step={step}
            linked={Boolean(linkedEvent)}
            detailsDone={Boolean(linkedEvent?.progress.details)}
            guestsDone={Boolean(linkedEvent?.progress.guests)}
            emailDone={Boolean(linkedEvent?.progress.send)}
          />
        </div>

        {step === "event" ? (
          <ChooseEventStep
            invitation={invitation}
            linkableEvents={linkableEvents}
            errorMessage={errorMessage}
          />
        ) : step === "details" && linkedEvent ? (
          <EventDetailsStep
            invitation={invitation}
            event={linkedEvent}
            errorMessage={errorMessage}
          />
        ) : step === "guests" && linkedEvent ? (
          missingGuestsTable ? (
            <div className="mt-8 rounded-2xl bg-soft-grey px-4 py-5 text-sm leading-6 text-black/75">
              <p className="font-semibold text-black">One-time database setup</p>
              <p className="mt-2">
                Run{" "}
                <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                  supabase/migrations/005_event_guests.sql
                </code>{" "}
                in the Supabase SQL editor, then refresh this page.
              </p>
            </div>
          ) : (
            <GuestListEditor
              eventId={linkedEvent.id}
              eventSlug={linkedEvent.slug}
              invitationSlug={invitation.slug}
              initialGuests={initialGuests}
              sentGuestIds={sentGuestIds}
            />
          )
        ) : step === "email" && linkedEvent ? (
          missingEmailTable ? (
            <div className="mt-8 rounded-2xl bg-soft-grey px-4 py-5 text-sm leading-6 text-black/75">
              <p className="font-semibold text-black">One-time database setup</p>
              <p className="mt-2">
                Run{" "}
                <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                  supabase/migrations/006_event_email_campaigns.sql
                </code>
                {", then "}
                <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                  007_email_hero_image.sql
                </code>{" "}
                in Supabase, then refresh.
              </p>
            </div>
          ) : emailDraft ? (
            <div className="mt-8">
              <EmailInviteComposer
                eventId={linkedEvent.id}
                event={{
                  name: linkedEvent.name,
                  slug: linkedEvent.slug,
                  eventDate: linkedEvent.eventDate,
                  timezone: linkedEvent.timezone,
                  venue: linkedEvent.venue,
                  address: linkedEvent.address,
                }}
                invitation={invitation}
                guests={initialGuests}
                sentGuestIds={sentGuestIds}
                initialDraft={emailDraft}
                sendingConfigured={sendingConfigured}
                designImageUrls={designImageUrls}
                defaultTestEmail={defaultTestEmail}
              />
            </div>
          ) : (
            <p className="mt-8 text-sm text-grey">Could not load email draft.</p>
          )
        ) : (
          <div className="mt-8">
            <p className="text-sm text-grey">Connect an event to continue.</p>
            <Button href="?step=event" size="md" className="mt-4">
              Choose event
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
