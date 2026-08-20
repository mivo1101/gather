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
import { RequiredMark } from "@/components/ui/RequiredMark";
import { Select } from "@/components/ui/Select";
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
  sentGuestIds?: string[];
}

export function GuestListEditor({
  eventId,
  eventSlug,
  invitationSlug,
  initialGuests,
  sentGuestIds = [],
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
  const sentIds = useMemo(() => new Set(sentGuestIds), [sentGuestIds]);

  const recipientCount = useMemo(() => guestRecipientCount(rows), [rows]);
  const remaining = Math.max(0, FREE_RECIPIENT_LIMIT - recipientCount);

  const updateRow = (index: number, patch: Partial<GuestDraft>) => {
    if (rows[index]?.id && sentIds.has(rows[index].id)) return;
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
    if (rows[index]?.id && sentIds.has(rows[index].id)) {
      setError(
        "This invitation has already been sent. This guest’s details can no longer be changed or removed.",
      );
      return;
    }
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
      const lockedRows = rows.filter(
        (row) => row.id && sentIds.has(row.id),
      );
      const lockedEmails = new Set(
        lockedRows.map((row) => row.email.trim().toLowerCase()),
      );
      const mergeWithLockedRows = (guests: GuestDraft[]) => [
        ...lockedRows,
        ...guests.filter(
          (guest) => !lockedEmails.has(guest.email.trim().toLowerCase()),
        ),
      ];
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
          setRows(mergeWithLockedRows(validation.guests));
        } else {
          setRows(mergeWithLockedRows(parsed.guests));
        }
        return;
      }

      const nextRows = mergeWithLockedRows(validation.guests);
      const mergedValidation = validateGuestDrafts(nextRows);
      if (!mergedValidation.ok) {
        setError(
          mergedValidation.errors[0]?.message ??
            "The imported guest list is invalid.",
        );
        return;
      }

      setRows(
        nextRows.length > 0
          ? nextRows
          : [createEmptyGuestDraft()],
      );
      const importedCount = nextRows.length - lockedRows.length;
      setNotice(
        `Imported ${importedCount} ${importedCount === 1 ? "guest" : "guests"} from ${file.name}.${lockedRows.length > 0 ? ` Kept ${lockedRows.length} sent ${lockedRows.length === 1 ? "guest" : "guests"} unchanged.` : ""} Review the table, then save.`,
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
      let formError: string | null = null;
      for (const item of validation.errors) {
        if (item.row < 0) {
          formError ??= item.message;
        } else {
          nextFields[`${item.row}:${item.field}`] = item.message;
        }
      }
      setFieldErrors(nextFields);
      setError(formError);
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
        Add Your Guests
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
              className="inline-flex items-center gap-2 rounded-full bg-black px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-black/90"
            >
              <PlusIcon />
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

      <div className="mt-5 overflow-hidden rounded-[22px] border border-black/[0.07]">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[4.25rem] sm:w-[5.25rem]" />
            <col className="w-[27%]" />
            <col />
            <col className="w-[3.75rem] sm:w-[4.25rem]" />
            <col className="w-7 sm:w-9" />
          </colgroup>
          <thead className="bg-soft-grey/80 text-[11px] font-semibold uppercase tracking-[0.08em] text-grey">
            <tr>
              <th className="px-1.5 py-3 sm:px-2">Prefix</th>
              <th className="px-1.5 py-3 sm:px-2">
                Display name
                <RequiredMark />
              </th>
              <th className="px-1.5 py-3 sm:px-2">
                Email
                <RequiredMark />
              </th>
              <th className="px-1 py-3">Status</th>
              <th className="px-0 py-3">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const placeholder =
                ROW_PLACEHOLDERS[index] ?? ROW_PLACEHOLDERS[0];
              const isSent = Boolean(row.id && sentIds.has(row.id));
              const lockedMessage = isSent
                ? "This invitation has already been sent. This guest’s details can no longer be changed or removed."
                : undefined;
              return (
                <tr
                  key={row.id ?? `new-${index}`}
                  className={`border-t border-black/[0.06] ${isSent ? "bg-soft-grey/60 text-grey" : ""}`}
                  title={lockedMessage}
                >
                  <td className="px-1.5 py-2 align-top sm:px-2">
                    <Select
                      variant="compact"
                      wrapperClassName="block w-full"
                      className="w-full disabled:cursor-not-allowed disabled:bg-transparent disabled:text-grey"
                      value={row.prefix}
                      disabled={isSent}
                      onChange={(e) =>
                        updateRow(index, { prefix: e.target.value })
                      }
                      aria-label={`Prefix for guest ${index + 1}`}
                    >
                      {GUEST_PREFIX_OPTIONS.map((option) => (
                        <option key={option || "none"} value={option}>
                          {option || "-"}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-1.5 py-2 align-top sm:px-2">
                    <input
                      value={row.displayName}
                      required
                      aria-required="true"
                      disabled={isSent}
                      onChange={(e) =>
                        updateRow(index, { displayName: e.target.value })
                      }
                      placeholder={placeholder.displayName}
                      className={`w-full min-w-0 rounded-xl border bg-white px-2 py-2.5 text-sm outline-none focus:ring-2 focus:ring-signature/15 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-grey sm:px-3 ${
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
                  <td className="px-1.5 py-2 align-top sm:px-2">
                    <input
                      type="email"
                      value={row.email}
                      required
                      aria-required="true"
                      disabled={isSent}
                      onChange={(e) =>
                        updateRow(index, { email: e.target.value })
                      }
                      placeholder={placeholder.email}
                      className={`w-full min-w-0 rounded-xl border bg-white px-2 py-2.5 text-sm outline-none focus:ring-2 focus:ring-signature/15 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-grey sm:px-3 ${
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
                  <td className="px-1 py-2 align-middle">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold sm:text-[11px] ${
                        isSent
                          ? "bg-black text-white"
                          : "bg-soft-grey text-grey"
                      }`}
                    >
                      {isSent ? "Sent" : "Not sent"}
                    </span>
                  </td>
                  <td className="px-0 py-2 align-top">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      disabled={isSent}
                      className="flex h-10 w-full items-center justify-center rounded-xl text-signature transition-colors hover:bg-signature/10 disabled:cursor-not-allowed disabled:text-grey disabled:opacity-30 disabled:hover:bg-transparent"
                      aria-label={
                        isSent
                          ? `Guest ${index + 1} cannot be removed because their invitation was sent`
                          : `Remove guest ${index + 1}`
                      }
                      title={lockedMessage}
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
          <PlusIcon />
          {isPending ? "Saving…" : "Save guests and continue"}
        </Button>
      </div>
    </div>
  );
}
