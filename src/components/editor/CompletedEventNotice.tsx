"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export interface CompletedEventInfo {
  name: string;
  /** Event hub link that opens the details form ready to reschedule. */
  reopenHref: string;
}

/**
 * A completed event's design is view-only. Say so over the editor rather than
 * bouncing to the event hub, so the host sees the design they asked for and
 * chooses whether to leave. There is no dismiss: reopening needs a new date,
 * which only the event details form can set.
 */
export function CompletedEventNotice({ event }: { event: CompletedEventInfo }) {
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal
      open
      role="alertdialog"
      labelledBy={titleId}
      describedBy={descriptionId}
    >
      <h2
        id={titleId}
        className="text-xl font-semibold tracking-tight text-black"
      >
        This Event Has Finished
      </h2>
      <p id={descriptionId} className="mt-3 text-sm leading-6 text-grey">
        “{event.name}” is completed, so its design is view-only. Reopen the event
        to pick a new date, then you can edit the design again.
      </p>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/home")}
          className="rounded-full px-4 py-2 text-sm font-semibold text-grey transition-colors hover:bg-soft-grey hover:text-black"
        >
          Back to Home
        </button>
        <Button size="sm" onClick={() => router.push(event.reopenHref)}>
          Reopen Event
        </Button>
      </div>
    </Modal>
  );
}
