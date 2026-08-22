import Link from "next/link";
import { cardAspectRatio } from "@/components/editor/canvas-metrics";
import { Button, PlusIcon } from "@/components/ui/Button";
import type { EventWorkspace } from "@/lib/data/event-workspace-utils";
import { eventLocation, eventPath } from "@/lib/data/event-workspace-utils";
import {
  nextSetupStep,
  setupSteps,
  setupStepHref,
} from "@/lib/data/up-next";
import { formatCountdown, formatEventDate } from "@/lib/format";
import { CreateShortcuts } from "./CreateShortcuts";
import { SetupSteps } from "./SetupSteps";
import { InvitationPagePreview } from "./InvitationPagePreview";
import { StatusDot } from "./StatusDot";

// Solid and lifted so the hero reads as a different kind of thing from the
// flat translucent cards in the list below it.
const panel =
  "rounded-3xl border border-black/[0.06] bg-white px-5 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.03),0_18px_44px_rgba(0,0,0,0.07)] sm:px-7 sm:py-7";

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-signature">
      {children}
    </p>
  );
}

function Cover({ event }: { event: EventWorkspace }) {
  const invitation = event.invitation;
  const page = invitation?.content.pages[0];
  if (!invitation || !page) {
    return (
      <div className="flex h-[7.5rem] w-[5.75rem] shrink-0 items-center justify-center rounded-xl border border-dashed border-black/15 bg-white/60 text-center text-[11px] leading-tight text-grey">
        No design
        <br />
        yet
      </div>
    );
  }

  const shape = invitation.content.shape ?? "portrait";
  const aspect = cardAspectRatio(shape, invitation.content.customSize);

  return (
    <div className="flex h-[7.5rem] w-[5.75rem] shrink-0 items-center justify-center">
      <div
        className="relative isolate overflow-hidden rounded-lg shadow-[0_4px_14px_rgba(0,0,0,0.12)]"
        style={{
          aspectRatio: String(aspect),
          height: aspect <= 1 ? "100%" : "auto",
          width: aspect > 1 ? "100%" : "auto",
          maxHeight: "100%",
          maxWidth: "100%",
        }}
      >
        <InvitationPagePreview
          page={page}
          shape={shape}
          customSize={invitation.content.customSize}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}

function NothingUpcoming() {
  return (
    <section aria-labelledby="up-next-heading" className={panel}>
      <SectionLabel>Up next</SectionLabel>
      <h2
        id="up-next-heading"
        className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-black"
      >
        Nothing coming up
      </h2>
      <p className="mt-2 text-sm leading-6 text-grey">
        Start a new invitation and we will track its setup here.
      </p>
      <div className="mt-5">
        <CreateShortcuts />
      </div>
    </section>
  );
}

/**
 * The event the host is most likely here for, with the one thing it still needs
 * as the primary action. Replaces the layout shortcuts, which only picked a
 * canvas shape the editor can change anyway.
 */
export function UpNext({ event }: { event: EventWorkspace | null }) {
  if (!event) return <NothingUpcoming />;

  const nextStep = nextSetupStep(event);
  const location = eventLocation(event);
  const countdown = event.eventDate ? formatCountdown(event.eventDate) : null;

  return (
    <section aria-labelledby="up-next-heading" className={panel}>
      <div className="flex items-start justify-between gap-3">
        <SectionLabel>Up next</SectionLabel>
        <StatusDot
          tone={event.status === "active" ? "green" : "neutral"}
          label={event.status === "active" ? "Active" : "Draft"}
        />
      </div>

      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
        <Cover event={event} />

        <div className="min-w-0 flex-1">
          <h2
            id="up-next-heading"
            className="truncate text-2xl font-semibold leading-tight tracking-tight text-black"
          >
            {event.name}
          </h2>
          <p className="mt-2 truncate text-sm leading-6 text-grey">
            {event.eventDate ? formatEventDate(event.eventDate) : "Date not set"}
            {countdown ? (
              <>
                <span className="px-1.5 text-black/20">·</span>
                <span className="font-semibold text-black">{countdown}</span>
              </>
            ) : null}
          </p>
          <p className="mt-1 truncate text-sm leading-6 text-grey">
            {location || "Location not set"}
          </p>

          <div className="mt-5">
            <SetupSteps
              steps={setupSteps.map((step) => ({
                id: step.key,
                label: step.label,
                done: event.progress[step.key],
                href: setupStepHref(event, step.key),
              }))}
              activeId={nextStep?.key}
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          {nextStep ? (
            <Button href={setupStepHref(event, nextStep.key)} size="sm">
              <PlusIcon />
              {nextStep.action}
            </Button>
          ) : (
            <Button href={eventPath(event)} size="sm">
              <PlusIcon />
              Open event
            </Button>
          )}
          <Link
            href={eventPath(event)}
            className="text-center text-xs font-semibold text-grey transition-colors hover:text-black sm:text-right"
          >
            {nextStep ? "View event" : "All set"}
          </Link>
        </div>
      </div>
    </section>
  );
}
