"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./editor-icons";
import {
  SIZE_UNITS,
  type CustomCanvasSize,
  type SizeUnit,
} from "./editor-types";

interface CustomSizeModalProps {
  open: boolean;
  initial: CustomCanvasSize;
  onClose: () => void;
  onApply: (size: CustomCanvasSize) => void;
}

export function CustomSizeModal({
  open,
  initial,
  onClose,
  onApply,
}: CustomSizeModalProps) {
  const titleId = useId();
  const [width, setWidth] = useState(String(initial.width));
  const [height, setHeight] = useState(String(initial.height));
  const [unit, setUnit] = useState<SizeUnit>(initial.unit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setWidth(String(initial.width));
    setHeight(String(initial.height));
    setUnit(initial.unit);
    setError(null);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  const submit = () => {
    const w = Number.parseFloat(width);
    const h = Number.parseFloat(height);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      setError("Enter positive width and height values.");
      return;
    }
    if (unit === "px" && (w > 10000 || h > 10000)) {
      setError("Pixel sizes can be at most 10,000.");
      return;
    }
    if (unit !== "px" && (w > 500 || h > 500)) {
      setError("That size looks too large - check the unit.");
      return;
    }
    onApply({
      width: Math.round(w * 1000) / 1000,
      height: Math.round(h * 1000) / 1000,
      unit,
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-black">
              Custom size
            </h2>
            <p className="mt-1 text-sm text-grey">
              Set the invitation width and height.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-grey hover:bg-soft-grey hover:text-black"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-grey">
              Width
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-grey">
              Height
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
            />
          </label>
        </div>

        <div className="mt-4">
          <span className="mb-1.5 block text-xs font-semibold text-grey">
            Unit
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SIZE_UNITS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setUnit(item.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  unit === item.id
                    ? "bg-black text-white"
                    : "bg-soft-grey text-grey hover:text-black"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="mt-3 text-xs font-medium text-signature">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-semibold text-grey hover:bg-soft-grey hover:text-black"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-full bg-signature px-4 py-2 text-sm font-semibold text-white hover:bg-signature/90"
          >
            Apply
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
