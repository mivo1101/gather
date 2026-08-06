"use client";

import { useMemo, useState, useTransition } from "react";
import { InvitationPagePreview } from "@/components/app/InvitationPagePreview";
import { InteractiveRsvpPanel } from "@/components/invitation/InteractiveRsvpPanel";
import { LocationMapPanel } from "@/components/invitation/LocationMapPanel";
import { cardAspectRatio } from "@/components/editor/canvas-metrics";
import { submitGuestRsvpAction } from "@/lib/actions/rsvp";
import {
  invitationPageRoleLabel,
  type InvitationPage,
} from "@/lib/data/invitation-content";
import {
  pageHasAnswerWidgets,
  type RsvpAnswerValue,
  type RsvpResponse,
} from "@/lib/data/rsvp-responses";
import type { Invitation } from "@/lib/data/types";
import { guestDisplayLabel } from "@/lib/invitation-paths";
import { Logo } from "@/components/ui/Logo";

interface GuestInviteViewerProps {
  invitation: Invitation;
  eventName: string;
  eventSlug: string;
  guest: {
    prefix: string;
    displayName: string;
    token: string;
  };
  rsvpResponse?: RsvpResponse | null;
}

export function GuestInviteViewer({
  invitation,
  eventName,
  eventSlug,
  guest,
  rsvpResponse = null,
}: GuestInviteViewerProps) {
  const pages = invitation.content.pages;
  const shape = invitation.content.shape ?? "portrait";
  const customSize = invitation.content.customSize;
  const aspectRatio = cardAspectRatio(shape, customSize);
  const personalizedName = guestDisplayLabel(guest);

  const firstAnswerPageIndex = pages.findIndex(
    (page) => page.kind === "rsvp" || pageHasAnswerWidgets(page),
  );
  const [pageIndex, setPageIndex] = useState(
    firstAnswerPageIndex >= 0 && rsvpResponse ? firstAnswerPageIndex : 0,
  );
  const safePageIndex = Math.min(pageIndex, Math.max(pages.length - 1, 0));
  const page: InvitationPage | undefined = pages[safePageIndex];

  const [answers, setAnswers] = useState<Record<string, RsvpAnswerValue>>(
    rsvpResponse?.answers ?? {},
  );
  const [submitted, setSubmitted] = useState(Boolean(rsvpResponse));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const roleLabel = useMemo(
    () => (page ? invitationPageRoleLabel(page.role) : "Page"),
    [page],
  );

  const submitRsvp = async (nextAnswers: Record<string, RsvpAnswerValue>) =>
    submitGuestRsvpAction({
      eventSlug,
      token: guest.token,
      answers: nextAnswers,
    });

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

  if (!page) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-grey">This invitation has no pages yet.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-signature/[0.12] via-sugar-milk/80 to-soft-grey">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Logo href="/" className="origin-left scale-90" />
        <p className="truncate text-sm text-grey">{eventName}</p>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-8 sm:px-6">
        <p className="mb-4 text-center text-sm text-grey">
          {roleLabel}
          <span className="px-1.5 text-black/20">·</span>
          {safePageIndex + 1} of {pages.length}
        </p>

        <div className="flex flex-1 items-center justify-center">
          {page.kind === "rsvp" ? (
            <div className="w-full overflow-hidden rounded-[28px] border border-black/[0.07] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.1)]">
              <InteractiveRsvpPanel
                config={page.rsvpConfig}
                interactive
                className="min-h-[28rem]"
                initialAnswers={rsvpResponse?.answers ?? {}}
                alreadySubmitted={Boolean(rsvpResponse)}
                onSubmit={submitRsvp}
              />
            </div>
          ) : page.kind === "location" && page.location ? (
            <div className="w-full overflow-hidden rounded-[28px] border border-black/[0.07] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.1)]">
              <LocationMapPanel
                location={page.location}
                interactive
                className="min-h-[28rem]"
              />
            </div>
          ) : (
            <div className="flex w-full max-w-[22rem] flex-col gap-3">
              <div
                className="relative w-full overflow-hidden rounded-[18px] shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
                style={{ aspectRatio: String(aspectRatio) }}
              >
                <InvitationPagePreview
                  page={page}
                  shape={shape}
                  customSize={customSize}
                  personalizedName={personalizedName}
                  interactive={pageHasAnswerWidgets(page)}
                  answers={answers}
                  onAnswerChange={(questionId, value) => {
                    setAnswers((prev) => ({ ...prev, [questionId]: value }));
                    setError(null);
                  }}
                  className="h-full w-full"
                />
              </div>

              {pageHasAnswerWidgets(page) ? (
                <div className="rounded-2xl border border-black/[0.07] bg-white px-4 py-3 shadow-[0_2px_4px_rgba(0,0,0,0.03)]">
                  {error ? (
                    <p className="mb-2 text-center text-xs text-[#9a2a2a]">
                      {error}
                    </p>
                  ) : null}
                  {submitted ? (
                    <p className="mb-2 text-center text-xs font-medium text-signature">
                      Thanks - your RSVP is saved. You can update it anytime.
                    </p>
                  ) : (
                    <p className="mb-2 text-center text-xs text-grey">
                      Tap your reply on the card, then submit below.
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={pending || Object.keys(answers).length === 0}
                    onClick={submitCanvasAnswers}
                    className="w-full rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
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

        {pages.length > 1 ? (
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              disabled={safePageIndex === 0}
              className="rounded-full px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/70 disabled:opacity-30"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {pages.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPageIndex(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    index === safePageIndex
                      ? "bg-black"
                      : "bg-black/20 hover:bg-black/40"
                  }`}
                  aria-label={`Page ${index + 1}, ${invitationPageRoleLabel(item.role)}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setPageIndex((i) => Math.min(pages.length - 1, i + 1))
              }
              disabled={safePageIndex >= pages.length - 1}
              className="rounded-full px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/70 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
