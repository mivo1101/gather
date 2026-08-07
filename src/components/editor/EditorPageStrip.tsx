"use client";

import type { CanvasElement } from "@/lib/data/canvas-elements";
import {
  invitationPageRoleLabel,
  type InvitationPage,
} from "@/lib/data/invitation-content";
import { canvasFontFamilyClass } from "@/lib/canvas-fonts";
import { paperTextureLayerStyle } from "@/lib/paper-textures";
import { CanvasImageContent, cardAspectRatio } from "./CanvasImageContent";
import { CanvasWidgetView } from "./CanvasWidgetView";
import { ChevronLeftIcon, FitIcon, PlusIcon, TrashIcon } from "./editor-icons";
import type { CustomCanvasSize, InvitationShape } from "./editor-types";
import { ShapeGraphic } from "./ShapeGraphic";
import { designCanvasSize } from "./canvas-metrics";

const THUMB_MAX_EDGE = 78;

function thumbnailMetrics(
  shape: InvitationShape,
  customSize: CustomCanvasSize,
) {
  const aspect = cardAspectRatio(shape, customSize);
  const landscapeOrSquare = aspect >= 1;
  const width = landscapeOrSquare
    ? THUMB_MAX_EDGE
    : Math.round(THUMB_MAX_EDGE * aspect);
  const height = landscapeOrSquare
    ? Math.round(THUMB_MAX_EDGE / aspect)
    : THUMB_MAX_EDGE;
  const designSize = designCanvasSize(aspect);
  const cardWidth = designSize.width;
  const cardHeight = designSize.height;

  return {
    width,
    height,
    cardWidth,
    cardHeight,
    scale: width / cardWidth,
  };
}

/**
 * Renders the page at full card proportions, then scales it down.
 * That keeps layout identical to the canvas (not a denser reflow).
 */
function PageThumbnail({
  page,
  metrics,
}: {
  page: InvitationPage;
  metrics: ReturnType<typeof thumbnailMetrics>;
}) {
  const backgroundColor = page.backgroundColor || "#fff8f4";
  const elements = page.elements;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor }}
      aria-hidden="true"
    >
      {page.backgroundTexture && page.backgroundTexture !== "none" && (
        <div
          className="pointer-events-none absolute inset-0"
          data-paper-texture={page.backgroundTexture}
          style={{
            ...paperTextureLayerStyle({
              texture: page.backgroundTexture,
              opacity: page.backgroundTextureOpacity ?? 22,
              tint: page.backgroundTextureTint || "#ffffff",
              blend: page.backgroundTextureBlend || "soft-light",
            }),
            backgroundSize: "64px",
          }}
        />
      )}
      <div
        className="origin-top-left"
        style={{
          width: metrics.cardWidth,
          height: metrics.cardHeight,
          transform: `scale(${metrics.scale})`,
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
                className={`whitespace-pre-wrap break-words ${canvasFontFamilyClass(el.style.fontFamily)}`}
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
                effects={el.style.effects}
                imageScale={el.style.imageScale}
                imageOffsetX={el.style.imageOffsetX}
                imageOffsetY={el.style.imageOffsetY}
                className="relative h-full min-h-[40px] w-full"
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
              <div
                className="h-0.5 w-full rounded-full"
                style={{ backgroundColor: el.style.color }}
              />
            )}
            {el.type === "widget" && el.widget && (
              <CanvasWidgetView
                widget={el.widget}
                elementStyle={el.style}
                surfaceColor={backgroundColor}
                interactive={false}
                className="h-full w-full"
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
  shape: InvitationShape;
  customSize: CustomCanvasSize;
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
  shape,
  customSize,
  onSelectPage,
  onAddPage,
  onDeletePage,
}: EditorPageStripProps) {
  const metrics = thumbnailMetrics(shape, customSize);

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
          {pages.map((page) => {
            const active = page.id === activePageId;
            const roleLabel = invitationPageRoleLabel(page.role);
            return (
              <div
                key={page.id}
                className="group relative flex shrink-0 flex-col items-center gap-1"
              >
                <button
                  type="button"
                  onClick={() => onSelectPage(page.id)}
                  className={`relative overflow-hidden rounded-lg ${
                    active
                      ? "border-2 border-signature"
                      : "border border-black/10 hover:border-signature/40"
                  }`}
                  style={{ width: metrics.width, height: metrics.height }}
                  aria-current={active ? "page" : undefined}
                  aria-label={`${roleLabel}: ${page.name}`}
                >
                  <PageThumbnail page={page} metrics={metrics} />
                </button>
                <span
                  className={`max-w-[78px] truncate text-[10px] font-semibold leading-none ${
                    active ? "text-signature" : "text-grey"
                  }`}
                >
                  {roleLabel}
                </span>
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

          <div className="flex shrink-0 flex-col items-center gap-1">
            <button
              type="button"
              onClick={onAddPage}
              className="flex shrink-0 items-center justify-center rounded-lg border border-dashed border-black/20 text-grey transition-colors hover:border-signature/40 hover:text-signature"
              style={{ width: metrics.width, height: metrics.height }}
              aria-label="Add details page"
            >
              <PlusIcon />
            </button>
            <span className="text-[10px] font-semibold leading-none text-grey">
              Add page
            </span>
          </div>
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
