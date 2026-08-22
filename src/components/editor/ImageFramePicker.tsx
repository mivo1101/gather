"use client";

import type { ImageFrame } from "@/lib/data/canvas-elements";
import { FramePreview } from "./FramePreview";
import { IMAGE_FRAME_OPTIONS, type ImageFrameGroup } from "./image-frames";

const GROUPS: { id: ImageFrameGroup; label: string }[] = [
  { id: "basic", label: "Shapes" },
  { id: "decorative", label: "Decorative" },
];

export function ImageFramePicker({
  value,
  onChange,
  frameColor,
}: {
  value: ImageFrame;
  onChange: (frame: ImageFrame) => void;
  frameColor?: string;
}) {
  return (
    <div className="space-y-4">
      {GROUPS.map((group) => (
        <div key={group.id}>
          <p className="mb-2 text-xs font-medium tracking-wide text-grey">
            {group.label}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {IMAGE_FRAME_OPTIONS.filter(
              (frame) => frame.group === group.id,
            ).map((frame) => (
              <button
                key={frame.id}
                type="button"
                onClick={() => onChange(frame.id)}
                className={`group rounded-xl border p-1.5 text-center transition-colors ${
                  value === frame.id
                    ? "border-signature bg-signature/5 text-signature"
                    : "border-black/8 text-grey hover:border-signature/35 hover:text-black"
                }`}
                aria-label={`${frame.label} frame`}
                aria-pressed={value === frame.id}
              >
                <span className="flex aspect-square items-center justify-center rounded-lg bg-soft-grey/70 p-1.5">
                  <FramePreview
                    frame={frame.id}
                    color={group.id === "decorative" ? frameColor : null}
                  />
                </span>
                <span className="mt-1 block truncate text-xs font-semibold">
                  {frame.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
