"use client";

import type { CSSProperties } from "react";
import { isPatternGraphicSrc } from "@/lib/data/element-library";
import type {
  ElementEffects,
  ImageFrame,
} from "@/lib/data/canvas-elements";
import { effectsToCss } from "@/lib/element-effects";
import type { InvitationShape } from "./editor-types";

function frameClip(frame?: ImageFrame): string | undefined {
  switch (frame) {
    case "circle":
      // closest-side keeps a true circle inside non-square boxes
      return "circle(closest-side at 50% 50%)";
    case "heart":
      return "polygon(50% 92%, 8% 52%, 8% 30%, 22% 16%, 38% 16%, 50% 30%, 62% 16%, 78% 16%, 92% 30%, 92% 52%)";
    case "rounded":
      return "inset(0 round 16%)";
    case "arch":
      return "inset(0 round 50% 50% 0 0)";
    case "square":
      return "inset(0)";
    default:
      return undefined;
  }
}

/** Frames that should stay visually square on the card. */
export function isSquareFrame(frame?: ImageFrame | null): boolean {
  return frame === "circle" || frame === "heart" || frame === "square";
}

/**
 * Snap percent width/height to a visual square on the invitation card.
 * Card percent axes are not equal (portrait cards are taller), so height =
 * width * cardAspect for a 1:1 visual result.
 */
export function squareElementSize(
  width: number,
  height: number,
  cardAspect: number,
): { width: number; height: number } {
  const nextWidth = Math.min(width, height / Math.max(cardAspect, 0.001));
  const nextHeight = nextWidth * cardAspect;
  return {
    width: Math.round(Math.max(8, nextWidth) * 10) / 10,
    height: Math.round(Math.max(6, nextHeight) * 10) / 10,
  };
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeImageScale(scale?: number) {
  return clamp(scale ?? 1, 1, 4);
}

/** Max pan (%) so the photo still covers the frame at this scale. */
export function maxImageOffset(scale?: number) {
  const s = normalizeImageScale(scale);
  return Math.max(0, (s - 1) * 50);
}

export function normalizeImageOffset(offset?: number, scale?: number) {
  const max = maxImageOffset(scale);
  return clamp(offset ?? 0, -max, max);
}

/** Keep scale ≥ 1 and offsets inside the coverable range. */
export function clampImageFit(input: {
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
}) {
  const imageScale = normalizeImageScale(input.imageScale);
  return {
    imageScale,
    imageOffsetX: normalizeImageOffset(input.imageOffsetX, imageScale),
    imageOffsetY: normalizeImageOffset(input.imageOffsetY, imageScale),
  };
}

function photoLayerStyle(
  scale: number,
  offsetX: number,
  offsetY: number,
): CSSProperties {
  const fit = clampImageFit({
    imageScale: scale,
    imageOffsetX: offsetX,
    imageOffsetY: offsetY,
  });
  const size = fit.imageScale * 100;
  return {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: `${size}%`,
    height: `${size}%`,
    maxWidth: "none",
    objectFit: "cover",
    transform: `translate(calc(-50% + ${fit.imageOffsetX}%), calc(-50% + ${fit.imageOffsetY}%))`,
  };
}

export function CanvasImageContent({
  src,
  color,
  frame,
  effects,
  imageScale = 1,
  imageOffsetX = 0,
  imageOffsetY = 0,
  cropEditing = false,
  className = "relative h-full min-h-[24px] w-full",
  onNaturalSize,
}: {
  src: string;
  color?: string;
  frame?: ImageFrame;
  effects?: ElementEffects | null;
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  /** Show dimmed overflow so the photo can be framed. */
  cropEditing?: boolean;
  className?: string;
  onNaturalSize?: (naturalWidth: number, naturalHeight: number) => void;
}) {
  const clip = frameClip(frame);
  const isPattern = isPatternGraphicSrc(src);
  const scale = normalizeImageScale(imageScale);
  const fit = clampImageFit({
    imageScale: scale,
    imageOffsetX,
    imageOffsetY,
  });
  const ox = fit.imageOffsetX;
  const oy = fit.imageOffsetY;
  const effectCss = effectsToCss(effects, color);
  const outerEffect: CSSProperties = { filter: effectCss.filter };

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
    // Outer filter so drop-shadow isn't clipped by the frame
    return (
      <div className={className} style={outerEffect} aria-hidden="true">
        <div className="h-full w-full" style={style} />
      </div>
    );
  }

  const onLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalWidth > 0 && naturalHeight > 0) {
      onNaturalSize?.(naturalWidth, naturalHeight);
    }
  };

  if (cropEditing) {
    return (
      <div
        className={`${className} overflow-visible`}
        style={{ zIndex: 5 }}
      >
        {/* Dimmed full photo outside the frame */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          draggable={false}
          className="pointer-events-none select-none opacity-35"
          style={photoLayerStyle(scale, ox, oy)}
          onLoad={onLoad}
        />
        {/* Bright photo inside the frame — effects follow this shape */}
        <div className="absolute inset-0" style={outerEffect}>
          <div
            className="h-full w-full overflow-hidden"
            style={{ clipPath: clip }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              draggable={false}
              className="pointer-events-none select-none"
              style={photoLayerStyle(scale, ox, oy)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={outerEffect}>
      <div
        className="h-full w-full overflow-hidden"
        style={{ clipPath: clip }}
      >
        {/* Blob / data URLs from uploads — next/image is not suitable */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          draggable={false}
          className="pointer-events-none select-none"
          style={photoLayerStyle(scale, ox, oy)}
          onLoad={onLoad}
        />
      </div>
    </div>
  );
}
