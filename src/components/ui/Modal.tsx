"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  /** Omit to make the modal blocking: no Escape key, no backdrop click. */
  onDismiss?: () => void;
  role?: "dialog" | "alertdialog";
  labelledBy?: string;
  describedBy?: string;
  /** Overrides the default white panel, e.g. to change its width. */
  panelClassName?: string;
  children: ReactNode;
}

const defaultPanel =
  "my-auto w-full max-w-md rounded-[24px] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]";

/**
 * Overlay portalled to <body> so it covers the whole viewport and centres on the
 * screen. Rendered in place, `fixed` is trapped by any transformed ancestor - the
 * fade-up animation on the hub pages leaves one behind - which both clips the
 * backdrop to the content column and centres the panel on the page, putting it
 * off-screen when the page is long.
 */
export function Modal({
  open,
  onDismiss,
  role = "dialog",
  labelledBy,
  describedBy,
  panelClassName = defaultPanel,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open || !onDismiss) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onDismiss]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onDismiss}
    >
      <div
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className={panelClassName}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
