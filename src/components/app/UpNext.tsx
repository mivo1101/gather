import Link from "next/link";
import { cardAspectRatio } from "@/components/editor/canvas-metrics";
import type { EventWorkspace } from "@/lib/data/event-workspace-utils";
import { eventLocation, eventPath } from "@/lib/data/event-workspace-utils";
import {
  isStepReachable,
  nextSetupStep,
  setupSteps,
  setupStepHref,
} from "@/lib/data/up-next";
import { formatCountdown, formatEventDate } from "@/lib/format";
import { CreateShortcuts } from "./CreateShortcuts";
import { SetupSteps } from "./SetupSteps";
import { InvitationPagePreview } from "./InvitationPagePreview";
import { StatusDot } from "./StatusDot";

function SectionHeading() {
  return (
    <h2
      id="up-next-heading"
      className="text-xl font-semibold tracking-tight text-black"
    >
      Up Next
    </h2>
  );
}

/**
 * Fixed height, width follows the artwork. A fixed box would leave a landscape
 * design floating in the middle of a portrait-shaped hole.
 */
const COVER_HEIGHT = "10rem";

function Cover({ event }: { event: EventWorkspace }) {
  const invitation = event.invitation;
  const page = invitation?.content.pages[0];

  if (!invitation || !page) {
    return (
      <div
        className="flex w-[7.5rem] shrink-0 items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white/50 text-center text-xs leading-relaxed text-grey"
        style={{ height: COVER_HEIGHT }}
      >
        No design
        <br />
        yet
      </div>
    );
  }

  const shape = invitation.content.shape ?? "portrait";
  const aspect = cardAspectRatio(shape, invitation.content.customSize);

  return (
    <div
      className="relative isolate shrink-0 overflow-hidden rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.16)]"
      style={{ height: COVER_HEIGHT, aspectRatio: String(aspect) }}
    >
      <InvitationPagePreview
        page={page}
        shape={shape}
        customSize={invitation.content.customSize}
        className="h-full w-full"
      />
    </div>
  );
}

function NothingUpcoming() {
  return (
    <section aria-labelledby="up-next-heading">
      <SectionHeading />
      <p className="mt-3 text-sm leading-6 text-grey">
        Nothing coming up. Start a new invitation and we will track its setup
        here.
      </p>
      <div className="mt-5">
        <CreateShortcuts />
      </div>
    </section>
  );
}

/**
 * The event the host is most likely here for, and what it still needs.
 *
 * Deliberately not a panel: Home already repeats a rounded white card for every
 * invitation, and wrapping this in the same shape made it read as one more of
 * them. The step rail carries the actions, so there is no separate button.
 */
export function UpNext({ event }: { event: EventWorkspace | null }) {
  if (!event) return <NothingUpcoming />;

  const nextStep = nextSetupStep(event);
  const location = eventLocation(event);
  const countdown = event.eventDate ? formatCountdown(event.eventDate) : null;

  return (
    <section aria-labelledby="up-next-heading">
      <SectionHeading />

      {/* items-start so the cover and the title share a top edge rather than
          floating against each other. */}
      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-7">
        <Cover event={event} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="min-w-0 truncate text-2xl font-semibold leading-tight tracking-tight text-black">
              <Link
                href={eventPath(event)}
                className="rounded transition-colors hover:text-signature focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signature/40"
              >
                {event.name}
              </Link>
            </h3>
            <StatusDot
              tone={event.status === "active" ? "green" : "neutral"}
              label={event.status === "active" ? "Active" : "Draft"}
            />
          </div>

          <p className="mt-3 text-sm leading-6 text-grey">
            {event.eventDate ? formatEventDate(event.eventDate) : "Date not set"}
            {countdown ? (
              <>
                <span className="px-2 text-black/20">·</span>
                <span className="font-semibold text-black">{countdown}</span>
              </>
            ) : null}
          </p>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-grey">
            {location || "Location not set"}
          </p>

          <div className="mt-6">
            <SetupSteps
              steps={setupSteps.map((step) => ({
                id: step.key,
                label: step.label,
                done: event.progress[step.key],
                href: isStepReachable(event, step.key)
                  ? setupStepHref(event, step.key)
                  : null,
              }))}
              activeId={nextStep?.key}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
