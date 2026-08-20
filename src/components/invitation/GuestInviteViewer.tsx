"use client";

import { useMemo, useState, useTransition } from "react";
import { InvitationPagePreview } from "@/components/app/InvitationPagePreview";
import { GuestInviteOpening } from "@/components/invitation/GuestInviteOpening";
import { InteractiveRsvpPanel } from "@/components/invitation/InteractiveRsvpPanel";
import { LocationMapPanel } from "@/components/invitation/LocationMapPanel";
import { cardAspectRatio } from "@/components/editor/canvas-metrics";
import { submitGuestRsvpAction } from "@/lib/actions/rsvp";
import type { InvitationPage } from "@/lib/data/invitation-content";
import {
  pageHasAnswerWidgets,
  type RsvpAnswerValue,
  type RsvpResponse,
} from "@/lib/data/rsvp-responses";
import type { Invitation } from "@/lib/data/types";
import { formatEventDate } from "@/lib/format";
import { guestDisplayLabel } from "@/lib/invitation-paths";
import { Logo } from "@/components/ui/Logo";

interface GuestInviteViewerProps {
  invitation: Invitation;
  eventName: string;
  eventSlug: string;
  eventDate: string | null;
  timezone: string;
  venue: string | null;
  address: string | null;
  guest: {
    prefix: string;
    displayName: string;
    token: string;
  };
  rsvpResponse?: RsvpResponse | null;
  organiserPreview?: boolean;
}

function formatEventTime(iso: string, timeZone: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timeZone || undefined,
    });
  } catch {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
}

