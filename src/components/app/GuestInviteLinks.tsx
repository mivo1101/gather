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
}

export function GuestInviteLinks({
  eventSlug,
  guests,
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
      window.prompt("Copy this personalised link:", url);
    }
  };

  return (
    <ul className="divide-y divide-black/[0.06] rounded-2xl border border-black/[0.06]">
      {guests.map((guest) => (
        <li
          key={guest.id}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
        >
          <div className="min-w-0">
            <p className="font-medium text-black">
              {guestDisplayLabel(guest)}
            </p>
            <p className="mt-0.5 truncate text-grey">{guest.email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={guestInvitePath(eventSlug, guest.token)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-soft-grey"
            >
              Open
            </a>
            <button
              type="button"
              onClick={() => {
                void copyLink(guest);
              }}
              className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:border-black/20"
            >
              {copiedId === guest.id ? "Copied" : "Copy link"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
