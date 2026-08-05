"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CanvasElement } from "@/lib/data/canvas-elements";
import type {
  InvitationCustomSize,
  InvitationPage,
} from "@/lib/data/invitation-content";
import { CanvasImageContent, cardAspectRatio } from "@/components/editor/CanvasImageContent";
import { CanvasWidgetView } from "@/components/editor/CanvasWidgetView";
import type { InvitationShape } from "@/components/editor/editor-types";
import { ShapeGraphic } from "@/components/editor/ShapeGraphic";
import {
  fillBoxStyle,
  fillTextStyle,
  isGradient,
  normalizeHex,
} from "@/lib/color-utils";
import { canvasFontFamilyClass } from "@/lib/canvas-fonts";
import { effectsToCss } from "@/lib/element-effects";
import { paperTextureLayerStyle } from "@/lib/paper-textures";
import { designCanvasSize } from "@/components/editor/canvas-metrics";

function patternOverlay(
  pattern: InvitationPage["backgroundPattern"],
) {
  switch (pattern) {
    case "dots":
      return {
        backgroundImage:
          "radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)",
        backgroundSize: "12px 12px",
      };
    case "grid":
      return {
        backgroundImage:
          "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
        backgroundSize: "14px 14px",
      };
    case "stripes":
      return {
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(0,0,0,0.04) 0 8px, transparent 8px 16px)",
      };
    case "waves":
      return {
        backgroundImage:
          "repeating-radial-gradient(circle at 0 0, transparent 0, transparent 10px, rgba(0,0,0,0.04) 10px, rgba(0,0,0,0.04) 11px)",
      };
    default:
      return undefined;
  }
}

function PreviewDivider({
  variant,
  color,
}: {
  variant: string;
  color: string;
}) {
  const solid = isGradient(color) ? normalizeHex("#1F2D22") : color;
  const box = fillBoxStyle(color);
  if (variant === "dashed" || variant === "dotted") {
    return (
      <div
        className={`w-full border-t-2 ${
          variant === "dashed" ? "border-dashed" : "border-dotted"
        }`}
        style={{ borderColor: solid }}
      />
    );
  }
  if (variant === "double") {
    return (
      <div
        className="w-full border-t-[3px] border-double"
        style={{ borderColor: solid }}
      />
    );
  }
  if (variant === "thick") {
    return <div className="h-2 w-full rounded-full" style={box} />;
  }
  if (variant === "dots") {
    return (
      <div className="flex w-full items-center justify-between px-1">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className="h-1.5 w-1.5 rounded-full"
            style={box}
          />
        ))}
      </div>
    );
  }
  if (variant === "diamond") {
    return (
      <div className="flex w-full items-center gap-2">
        <div className="h-px flex-1" style={box} />
        <div className="h-2.5 w-2.5 rotate-45" style={box} />
        <div className="h-px flex-1" style={box} />
      </div>
    );
  }
  return <div className="h-0.5 w-full rounded-full" style={box} />;
}

