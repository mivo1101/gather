"use client";

import type { CanvasElement } from "@/lib/data/canvas-elements";
import type { InvitationPage } from "@/lib/data/invitation-content";
import { CanvasImageContent } from "./CanvasImageContent";
import { ChevronLeftIcon, FitIcon, PlusIcon, TrashIcon } from "./editor-icons";
import { ShapeGraphic } from "./ShapeGraphic";

const THUMB_WIDTH = 44;
/** Full card width used before CSS scale — matches portrait canvas */
const CARD_WIDTH = 320;
const CARD_HEIGHT = CARD_WIDTH * (16 / 9);
const SCALE = THUMB_WIDTH / CARD_WIDTH;
const THUMB_HEIGHT = Math.round(CARD_HEIGHT * SCALE);

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

/**
 * Renders the page at full card proportions, then scales it down.
 * That keeps layout identical to the canvas (not a denser reflow).
 */
function PageThumbnail({
  elements,
  backgroundColor,
}: {
  elements: CanvasElement[];
  backgroundColor: string;
}) {
  const cardHeight = CARD_HEIGHT;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor }}
      aria-hidden="true"
    >
      <div
        className="origin-top-left"
        style={{
          width: CARD_WIDTH,
          height: cardHeight,
          transform: `scale(${SCALE})`,
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
                    el.style.bold || el.style.fontWeight === "bold" ? 700 : 400,
                  color: el.style.color,
                  textAlign: el.style.textAlign,
                  lineHeight: el.style.lineHeight,
                  letterSpacing: `${el.style.letterSpacing}px`,
                  fontStyle: el.style.italic ? "italic" : "normal",
                  textDecoration: [
                    el.style.underline ? "underline" : "",
                    el.style.strike ? "line-through" : "",
                  ]
                    .filter(Boolean)
                    .join(" "),
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
                className="relative h-full min-h-[40px] w-full"
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
    </div>
  );
}

interface EditorPageStripProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFullscreenPreview: () => void;
  pages: InvitationPage[];
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
}

export function EditorPageStrip({
  collapsed,
  onToggleCollapse,
  zoom,
  onZoomChange,
  onFullscreenPreview,
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
}: EditorPageStripProps) {
  if (collapsed) {
    return (
      <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center border-t border-black/5 bg-white/95 px-4 py-2 backdrop-blur">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-black hover:bg-soft-grey"
        >
          Show pages ({pages.length})
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 border-t border-black/5 bg-white/95 px-3 py-2.5 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-grey hover:bg-soft-grey hover:text-black"
          aria-label="Collapse pages"
        >
          <ChevronLeftIcon />
        </button>

        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          {pages.map((page, index) => {
            const active = page.id === activePageId;
            return (
              <div key={page.id} className="group relative shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectPage(page.id)}
                  className={`relative overflow-hidden rounded-lg ${
                    active
                      ? "border-2 border-signature"
                      : "border border-black/10 hover:border-signature/40"
                  }`}
                  style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
                  aria-current={active ? "page" : undefined}
                  aria-label={page.name}
                >
                  <PageThumbnail
                    elements={page.elements}
                    backgroundColor={page.backgroundColor || "#fff8f4"}
                  />
                  <span className="absolute inset-x-0 bottom-0 z-10 bg-black/45 py-0.5 text-center text-[9px] font-semibold text-white">
                    {index + 1}
                  </span>
                </button>
                {pages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeletePage(page.id)}
                    className="absolute -right-1 -top-1 z-20 hidden h-5 w-5 items-center justify-center rounded-full bg-white text-grey shadow group-hover:flex hover:text-signature"
                    aria-label={`Delete ${page.name}`}
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={onAddPage}
            className="flex shrink-0 items-center justify-center rounded-lg border border-dashed border-black/20 text-grey transition-colors hover:border-signature/40 hover:text-signature"
            style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
            aria-label="Add page"
          >
            <PlusIcon />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(40, zoom - 10))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-grey hover:bg-soft-grey hover:text-black"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="min-w-[2.5rem] text-center text-xs font-semibold text-black">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(200, zoom + 10))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-grey hover:bg-soft-grey hover:text-black"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={onFullscreenPreview}
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-grey hover:bg-soft-grey hover:text-black"
            aria-label="Full-screen preview"
            title="Full-screen preview"
          >
            <FitIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
