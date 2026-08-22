"use client";

import { useEffect, useId, useState } from "react";
import type { InvitationPage } from "@/lib/data/invitation-content";
import { CloseIcon } from "./editor-icons";
import { InvitationStage } from "@/components/invitation/InvitationStage";
import type { CustomCanvasSize, InvitationShape } from "./editor-types";

interface EditorPreviewModalProps {
  open: boolean;
  pages: InvitationPage[];
  activePageId: string;
  title: string;
  shape: InvitationShape;
  customSize: CustomCanvasSize;
  onClose: () => void;
}

export function EditorPreviewModal({
  open,
  pages,
  activePageId,
  title,
  shape,
  customSize,
  onClose,
}: EditorPreviewModalProps) {
  const titleId = useId();
  const activeIndex = Math.max(
    0,
    pages.findIndex((page) => page.id === activePageId),
  );
  const [pageIndex, setPageIndex] = useState(activeIndex);
  const activePage = pages[pageIndex] ?? pages[0];

  // Opening the preview lands on whatever page is being edited.
  useEffect(() => {
    if (open) setPageIndex(activeIndex);
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !activePage) return null;

  const card = (
    <InvitationStage
      pages={pages}
      pageIndex={pageIndex}
      onPageIndexChange={setPageIndex}
      eventName={title}
      headerMeta={[`Page ${pageIndex + 1} of ${pages.length}`]}
      shape={shape}
      customSize={customSize}
      personalizedName="Sam Rivera"
      interactive={false}
      fit="container"
    />
  );

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-[#1a1a1c]/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-signature">
            Preview
          </p>
          <h2 id={titleId} className="truncate text-sm font-semibold text-white">
            {title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Close preview"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="h-full w-full overflow-hidden rounded-2xl">{card}</div>
      </div>

    </div>
  );
}
