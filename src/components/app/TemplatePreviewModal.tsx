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
  const templateShape = template.shape ?? "portrait";
  const isLandscape = templateShape === "landscape";
  const isSquare = templateShape === "square";
  const shapeLabel = isLandscape
    ? "Landscape"
    : isSquare
      ? "Square"
      : "Portrait";
  const formatLabel = isLandscape
    ? "16:9 format"
    : isSquare
      ? "1:1 format"
      : "9:16 format";

  const previewPages = useMemo(
    () =>
      pages.map((page) => {
        if (page.kind === "location") {
          return {
            elements: elementsFromLocationPage(
              page.location,
              page.backgroundColor,
              templateShape,
            ),
            backgroundColor: page.backgroundColor,
            backgroundPattern: page.backgroundPattern ?? "none",
            backgroundTexture: page.backgroundTexture ?? "none",
            backgroundTextureOpacity: page.backgroundTextureOpacity ?? 22,
            backgroundTextureTint:
              page.backgroundTextureTint ?? "#ffffff",
            backgroundTextureBlend:
              page.backgroundTextureBlend ?? "soft-light",
            border: page.border ?? null,
          };
        }
        if (page.kind === "rsvp") {
          return {
            elements: elementsFromRsvpPage(
              page.rsvpConfig,
              templateShape,
            ),
            backgroundColor: page.backgroundColor,
            backgroundPattern: page.backgroundPattern ?? "none",
            backgroundTexture: page.backgroundTexture ?? "none",
            backgroundTextureOpacity: page.backgroundTextureOpacity ?? 22,
            backgroundTextureTint:
              page.backgroundTextureTint ?? "#ffffff",
            backgroundTextureBlend:
              page.backgroundTextureBlend ?? "soft-light",
            border: page.border ?? null,
          };
        }
        return {
          elements: page.elements,
          backgroundColor: page.backgroundColor,
          backgroundPattern: page.backgroundPattern ?? "none",
          backgroundTexture: page.backgroundTexture ?? "none",
          backgroundTextureOpacity: page.backgroundTextureOpacity ?? 22,
          backgroundTextureTint: page.backgroundTextureTint ?? "#ffffff",
          backgroundTextureBlend:
            page.backgroundTextureBlend ?? "soft-light",
          border: page.border ?? null,
        };
      }),
    [pages, templateShape],
  );
  const previewPage = previewPages[pageIndex] ?? previewPages[0];

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
        className="relative z-10 grid max-h-[min(94vh,900px)] w-full max-w-6xl overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_28px_90px_rgba(0,0,0,0.3)] lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <div className="min-h-0 overflow-auto bg-[#f3f1ef] px-4 py-5 sm:px-7 sm:py-7 lg:px-8">
          <div className="mx-auto flex min-h-full max-w-4xl flex-col">
            <div className="relative flex min-h-[280px] flex-1 items-center justify-center">
            <div
                className={`relative overflow-hidden rounded-md bg-white shadow-[0_18px_50px_rgba(0,0,0,0.14)] ${
                  isLandscape
                    ? "aspect-video w-full max-w-[760px]"
                    : isSquare
                      ? "aspect-square h-[min(64vh,560px)] max-h-[560px]"
                      : "aspect-[9/16] h-[min(64vh,560px)] max-h-[560px]"
                }`}
            >
              <InvitationPagePreview
                key={`${template.id}-page-${pageIndex}`}
                page={previewPage}
                shape={template.shape ?? "portrait"}
                className="h-full w-full"
              />
            </div>

              {pageCount > 1 && (
                <>
                  <button
                    type="button"
                    disabled={pageIndex === 0}
                    onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                    className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/95 text-black shadow-md transition-all hover:scale-105 hover:bg-white disabled:pointer-events-none disabled:opacity-0 sm:left-1"
                    aria-label="Previous page"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M12.5 4.5L7 10l5.5 5.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    disabled={pageIndex >= pageCount - 1}
                    onClick={() =>
                      setPageIndex((i) => Math.min(pageCount - 1, i + 1))
                    }
                    className="absolute right-0 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/95 text-black shadow-md transition-all hover:scale-105 hover:bg-white disabled:pointer-events-none disabled:opacity-0 sm:right-1"
                    aria-label="Next page"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M7.5 4.5L13 10l-5.5 5.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            <div className="mt-5 flex items-start gap-3 overflow-x-auto pb-1">
              {previewPages.map((page, index) => (
              <button
                  key={`${pages[index]?.name ?? "Page"}-${index}`}
                type="button"
                  onClick={() => setPageIndex(index)}
                  aria-label={`Page ${index + 1}: ${pages[index]?.name}`}
                  aria-current={index === pageIndex}
                  className={`group/thumb shrink-0 rounded-lg border-2 bg-white p-1.5 text-left transition-all ${
                    index === pageIndex
                      ? "border-signature shadow-sm"
                      : "border-transparent hover:border-black/15"
                  }`}
              >
                  <span
                    className={`block overflow-hidden rounded-sm border border-black/5 ${
                      isLandscape
                        ? "aspect-video w-28"
                        : isSquare
                          ? "aspect-square h-16"
                          : "aspect-[9/16] h-16"
                    }`}
                  >
                    <InvitationPagePreview
                      page={page}
                      shape={template.shape ?? "portrait"}
                      className="h-full w-full"
                    />
                  </span>
                  <span
                    className={`mt-1.5 block max-w-28 truncate px-0.5 text-[11px] font-medium ${
                      index === pageIndex ? "text-black" : "text-grey"
                    }`}
                  >
                    {pages[index]?.name}
                  </span>
              </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="flex min-h-0 flex-col overflow-auto border-t border-black/5 bg-white p-5 sm:p-6 lg:border-l lg:border-t-0">
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-grey transition-colors hover:bg-soft-grey hover:text-black"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>

          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-signature">
              {shapeLabel} template
            </p>
            <h2
              id={titleId}
              className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-black"
            >
              {template.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-grey">
              {template.description}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-signature/10 px-3 py-1.5 text-xs font-semibold text-signature">
              {pageCount} pages
            </span>
            <span className="rounded-full bg-soft-grey px-3 py-1.5 text-xs font-medium text-black/70">
              {formatLabel}
            </span>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(() => {
                void createInvitationFromTemplateAction(template.id);
              })
            }
            className="mt-6 w-full rounded-full bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-black/90 hover:shadow-md disabled:opacity-50"
          >
            {isPending ? "Creating…" : "Use template"}
          </button>

          <div className="mt-7 border-t border-black/5 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
              Previewing
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-black">
                {current.name}
              </p>
              <p className="shrink-0 text-xs font-medium text-grey">
                {pageIndex + 1} of {pageCount}
              </p>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-soft-grey">
              <div
                className="h-full rounded-full bg-signature transition-[width] duration-300"
                style={{ width: `${((pageIndex + 1) / pageCount) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-7 border-t border-black/5 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
              Included
            </p>
            <ul className="mt-3 space-y-2.5 text-sm text-black/75">
              <li>Cover and event details</li>
              <li>Google Maps location page</li>
              <li>Interactive RSVP form</li>
              <li>Fully editable design</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-auto pt-8 text-sm font-medium text-grey transition-colors hover:text-black"
          >
            Close preview
          </button>
        </aside>
      </div>
    </div>,
    document.body,
  );
}
