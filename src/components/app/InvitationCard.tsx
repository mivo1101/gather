"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import {
  moveInvitationToTrashAction,
  permanentlyDeleteInvitationsAction,
  renameInvitationAction,
} from "@/lib/actions/invitations";
import type { Invitation } from "@/lib/data/types";
import { formatEventDate, formatRelativeTime } from "@/lib/format";
import { BrandCheckbox } from "./BrandCheckbox";
import { MoreIcon, PencilIcon } from "./icons";
import { InvitationPagePreview } from "./InvitationPagePreview";

const statusStyles = {
  draft: "bg-[#fde8d8] text-[#9a5a2a]",
  published: "bg-[#e4f3ec] text-[#2f7a5b]",
  archived: "bg-soft-grey text-grey",
} as const;

const statusLabels = {
  draft: "Draft",
  published: "Published",
  archived: "Trash",
} as const;

interface InvitationCardProps {
  invitation: Invitation;
  selectable?: boolean;
  selected?: boolean;
  onSelectedChange?: (id: string) => void;
  onTrashed?: (id: string) => void;
  onTrashFailed?: (id: string) => void;
  onPermanentlyDeleted?: (id: string) => void;
  onPermanentDeleteFailed?: (id: string) => void;
}

function ExternalLinkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 4h6v6M10 14L20 4M20 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1h5"
      />
    </svg>
  );
}

function OpenIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 19V5a1 1 0 011-1h7M14 4h5a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1"
      />
      <path strokeLinecap="round" d="M9 12h10" />
    </svg>
  );
}

function TrashMenuIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 12a1 1 0 001 1h8a1 1 0 001-1l1-12"
      />
    </svg>
  );
}

