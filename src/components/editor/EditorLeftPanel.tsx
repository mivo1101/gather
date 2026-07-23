"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { CanvasElement } from "@/lib/data/canvas-elements";
import type { InvitationPage } from "@/lib/data/invitation-content";
import {
  isPatternGraphicSrc,
  LIBRARY_ELEMENTS,
  type LibraryElement,
} from "@/lib/data/element-library";
import {
  ElementTile,
  loadElementRecents,
  saveElementRecent,
} from "./ElementsBrowser";
import {
  removeUpload,
  subscribeUploads,
  type UploadRecord,
} from "./panels/ToolPanels";
import { ChevronLeftIcon, TrashIcon } from "./editor-icons";
import { CustomSizeModal } from "./CustomSizeModal";
import {
  formatCustomSize,
  INVITATION_SHAPES,
  type CustomCanvasSize,
  type EditorToolId,
  type InvitationShape,
} from "./editor-types";
import { EmptyHint } from "./panels/shared";

interface EditorLeftPanelProps {
  activeTool: EditorToolId;
  selectedShape: InvitationShape;
  customSize: CustomCanvasSize;
  pages: InvitationPage[];
  allElements: CanvasElement[];
  onShapeChange: (shape: InvitationShape) => void;
  onCustomSizeChange: (size: CustomCanvasSize) => void;
  onAddText: (preset?: "heading" | "subheading" | "body") => void;
  onAddLibraryElement: (item: LibraryElement) => void;
  onAddImageSrc: (src: string) => void;
  onCollapse: () => void;
}

function ShapePreview({
  shape,
  customSize,
}: {
  shape: InvitationShape;
  customSize?: CustomCanvasSize;
}) {
  if (shape === "custom" && customSize) {
    const aspect = customSize.width / Math.max(customSize.height, 0.001);
    const max = 56;
    const w = aspect >= 1 ? max : max * aspect;
    const h = aspect >= 1 ? max / aspect : max;
    return (
      <div className="flex h-16 items-center justify-center">
        <div
          className="rounded-md border-2 border-dashed border-current/40"
          style={{ width: w, height: h }}
        />
      </div>
    );
  }

  const box =
    shape === "portrait"
      ? "h-14 w-9"
      : shape === "landscape"
        ? "h-8 w-14"
        : shape === "square"
          ? "h-10 w-10"
          : "h-10 w-12 border-dashed";

  return (
    <div className="flex h-16 items-center justify-center">
      <div className={`rounded-md border-2 border-current/40 ${box}`} />
    </div>
  );
}

function LayoutPanel({
  selectedShape,
  customSize,
  onShapeChange,
  onCustomSizeChange,
}: {
  selectedShape: InvitationShape;
  customSize: CustomCanvasSize;
  onShapeChange: (shape: InvitationShape) => void;
  onCustomSizeChange: (size: CustomCanvasSize) => void;
}) {
  const [customOpen, setCustomOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-black">
          Select Invitation Shape
        </h2>
        <p className="mt-1 text-sm text-grey">You can change this later.</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {INVITATION_SHAPES.map((shape) => {
          const selected = selectedShape === shape.id;
          const sizeLabel =
            shape.id === "custom" && selectedShape === "custom"
              ? formatCustomSize(customSize)
              : shape.size;
          return (
            <button
              key={shape.id}
              type="button"
              onClick={() => {
                if (shape.id === "custom") {
                  setCustomOpen(true);
                  return;
                }
                onShapeChange(shape.id);
              }}
              className={`rounded-2xl border p-3 text-left transition-colors ${
                selected
                  ? "border-signature bg-signature/10 text-black"
                  : "border-black/10 bg-white text-grey hover:border-black/20 hover:text-black"
              }`}
              aria-pressed={selected}
            >
              <ShapePreview shape={shape.id} customSize={customSize} />
              <p className="mt-1 text-sm font-semibold text-black">
                {shape.label}
              </p>
              <p className="text-[11px] text-grey">{sizeLabel}</p>
            </button>
          );
        })}
      </div>

      <CustomSizeModal
        open={customOpen}
        initial={customSize}
        onClose={() => setCustomOpen(false)}
        onApply={(size) => {
          onCustomSizeChange(size);
          onShapeChange("custom");
          setCustomOpen(false);
        }}
      />
    </div>
  );
}

