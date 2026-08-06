"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { saveEventGuestsAndContinueAction } from "@/lib/actions/guests";
import {
  downloadGuestTemplateCsv,
  parseGuestCsv,
} from "@/lib/data/guest-csv";
import {
  createEmptyGuestDraft,
  FREE_RECIPIENT_LIMIT,
  GUEST_PREFIX_OPTIONS,
  guestRecipientCount,
  validateGuestDrafts,
  type EventGuest,
  type GuestDraft,
} from "@/lib/data/guests";
import { Button, PlusIcon } from "@/components/ui/Button";
import { BrandCheckbox } from "./BrandCheckbox";

const ROW_PLACEHOLDERS = [
  { displayName: "Emily", email: "emily@example.com" },
  { displayName: "Mi & Andre", email: "mi@example.com" },
] as const;

interface GuestListEditorProps {
  eventId: string;
  eventSlug: string;
  invitationSlug: string;
  initialGuests: EventGuest[];
}

export function GuestListEditor({
  eventId,
  eventSlug,
  invitationSlug,
  initialGuests,
}: GuestListEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<GuestDraft[]>(() =>
    initialGuests.length > 0
      ? initialGuests.map((guest) => ({
          id: guest.id,
          prefix: guest.prefix,
          displayName: guest.displayName,
          email: guest.email,
        }))
      : [createEmptyGuestDraft(), createEmptyGuestDraft()],
  );
  const [permissionConfirmed, setPermissionConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const recipientCount = useMemo(() => guestRecipientCount(rows), [rows]);
  const remaining = Math.max(0, FREE_RECIPIENT_LIMIT - recipientCount);

  const updateRow = (index: number, patch: Partial<GuestDraft>) => {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const addRow = () => {
    if (recipientCount >= FREE_RECIPIENT_LIMIT) {
      setError(
        `Free accounts can invite up to ${FREE_RECIPIENT_LIMIT} recipients.`,
      );
      return;
    }
    setRows((current) => [...current, createEmptyGuestDraft()]);
  };

  const removeRow = (index: number) => {
    setRows((current) =>
      current.length <= 1
        ? [createEmptyGuestDraft()]
        : current.filter((_, i) => i !== index),
    );
  };

  const onUploadFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setNotice(null);
    setFieldErrors({});

    const lower = file.name.toLowerCase();
    if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
      setError(
        "Excel files aren’t supported yet. In Excel or Sheets, use File → Download/Save as → CSV, then upload that file.",
      );
      return;
    }
    if (!lower.endsWith(".csv") && file.type && !file.type.includes("csv")) {
      setError("Please upload a .csv file using the Gather template.");
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseGuestCsv(text);
      if (parsed.errors.length > 0 && parsed.guests.length === 0) {
        setError(parsed.errors[0] ?? "Couldn’t read that file.");
        return;
      }

      const validation = validateGuestDrafts(parsed.guests);
      if (!validation.ok) {
        setError(
          validation.errors[0]?.message ??
            "The uploaded file has invalid rows. Fix them in the template and try again.",
        );
        // Still show what we could parse so users can edit.
        if (validation.guests.length > 0) {
          setRows(validation.guests);
        } else {
          setRows(parsed.guests);
        }
        return;
      }

      if (validation.guests.length > FREE_RECIPIENT_LIMIT) {
        setError(
          `Free accounts can invite up to ${FREE_RECIPIENT_LIMIT} recipients. Your file has ${validation.recipientCount}.`,
        );
        return;
      }

      setRows(
        validation.guests.length > 0
          ? validation.guests
          : [createEmptyGuestDraft()],
      );
      setNotice(
        `Imported ${validation.guests.length} ${validation.guests.length === 1 ? "guest" : "guests"} from ${file.name}. Review the table, then save.`,
      );
    } catch {
      setError("Couldn’t read that file. Download the template and try again.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSave = () => {
    setError(null);
    setNotice(null);
    setFieldErrors({});

    const validation = validateGuestDrafts(rows, { requireAtLeastOne: true });
    if (!validation.ok) {
      const nextFields: Record<string, string> = {};
      for (const item of validation.errors) {
        if (item.row < 0) {
          setError(item.message);
        } else {
          nextFields[`${item.row}:${item.field}`] = item.message;
        }
      }
      setFieldErrors(nextFields);
      if (!validation.errors.some((item) => item.row < 0)) {
        setError(validation.errors[0]?.message ?? "Fix the guest list.");
      }
      return;
    }

    if (!permissionConfirmed) {
      setError(
        "Confirm you have permission to use these guest contact details.",
      );
      return;
    }

    startTransition(async () => {
      const result = await saveEventGuestsAndContinueAction({
        eventId,
        eventSlug,
        invitationSlug,
        guests: validation.guests,
        permissionConfirmed,
      });
      if (result && "error" in result) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold tracking-tight text-black">
        Add your guests
      </h2>
      <p className="mt-2 text-sm leading-6 text-grey">
        Use the display name you want on the card - it fills the Guest name
        element. Free plan: up to {FREE_RECIPIENT_LIMIT} recipients.
      </p>

      <div className="mt-5 rounded-[22px] border border-black/[0.07] bg-soft-grey/40 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-black">Upload a CSV</p>
            <p className="mt-1 text-sm leading-6 text-grey">
              Use Gather’s template so columns sort correctly:{" "}
              <span className="font-medium text-black">
                Prefix, Display name, Email
              </span>
              .
            </p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs leading-5 text-grey">
              <li>Download the template and keep the header row.</li>
              <li>Fill rows in Excel, Numbers, or Google Sheets.</li>
              <li>Save or export as CSV, then upload here.</li>
            </ol>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadGuestTemplateCsv()}
              className="rounded-full border border-black/10 bg-white px-3.5 py-2 text-sm font-semibold text-black transition-colors hover:border-black/20"
            >
              Download template
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full bg-black px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-black/90"
            >
              Upload CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                void onUploadFile(event.target.files?.[0] ?? null);
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-soft-grey px-4 py-3 text-sm">
        <span className="font-medium text-black">
          {recipientCount} / {FREE_RECIPIENT_LIMIT} recipients
        </span>
        <span className="text-grey">
          {remaining === 0
            ? "Recipient limit reached"
            : `${remaining} remaining`}
        </span>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl bg-[#fff1f1] px-4 py-3 text-sm text-[#9a2a2a]">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-4 rounded-2xl border border-signature/20 bg-signature/10 px-4 py-3 text-sm text-black">
          {notice}
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-[22px] border border-black/[0.07]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-soft-grey/80 text-[11px] font-semibold uppercase tracking-[0.08em] text-grey">
            <tr>
              <th className="px-3 py-3 sm:px-4">Prefix</th>
              <th className="px-3 py-3 sm:px-4">Display name</th>
              <th className="px-3 py-3 sm:px-4">Email</th>
              <th className="px-3 py-3 sm:w-14 sm:px-4">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const placeholder =
                ROW_PLACEHOLDERS[index] ?? ROW_PLACEHOLDERS[0];
              return (
                <tr
                  key={row.id ?? `new-${index}`}
                  className="border-t border-black/[0.06]"
                >
                  <td className="px-2 py-2 align-top sm:px-3">
                    <select
                      value={row.prefix}
                      onChange={(e) =>
                        updateRow(index, { prefix: e.target.value })
                      }
                      className="w-full min-w-[4.5rem] rounded-xl border border-black/10 bg-white px-2 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/15"
                      aria-label={`Prefix for guest ${index + 1}`}
                    >
                      {GUEST_PREFIX_OPTIONS.map((option) => (
                        <option key={option || "none"} value={option}>
                          {option || "-"}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 align-top sm:px-3">
                    <input
                      value={row.displayName}
                      onChange={(e) =>
                        updateRow(index, { displayName: e.target.value })
                      }
                      placeholder={placeholder.displayName}
                      className={`w-full min-w-[9rem] rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-signature/15 ${
                        fieldErrors[`${index}:displayName`]
                          ? "border-[#e8a0a0] focus:border-[#e8a0a0]"
                          : "border-black/10 focus:border-signature/40"
                      }`}
                      aria-label={`Display name for guest ${index + 1}`}
                    />
                    {fieldErrors[`${index}:displayName`] ? (
                      <p className="mt-1 text-[11px] text-[#9a2a2a]">
                        {fieldErrors[`${index}:displayName`]}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-2 py-2 align-top sm:px-3">
                    <input
                      type="email"
                      value={row.email}
                      onChange={(e) =>
                        updateRow(index, { email: e.target.value })
                      }
                      placeholder={placeholder.email}
                      className={`w-full min-w-[11rem] rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-signature/15 ${
                        fieldErrors[`${index}:email`]
                          ? "border-[#e8a0a0] focus:border-[#e8a0a0]"
                          : "border-black/10 focus:border-signature/40"
                      }`}
                      aria-label={`Email for guest ${index + 1}`}
                    />
                    {fieldErrors[`${index}:email`] ? (
                      <p className="mt-1 text-[11px] text-[#9a2a2a]">
                        {fieldErrors[`${index}:email`]}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-2 py-2 align-top sm:px-3">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-grey transition-colors hover:bg-soft-grey hover:text-black"
                      aria-label={`Remove guest ${index + 1}`}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-soft-grey"
        >
          <PlusIcon />
          Add guest
        </button>
      </div>

      <BrandCheckbox
        className="mt-6 w-full rounded-2xl border border-black/[0.07] bg-white px-4 py-3.5"
        checked={permissionConfirmed}
        onChange={() => setPermissionConfirmed((value) => !value)}
        label="Confirm permission to use guest contact details"
      >
        I have permission to use these guest names and email addresses to send
        invitations for this event.
      </BrandCheckbox>

      <div className="mt-7 flex justify-end">
        <Button
          type="button"
          size="md"
          disabled={isPending}
          onClick={onSave}
        >
          {isPending ? "Saving…" : "Save guests and continue"}
        </Button>
      </div>
    </div>
  );
}