/** Scaled preview of an invitation page — matches editor layout & canvas shape. */
export function InvitationPagePreview({
  page,
  shape = "portrait",
  customSize,
  className = "",
}: {
  page: Pick<
    InvitationPage,
    | "elements"
    | "backgroundColor"
    | "backgroundPattern"
    | "backgroundTexture"
    | "backgroundTextureOpacity"
    | "backgroundTextureTint"
    | "backgroundTextureBlend"
    | "border"
  >;
  shape?: InvitationShape;
  customSize?: InvitationCustomSize;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);
  const backgroundColor = page.backgroundColor || "#fff8f4";
  const elements = page.elements ?? [];
  const aspect = cardAspectRatio(shape, customSize);
  const designSize = useMemo(
    () => designCanvasSize(aspect),
    [aspect],
  );

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const update = () => {
      const { width, height } = node.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      setScale(
        Math.min(width / designSize.width, height / designSize.height),
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [designSize]);

  return (
    <div
      ref={frameRef}
      className={`relative overflow-hidden ${className}`}
      style={fillBoxStyle(backgroundColor)}
      aria-hidden="true"
    >
      {elements.length === 0 ? (
        <div className="absolute inset-0 bg-gradient-to-br from-soft-grey to-sugar-milk" />
      ) : (
        <div
          className="absolute left-1/2 top-1/2 origin-center"
          style={{
            width: designSize.width,
            height: designSize.height,
            transform: `translate(-50%, -50%) scale(${scale})`,
            ...fillBoxStyle(backgroundColor),
            boxSizing: "border-box",
            borderStyle:
              page.border && page.border.style !== "none"
                ? page.border.style === "ornament"
                  ? "double"
                  : page.border.style
                : undefined,
            borderWidth:
              page.border && page.border.style !== "none"
                ? page.border.width
                : undefined,
            borderColor:
              page.border && page.border.style !== "none"
                ? page.border.color
                : undefined,
          }}
        >
          {page.backgroundTexture &&
            page.backgroundTexture !== "none" && (
              <div
                className="pointer-events-none absolute inset-0"
                data-paper-texture={page.backgroundTexture}
                style={paperTextureLayerStyle({
                  texture: page.backgroundTexture,
                  opacity: page.backgroundTextureOpacity ?? 22,
                  tint: page.backgroundTextureTint || "#ffffff",
                  blend: page.backgroundTextureBlend || "soft-light",
                })}
              />
            )}
          {page.backgroundPattern &&
            page.backgroundPattern !== "none" && (
              <div
                className="pointer-events-none absolute inset-0"
                style={patternOverlay(page.backgroundPattern)}
              />
            )}
          {elements.map((el) => (
            <div
              key={el.id}
              data-preview-element-id={el.id}
              className="absolute"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}%`,
                height: el.height ? `${el.height}%` : undefined,
                transform: `rotate(${el.rotation}deg)`,
                ...(el.type === "image"
                  ? undefined
                  : effectsToCss(el.style.effects, el.style.color)),
              }}
            >
              {el.type === "text" && (
                <div
                  className={`flex h-full w-full ${
                    (el.style.verticalAlign ?? "top") === "middle"
                      ? "items-center"
                      : (el.style.verticalAlign ?? "top") === "bottom"
                        ? "items-end"
                        : "items-start"
                  }`}
                >
                  <div
                    className={`w-full whitespace-pre-wrap break-words ${canvasFontFamilyClass(el.style.fontFamily)}`}
                    style={{
                      fontSize: `${el.style.fontSize}px`,
                      fontWeight:
                        el.style.bold || el.style.fontWeight === "bold"
                          ? 700
                          : el.style.fontWeight === "medium"
                            ? 500
                            : 400,
                      ...fillTextStyle(el.style.color),
                      textAlign: el.style.textAlign,
                      lineHeight: el.style.lineHeight,
                      letterSpacing: `${el.style.letterSpacing}px`,
                      fontStyle: el.style.italic ? "italic" : "normal",
                      textDecoration: [
                        el.style.underline || el.href ? "underline" : "",
                        el.style.strike ? "line-through" : "",
                      ]
                        .filter(Boolean)
                        .join(" "),
                    }}
                  >
                    {el.content}
                  </div>
                </div>
              )}
              {el.type === "image" && (
                <CanvasImageContent
                  src={el.content}
                  color={el.style.color}
                  frame={el.style.frame}
                  effects={el.style.effects}
                  imageScale={el.style.imageScale}
                  imageOffsetX={el.style.imageOffsetX}
                  imageOffsetY={el.style.imageOffsetY}
                  className="relative h-full min-h-[24px] w-full"
                />
              )}
              {el.type === "shape" && (
                <ShapeGraphic
                  kind={el.content}
                  color={el.style.color}
                  borderColor={el.style.shapeBorderColor}
                  borderWidth={el.style.shapeBorderWidth}
                />
              )}
              {el.type === "divider" && (
                <PreviewDivider
                  variant={el.content || "solid"}
                  color={el.style.color}
                />
              )}
              {el.type === "widget" && el.widget && (
                <CanvasWidgetView
                  widget={el.widget}
                  elementStyle={el.style}
                  interactive={false}
                  className="h-full w-full"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
