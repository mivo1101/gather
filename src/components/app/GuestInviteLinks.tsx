"use client";

import { useState } from "react";
import type { EventGuest } from "@/lib/data/guests";
import {
  guestDisplayLabel,
  guestInvitePath,
} from "@/lib/invitation-paths";

interface GuestInviteLinksProps {
  eventSlug: string;
  guests: EventGuest[];
  copyEnabled?: boolean;
}

export function GuestInviteLinks({
  eventSlug,
  guests,
  copyEnabled = true,
}: GuestInviteLinksProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyLink = async (guest: EventGuest) => {
    const path = guestInvitePath(eventSlug, guest.token);
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(guest.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      window.prompt("Copy invitation link:", url);
    }
  };

  return (
    <ul className="divide-y divide-black/[0.06] rounded-2xl border border-black/[0.06]">
      {guests.map((guest) => {
        const isCopied = copiedId === guest.id;
        return (
          <li
            key={guest.id}
            className="group flex items-center justify-between gap-3 px-4 py-3 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium text-black">
                {guestDisplayLabel(guest)}
              </p>
              <p className="mt-0.5 truncate text-grey">{guest.email}</p>
            </div>
            {copyEnabled ? (
              <button
                type="button"
                onClick={() => {
                  void copyLink(guest);
                }}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signature/30 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 sm:text-xs sm:font-semibold sm:focus-visible:opacity-100 ${
                  isCopied
                    ? "bg-signature text-black opacity-100"
                    : "bg-black text-white hover:bg-black/90 sm:opacity-0 sm:group-hover:opacity-100"
                }`}
                aria-label={`${isCopied ? "Copied invitation link for" : "Copy invitation link for"} ${guestDisplayLabel(guest)}`}
              >
                <span className="sm:hidden" aria-hidden="true">
                  {isCopied ? "✓" : "⧉"}
                </span>
                <span className="hidden sm:inline">
                  {isCopied ? "Copied ✓" : "Copy link"}
                </span>
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
