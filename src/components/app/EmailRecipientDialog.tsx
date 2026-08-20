"use client";

import { useEffect, useId, useMemo } from "react";
import { createPortal } from "react-dom";
import type { EventGuest } from "@/lib/data/guests";
import { guestDisplayLabel } from "@/lib/invitation-paths";
import { PlusIcon } from "@/components/ui/Button";

interface EmailRecipientDialogProps {
  open: boolean;
  guests: EventGuest[];
  sentGuestIds: string[];
  selectedGuestIds: Set<string>;
  onSelectedGuestIdsChange: (ids: Set<string>) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function EmailRecipientDialog({
  open,
  guests,
  sentGuestIds,
  selectedGuestIds,
  onSelectedGuestIdsChange,
  onCancel,
  onConfirm,
}: EmailRecipientDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const sentIds = useMemo(() => new Set(sentGuestIds), [sentGuestIds]);
  const eligibleGuestIds = useMemo(
    () => guests.filter((guest) => !sentIds.has(guest.id)).map((guest) => guest.id),
    [guests, sentIds],
  );
  const allSelected =
    eligibleGuestIds.length > 0 &&
    eligibleGuestIds.every((guestId) => selectedGuestIds.has(guestId));
  const selectedCount = selectedGuestIds.size;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  const toggleAll = () => {
    onSelectedGuestIdsChange(
      allSelected ? new Set() : new Set(eligibleGuestIds),
    );
  };

  const toggleGuest = (guestId: string) => {
    const next = new Set(selectedGuestIds);
    if (next.has(guestId)) next.delete(guestId);
    else next.add(guestId);
    onSelectedGuestIdsChange(next);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md overflow-hidden rounded-[24px] border border-black/[0.04] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.16)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <h2 id={titleId} className="text-xl font-bold tracking-tight text-black">
            Choose email recipients
          </h2>
          <p id={descriptionId} className="mt-2 text-sm leading-6 text-grey">
            Select the guests who should receive their invitation now. You can
            send to the others later.
          </p>
        </div>

        <div className="border-y border-black/[0.06] bg-soft-grey/45 px-5 py-3 sm:px-6">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="flex items-center gap-3 text-sm font-semibold text-black">
              <input
                type="checkbox"
                checked={allSelected}
                disabled={eligibleGuestIds.length === 0}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-black/20 accent-[#ff60aa] disabled:opacity-40"
              />
              Select all
            </span>
            <span className="text-xs text-grey">
              {eligibleGuestIds.length} available
            </span>
          </label>
        </div>

        <div className="max-h-[min(22rem,45vh)] overflow-y-auto px-3 py-2 sm:px-4">
          <ul className="divide-y divide-black/[0.06]">
            {guests.map((guest) => {
              const isSent = sentIds.has(guest.id);
              const isSelected = selectedGuestIds.has(guest.id);
              return (
                <li key={guest.id}>
                  <label
                    className={`flex items-center gap-3 rounded-xl px-2 py-3 sm:px-2.5 ${
                      isSent
                        ? "cursor-not-allowed text-grey"
                        : "cursor-pointer hover:bg-soft-grey/70"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isSent}
                      onChange={() => toggleGuest(guest.id)}
                      className="h-4 w-4 shrink-0 rounded border-black/20 accent-[#ff60aa] disabled:opacity-30"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-black">
                        {guestDisplayLabel(guest)}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-grey">
                        {guest.email}
                      </span>
                    </span>
                    {isSent ? (
                      <span className="shrink-0 rounded-full bg-black px-2.5 py-1 text-[11px] font-semibold text-white">
                        Sent
                      </span>
                    ) : null}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-black/[0.06] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-grey transition-colors hover:bg-soft-grey hover:text-black"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send to {selectedCount} {selectedCount === 1 ? "guest" : "guests"}
            <PlusIcon />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
