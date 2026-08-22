"use client";

import type { ImageFrame } from "@/lib/data/canvas-elements";
import { FrameOrnament } from "./FrameOrnament";
import {
  decorativeFrameSpec,
  imageFrameClipPath,
  imageFrameInset,
} from "./image-frames";

/** Stand-in photo used by every frame swatch, so shapes read at a glance. */
const SWATCH_PHOTO =
  "linear-gradient(180deg, #dff3ff 0%, #dff3ff 62%, #b7d978 62%, #7cab38 100%)";

/**
 * One frame swatch - the aperture holds a stand-in photo and the ornament is
 * drawn around it, exactly as the canvas composes a framed image.
 */
export function FramePreview({
  frame,
  color,
  className = "relative block h-full w-full",
}: {
  frame: ImageFrame;
  color?: string | null;
  className?: string;
}) {
  const decorative = decorativeFrameSpec(frame);

  return (
    <span className={className}>
      <span
        className="absolute overflow-hidden"
        style={{
          inset: imageFrameInset(frame),
          clipPath: imageFrameClipPath(frame),
          background: SWATCH_PHOTO,
        }}
      >
        <span className="absolute left-[24%] top-[22%] block h-[14%] w-[52%] rounded-full bg-white/90" />
      </span>
      {decorative && <FrameOrnament frame={frame} color={color} />}
    </span>
  );
}
