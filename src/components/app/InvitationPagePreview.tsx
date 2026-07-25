"use client";

import { useEffect, useRef, useState } from "react";
import type { CanvasElement } from "@/lib/data/canvas-elements";
import type { InvitationPage } from "@/lib/data/invitation-content";
import { CanvasImageContent } from "@/components/editor/CanvasImageContent";
import { ShapeGraphic } from "@/components/editor/ShapeGraphic";

const DESIGN_WIDTH = 320;
const DESIGN_HEIGHT = DESIGN_WIDTH * (16 / 9);

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

/** Scaled preview of an invitation page — matches editor layout. */
export function InvitationPagePreview({
  page,
  className = "",
}: {
  page: Pick<InvitationPage, "elements" | "backgroundColor">;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);
  const backgroundColor = page.backgroundColor || "#fff8f4";
  const elements = page.elements ?? [];

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const update = () => {
      const { width, height } = node.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      setScale(Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor }}
      aria-hidden="true"
    >
      {elements.length === 0 ? (
        <div className="absolute inset-0 bg-gradient-to-br from-soft-grey to-sugar-milk" />
      ) : (
        <div
          className="absolute left-1/2 top-1/2 origin-center"
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `translate(-50%, -50%) scale(${scale})`,
            backgroundColor,
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
                    color: el.style.color,
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
                  className="relative h-full min-h-[24px] w-full"
                />
              )}
              {el.type === "shape" && (
                <ShapeGraphic kind={el.content} color={el.style.color} />
              )}
              {el.type === "divider" && (
                <div
                  className="h-0.5 w-full rounded-full"
                  style={{ backgroundColor: el.style.color }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
