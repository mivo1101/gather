"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateEventDetailsFromHubAction } from "@/lib/actions/events";
import {
  designLocationFromInvitation,
  type EventWorkspace,
} from "@/lib/data/event-workspaces";
import { Button } from "@/components/ui/Button";

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

function SaveDetailsButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Saving…" : "Save details"}
    </Button>
  );
}

interface EventDetailsFormProps {
  workspace: EventWorkspace;
}

export function EventDetailsForm({ workspace }: EventDetailsFormProps) {
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

  const saveAction = updateEventDetailsFromHubAction.bind(null, workspace.id);

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-black">Event details</h2>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-grey transition-colors hover:text-black"
          >
            Edit
          </button>
        </div>
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
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-black">Event details</h2>
      <form action={saveAction} className="mt-4 space-y-3">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-grey">
            Name
          </span>
          <input
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-black/10 bg-soft-grey/50 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:bg-white focus:ring-2 focus:ring-signature/15"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-grey">
              Date
            </span>
            <input
              type="date"
              name="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/15"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-grey">
              Time
            </span>
            <input
              type="time"
              name="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/15"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-grey">
            Time zone
          </span>
          <select
            name="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/15"
          >
            {TIMEZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-grey">
            Venue
          </span>
          <input
            name="venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            onBlur={() => notifyIfDifferent("venue", venue, designVenue)}
            className="mt-1.5 w-full rounded-xl border border-black/10 bg-soft-grey/50 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:bg-white focus:ring-2 focus:ring-signature/15"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-grey">
            Address
          </span>
          <input
            name="address"
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
          <SaveDetailsButton />
        </div>
      </form>
    </div>
  );
}