export function InvitationCard({
  invitation,
  selectable = false,
  selected = false,
  onSelectedChange,
  onTrashed,
  onTrashFailed,
  onPermanentlyDeleted,
  onPermanentDeleteFailed,
}: InvitationCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(invitation.title);
  const [displayTitle, setDisplayTitle] = useState(invitation.title);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const menuId = useId();
  const inTrash = invitation.status === "archived";
  const editHref = `/invitations/${invitation.id}/edit`;
  const viewHref = `/invitations/${invitation.id}`;

  const firstPage = useMemo(() => {
    const pages = invitation.content.pages;
    if (pages?.length) {
      return {
        elements: pages[0].elements,
        backgroundColor: pages[0].backgroundColor || "#fff8f4",
      };
    }
    return {
      elements: invitation.content.elements ?? [],
      backgroundColor: "#fff8f4",
    };
  }, [invitation.content]);

  const pageCount = invitation.content.pages?.length || 1;

  useEffect(() => {
    if (!menuOpen) {
      setRenaming(false);
      setDraftTitle(displayTitle);
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (renaming) {
          setRenaming(false);
          setDraftTitle(displayTitle);
          return;
        }
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, renaming, displayTitle]);

  useEffect(() => {
    setDisplayTitle(invitation.title);
    setDraftTitle(invitation.title);
  }, [invitation.title]);

  useEffect(() => {
    if (!renaming) return;
    const input = titleInputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, [renaming]);

  const saveTitle = () => {
    const next = draftTitle.trim() || "Untitled invitation";
    if (next === displayTitle) {
      setRenaming(false);
      setDraftTitle(displayTitle);
      return;
    }

    setError(null);
    setDisplayTitle(next);
    setRenaming(false);
    startTransition(async () => {
      const result = await renameInvitationAction(invitation.id, next);
      if ("error" in result) {
        setDisplayTitle(invitation.title);
        setDraftTitle(invitation.title);
        setError(result.error);
        return;
      }
      setDisplayTitle(result.invitation.title);
      setDraftTitle(result.invitation.title);
      router.refresh();
    });
  };

  const moveToTrash = () => {
    setError(null);
    setMenuOpen(false);
    onTrashed?.(invitation.id);
    startTransition(async () => {
      const result = await moveInvitationToTrashAction(invitation.id);
      if ("error" in result) {
        onTrashFailed?.(invitation.id);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const deletePermanently = () => {
    const confirmed = window.confirm(
      `Permanently delete “${displayTitle}”? This cannot be undone.`,
    );
    if (!confirmed) return;

    setError(null);
    setMenuOpen(false);
    onPermanentlyDeleted?.(invitation.id);
    startTransition(async () => {
      const result = await permanentlyDeleteInvitationsAction([invitation.id]);
      if ("error" in result) {
        onPermanentDeleteFailed?.(invitation.id);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] ${
        selected ? "border-black/25 ring-2 ring-black/10" : "border-black/8"
      }`}
    >      <Link
        href={editHref}
        className="flex min-h-0 flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-signature/40 focus-visible:ring-inset"
        aria-label={`Edit ${displayTitle}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f3f1ef]">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative aspect-[9/16] h-full overflow-hidden rounded-sm shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-transform duration-500 group-hover:scale-[1.02]">
              <InvitationPagePreview
                page={firstPage}
                className="h-full w-full"
              />
            </div>
          </div>

          <span
            className={`absolute ${selectable ? "left-12" : "left-3"} top-3 z-10 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[invitation.status]}`}
          >
            {statusLabels[invitation.status]}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4">
          <h3 className="truncate text-base font-semibold text-black">
            {displayTitle}
          </h3>
          {invitation.eventDate ? (
            <p className="text-sm text-grey">
              {formatEventDate(invitation.eventDate)}
              {invitation.location ? ` · ${invitation.location}` : null}
            </p>
          ) : (
            <p className="text-sm text-grey">Event date not set</p>
          )}
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-grey">
            <PencilIcon className="h-3 w-3 shrink-0" />
            <span>Last edited {formatRelativeTime(invitation.updatedAt)}</span>
          </p>
          {error && (
            <p className="mt-1 text-xs font-medium text-signature">{error}</p>
          )}
        </div>
      </Link>

      {selectable && (
        <div
          className={`absolute left-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-md border bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] ${
            selected ? "border-black" : "border-black/15"
          }`}
        >
          <BrandCheckbox
            checked={selected}
            onChange={() => onSelectedChange?.(invitation.id)}
            label={`Select ${displayTitle}`}
          />
        </div>
      )}

      {/* Canva-style hover control on the cover */}
      <div
        className={`absolute right-3 top-3 z-20 transition-opacity ${
          menuOpen
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
        }`}
        ref={menuRef}
      >
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-[0_6px_16px_rgba(0,0,0,0.18)] transition-colors hover:bg-black/85"
          aria-label={`Details for ${displayTitle}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setMenuOpen((open) => !open);
          }}
        >
          <MoreIcon className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div
            id={menuId}
            role="menu"
            className="absolute right-0 top-full z-30 mt-2 w-[17.5rem] overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.14)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-black/5 px-3.5 py-3">
              <div className="flex items-start gap-2">
                {renaming ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={draftTitle}
                    disabled={isPending}
                    aria-label="Invitation title"
                    className="min-w-0 flex-1 rounded-md border border-black/10 bg-soft-grey px-2 py-1 text-sm font-semibold text-black outline-none focus:border-black/25"
                    onChange={(event) => setDraftTitle(event.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        event.currentTarget.blur();
                      }
                      if (event.key === "Escape") {
                        event.preventDefault();
                        event.stopPropagation();
                        setRenaming(false);
                        setDraftTitle(displayTitle);
                      }
                    }}
                  />
                ) : (
                  <>
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-black">
                      {displayTitle}
                    </p>
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 rounded-md p-0.5 text-grey hover:bg-soft-grey hover:text-black"
                      aria-label="Rename invitation"
                      onClick={() => {
                        setDraftTitle(displayTitle);
                        setRenaming(true);
                      }}
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-grey">
                Invitation · {statusLabels[invitation.status]} · Edited{" "}
                {formatRelativeTime(invitation.updatedAt)}
              </p>
              <p className="mt-0.5 text-[11px] text-grey">
                {pageCount} {pageCount === 1 ? "page" : "pages"}
                {invitation.eventDate
                  ? ` · ${formatEventDate(invitation.eventDate)}`
                  : ""}
                {invitation.location ? ` · ${invitation.location}` : ""}
              </p>
            </div>

            <div className="py-1.5">
              <Link
                href={editHref}
                role="menuitem"
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-black hover:bg-soft-grey"
                onClick={() => setMenuOpen(false)}
              >
                <OpenIcon className="h-4 w-4 text-grey" />
                Open in editor
              </Link>
              <a
                href={viewHref}
                target="_blank"
                rel="noreferrer"
                role="menuitem"
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-black hover:bg-soft-grey"
                onClick={() => setMenuOpen(false)}
              >
                <ExternalLinkIcon className="h-4 w-4 text-grey" />
                View invitation
              </a>
              <a
                href={editHref}
                target="_blank"
                rel="noreferrer"
                role="menuitem"
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-black hover:bg-soft-grey"
                onClick={() => setMenuOpen(false)}
              >
                <ExternalLinkIcon className="h-4 w-4 text-grey" />
                Open in a new tab
              </a>
            </div>

            {!inTrash ? (
              <div className="border-t border-black/5 py-1.5">
                <button
                  type="button"
                  role="menuitem"
                  disabled={isPending}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-black hover:bg-soft-grey disabled:opacity-50"
                  onClick={moveToTrash}
                >
                  <TrashMenuIcon className="h-4 w-4 text-grey" />
                  {isPending ? "Moving…" : "Move to Trash"}
                </button>
              </div>
            ) : (
              <div className="border-t border-black/5 py-1.5">
                <button
                  type="button"
                  role="menuitem"
                  disabled={isPending}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-black hover:bg-soft-grey disabled:opacity-50"
                  onClick={deletePermanently}
                >
                  <TrashMenuIcon className="h-4 w-4 text-grey" />
                  {isPending ? "Deleting…" : "Delete permanently"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
