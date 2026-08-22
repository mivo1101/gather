"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { formatRelativeTime } from "@/lib/format";
import {
  BackIcon,
  ChevronRightIcon,
  CloseIcon,
  EyeIcon,
  PencilIcon,
  RedoIcon,
  UndoIcon,
} from "./editor-icons";

interface EditorToolbarProps {
  title: string;
  onTitleChange: (value: string) => void;
  status: string;
  savedAt: string;
  previewOpen: boolean;
  onOpenPreview: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onContinue: () => void;
  isSaving: boolean;
  isContinuing?: boolean;
  saveLabel: string;
}

export function EditorToolbar({
  title,
  onTitleChange,
  status,
  savedAt,
  previewOpen,
  onOpenPreview,
  zoom,
  onZoomChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onContinue,
  isSaving,
  isContinuing = false,
  saveLabel,
}: EditorToolbarProps) {
  // Defer relative time until after mount so SSR and client HTML match
  const [savedLabel, setSavedLabel] = useState("just now");

  useEffect(() => {
    setSavedLabel(formatRelativeTime(savedAt));
    const id = window.setInterval(() => {
      setSavedLabel(formatRelativeTime(savedAt));
    }, 30_000);
    return () => window.clearInterval(id);
  }, [savedAt]);

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
          <p className="truncate text-xs capitalize text-grey">
            {status} · Saved {savedLabel}
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
        <button
          type="button"
          onClick={onOpenPreview}
          className={`flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-colors ${
            previewOpen
              ? "bg-black text-white"
              : "text-grey hover:bg-soft-grey hover:text-black"
          }`}
          aria-label="Preview invitation"
          title="See what guests will see"
        >
          <EyeIcon />
          Preview
        </button>

        <div className="mx-1 h-5 w-px bg-black/10" aria-hidden="true" />

        {/* Canvas zoom - it used to sit down among the page thumbnails. */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(40, zoom - 10))}
            className="flex h-9 w-8 items-center justify-center rounded-xl text-base text-grey transition-colors hover:bg-soft-grey hover:text-black"
            aria-label="Zoom out"
            title="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => onZoomChange(100)}
            className="min-w-[3.25rem] rounded-xl px-1 py-1.5 text-center text-sm font-semibold text-black transition-colors hover:bg-soft-grey"
            aria-label="Reset zoom to 100%"
            title="Reset to 100%"
          >
            {zoom}%
          </button>
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(200, zoom + 10))}
            className="flex h-9 w-8 items-center justify-center rounded-xl text-base text-grey transition-colors hover:bg-soft-grey hover:text-black"
            aria-label="Zoom in"
            title="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || isContinuing}
          className="rounded-full border border-black/10 px-3.5 py-2 text-sm font-semibold text-black transition-colors hover:border-black/20 disabled:opacity-60"
        >
          {isSaving ? "Saving…" : saveLabel}
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={isSaving || isContinuing}
          className="inline-flex items-center gap-1 rounded-full bg-black px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-black/90 disabled:opacity-60"
        >
          {isContinuing ? "Continuing…" : "Continue"}
          {!isContinuing ? (
            <ChevronRightIcon className="h-3.5 w-3.5 text-signature" />
          ) : null}
        </button>

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
