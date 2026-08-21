"use client";

import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { updateEventDetailsFromHubAction } from "@/lib/actions/events";
import {
  designLocationFromInvitation,
  type EventWorkspace,
} from "@/lib/data/event-workspace-utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { Select } from "@/components/ui/Select";

const TIMEZONES = [
  "Australia/Melbourne",
  "Australia/Sydney",
  "Australia/Brisbane",
  "Australia/Adelaide",
  "Australia/Perth",
  "Pacific/Auckland",
  "UTC",
] as const;

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

interface EventDetailsFormProps {
  workspace: EventWorkspace;
  sentRecipientCount: number;
  promptReopen?: boolean;
}

export function EventDetailsForm({
  workspace,
  sentRecipientCount,
  promptReopen = false,
}: EventDetailsFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const design = useMemo(
    () => designLocationFromInvitation(workspace.invitation),
    [workspace.invitation],
  );
  const designVenue = design.venue ?? "";
  const designAddress = design.address ?? "";
  const [editing, setEditing] = useState(!workspace.progress.details);
  const [name, setName] = useState(workspace.name);
  const [date, setDate] = useState(
    toDateInputValue(workspace.eventDate ?? workspace.invitation?.eventDate),
  );
  const [time, setTime] = useState(toTimeInputValue(workspace.eventDate));
  const [timezone, setTimezone] = useState(
    workspace.timezone || "Australia/Melbourne",
  );
  const [venue, setVenue] = useState(workspace.venue?.trim() || designVenue);
  const [address, setAddress] = useState(
    workspace.address?.trim() || designAddress,
  );
  const [dialog, setDialog] = useState<"reopen" | "changes" | null>(
    promptReopen ? "reopen" : null,
  );
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (promptReopen && workspace.status === "completed") {
      setDialog("reopen");
    }
  }, [promptReopen, workspace.status]);

  const changedFields = useMemo(() => {
    const fields: string[] = [];
    const changed = (a: string, b: string) =>
      a.trim().toLowerCase() !== b.trim().toLowerCase();
    if (changed(workspace.name, name)) fields.push("Event name");
    if (
      changed(toDateInputValue(workspace.eventDate), date) ||
      changed(toTimeInputValue(workspace.eventDate), time) ||
      changed(workspace.timezone, timezone)
    ) {
      fields.push("Date & Time");
    }
    if (changed(workspace.venue ?? "", venue)) fields.push("Venue");
    if (changed(workspace.address ?? "", address)) fields.push("Address");
    return fields;
  }, [address, date, name, time, timezone, venue, workspace]);

  const notifyIfDifferent = (
    field: "venue" | "address",
    value: string,
    designValue: string,
  ) => {
    if (!designValue.trim()) return;
    if (value.trim().toLowerCase() === designValue.trim().toLowerCase()) return;
    window.alert(
      field === "venue"
        ? `This venue is different from the design (“${designValue}”). Guests will see the value you enter here.`
        : `This address is different from the design (“${designValue}”). Guests will see the value you enter here.`,
    );
  };

  const submitDetails = (notifyGuests: boolean) => {
    const form = formRef.current;
    if (!form) return;
    const formData = new FormData(form);
    formData.set("notifyGuests", String(notifyGuests));
    setDialog(null);
    setFeedback(null);
    startTransition(async () => {
      const result = await updateEventDetailsFromHubAction(
        workspace.id,
        formData,
      );
      if ("error" in result) {
        setFeedback({ tone: "error", message: result.error });
        return;
      }
      setFeedback({ tone: "success", message: result.message });
      setEditing(false);
      router.refresh();
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sentRecipientCount > 0 && changedFields.length > 0) {
      setDialog("changes");
      return;
    }
    submitDetails(false);
  };

  const dialogUi = (
    <Modal
      open={dialog !== null}
      onDismiss={isPending ? undefined : () => setDialog(null)}
      labelledBy="event-details-dialog-title"
    >
      <h3
        id="event-details-dialog-title"
        className="text-xl font-semibold tracking-tight text-black"
      >
        {dialog === "reopen"
          ? "Reopen This Event?"
          : "Notify Guests About These Changes?"}
      </h3>
      {dialog === "reopen" ? (
        <p className="mt-3 text-sm leading-6 text-grey">
          This event is completed. You can reopen it to correct or reschedule
          the details.
          {sentRecipientCount > 0
            ? ` ${sentRecipientCount} ${sentRecipientCount === 1 ? "guest has" : "guests have"} already received the invitation.`
            : ""}
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6 text-grey">
            {sentRecipientCount} {sentRecipientCount === 1 ? "guest has" : "guests have"}
            {" "}already received the previous details. You changed:
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {changedFields.map((field) => (
              <li
                key={field}
                className="rounded-full bg-soft-grey px-3 py-1 text-xs font-semibold text-black"
              >
                {field}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-grey">
            Guest updates will be linked to the original email thread when
            their email provider supports it.
          </p>
        </>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => setDialog(null)}
          className="rounded-full px-4 py-2 text-sm font-semibold text-grey hover:bg-soft-grey hover:text-black disabled:opacity-50"
        >
          Cancel
        </button>
        {dialog === "reopen" ? (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setDialog(null);
              setEditing(true);
            }}
          >
            Reopen &amp; Edit
          </Button>
        ) : (
          <>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={() => submitDetails(false)}
            >
              Save Without Notifying
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={() => submitDetails(true)}
            >
              Save &amp; Notify Guests
            </Button>
          </>
        )}
      </div>
    </Modal>
  );

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-black">Event Details</h2>
          <button
            type="button"
            onClick={() =>
              workspace.status === "completed"
                ? setDialog("reopen")
                : setEditing(true)
            }
            className="text-xs font-semibold text-grey transition-colors hover:text-black"
          >
            {workspace.status === "completed" ? "Reopen & Edit" : "Edit"}
          </button>
        </div>
        {workspace.status === "completed" ? (
          <p className="mt-3 rounded-xl bg-[#f3f5f9] px-3 py-2.5 text-xs leading-5 text-[#50617d]">
            This event is complete. Details are view-only until you reopen it.
          </p>
        ) : null}
        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.08em] text-grey">
              Date
            </dt>
            <dd className="mt-1 font-medium text-black">
              {workspace.eventDate
                ? new Date(workspace.eventDate).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Not confirmed"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.08em] text-grey">
              Time zone
            </dt>
            <dd className="mt-1 font-medium text-black">
              {workspace.timezone.replace(/_/g, " ")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.08em] text-grey">
              Location
            </dt>
            <dd className="mt-1 font-medium text-black">
              {[workspace.venue, workspace.address].filter(Boolean).join(", ") ||
                "Not confirmed"}
            </dd>
          </div>
        </dl>
        {feedback ? (
          <p
            className={`mt-4 text-xs font-semibold ${feedback.tone === "error" ? "text-[#b42318]" : "text-signature"}`}
            role={feedback.tone === "error" ? "alert" : "status"}
          >
            {feedback.message}
          </p>
        ) : null}
        {dialogUi}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-black">Event Details</h2>
      <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-grey">
            Name
            <RequiredMark />
          </span>
          <input
            name="name"
            required
            aria-required="true"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-black/10 bg-soft-grey/50 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:bg-white focus:ring-2 focus:ring-signature/15"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-grey">
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
              className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/15"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-grey">
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
              className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/15"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-grey">
            Time zone
            <RequiredMark />
          </span>
          <Select
            name="timezone"
            required
            aria-required="true"
            variant="compact"
            wrapperClassName="mt-1.5 block w-full"
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
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-grey">
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
            className="mt-1.5 w-full rounded-xl border border-black/10 bg-soft-grey/50 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:bg-white focus:ring-2 focus:ring-signature/15"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-grey">
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
            className="mt-1.5 w-full rounded-xl border border-black/10 bg-soft-grey/50 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:bg-white focus:ring-2 focus:ring-signature/15"
          />
        </label>

        <div className="flex items-center justify-end gap-2 pt-1">
          {workspace.progress.details ? (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full px-3 py-2 text-xs font-semibold text-grey hover:text-black"
            >
              Cancel
            </button>
          ) : null}
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Saving…" : "Save Details"}
          </Button>
        </div>
        {feedback ? (
          <p
            className={`text-right text-xs font-semibold ${feedback.tone === "error" ? "text-[#b42318]" : "text-signature"}`}
            role={feedback.tone === "error" ? "alert" : "status"}
          >
            {feedback.message}
          </p>
        ) : null}
      </form>
      {dialogUi}
    </div>
  );
}
