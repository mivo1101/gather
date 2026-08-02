"use client";

import type { ImageFrame } from "@/lib/data/canvas-elements";
import {
  IMAGE_FRAME_OPTIONS,
  imageFrameClipPath,
} from "./image-frames";

export function ImageFramePicker({
  value,
  onChange,
}: {
  value: ImageFrame;
  onChange: (frame: ImageFrame) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {IMAGE_FRAME_OPTIONS.map((frame) => (
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
            <span
              className="relative block h-full w-full overflow-hidden"
              style={{
                clipPath: imageFrameClipPath(frame.id),
                background:
                  "linear-gradient(180deg, #dff3ff 0%, #dff3ff 62%, #b7d978 62%, #7cab38 100%)",
              }}
              aria-hidden="true"
            >
              <span className="absolute left-[24%] top-[22%] h-[14%] w-[52%] rounded-full bg-white/90" />
            </span>
          </span>
          <span className="mt-1 block truncate text-[10px] font-semibold">
            {frame.label}
          </span>
        </button>
      ))}
    </div>
  );
}
