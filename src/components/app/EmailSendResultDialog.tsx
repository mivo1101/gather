"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { PlusIcon } from "@/components/ui/Button";

export interface EmailSendResult {
  sent: number;
  failed: number;
  skipped: number;
}

interface EmailSendResultDialogProps {
  result: EmailSendResult | null;
  onClose: () => void;
  onViewStatus: () => void;
}

export function EmailSendResultDialog({
  result,
  onClose,
  onViewStatus,
}: EmailSendResultDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!result) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [result, onClose]);

  if (!result || typeof document === "undefined") return null;

  const completeSuccess = result.sent > 0 && result.failed === 0;
  const partialSuccess = result.sent > 0 && result.failed > 0;
  const title = completeSuccess
    ? `Great news! ${result.sent} ${result.sent === 1 ? "invitation was" : "invitations were"} sent successfully.`
    : partialSuccess
      ? `Almost there! ${result.sent} ${result.sent === 1 ? "invitation was" : "invitations were"} sent successfully, but ${result.failed} couldn’t be sent.`
      : result.failed > 0
        ? "We couldn’t send your invitations."
        : "No new invitations were sent.";
  const description = completeSuccess
    ? "You can review the delivery status from your event’s Email section."
    : result.failed > 0
      ? "Review the email status to see what happened and try again."
      : "The selected invitations had already been sent. Review their current email status below.";
  const iconTone = completeSuccess
    ? "bg-signature/15 text-signature"
    : partialSuccess
      ? "bg-[#fff2d8] text-[#9a6816]"
      : "bg-[#fff1f1] text-[#b23a3a]";

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-[24px] border border-black/[0.04] bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.16)] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold ${iconTone}`}
          aria-hidden="true"
        >
          {completeSuccess ? "✓" : partialSuccess ? "!" : "×"}
        </span>
        <h2 id={titleId} className="mt-4 text-xl font-bold leading-7 tracking-tight text-black">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-grey">
          {description}
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-grey transition-colors hover:bg-soft-grey hover:text-black"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onViewStatus}
            className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black/90"
          >
            {completeSuccess ? "View email status" : "Review email status"}
            <PlusIcon />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
