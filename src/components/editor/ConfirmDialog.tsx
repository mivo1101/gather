"use client";

import { useId } from "react";
import { Modal } from "@/components/ui/Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Replace",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal
      open={open}
      onDismiss={onCancel}
      role="alertdialog"
      labelledBy={titleId}
      describedBy={descriptionId}
      panelClassName="my-auto w-full max-w-sm rounded-2xl border border-black/[0.04] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]"
    >
      <h2 id={titleId} className="text-base font-semibold text-black">
        {title}
      </h2>
      <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-grey">
        {description}
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-4 py-2 text-sm font-semibold text-grey hover:bg-soft-grey hover:text-black"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-full bg-signature px-4 py-2 text-sm font-semibold text-white hover:bg-signature/90"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
