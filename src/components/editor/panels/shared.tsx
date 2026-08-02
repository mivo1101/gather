"use client";

import { useEffect, useState } from "react";

export { ColourField, DocumentColorsProvider } from "./ColourField";

export function EditableNumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  precision = 0,
  className = "",
  ariaLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const format = (number: number) =>
    precision > 0
      ? String(Number(number.toFixed(precision)))
      : String(Math.round(number));
  const [draft, setDraft] = useState(() => format(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(format(value));
    // `format` intentionally follows the current precision.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused, precision, value]);

  const normalize = (number: number) => {
    const bounded = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, number));
    const stepped =
      step > 0 ? Math.round(bounded / step) * step : bounded;
    return precision > 0
      ? Number(stepped.toFixed(precision))
      : Math.round(stepped);
  };

  const commit = () => {
    const parsed = Number(draft);
    const next = Number.isFinite(parsed) ? normalize(parsed) : normalize(value);
    setDraft(format(next));
    setFocused(false);
    if (next !== value) onChange(next);
  };

  return (
    <input
      type="number"
      inputMode="decimal"
      aria-label={ariaLabel}
      min={min}
      max={max}
      step={step}
      value={draft}
      onFocus={(event) => {
        setFocused(true);
        event.currentTarget.select();
      }}
      onChange={(event) => {
        const nextDraft = event.target.value;
        setDraft(nextDraft);
        if (nextDraft.trim() === "") return;
        const parsed = Number(nextDraft);
        if (Number.isFinite(parsed)) onChange(normalize(parsed));
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          setDraft(format(value));
          event.currentTarget.blur();
        }
      }}
      className={className}
    />
  );
}

export function ThinSlider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-grey">{label}</span>
        <span className="text-xs text-grey">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full appearance-none rounded-full bg-black/10 accent-signature [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-signature"
      />
    </label>
  );
}

export function PanelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-soft-grey/50">
      <p className="rounded-t-xl bg-soft-grey px-3 py-2 text-sm font-semibold text-black">
        {title}
      </p>
      <div className="space-y-3 px-3 py-3">{children}</div>
    </div>
  );
}

export function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl bg-soft-grey/70 px-3 py-4 text-sm text-grey">
      {children}
    </p>
  );
}
