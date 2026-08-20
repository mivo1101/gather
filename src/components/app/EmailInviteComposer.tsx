"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveEmailCampaignAction,
  sendInviteEmailsAction,
  sendTestInviteEmailAction,
} from "@/lib/actions/email";
import type { EmailCampaignDraft } from "@/lib/data/email-campaigns";
import type { EventGuest } from "@/lib/data/guests";
import type { Invitation } from "@/lib/data/types";
import { guestDisplayLabel, guestInvitePath } from "@/lib/invitation-paths";
import { Button, PlusIcon } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { EmailRecipientDialog } from "./EmailRecipientDialog";
import {
  EmailSendResultDialog,
  type EmailSendResult,
} from "./EmailSendResultDialog";

interface EmailInviteComposerProps {
  eventId: string;
  event: {
    name: string;
    slug: string;
    eventDate: string | null;
    timezone: string;
    venue: string | null;
    address: string | null;
  };
  invitation: Invitation | null;
  guests: EventGuest[];
  sentGuestIds?: string[];
  initialDraft: EmailCampaignDraft;
  sendingConfigured: boolean;
  designImageUrls: string[];
  /** Account email used for test sends (locked to signed-in user). */
  defaultTestEmail?: string;
}

function fieldClassName(extra = "") {
  return `mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-signature/40 focus:ring-2 focus:ring-signature/15 ${extra}`;
}

