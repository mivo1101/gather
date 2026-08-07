"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { InvitationPagePreview } from "@/components/app/InvitationPagePreview";
import { cardAspectRatio } from "@/components/editor/canvas-metrics";
import {
  CloseIcon,
  FitIcon,
} from "@/components/editor/editor-icons";
import { Select } from "@/components/ui/Select";
import {
  invitationPageRoleLabel,
  type InvitationPage,
} from "@/lib/data/invitation-content";
import type { EventGuest } from "@/lib/data/guests";
import type { Invitation } from "@/lib/data/types";

function guestLabel(guest: EventGuest) {
  return [guest.prefix, guest.displayName].filter(Boolean).join(" ");
}

interface EventDesignPreviewProps {
  invitation: Invitation;
  guests: EventGuest[];
}

function PageDots({
  pages,
  activeIndex,
  onSelect,
  tone = "light",
}: {
  pages: InvitationPage[];
  activeIndex: number;
  onSelect: (index: number) => void;
  tone?: "light" | "dark";
}) {
  return (
    <div className="flex items-center justify-center gap-2.5">
      {pages.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(index)}
          className={`h-2.5 w-2.5 rounded-full transition-colors ${
            tone === "dark"
              ? index === activeIndex
                ? "bg-white"
                : "bg-white/35 hover:bg-white/60"
              : index === activeIndex
                ? "bg-black"
                : "bg-black/20 hover:bg-black/40"
          }`}
          aria-label={`Page ${index + 1}, ${invitationPageRoleLabel(item.role)}`}
          aria-current={index === activeIndex ? "true" : undefined}
        />
      ))}
    </div>
  );
}

/** Compact multi-page design preview for the event hub, with seeded guest name. */
export function EventDesignPreview({
  invitation,
  guests,
}: EventDesignPreviewProps) {
  const pages = invitation.content.pages;
  const shape = invitation.content.shape ?? "portrait";
  const customSize = invitation.content.customSize;
  const aspectRatio = cardAspectRatio(shape, customSize);

  const [pageIndex, setPageIndex] = useState(0);
  const [guestIndex, setGuestIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const safePageIndex = Math.min(pageIndex, Math.max(pages.length - 1, 0));
  const page: InvitationPage | undefined = pages[safePageIndex];
  const guest = guests[Math.min(guestIndex, Math.max(guests.length - 1, 0))];
  const personalizedName = guest ? guestLabel(guest) : "Guest name";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
      if (event.key === "ArrowLeft") {
        setPageIndex((i) => Math.max(0, i - 1));
      }
      if (event.key === "ArrowRight") {
        setPageIndex((i) => Math.min(pages.length - 1, i + 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [fullscreen, pages.length]);

  if (!page) {
    return (
      <p className="rounded-2xl border border-dashed border-black/10 bg-soft-grey/50 px-4 py-8 text-center text-sm text-grey">
        No pages in this design yet.
      </p>
    );
  }

  const fullscreenModal =
    mounted && fullscreen
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px] sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Invitation full screen preview"
            onClick={() => setFullscreen(false)}
          >
            <div
              className="relative flex max-h-full w-full max-w-4xl flex-col items-center"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex w-full items-center justify-between gap-3">
                <p className="text-sm font-medium text-white/90">
                  Page {safePageIndex + 1} of {pages.length}
                  {guest ? (
                    <>
                      <span className="px-2 text-white/35">·</span>
                      Previewing as {guestLabel(guest)}
                    </>
                  ) : null}
                </p>
                <button
                  type="button"
                  onClick={() => setFullscreen(false)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  aria-label="Close full screen preview"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex min-h-0 w-full flex-1 items-center justify-center">
                <div
                  className="relative max-h-[min(72vh,40rem)] max-w-full overflow-hidden rounded-xl shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
                  style={{
                    aspectRatio: String(aspectRatio),
                    height: "min(72vh, 40rem)",
                    width: "auto",
                  }}
                >
                  <InvitationPagePreview
                    page={page}
                    shape={shape}
                    customSize={customSize}
                    personalizedName={personalizedName}
                    className="h-full w-full"
                  />
                </div>
              </div>

              {pages.length > 1 ? (
                <div className="mt-5 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                    disabled={safePageIndex === 0}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <PageDots
                    pages={pages}
                    activeIndex={safePageIndex}
                    onSelect={setPageIndex}
                    tone="dark"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPageIndex((i) => Math.min(pages.length - 1, i + 1))
                    }
                    disabled={safePageIndex >= pages.length - 1}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-grey">
          Page {safePageIndex + 1} of {pages.length}
        </p>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {guests.length > 0 ? (
            <label className="flex min-w-0 items-center gap-2 text-sm">
              <span className="shrink-0 text-grey">As</span>
              <Select
                variant="pill"
                value={guest?.id ?? ""}
                onChange={(event) => {
                  const next = guests.findIndex(
                    (g) => g.id === event.target.value,
                  );
                  setGuestIndex(next >= 0 ? next : 0);
                }}
                className="max-w-[12rem] truncate font-medium"
              >
                {guests.map((item) => (
                  <option key={item.id} value={item.id}>
                    {guestLabel(item)}
                  </option>
                ))}
              </Select>
            </label>
          ) : (
            <span className="text-xs text-grey">Add guests to preview names</span>
          )}
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-grey transition-colors hover:border-black/20 hover:bg-soft-grey hover:text-black"
            aria-label="Open full screen preview"
            title="Full screen preview"
          >
            <FitIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center rounded-2xl bg-[#f2efed] p-2">
        <div
          className="relative max-h-full max-w-full overflow-hidden rounded-lg shadow-[0_12px_30px_rgba(0,0,0,0.14)]"
          style={{
            aspectRatio: String(aspectRatio),
            height: "100%",
            width: "auto",
          }}
        >
          <InvitationPagePreview
            page={page}
            shape={shape}
            customSize={customSize}
            personalizedName={personalizedName}
            className="h-full w-full"
          />
        </div>
      </div>

      {pages.length > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
            disabled={safePageIndex === 0}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-soft-grey disabled:opacity-30"
          >
            Previous
          </button>
          <PageDots
            pages={pages}
            activeIndex={safePageIndex}
            onSelect={setPageIndex}
          />
          <button
            type="button"
            onClick={() =>
              setPageIndex((i) => Math.min(pages.length - 1, i + 1))
            }
            disabled={safePageIndex >= pages.length - 1}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-soft-grey disabled:opacity-30"
          >
            Next
          </button>
        </div>
      ) : null}

      {fullscreenModal}
    </div>
  );
}
