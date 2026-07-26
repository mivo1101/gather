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
import { fillBoxStyle, fillTextStyle } from "@/lib/color-utils";

const DESIGN_WIDTH = 320;

function fontFamilyClass(family: CanvasElement["style"]["fontFamily"]) {
  switch (family) {
    case "caveat":
      return "font-[family-name:var(--font-cursive)]";
    case "urbanist":
      return "font-sans";
    default:
      return "font-[family-name:var(--font-playfair)]";
  }
}

/** Scaled preview of an invitation page — matches editor layout & canvas shape. */
export function InvitationPagePreview({
  page,
  shape = "portrait",
  customSize,
  className = "",
}: {
  page: Pick<InvitationPage, "elements" | "backgroundColor">;
  shape?: InvitationShape;
  customSize?: InvitationCustomSize;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);
  const backgroundColor = page.backgroundColor || "#fff8f4";
  const elements = page.elements ?? [];
  const aspect = cardAspectRatio(shape, customSize);
  const designHeight = useMemo(
    () => DESIGN_WIDTH / Math.max(aspect, 0.001),
    [aspect],
  );

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const update = () => {
      const { width, height } = node.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      setScale(Math.min(width / DESIGN_WIDTH, height / designHeight));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [designHeight]);

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
            width: DESIGN_WIDTH,
            height: designHeight,
            transform: `translate(-50%, -50%) scale(${scale})`,
            ...fillBoxStyle(backgroundColor),
          }}
        >
          {elements.map((el) => (
            <div
              key={el.id}
              className="absolute"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}%`,
                height: el.height ? `${el.height}%` : undefined,
                transform: `rotate(${el.rotation}deg)`,
              }}
            >
              {el.type === "text" && (
                <div
                  className={`whitespace-pre-wrap break-words ${fontFamilyClass(el.style.fontFamily)}`}
                  style={{
                    fontSize: `${el.style.fontSize}px`,
                    fontWeight:
                      el.style.bold || el.style.fontWeight === "bold"
                        ? 700
                        : 400,
                    ...fillTextStyle(el.style.color),
                    textAlign: el.style.textAlign,
                    lineHeight: el.style.lineHeight,
                    letterSpacing: `${el.style.letterSpacing}px`,
                    fontStyle: el.style.italic ? "italic" : "normal",
                  }}
                >
                  {el.content}
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
                <ShapeGraphic kind={el.content} color={el.style.color} />
              )}
              {el.type === "divider" && (
                <div
                  className="h-0.5 w-full rounded-full"
                  style={fillBoxStyle(el.style.color)}
                />
              )}
              {el.type === "widget" && el.widget && (
                <CanvasWidgetView
                  widget={el.widget}
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