function ElementsRecentsPanel({
  onAddLibraryElement,
}: {
  onAddLibraryElement: (item: LibraryElement) => void;
}) {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentIds(loadElementRecents());
  }, []);

  const recents = useMemo(
    () =>
      recentIds
        .map((id) => LIBRARY_ELEMENTS.find((item) => item.id === id))
        .filter((item): item is LibraryElement => Boolean(item)),
    [recentIds],
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-black">Elements</h2>
        <p className="mt-1 text-sm text-grey">Recently used</p>
      </div>
      {recents.length === 0 ? (
        <EmptyHint>
          Browse and add elements from the right panel — they&apos;ll show up
          here.
        </EmptyHint>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {recents.map((item) => (
            <div key={item.id} className="h-[88px]">
              <ElementTile
                item={item}
                size="sm"
                onSelect={(next) => {
                  saveElementRecent(next.id);
                  setRecentIds(loadElementRecents());
                  onAddLibraryElement(next);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TextPresetsPanel({
  onAddText,
}: {
  onAddText: (preset?: "heading" | "subheading" | "body") => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-black">Text</h2>
        <p className="mt-1 text-sm text-grey">
          Add a text box, then style it on the right.
        </p>
      </div>
      <button
        type="button"
        onClick={() => onAddText()}
        className="w-full rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-black/90"
      >
        + Add text
      </button>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-grey">
          Presets
        </p>
        {(
          [
            ["heading", "Heading", "text-xl font-[family-name:var(--font-playfair)]"],
            ["subheading", "Subheading", "text-base font-semibold"],
            ["body", "Body", "text-sm"],
          ] as const
        ).map(([id, label, className]) => (
          <button
            key={id}
            type="button"
            onClick={() => onAddText(id)}
            className={`w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-left text-black hover:border-signature/40 ${className}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ImagesRecentsPanel({
  allElements,
  onAddImageSrc,
}: {
  allElements: CanvasElement[];
  onAddImageSrc: (src: string) => void;
}) {
  const used = useMemo(() => {
    const seen = new Set<string>();
    const items: { src: string; name: string }[] = [];
    for (const el of allElements) {
      if (el.type !== "image" || !el.content || seen.has(el.content)) continue;
      // Patterns (flowers etc.) live under Elements — Images is photos/videos
      if (isPatternGraphicSrc(el.content)) continue;
      seen.add(el.content);
      items.push({ src: el.content, name: "Photo" });
    }
    return items;
  }, [allElements]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-black">Images</h2>
        <p className="mt-1 text-sm text-grey">Recently used photos &amp; video</p>
      </div>
      {used.length === 0 ? (
        <EmptyHint>
          Photos and videos you place on any card appear here. Floral artwork is
          under Elements → Patterns.
        </EmptyHint>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {used.map((item) => (
            <button
              key={item.src}
              type="button"
              onClick={() => onAddImageSrc(item.src)}
              className="overflow-hidden rounded-xl border border-black/8 hover:border-signature/40"
            >
              <div className="relative flex aspect-square items-center justify-center bg-soft-grey/60 p-2">
                <Image
                  src={item.src}
                  alt=""
                  width={96}
                  height={96}
                  className="max-h-full max-w-full object-cover"
                />
              </div>
              <span className="block truncate px-2 py-1.5 text-[10px] font-semibold text-grey">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UploadsRecentsPanel({
  onAddImageSrc,
}: {
  onAddImageSrc: (src: string) => void;
}) {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  useEffect(() => subscribeUploads(setUploads), []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-black">Uploads</h2>
        <p className="mt-1 text-sm text-grey">Recently uploaded</p>
      </div>
      {uploads.length === 0 ? (
        <EmptyHint>Upload files from the right panel.</EmptyHint>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {uploads.slice(0, 12).map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl border border-black/8 text-left hover:border-signature/40"
            >
              <button
                type="button"
                onClick={() => {
                  if (item.kind === "image") onAddImageSrc(item.url);
                }}
                className="w-full text-left"
              >
                <div className="flex aspect-square items-center justify-center bg-soft-grey/60 p-2 text-[10px] font-semibold text-grey">
                  {item.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    item.kind
                  )}
                </div>
                <span className="block truncate px-2 py-1.5 text-[10px] font-semibold text-grey">
                  {item.name}
                </span>
              </button>
              <button
                type="button"
                aria-label={`Delete ${item.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  removeUpload(item.id);
                }}
                className="absolute right-1.5 top-1.5 rounded-full bg-white/95 p-1.5 text-grey opacity-0 shadow-sm ring-1 ring-black/5 transition-opacity hover:text-black group-hover:opacity-100 focus-visible:opacity-100"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BackgroundSummaryPanel({ pages }: { pages: InvitationPage[] }) {
  const colours = useMemo(() => {
    return Array.from(new Set(pages.map((p) => p.backgroundColor)));
  }, [pages]);
  const patterns = useMemo(() => {
    return Array.from(
      new Set(pages.map((p) => p.backgroundPattern || "none")),
    );
  }, [pages]);
  const borders = useMemo(() => {
    return pages
      .map((p) => p.border)
      .filter((b): b is NonNullable<InvitationPage["border"]> =>
        Boolean(b && b.style !== "none"),
      );
  }, [pages]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-black">Background</h2>
        <p className="mt-1 text-sm text-grey">
          Summary across all cards in this invitation
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-grey">
          Colours
        </p>
        <div className="flex flex-wrap gap-2">
          {colours.map((color) => (
            <span
              key={color}
              className="flex items-center gap-1.5 rounded-full border border-black/10 px-2 py-1 text-[11px] font-semibold text-grey"
            >
              <span
                className="h-3.5 w-3.5 rounded-full border border-black/10"
                style={{ backgroundColor: color }}
              />
              {color}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-grey">
          Bg patterns
        </p>
        <div className="flex flex-wrap gap-1.5">
          {patterns.map((pattern) => (
            <span
              key={pattern}
              className="rounded-full bg-soft-grey px-2.5 py-1 text-[11px] font-semibold capitalize text-grey"
            >
              {pattern}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-grey">
          Border
        </p>
        {borders.length === 0 ? (
          <p className="text-sm text-grey">No borders yet</p>
        ) : (
          <div className="space-y-1.5">
            {borders.map((border, i) => (
              <p key={i} className="text-sm text-grey">
                {border.style} · {border.color} · {border.width}px
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function EditorLeftPanel({
  activeTool,
  selectedShape,
  customSize,
  pages,
  allElements,
  onShapeChange,
  onCustomSizeChange,
  onAddText,
  onAddLibraryElement,
  onAddImageSrc,
  onCollapse,
}: EditorLeftPanelProps) {
  return (
    <aside className="relative flex w-72 shrink-0 flex-col border-r border-black/5 bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-black/5 px-3 py-2">
        <span className="text-xs font-semibold capitalize text-grey">
          {activeTool}
        </span>
        <button
          type="button"
          onClick={onCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-grey hover:bg-soft-grey hover:text-black"
          aria-label="Hide sidebar"
          title="Hide sidebar"
        >
          <ChevronLeftIcon />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {activeTool === "layout" ? (
          <LayoutPanel
            selectedShape={selectedShape}
            customSize={customSize}
            onShapeChange={onShapeChange}
            onCustomSizeChange={onCustomSizeChange}
          />
        ) : activeTool === "elements" ? (
          <ElementsRecentsPanel onAddLibraryElement={onAddLibraryElement} />
        ) : activeTool === "text" ? (
          <TextPresetsPanel onAddText={onAddText} />
        ) : activeTool === "images" ? (
          <ImagesRecentsPanel
            allElements={allElements}
            onAddImageSrc={onAddImageSrc}
          />
        ) : activeTool === "uploads" ? (
          <UploadsRecentsPanel onAddImageSrc={onAddImageSrc} />
        ) : activeTool === "background" ? (
          <BackgroundSummaryPanel pages={pages} />
        ) : (
          <div>
            <h2 className="text-base font-semibold capitalize text-black">
              {activeTool}
            </h2>
            <p className="mt-2 text-sm text-grey">
              Use the right panel and canvas controls to continue designing.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
