"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { Invitation } from "@/lib/data/types";
import { formatEventDate, formatRelativeTime } from "@/lib/format";
import { MoreIcon, PencilIcon } from "./icons";

const statusStyles = {
  draft: "bg-[#fde8d8] text-[#9a5a2a]",
  published: "bg-[#e4f3ec] text-[#2f7a5b]",
  archived: "bg-soft-grey text-grey",
} as const;

const statusLabels = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
} as const;

interface InvitationCardProps {
  invitation: Invitation;
}

export function InvitationCard({ invitation }: InvitationCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-sugar-milk">
        {invitation.coverImage ? (
          <div className="absolute inset-0 bg-gradient-to-br from-sugar-milk via-[#ffe4f0] to-signature/20">
            <Image
              src={invitation.coverImage}
              alt=""
              fill
              className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-soft-grey to-sugar-milk" />
        )}

        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[invitation.status]}`}
        >
          {statusLabels[invitation.status]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="truncate text-base font-semibold text-black">
            {invitation.title}
          </h3>
          {invitation.eventDate ? (
            <p className="mt-1 text-sm text-grey">
              {formatEventDate(invitation.eventDate)}
              {invitation.location ? ` · ${invitation.location}` : null}
            </p>
          ) : (
            <p className="mt-1 text-sm text-grey">Event date not set</p>
          )}
          <p className="mt-1 text-xs text-grey">
            Last edited {formatRelativeTime(invitation.updatedAt)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-grey transition-colors hover:bg-soft-grey hover:text-black"
              aria-label={`More actions for ${invitation.title}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MoreIcon />
            </button>

            {menuOpen && (
              <div
                id={menuId}
                role="menu"
                className="absolute left-0 bottom-full z-20 mb-2 min-w-[10rem] overflow-hidden rounded-xl border border-black/5 bg-white py-1 shadow-[0_12px_28px_rgba(0,0,0,0.1)]"
              >
                <Link
                  href={`/invitations/${invitation.id}`}
                  role="menuitem"
                  className="block px-3 py-2 text-sm text-black hover:bg-soft-grey"
                  onClick={() => setMenuOpen(false)}
                >
                  Open
                </Link>
                <Link
                  href={`/invitations/${invitation.id}/edit`}
                  role="menuitem"
                  className="block px-3 py-2 text-sm text-black hover:bg-soft-grey"
                  onClick={() => setMenuOpen(false)}
                >
                  Edit
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-2 text-left text-sm text-grey hover:bg-soft-grey"
                  onClick={() => setMenuOpen(false)}
                >
                  Archive
                </button>
              </div>
            )}
          </div>

          <Link
            href={`/invitations/${invitation.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-full bg-sugar-milk px-3.5 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#ffe4f0]"
          >
            <PencilIcon />
            Edit
          </Link>
        </div>
      </div>
    </article>
  );
}
