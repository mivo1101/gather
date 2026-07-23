"use client";

import type { CSSProperties } from "react";
import { isPatternGraphicSrc } from "@/lib/data/element-library";
import type { ImageFrame } from "@/lib/data/canvas-elements";
import type { InvitationShape } from "./editor-types";

function frameClip(frame?: ImageFrame): string | undefined {
  switch (frame) {
    case "circle":
      return "circle(50% at 50% 50%)";
    case "heart":
      return "polygon(50% 92%, 8% 52%, 8% 30%, 22% 16%, 38% 16%, 50% 30%, 62% 16%, 78% 16%, 92% 30%, 92% 52%)";
    case "rounded":
      return "inset(0 round 16%)";
    case "square":
      return "inset(0)";
    default:
      return undefined;
  }
}

/** Card width/height ratio for percent-based element sizing. */
export function cardAspectRatio(
  shape: InvitationShape,
  customSize?: { width: number; height: number },
): number {
  switch (shape) {
    case "landscape":
      return 16 / 9;
    case "square":
      return 1;
    case "custom":
      return (
        (customSize?.width ?? 4) / Math.max(customSize?.height ?? 5, 0.001)
      );
    case "portrait":
    default:
      return 9 / 16;
  }
}

/** Size a photo element (%) so the selection box matches image aspect. */
export function photoElementSize(
  naturalWidth: number,
  naturalHeight: number,
  cardAspect: number,
): { width: number; height: number } {
  const imageAspect = naturalWidth / Math.max(1, naturalHeight);
  let width = 52;
  let height = (width * cardAspect) / imageAspect;
  if (height > 40) {
    height = 40;
    width = (height * imageAspect) / cardAspect;
  }
  if (width > 72) {
    width = 72;
    height = (width * cardAspect) / imageAspect;
  }
  return {
    width: Math.round(width * 10) / 10,
    height: Math.round(height * 10) / 10,
  };
}

export function CanvasImageContent({
  src,
  color,
  frame,
  className = "relative h-full min-h-[24px] w-full",
  onNaturalSize,
}: {
  src: string;
  color?: string;
  frame?: ImageFrame;
  className?: string;
  onNaturalSize?: (naturalWidth: number, naturalHeight: number) => void;
}) {
  const clip = frameClip(frame);
  const isPattern = isPatternGraphicSrc(src);

  if (isPattern) {
    const style: CSSProperties = {
      backgroundColor: color || "#1F2D22",
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskSize: "contain",
      maskSize: "contain",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      clipPath: clip,
    };
    return <div className={className} style={style} aria-hidden="true" />;
  }

  return (
    <div className={`${className} overflow-hidden`} style={{ clipPath: clip }}>
      {/* Blob / data URLs from uploads — next/image is not suitable */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="pointer-events-none h-full w-full object-contain select-none"
        onLoad={(event) => {
          const { naturalWidth, naturalHeight } = event.currentTarget;
          if (naturalWidth > 0 && naturalHeight > 0) {
            onNaturalSize?.(naturalWidth, naturalHeight);
          }
        }}
      />
    </div>
  );
}