export function EmailInviteComposer({
  eventId,
  event,
  invitation,
  guests,
  sentGuestIds = [],
  initialDraft,
  sendingConfigured,
  designImageUrls,
  defaultTestEmail = "",
}: EmailInviteComposerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(initialDraft);
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [previewGuestId, setPreviewGuestId] = useState(guests[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(
    new Set(),
  );
  const [sendResult, setSendResult] = useState<EmailSendResult | null>(null);
  const [pending, startTransition] = useTransition();

  const previewGuest =
    guests.find((guest) => guest.id === previewGuestId) ?? guests[0] ?? null;

  const imageOptions = useMemo(() => {
    const urls: string[] = [];
    const push = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || urls.includes(trimmed)) return;
      urls.push(trimmed);
    };
    for (const url of designImageUrls) push(url);
    for (const url of extraImages) push(url);
    if (draft.heroImageUrl) push(draft.heroImageUrl);
    return urls;
  }, [designImageUrls, extraImages, draft.heroImageUrl]);

  const previewHero = draft.heroImageUrl.trim() || null;

  const greetingLine = previewGuest
    ? `${draft.greeting.trim() || "Dear"} ${guestDisplayLabel(previewGuest)},`
    : `${draft.greeting.trim() || "Dear"} Guest name,`;

  const inviteHref = previewGuest
    ? guestInvitePath(event.slug, previewGuest.token)
    : null;

  const bodyParagraphs = draft.body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const location = [event.venue, event.address].filter(Boolean).join(", ");

  const runAction = (
    action: (
      eventId: string,
      formData: FormData,
    ) => Promise<
      | {
          ok: true;
          message?: string;
          sent?: number;
          failed?: number;
          skipped?: number;
        }
      | { error: string }
    >,
    recipientGuestIds?: string[],
    onSuccess?: (result: {
      ok: true;
      message?: string;
      sent?: number;
      failed?: number;
      skipped?: number;
    }) => void,
  ) => {
    const formData = new FormData();
    formData.set("subject", draft.subject);
    formData.set("previewText", draft.previewText);
    formData.set("senderName", draft.senderName);
    formData.set("replyTo", draft.replyTo);
    formData.set("greeting", draft.greeting);
    formData.set("body", draft.body);
    formData.set("ctaLabel", draft.ctaLabel);
    formData.set("heroImageUrl", draft.heroImageUrl);
    if (draft.includeCalendar) formData.set("includeCalendar", "on");
    for (const guestId of recipientGuestIds ?? []) {
      formData.append("guestId", guestId);
    }

    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await action(eventId, formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      if (onSuccess) onSuccess(result);
      else setMessage(result.message ?? "Saved.");
      router.refresh();
    });
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body });
      const result = (await response.json()) as {
        upload?: { url: string; kind: string };
        error?: string;
      };
      if (!response.ok || !result.upload) {
        throw new Error(result.error || "Could not upload photo.");
      }
      if (result.upload.kind !== "image") {
        throw new Error("Please upload an image for the email photo.");
      }
      setExtraImages((current) => [result.upload!.url, ...current]);
      setDraft((current) => ({
        ...current,
        heroImageUrl: result.upload!.url,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (!invitation) {
    return (
      <p className="rounded-2xl border border-dashed border-black/10 bg-soft-grey/50 px-4 py-8 text-center text-sm text-grey">
        Connect an invitation design before composing email.
      </p>
    );
  }

  if (guests.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-black/10 bg-soft-grey/50 px-4 py-8 text-center text-sm text-grey">
        Add guests first, then compose and send their personalised emails.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {!sendingConfigured ? (
        <p className="rounded-2xl border border-[#f0d9a8] bg-[#fff8ea] px-4 py-3 text-sm text-[#7a5a18]">
          Email sending needs <code className="text-xs">RESEND_API_KEY</code> in
          your environment. You can still save the draft and preview below.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
              Email photo
            </span>
            <p className="mt-1 text-sm text-grey">
              Shown at the top of the email. Pick from your design or upload a
              new photo.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setDraft((current) => ({ ...current, heroImageUrl: "" }))
                }
                className={`flex h-16 w-16 items-center justify-center rounded-xl border text-[11px] font-semibold ${
                  !previewHero
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-soft-grey text-grey hover:border-black/20"
                }`}
              >
                None
              </button>
              {imageOptions.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({ ...current, heroImageUrl: url }))
                  }
                  className={`h-16 w-16 overflow-hidden rounded-xl border ${
                    previewHero === url
                      ? "border-black ring-2 ring-black/20"
                      : "border-black/10 hover:border-black/25"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-black/20 text-[11px] font-semibold text-black hover:border-black/40 disabled:opacity-50"
              >
                {uploading ? "…" : "Upload"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void uploadPhoto(file);
                }}
              />
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
              Subject
            </span>
            <input
              value={draft.subject}
              onChange={(e) =>
                setDraft((current) => ({ ...current, subject: e.target.value }))
              }
              className={fieldClassName()}
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
              Preview text
            </span>
            <input
              value={draft.previewText}
              onChange={(e) =>
                setDraft((current) => ({
                  ...current,
                  previewText: e.target.value,
                }))
              }
              className={fieldClassName()}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
                Sender name
              </span>
              <input
                value={draft.senderName}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    senderName: e.target.value,
                  }))
                }
                className={fieldClassName()}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
                Reply-to
              </span>
              <input
                type="email"
                value={draft.replyTo}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    replyTo: e.target.value,
                  }))
                }
                className={fieldClassName()}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
                Greeting
              </span>
              <input
                value={draft.greeting}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    greeting: e.target.value,
                  }))
                }
                className={fieldClassName()}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
                Button label
              </span>
              <input
                value={draft.ctaLabel}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    ctaLabel: e.target.value,
                  }))
                }
                className={fieldClassName()}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
              Body
            </span>
            <textarea
              rows={6}
              value={draft.body}
              onChange={(e) =>
                setDraft((current) => ({ ...current, body: e.target.value }))
              }
              className={fieldClassName("resize-y")}
            />
          </label>

          <label className="flex items-center gap-3 text-sm text-black">
            <input
              type="checkbox"
              checked={draft.includeCalendar}
              onChange={(e) =>
                setDraft((current) => ({
                  ...current,
                  includeCalendar: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-black/20 accent-[#ff60aa]"
            />
            Include Add to calendar button
          </label>

          <div className="rounded-2xl border border-black/[0.06] bg-soft-grey/50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
              Send test to
            </p>
            <p className="mt-1.5 text-sm font-medium text-black">
              {defaultTestEmail || "Your account email"}
            </p>
            <p className="mt-1 text-xs text-grey">
              Test emails always go to your signed-in account so guest inboxes
              stay untouched.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={pending}
              onClick={() => runAction(saveEmailCampaignAction)}
            >
              {pending ? "Working..." : "Save draft"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={pending || !sendingConfigured || !defaultTestEmail}
              onClick={() => runAction(sendTestInviteEmailAction)}
            >
              Send test
            </Button>
            <Button
              type="button"
              size="md"
              disabled={pending || !sendingConfigured}
              onClick={() => {
                const sentIds = new Set(sentGuestIds);
                setSelectedGuestIds(
                  new Set(
                    guests
                      .filter((guest) => !sentIds.has(guest.id))
                      .map((guest) => guest.id),
                  ),
                );
                setConfirmSendOpen(true);
              }}
            >
              Send to guests
              <PlusIcon />
            </Button>
          </div>

          <EmailRecipientDialog
            open={confirmSendOpen}
            guests={guests}
            sentGuestIds={sentGuestIds}
            selectedGuestIds={selectedGuestIds}
            onSelectedGuestIdsChange={setSelectedGuestIds}
            onCancel={() => setConfirmSendOpen(false)}
            onConfirm={() => {
              setConfirmSendOpen(false);
              runAction(
                sendInviteEmailsAction,
                Array.from(selectedGuestIds),
                (result) => {
                  setMessage(null);
                  setSendResult({
                    sent: result.sent ?? 0,
                    failed: result.failed ?? 0,
                    skipped: result.skipped ?? 0,
                  });
                },
              );
            }}
          />

          <EmailSendResultDialog
            result={sendResult}
            onClose={() => setSendResult(null)}
            onViewStatus={() => {
              setSendResult(null);
              router.push(`/invitations/${event.slug}?tab=email`);
            }}
          />

          {message ? (
            <p className="rounded-2xl border border-signature/20 bg-signature/10 px-4 py-3 text-sm text-black">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-2xl bg-[#fff1f1] px-4 py-3 text-sm text-[#9a2a2a]">
              {error}
            </p>
          ) : null}
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
              Email preview
            </p>
            <label className="flex items-center gap-2 text-sm text-black">
              <span className="text-grey">As</span>
              <Select
                variant="pill"
                value={previewGuest?.id ?? ""}
                onChange={(e) => setPreviewGuestId(e.target.value)}
                className="font-medium"
              >
                {guests.map((guest) => (
                  <option key={guest.id} value={guest.id}>
                    {guestDisplayLabel(guest)}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-black/[0.07] bg-[#f6f6f6] shadow-[0_2px_4px_rgba(0,0,0,0.03)]">
            <div className="border-b border-black/[0.06] bg-white px-4 py-3 text-xs text-grey">
              <p>
                <span className="font-semibold text-black">Subject</span>{" "}
                {draft.subject || "Untitled"}
              </p>
              <p className="mt-1 truncate">
                From {draft.senderName || "Host"} · Reply-to{" "}
                {draft.replyTo || "-"}
              </p>
            </div>

            <div className="p-4 sm:p-5">
              <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
                {previewHero ? (
                  // Match the real email: full width, natural height (no 16:9 crop).
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewHero}
                    alt=""
                    className="block w-full h-auto"
                  />
                ) : null}
                <div className="px-5 py-5">
                  <div className="mb-3.5 flex items-center gap-2">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-base font-bold text-signature"
                      aria-hidden="true"
                    >
                      +
                    </span>
                    <span className="text-lg font-semibold tracking-tight text-black">
                      Gather
                    </span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-black">
                    {event.name}
                  </h3>
                  {(event.eventDate || location) && (
                    <div className="mt-3 grid gap-3 text-sm text-black/80 sm:grid-cols-2">
                      {event.eventDate ? (
                        <div>
                          <p className="font-semibold text-black">When</p>
                          <p className="mt-0.5 text-grey">
                            {new Date(event.eventDate).toLocaleDateString(
                              undefined,
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      ) : null}
                      {location ? (
                        <div>
                          <p className="font-semibold text-black">Where</p>
                          <p className="mt-0.5 text-grey">{location}</p>
                        </div>
                      ) : null}
                    </div>
                  )}
                  <p className="mt-5 text-sm font-semibold text-black">
                    {greetingLine}
                  </p>
                  <div className="mt-3 space-y-3 text-sm leading-6 text-black/80">
                    {bodyParagraphs.length > 0 ? (
                      bodyParagraphs.map((paragraph, index) => (
                        <p key={index} className="whitespace-pre-wrap">
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <p className="text-grey">Email body appears here.</p>
                    )}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {inviteHref ? (
                      <a
                        href={inviteHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
                      >
                        <span className="text-signature" aria-hidden="true">
                          +
                        </span>
                        {draft.ctaLabel || "View invitation"}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                        <span className="text-signature" aria-hidden="true">
                          +
                        </span>
                        {draft.ctaLabel || "View invitation"}
                      </span>
                    )}
                    {draft.includeCalendar ? (
                      <span className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-black">
                        Add to calendar
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-5 border-t border-black/[0.06] pt-4 text-xs leading-5 text-grey">
                    Sent by {draft.senderName || "Host"}. Replies go to{" "}
                    {draft.replyTo || "your reply-to address"}.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-grey">
                    <span className="font-semibold text-black">Gather</span> -
                    Every guest is your +1.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
