"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { formatRelativeTime } from "@/lib/format";
import {
  BackIcon,
  ChevronDownIcon,
  CloseIcon,
  DesktopIcon,
  MobileIcon,
  PencilIcon,
  RedoIcon,
  UndoIcon,
} from "./editor-icons";
import type { PreviewDevice } from "./editor-types";

interface EditorToolbarProps {
  title: string;
  onTitleChange: (value: string) => void;
  status: string;
  savedAt: string;
  previewDevice: PreviewDevice;
  previewOpen: boolean;
  onOpenDevicePreview: (device: PreviewDevice) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onPublish: (mode: "published" | "draft") => void;
  isSaving: boolean;
  saveLabel: string;
}

export function EditorToolbar({
  title,
  onTitleChange,
  status,
  savedAt,
  previewDevice,
  previewOpen,
  onOpenDevicePreview,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onPublish,
  isSaving,
  saveLabel,
}: EditorToolbarProps) {
  const [publishOpen, setPublishOpen] = useState(false);
  const publishRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!publishOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!publishRef.current?.contains(event.target as Node)) {
        setPublishOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [publishOpen]);

  return (
    <header className="z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-black/5 bg-white px-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <Link
          href="/home"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-grey transition-colors hover:bg-soft-grey hover:text-black"
          aria-label="Back to Home"
        >
          <BackIcon />
        </Link>

        <div className="hidden sm:block">
          <Logo href="/home" className="origin-left scale-90" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="min-w-0 max-w-[10rem] truncate bg-transparent text-sm font-semibold text-black outline-none sm:max-w-[16rem]"
              aria-label="Invitation name"
            />
            <span className="text-grey" aria-hidden="true">
              <PencilIcon />
            </span>
          </div>
          <p className="truncate text-[11px] capitalize text-grey">
            {status} · Saved {formatRelativeTime(savedAt)}
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-1 md:flex">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-grey transition-colors hover:bg-soft-grey hover:text-black disabled:opacity-30"
          aria-label="Undo"
          title="Undo (⌘Z)"
        >
          <UndoIcon />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-grey transition-colors hover:bg-soft-grey hover:text-black disabled:opacity-30"
          aria-label="Redo"
          title="Redo (⌘⇧Z)"
        >
          <RedoIcon />
        </button>
        <div className="mx-1 h-5 w-px bg-black/10" aria-hidden="true" />
        <div className="flex rounded-xl bg-soft-grey p-1">
          <button
            type="button"
            onClick={() => onOpenDevicePreview("desktop")}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
              previewOpen && previewDevice === "desktop"
                ? "bg-white text-black shadow-sm"
                : "text-grey hover:text-black"
            }`}
            aria-label="Preview on desktop"
            title="Preview on MacBook"
          >
            <DesktopIcon />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => onOpenDevicePreview("mobile")}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
              previewOpen && previewDevice === "mobile"
                ? "bg-white text-black shadow-sm"
                : "text-grey hover:text-black"
            }`}
            aria-label="Preview on mobile"
            title="Preview on iPhone"
          >
            <MobileIcon />
            Mobile
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="rounded-full border border-black/10 px-3.5 py-2 text-sm font-semibold text-black transition-colors hover:border-black/20 disabled:opacity-60"
        >
          {isSaving ? "Saving…" : saveLabel}
        </button>

        <div className="relative" ref={publishRef}>
          <button
            type="button"
            onClick={() => setPublishOpen((open) => !open)}
            className="inline-flex items-center gap-1 rounded-full bg-black px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-black/90"
            aria-expanded={publishOpen}
          >
            Publish
            <ChevronDownIcon className="text-signature" />
          </button>
          {publishOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 min-w-[11rem] overflow-hidden rounded-xl border border-black/5 bg-white py-1 shadow-[0_12px_28px_rgba(0,0,0,0.12)]">
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-black hover:bg-soft-grey"
                onClick={() => {
                  onPublish("published");
                  setPublishOpen(false);
                }}
              >
                Publish now
              </button>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-black hover:bg-soft-grey"
                onClick={() => {
                  onPublish("draft");
                  setPublishOpen(false);
                }}
              >
                Revert to draft
              </button>
            </div>
          )}
        </div>

        <Link
          href="/home"
          className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl text-grey transition-colors hover:bg-soft-grey hover:text-black"
          aria-label="Close editor"
        >
          <CloseIcon />
        </Link>
      </div>
    </header>
  );
}
