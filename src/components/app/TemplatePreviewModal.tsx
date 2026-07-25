"use client";

import { useEffect, useId, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { createInvitationFromTemplateAction } from "@/lib/actions/invitations";
import type { InvitationTemplate } from "@/lib/data/invitation-templates";
import {
  elementsFromLocationPage,
  elementsFromRsvpPage,
} from "@/lib/data/invitation-content";
import { CloseIcon } from "./icons";
import { InvitationPagePreview } from "./InvitationPagePreview";

interface TemplatePreviewModalProps {
  template: InvitationTemplate;
  onClose: () => void;
}

/** Full-size quick preview with page flip — design + placeable interactive widgets. */
export function TemplatePreviewModal({
  template,
  onClose,
}: TemplatePreviewModalProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const pages = template.pages;
  const current = pages[pageIndex] ?? pages[0];
  const pageCount = pages.length;

  const previewPage = useMemo(() => {
    if (!current) return null;
    if (current.kind === "location") {
      return {
        elements: elementsFromLocationPage(
          current.location,
          current.backgroundColor,
        ),
        backgroundColor: current.backgroundColor,
      };
    }
    if (current.kind === "rsvp") {
      return {
        elements: elementsFromRsvpPage(current.rsvpConfig),
        backgroundColor: current.backgroundColor,
      };
    }
    return {
      elements: current.elements,
      backgroundColor: current.backgroundColor,
    };
  }, [current]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPageIndex(0);
  }, [template.id]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") {
        setPageIndex((i) => Math.min(pageCount - 1, i + 1));
      }
      if (event.key === "ArrowLeft") {
        setPageIndex((i) => Math.max(0, i - 1));
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, pageCount]);

  if (!mounted || !current || !previewPage) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Close preview"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92vh,880px)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/5 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-signature">
              Quick preview · {pageCount} pages
            </p>
            <h2
              id={titleId}
              className="mt-1 truncate text-lg font-semibold text-black"
            >
              {template.title}
            </h2>
            <p className="mt-0.5 text-sm text-grey">{template.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-grey transition-colors hover:bg-soft-grey hover:text-black"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-[#f3f1ef] px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto flex max-h-full flex-col items-center gap-4">
            <div className="relative aspect-[9/16] h-[min(58vh,480px)] overflow-hidden rounded-sm bg-white shadow-[0_16px_48px_rgba(0,0,0,0.16)]">
              <InvitationPagePreview
                key={`${template.id}-page-${pageIndex}`}
                page={previewPage}
                className="h-full w-full"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={pageIndex === 0}
                onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-soft-grey disabled:opacity-35"
              >
                Previous
              </button>
              <div className="flex items-center gap-1.5" aria-label="Pages">
                {pages.map((page, index) => (
                  <button
                    key={page.name + index}
                    type="button"
                    aria-label={`Page ${index + 1}: ${page.name}`}
                    aria-current={index === pageIndex}
                    onClick={() => setPageIndex(index)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === pageIndex
                        ? "bg-signature"
                        : "bg-black/20 hover:bg-black/40"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={pageIndex >= pageCount - 1}
                onClick={() =>
                  setPageIndex((i) => Math.min(pageCount - 1, i + 1))
                }
                className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-soft-grey disabled:opacity-35"
              >
                Next
              </button>
            </div>
            <p className="text-xs font-medium text-grey">
              {current.name} · {pageIndex + 1} of {pageCount}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-black/5 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-soft-grey"
          >
            Close
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(() => {
                void createInvitationFromTemplateAction(template.id);
              })
            }
            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black/90 disabled:opacity-50"
          >
            {isPending ? "Creating…" : "Use template"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
