"use client";

import { useEffect, useRef, useState } from "react";
import type { CanvasElement } from "@/lib/data/canvas-elements";
import { widgetKindLabel } from "@/lib/data/canvas-elements";
import { isDecorativeGraphicSrc } from "@/lib/data/element-library";
import {
  DuplicateIcon,
  GridIcon,
  LockIcon,
  PencilIcon,
  TransparencyIcon,
  TrashIcon,
} from "./editor-icons";

/** What the selection is, in the guest's words. */
function selectionLabel(element: CanvasElement): string {
  if (element.type === "widget" && element.widget) {
    return widgetKindLabel(element.widget.kind);
  }
  if (element.type === "image") {
    return isDecorativeGraphicSrc(element.content) ? "Graphic" : "Photo";
  }
  return element.type.charAt(0).toUpperCase() + element.type.slice(1);
}

function BarButton({
  label,
  icon: Icon,
  onClick,
  active,
  danger,
}: {
  label: string;
  icon: (props: { className?: string }) => React.ReactNode;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-signature/10 text-signature"
          : danger
            ? "text-grey hover:bg-red-50 hover:text-red-600"
            : "text-grey hover:bg-soft-grey hover:text-black"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/**
 * Actions for the current selection, docked above the canvas.
 *
 * These used to float on the element itself, which meant they rotated with it
 * and covered the artwork at the edges of the card. Up here the bar keeps one
 * position and one orientation, however the element is placed.
 */
export function ElementActionBar({
  element,
  selectionCount,
  showGrid,
  onToggleGrid,
  onEdit,
  onSetLink,
  onDuplicate,
  onDelete,
  onToggleLock,
  onChangeOpacity,
}: {
  element: CanvasElement | null;
  selectionCount: number;
  showGrid: boolean;
  onToggleGrid: () => void;
  onEdit: (id: string) => void;
  onSetLink: (id: string, href: string | null) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleLock: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [fadeOpen, setFadeOpen] = useState(false);
  const fadeRef = useRef<HTMLDivElement>(null);
  const [linkValue, setLinkValue] = useState("");
  const linkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLinkOpen(false);
    setFadeOpen(false);
  }, [element?.id]);

  useEffect(() => {
    if (!fadeOpen) return;
    const close = (event: PointerEvent) => {
      if (!fadeRef.current?.contains(event.target as Node)) setFadeOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [fadeOpen]);

  useEffect(() => {
    if (!linkOpen) return;
    const close = (event: PointerEvent) => {
      if (!linkRef.current?.contains(event.target as Node)) setLinkOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [linkOpen]);

  const multiple = selectionCount > 1;
  const opacity = Math.round(element?.opacity ?? 100);
  const isGuestNameWidget =
    element?.type === "widget" && element.widget?.kind === "guest_name";
  const canEdit =
    element &&
    !element.locked &&
    (element.type === "text" ||
      (element.type === "widget" && !isGuestNameWidget) ||
      (element.type === "image" && !isDecorativeGraphicSrc(element.content)));

  return (
    <div className="relative z-50 mx-auto mb-2 flex h-12 w-fit max-w-full shrink-0 items-center gap-1 rounded-2xl border border-black/[0.04] bg-white px-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {element ? (
        <>
          <span className="shrink-0 rounded-full bg-signature/10 px-2.5 py-1 text-xs font-semibold text-signature">
            {multiple ? `${selectionCount} selected` : selectionLabel(element)}
          </span>

          {!multiple && canEdit && (
            <BarButton
              label={element.type === "image" ? "Fit" : "Edit"}
              icon={PencilIcon}
              onClick={() => onEdit(element.id)}
            />
          )}

          {!multiple && element.type === "text" && !element.locked && (
            <div className="relative" ref={linkRef}>
              <button
                type="button"
                onClick={() => {
                  setLinkValue(element.href || "");
                  setLinkOpen((open) => !open);
                }}
                title="Link ⌘K"
                className={`inline-flex h-9 items-center rounded-lg px-2.5 text-sm font-semibold transition-colors ${
                  element.href
                    ? "bg-signature/10 text-signature"
                    : "text-grey hover:bg-soft-grey hover:text-black"
                }`}
              >
                Link
              </button>
              {linkOpen && (
                <div className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-black/10 bg-white p-2 shadow-[0_12px_32px_rgba(0,0,0,0.14)]">
                  <input
                    autoFocus
                    value={linkValue}
                    onChange={(event) => setLinkValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        onSetLink(element.id, linkValue.trim() || null);
                        setLinkOpen(false);
                      }
                      if (event.key === "Escape") setLinkOpen(false);
                    }}
                    placeholder="https://"
                    className="w-full rounded-lg border border-black/10 px-2.5 py-1.5 text-sm outline-none focus:border-signature/40"
                  />
                  <div className="mt-2 flex justify-end gap-1.5">
                    {element.href && (
                      <button
                        type="button"
                        onClick={() => {
                          onSetLink(element.id, null);
                          setLinkOpen(false);
                        }}
                        className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-grey hover:bg-soft-grey hover:text-black"
                      >
                        Remove
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onSetLink(element.id, linkValue.trim() || null);
                        setLinkOpen(false);
                      }}
                      className="rounded-lg bg-black px-2.5 py-1.5 text-sm font-semibold text-white"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!multiple && !element.locked && (
            <div className="relative" ref={fadeRef}>
              <button
                type="button"
                onClick={() => setFadeOpen((open) => !open)}
                title="Transparency"
                aria-label="Transparency"
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition-colors ${
                  opacity < 100
                    ? "bg-signature/10 text-signature"
                    : "text-grey hover:bg-soft-grey hover:text-black"
                }`}
              >
                <TransparencyIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {opacity < 100 ? `${opacity}%` : "Transparency"}
                </span>
              </button>
              {fadeOpen && (
                <div className="absolute left-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-black/10 bg-white p-3 shadow-[0_12px_32px_rgba(0,0,0,0.14)]">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium tracking-wide text-grey">
                      Transparency
                    </span>
                    <span className="text-xs font-semibold text-black">
                      {opacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={opacity}
                    onChange={(event) =>
                      onChangeOpacity(element.id, Number(event.target.value))
                    }
                    className="h-1.5 w-full appearance-none rounded-full bg-black/10 accent-signature [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/10 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
                  />
                  <div className="mt-2 flex justify-between">
                    {[0, 25, 50, 75, 100].map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => onChangeOpacity(element.id, step)}
                        className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-grey hover:bg-soft-grey hover:text-black"
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!multiple && (
            <BarButton
              label="Duplicate"
              icon={DuplicateIcon}
              onClick={() => onDuplicate(element.id)}
            />
          )}

          {!multiple && (
            <BarButton
              label={element.locked ? "Unlock" : "Lock"}
              icon={LockIcon}
              active={element.locked}
              onClick={() => onToggleLock(element.id)}
            />
          )}

          <BarButton
            label="Delete"
            icon={TrashIcon}
            danger
            onClick={() => onDelete(element.id)}
          />
        </>
      ) : (
        <span className="px-1.5 text-sm text-grey">
          Select something on the card to style it
        </span>
      )}

      <span className="mx-1 h-5 w-px shrink-0 bg-black/8" aria-hidden="true" />
      <BarButton
        label="Grid"
        icon={GridIcon}
        active={showGrid}
        onClick={onToggleGrid}
      />

    </div>
  );
}
