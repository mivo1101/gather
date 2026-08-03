"use client";

import type { CanvasElement } from "@/lib/data/canvas-elements";
import { EditableNumberInput, PanelSection } from "./shared";

interface PositionPanelProps {
  selected: CanvasElement;
  canMoveForward: boolean;
  canMoveBackward: boolean;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onAlign: (
    edge: "top" | "middle" | "bottom" | "left" | "center" | "right",
  ) => void;
  onChangeTransform: (patch: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
  }) => void;
}

export function PositionPanel({
  selected,
  canMoveForward,
  canMoveBackward,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onAlign,
  onChangeTransform,
}: PositionPanelProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2">
        <ArrangeButton
          label="Forward"
          disabled={!canMoveForward}
          onClick={onBringForward}
        />
        <ArrangeButton
          label="Backward"
          disabled={!canMoveBackward}
          onClick={onSendBackward}
        />
        <ArrangeButton
          label="To front"
          disabled={!canMoveForward}
          onClick={onBringToFront}
        />
        <ArrangeButton
          label="To back"
          disabled={!canMoveBackward}
          onClick={onSendToBack}
        />
      </div>

      <PanelSection title="Align to page">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["top", "Top"],
              ["left", "Left"],
              ["middle", "Middle"],
              ["center", "Center"],
              ["bottom", "Bottom"],
              ["right", "Right"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onAlign(id)}
              className="rounded-xl border border-black/10 px-3 py-2.5 text-left text-sm font-semibold text-black hover:border-signature/40 hover:bg-soft-grey"
            >
              {label}
            </button>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="Advanced">
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="Width"
            value={selected.width}
            suffix="%"
            onChange={(width) => onChangeTransform({ width })}
          />
          <NumberField
            label="Height"
            value={selected.height ?? 0}
            suffix="%"
            onChange={(height) => onChangeTransform({ height })}
          />
          <NumberField
            label="X"
            value={selected.x}
            suffix="%"
            onChange={(x) => onChangeTransform({ x })}
          />
          <NumberField
            label="Y"
            value={selected.y}
            suffix="%"
            onChange={(y) => onChangeTransform({ y })}
          />
          <NumberField
            label="Rotate"
            value={selected.rotation}
            suffix="°"
            onChange={(rotation) => onChangeTransform({ rotation })}
          />
        </div>
      </PanelSection>
    </div>
  );
}

function ArrangeButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold ${
        disabled
          ? "cursor-not-allowed border-black/5 text-grey/50"
          : "border-black/10 text-black hover:border-signature/40 hover:bg-soft-grey"
      }`}
    >
      {label}
    </button>
  );
}

function NumberField({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-grey">{label}</span>
      <div className="flex items-center rounded-xl border border-black/10 px-2.5 py-2">
        <EditableNumberInput
          value={Number(value.toFixed(1))}
          precision={1}
          onChange={onChange}
          className="w-full bg-transparent text-sm outline-none"
          ariaLabel={label}
        />
        <span className="text-xs text-grey">{suffix}</span>
      </div>
    </label>
  );
}
