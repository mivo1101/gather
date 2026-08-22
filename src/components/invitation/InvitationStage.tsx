"use client";

import type { ReactNode } from "react";
import { InvitationPagePreview } from "@/components/app/InvitationPagePreview";
import { InteractiveRsvpPanel } from "@/components/invitation/InteractiveRsvpPanel";
import { LocationMapPanel } from "@/components/invitation/LocationMapPanel";
import { cardAspectRatio } from "@/components/editor/canvas-metrics";
import type {
  CustomCanvasSize,
  InvitationShape,
} from "@/components/editor/editor-types";
import type { InvitationPage } from "@/lib/data/invitation-content";
import type { RsvpAnswerValue, RsvpResponse } from "@/lib/data/rsvp-responses";
import { Logo } from "@/components/ui/Logo";

/**
 * The invitation exactly as a guest meets it: the dark stage, the header, the
 * card fitted to the space, and the pager.
 *
 * The guest page and the editor's preview both render this, so what an
 * organiser previews is the same component the guest is sent - not a
 * lookalike that drifts.
 */
export function InvitationStage({
  pages,
  pageIndex,
  onPageIndexChange,
  eventName,
  headerMeta = [],
  shape,
  customSize,
  personalizedName,
  interactive = false,
  answers,
  onAnswerChange,
  rsvpResponse,
  onSubmitRsvp,
  notice,
  footer,
  /** "viewport" fills the browser; "container" fits inside a device frame. */
  fit = "viewport",
}: {
  pages: InvitationPage[];
  pageIndex: number;
  onPageIndexChange: (index: number) => void;
  eventName: string;
  headerMeta?: string[];
  shape: InvitationShape;
  customSize?: CustomCanvasSize;
  personalizedName?: string;
  interactive?: boolean;
  answers?: Record<string, RsvpAnswerValue>;
  onAnswerChange?: (questionId: string, value: RsvpAnswerValue) => void;
  rsvpResponse?: RsvpResponse | null;
  onSubmitRsvp?: (
    answers: Record<string, RsvpAnswerValue>,
  ) => Promise<{ error: string } | { ok: true }>;
  notice?: ReactNode;
  footer?: ReactNode;
  fit?: "viewport" | "container";
}) {
  const aspectRatio = cardAspectRatio(shape, customSize);
  const safeIndex = Math.min(Math.max(pageIndex, 0), Math.max(pages.length - 1, 0));
  const page = pages[safeIndex];

  if (!page) {
    return (
      <div
        className={`flex ${
          fit === "viewport" ? "min-h-dvh" : "h-full"
        } items-center justify-center bg-[#121214] px-4`}
      >
        <p className="text-sm text-white/60">This invitation has no pages yet.</p>
      </div>
    );
  }

  const pager =
    pages.length > 1 ? (
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/50 px-3 py-1.5 opacity-100 backdrop-blur-sm transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onPageIndexChange(Math.max(0, safeIndex - 1))}
          disabled={safeIndex === 0}
          className="text-xs font-semibold text-white disabled:opacity-30"
          aria-label="Previous page"
        >
          ‹
        </button>
        <div className="flex items-center gap-1.5">
          {pages.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onPageIndexChange(index)}
              aria-label={`Go to page ${index + 1}`}
              aria-current={index === safeIndex}
              className={`h-1.5 rounded-full transition-all ${
                index === safeIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            onPageIndexChange(Math.min(pages.length - 1, safeIndex + 1))
          }
          disabled={safeIndex >= pages.length - 1}
          className="text-xs font-semibold text-white disabled:opacity-30"
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    ) : null;

  /**
   * Fit inside the space while keeping the invitation's aspect. Width has to
   * be capped from the available height, or a tall card letterboxes into solid
   * side bands with no paper texture.
   */
  const cardStyle =
    fit === "viewport"
      ? {
          aspectRatio: String(aspectRatio),
          width: `min(100%, calc(min(82dvh, 900px) * ${aspectRatio}))`,
          maxHeight: "min(82dvh, 900px)",
        }
      : {
          aspectRatio: String(aspectRatio),
          width: `min(100cqw, calc(100cqh * ${aspectRatio}))`,
          maxHeight: "100cqh",
        };

  return (
    <div
      className={`relative flex ${
        fit === "viewport" ? "min-h-dvh" : "h-full"
      } flex-col bg-[#121214]`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,96,170,0.1),_transparent_50%)]"
        aria-hidden="true"
      />

      <header className="relative z-20 flex shrink-0 items-start justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo href="/" light className="origin-left scale-90" />
        <div className="min-w-0 text-right">
          <p className="truncate text-sm font-semibold text-white">{eventName}</p>
          {headerMeta.map((line) => (
            <p key={line} className="mt-0.5 truncate text-xs text-white/45">
              {line}
            </p>
          ))}
        </div>
      </header>

      {notice}

      <main
        className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 pb-4 sm:px-6"
        style={fit === "container" ? { containerType: "size" } : undefined}
      >
        <div
          className={`group relative w-full ${
            page.kind === "design" ? "max-w-full" : "max-w-xl"
          } ${
            fit === "container" ? "flex h-full items-center justify-center" : ""
          }`}
        >
          {page.kind === "rsvp" ? (
            <div className="relative w-full overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <InteractiveRsvpPanel
                config={page.rsvpConfig}
                interactive={interactive}
                className="min-h-[28rem]"
                initialAnswers={rsvpResponse?.answers ?? {}}
                alreadySubmitted={Boolean(rsvpResponse)}
                onSubmit={interactive ? onSubmitRsvp : undefined}
              />
              {pager}
            </div>
          ) : page.kind === "location" && page.location ? (
            <div className="relative w-full overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <LocationMapPanel
                location={page.location}
                interactive
                className="min-h-[28rem]"
              />
              {pager}
            </div>
          ) : (
            <div
              className={`flex flex-col items-center gap-2 ${
                fit === "container" ? "h-full justify-center" : ""
              }`}
            >
              <div
                className="relative mx-auto overflow-hidden rounded-[22px] shadow-[0_24px_60px_rgba(0,0,0,0.4)]"
                style={cardStyle}
              >
                <InvitationPagePreview
                  page={page}
                  shape={shape}
                  customSize={customSize}
                  personalizedName={personalizedName}
                  interactive={interactive}
                  answers={answers}
                  onAnswerChange={interactive ? onAnswerChange : undefined}
                  className="h-full w-full"
                />
                {pager}
              </div>
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