export function GuestInviteViewer({
  invitation,
  eventName,
  eventSlug,
  eventDate,
  timezone,
  venue,
  address,
  guest,
  rsvpResponse = null,
  organiserPreview = false,
}: GuestInviteViewerProps) {
  const pages = invitation.content.pages;
  const shape = invitation.content.shape ?? "portrait";
  const customSize = invitation.content.customSize;
  const aspectRatio = cardAspectRatio(shape, customSize);
  const personalizedName = guestDisplayLabel(guest);
  const guestFirstName =
    guest.displayName.trim().split(/\s+/)[0] || personalizedName || "there";

  const [phase, setPhase] = useState<"opening" | "viewing">("opening");
  const [pageIndex, setPageIndex] = useState(0);
  const safePageIndex = Math.min(pageIndex, Math.max(pages.length - 1, 0));
  const page: InvitationPage | undefined = pages[safePageIndex];
  const coverPage = pages[0];
  const isLastPage = safePageIndex >= pages.length - 1;

  const [answers, setAnswers] = useState<Record<string, RsvpAnswerValue>>(
    rsvpResponse?.answers ?? {},
  );
  const [submitted, setSubmitted] = useState(Boolean(rsvpResponse));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dateLabel = eventDate ? formatEventDate(eventDate) : null;
  const timeLabel = eventDate ? formatEventTime(eventDate, timezone) : null;
  const locationLabel = [venue, address].filter(Boolean).join(", ") || null;

  const headerMeta = useMemo(() => {
    const lines: string[] = [];
    if (dateLabel && timeLabel) lines.push(`${dateLabel}, ${timeLabel}`);
    else if (dateLabel) lines.push(dateLabel);
    else if (timeLabel) lines.push(timeLabel);
    if (locationLabel) lines.push(locationLabel);
    lines.push(`Page ${safePageIndex + 1} of ${pages.length}`);
    return lines;
  }, [dateLabel, timeLabel, locationLabel, safePageIndex, pages.length]);

  const submitRsvp = async (nextAnswers: Record<string, RsvpAnswerValue>) => {
    if (organiserPreview) {
      return {
        error: "RSVP changes are disabled in organiser preview.",
      };
    }
    return submitGuestRsvpAction({
      eventSlug,
      token: guest.token,
      answers: nextAnswers,
    });
  };

  const submitCanvasAnswers = () => {
    setError(null);
    startTransition(async () => {
      const result = await submitRsvp(answers);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
    });
  };

  const coverPreview =
    coverPage && coverPage.kind === "design" ? (
      <InvitationPagePreview
        page={coverPage}
        shape={shape}
        customSize={customSize}
        personalizedName={personalizedName}
        interactive={false}
        className="h-full w-full"
      />
    ) : (
      <div className="flex h-full w-full flex-col justify-center bg-gradient-to-br from-white to-[#fdebeb] px-6 py-8">
        <p className="text-xs text-grey">You&apos;re invited to</p>
        <h3 className="mt-1 text-2xl font-bold tracking-tight text-black">
          {eventName}
        </h3>
        <div className="mt-2 h-0.5 w-10 bg-signature" aria-hidden="true" />
      </div>
    );

  const organiserNotice = organiserPreview ? (
    <p className="relative z-20 px-4 text-center text-xs text-white/55 sm:text-sm">
      <span className="font-semibold text-signature">Organiser preview</span>
      <span aria-hidden="true"> · </span>
      RSVP editing is disabled
    </p>
  ) : null;

  if (!page) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#121214] px-4">
        <p className="text-sm text-white/60">This invitation has no pages yet.</p>
      </div>
    );
  }

  if (phase === "opening") {
    return (
      <div className="relative flex min-h-dvh flex-col bg-[#121214]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,96,170,0.12),_transparent_55%)]"
          aria-hidden="true"
        />
        <header className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6">
          <Logo href="/" light className="origin-left scale-90" />
          <p className="truncate text-sm text-white/50">{eventName}</p>
        </header>
        {organiserNotice}
        <main className="relative z-10 flex flex-1 items-center justify-center overflow-y-auto px-2 py-6 sm:py-10">
          <GuestInviteOpening
            guestFirstName={guestFirstName}
            inviteCard={coverPreview}
            inviteAspectRatio={aspectRatio}
            onOpened={() => setPhase("viewing")}
          />
        </main>
      </div>
    );
  }

  const pageHasAnswers =
    page.kind === "design" && pageHasAnswerWidgets(page);
  const showSubmit =
    !organiserPreview &&
    isLastPage &&
    page.kind === "design" &&
    (pageHasAnswers || Object.keys(answers).length > 0);

  const pager = pages.length > 1 ? (
    <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/50 px-3 py-1.5 opacity-100 backdrop-blur-sm transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
      <button
        type="button"
        onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
        disabled={safePageIndex === 0}
        className="text-xs font-semibold text-white disabled:opacity-30"
      >
        Previous
      </button>
      <div className="flex items-center gap-1.5">
        {pages.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPageIndex(index)}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              index === safePageIndex
                ? "bg-white"
                : "bg-white/35 hover:bg-white/60"
            }`}
            aria-label={`Page ${index + 1}`}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))}
        disabled={safePageIndex >= pages.length - 1}
        className="text-xs font-semibold text-white disabled:opacity-30"
      >
        Next
      </button>
    </div>
  ) : null;

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#121214]">
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

      {organiserNotice}

      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 pb-4 sm:px-6">
        <div
          className={`group relative w-full ${
            page.kind === "design" ? "max-w-full" : "max-w-xl"
          }`}
        >
          {page.kind === "rsvp" ? (
            <div className="relative overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <InteractiveRsvpPanel
                config={page.rsvpConfig}
                interactive={!organiserPreview}
                className="min-h-[28rem]"
                initialAnswers={rsvpResponse?.answers ?? {}}
                alreadySubmitted={Boolean(rsvpResponse)}
                onSubmit={organiserPreview ? undefined : submitRsvp}
              />
              {pager}
            </div>
          ) : page.kind === "location" && page.location ? (
            <div className="relative overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <LocationMapPanel
                location={page.location}
                interactive
                className="min-h-[28rem]"
              />
              {pager}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {/*
                Fit inside the viewport while keeping the invitation aspect.
                Using w-full + max-height alone letterboxes (solid side bands
                without page texture). Cap width from max height × aspect.
              */}
              <div
                className="relative mx-auto overflow-hidden rounded-[22px] shadow-[0_24px_60px_rgba(0,0,0,0.4)]"
                style={{
                  aspectRatio: String(aspectRatio),
                  width: `min(100%, calc(min(82dvh, 900px) * ${aspectRatio}))`,
                  maxHeight: "min(82dvh, 900px)",
                }}
              >
                <InvitationPagePreview
                  page={page}
                  shape={shape}
                  customSize={customSize}
                  personalizedName={personalizedName}
                  interactive={!organiserPreview}
                  answers={answers}
                  onAnswerChange={
                    organiserPreview
                      ? undefined
                      : (questionId, value) => {
                          setAnswers((prev) => ({
                            ...prev,
                            [questionId]: value,
                          }));
                          setError(null);
                        }
                  }
                  className="h-full w-full"
                />
                {pager}
              </div>

              {showSubmit ? (
                <div className="flex flex-col items-center gap-1 pt-1">
                  {error ? (
                    <p className="text-xs text-[#ff8f8f]">{error}</p>
                  ) : null}
                  <button
                    type="button"
                    disabled={pending || Object.keys(answers).length === 0}
                    onClick={submitCanvasAnswers}
                    className="text-sm font-semibold text-white/90 underline decoration-white/35 underline-offset-4 transition-colors hover:text-white hover:decoration-white disabled:opacity-40"
                  >
                    {pending
                      ? "Saving..."
                      : submitted
                        ? "Update RSVP"
                        : "Submit RSVP"}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
