/**
 * Pure helpers for the "Up Next" panel on Home: which event the host most
 * likely came back for, and what it still needs before it can go out.
 */
import {
  eventPath,
  type EventSetupStep,
  type EventWorkspace,
} from "./event-workspace-utils";
import {
  invitationContinuePath,
  invitationEditPath,
} from "@/lib/invitation-paths";

export interface SetupStep {
  key: EventSetupStep;
  label: string;
  /** Button copy when this is the step still outstanding. */
  action: string;
}

export const setupSteps: SetupStep[] = [
  { key: "design", label: "Design", action: "Finish the design" },
  { key: "details", label: "Details", action: "Confirm the details" },
  { key: "guests", label: "Guests", action: "Add guests" },
  { key: "send", label: "Send", action: "Send the invitation" },
];

/**
 * The soonest event still ahead. With nothing scheduled, fall back to the most
 * recently touched open event - it is unfinished precisely because it has no
 * date yet, which is the thing Home should be nudging.
 */
export function pickUpNextEvent(
  events: EventWorkspace[],
  now = Date.now(),
): EventWorkspace | null {
  const open = events.filter(
    (event) => event.status === "draft" || event.status === "active",
  );
  if (open.length === 0) return null;

  const scheduled = open
    .map((event) => ({
      event,
      at: event.eventDate ? Date.parse(event.eventDate) : Number.NaN,
    }))
    .filter((entry) => Number.isFinite(entry.at) && entry.at >= now)
    .sort((a, b) => a.at - b.at);

  // Events arrive sorted by most recently updated, so open[0] is the fallback.
  return scheduled[0]?.event ?? open[0];
}

/** The first step still outstanding, or null once setup is complete. */
export function nextSetupStep(event: EventWorkspace): SetupStep | null {
  return setupSteps.find((step) => !event.progress[step.key]) ?? null;
}

/**
 * A step opens only once everything before it is done. Jumping ahead would skip
 * the information the later step is built from - guests cannot be invited before
 * the date and venue exist. A finished step stays open so it can be revisited.
 */
export function isStepReachable(
  event: EventWorkspace,
  step: EventSetupStep,
): boolean {
  const index = setupSteps.findIndex((entry) => entry.key === step);
  if (index < 0) return false;
  if (event.progress[step]) return true;
  return setupSteps
    .slice(0, index)
    .every((earlier) => event.progress[earlier.key]);
}

/** Where a step is completed. The event hub covers designs not yet connected. */
export function setupStepHref(
  event: EventWorkspace,
  step: EventSetupStep,
): string {
  const invitation = event.invitation;
  if (!invitation) return eventPath(event);
  if (step === "design") return invitationEditPath(invitation);
  return `${invitationContinuePath(invitation)}?step=${
    step === "send" ? "email" : step
  }`;
}
