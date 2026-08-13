"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  isLibraryGraphicSrc,
  isPatternGraphicSrc,
  isWeddingSilhouetteSrc,
} from "@/lib/data/element-library";
import type {
  ElementEffects,
  ImageFrame,
} from "@/lib/data/canvas-elements";
import { effectsToCss } from "@/lib/element-effects";
import {
  EMPTY_IMAGE_FRAME_SRC,
  imageFrameClipPath,
  isSquareImageFrame,
} from "./image-frames";

/** Frames that should stay visually square on the card. */
export function isSquareFrame(frame?: ImageFrame | null): boolean {
  return isSquareImageFrame(frame);
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

export { cardAspectRatio } from "./canvas-metrics";

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

/**
 * Pan uses CSS object-position, whose full 0–100% range always keeps a
 * cover-fitted photo inside its frame without exposing empty space.
 */
export function maxImageOffset(_scale?: number) {
  return 50;
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
  frameSize?: { width: number; height: number } | null,
  naturalSize?: { width: number; height: number } | null,
): CSSProperties {
  const fit = clampImageFit({
    imageScale: scale,
    imageOffsetX: offsetX,
    imageOffsetY: offsetY,
  });
  if (
    frameSize &&
    naturalSize &&
    frameSize.width > 0 &&
    frameSize.height > 0 &&
    naturalSize.width > 0 &&
    naturalSize.height > 0
  ) {
    const frameAspect = frameSize.width / frameSize.height;
    const imageAspect = naturalSize.width / naturalSize.height;
    const baseWidth =
      imageAspect >= frameAspect
        ? (imageAspect / frameAspect) * 100
        : 100;
    const baseHeight =
      imageAspect >= frameAspect
        ? 100
        : (frameAspect / imageAspect) * 100;
    const renderedWidth = baseWidth * fit.imageScale;
    const renderedHeight = baseHeight * fit.imageScale;
    const overflowX = Math.max(0, renderedWidth - 100);
    const overflowY = Math.max(0, renderedHeight - 100);
    return {
      position: "absolute",
      left: `${(100 - renderedWidth) / 2 + (fit.imageOffsetX / 50) * (overflowX / 2)}%`,
      top: `${(100 - renderedHeight) / 2 + (fit.imageOffsetY / 50) * (overflowY / 2)}%`,
      width: `${renderedWidth}%`,
      height: `${renderedHeight}%`,
      maxWidth: "none",
      objectFit: "fill",
    };
  }

  return {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    maxWidth: "none",
    objectFit: "cover",
    objectPosition: `${50 - fit.imageOffsetX}% ${50 - fit.imageOffsetY}%`,
    transform: `scale(${fit.imageScale})`,
    transformOrigin: "center",
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
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    setNaturalSize(null);
  }, [src]);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const update = () => {
      const rect = node.getBoundingClientRect();
      setFrameSize((current) =>
        current &&
        Math.abs(current.width - rect.width) < 0.25 &&
        Math.abs(current.height - rect.height) < 0.25
          ? current
          : { width: rect.width, height: rect.height },
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [src]);

  const clip = imageFrameClipPath(frame);
  const isPattern = isPatternGraphicSrc(src);
  const isWeddingSilhouette = isWeddingSilhouetteSrc(src);
  const isLibraryGraphic = isLibraryGraphicSrc(src);
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

  if (src === EMPTY_IMAGE_FRAME_SRC) {
    return (
      <div className={className} style={outerEffect}>
        <div
          className="relative flex h-full w-full items-center justify-center overflow-hidden"
          style={{
            clipPath: clip,
            background:
              "linear-gradient(180deg, #e6f5ff 0%, #e6f5ff 62%, #c7dfa0 62%, #8fba4e 100%)",
          }}
        >
          <div className="absolute left-[24%] top-[22%] h-[13%] w-[52%] rounded-full bg-white/90" />
          <div className="relative rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-black/55 shadow-sm">
            Add image
          </div>
        </div>
      </div>
    );
  }

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

  if (isWeddingSilhouette) {
    const base = src.replace(/-preview\.png$/, "");
    const maskStyle: CSSProperties = {
      WebkitMaskImage: `url(${base}-fill.png)`,
      maskImage: `url(${base}-fill.png)`,
      WebkitMaskSize: "contain",
      maskSize: "contain",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      backgroundColor: color === "transparent" ? "transparent" : color || "#1F2D22",
    };
    return (
      <div className={className} style={outerEffect}>
        <div className="relative h-full w-full overflow-hidden" style={{ clipPath: clip }}>
          {color !== "transparent" && <div className="absolute inset-0" style={maskStyle} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${base}-outline.png`}
            alt=""
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
          />
        </div>
      </div>
    );
  }

  if (isLibraryGraphic) {
    return (
      <div className={className} style={outerEffect}>
        <div
          className="flex h-full w-full items-center justify-center overflow-hidden"
          style={{ clipPath: clip }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            draggable={false}
            className="pointer-events-none h-full w-full select-none object-contain"
          />
        </div>
      </div>
    );
  }

  if (cropEditing) {
    const exactPhotoStyle = photoLayerStyle(
      scale,
      ox,
      oy,
      frameSize,
      naturalSize,
    );
    return (
      <div
        ref={frameRef}
        className={`${className} overflow-visible`}
        style={{ zIndex: 5 }}
      >
        {/* Soft overflow preview makes the crop available outside the frame. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          draggable={false}
          className="pointer-events-none select-none opacity-25 blur-[2px] saturate-75"
          style={exactPhotoStyle}
          onLoad={(event) =>
            setNaturalSize({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            })
          }
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
              style={exactPhotoStyle}
              onLoad={(event) =>
                setNaturalSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                })
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={frameRef} className={className} style={outerEffect}>
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
          style={photoLayerStyle(
            scale,
            ox,
            oy,
            frameSize,
            naturalSize,
          )}
          onLoad={(event) =>
            setNaturalSize({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            })
          }
        />
      </div>
    </div>
  );
}
