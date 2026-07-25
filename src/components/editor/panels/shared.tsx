"use client";

export { ColourField, DocumentColorsProvider } from "./ColourField";

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
