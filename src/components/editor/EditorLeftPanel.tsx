"use client";

import { useMemo, useState } from "react";
import type { WidgetKind } from "@/lib/data/canvas-elements";
import type { InvitationPage } from "@/lib/data/invitation-content";
import type { LibraryElement } from "@/lib/data/element-library";
import {
  ToolElementsPanel,
  ToolImagesPanel,
  ToolUploadsPanel,
} from "./panels/ToolPanels";
import { ToolInteractivePanel } from "./panels/ToolInteractivePanel";
import { ToolTemplatesPanel } from "./panels/ToolTemplatesPanel";
import { ChevronLeftIcon } from "./editor-icons";
import { CustomSizeModal } from "./CustomSizeModal";
import {
  formatCustomSize,
  INVITATION_SHAPES,
  type CustomCanvasSize,
  type EditorToolId,
  type InvitationShape,
} from "./editor-types";
import type { InvitationTemplate } from "@/lib/data/invitation-templates";
import {
  clearInsertDragData,
  setInsertDragData,
} from "@/lib/editor-insert-dnd";

interface EditorLeftPanelProps {
  activeTool: EditorToolId;
  selectedShape: InvitationShape;
  customSize: CustomCanvasSize;
  customSizeOpen?: boolean;
  onCustomSizeOpenChange?: (open: boolean) => void;
  pages: InvitationPage[];
  defaultElementColor: string;
  onDefaultElementColorChange: (color: string) => void;
  onShapeChange: (shape: InvitationShape) => void;
  onCustomSizeChange: (size: CustomCanvasSize) => void;
  onAddText: (preset?: "heading" | "subheading" | "body") => void;
  onAddLibraryElement: (item: LibraryElement) => void;
  onAddImageSrc: (src: string) => void;
  onAddWidget: (kind: WidgetKind) => void;
  onApplyTemplate: (template: InvitationTemplate) => void;
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
  customSizeOpen,
  onCustomSizeOpenChange,
  onShapeChange,
  onCustomSizeChange,
}: {
  selectedShape: InvitationShape;
  customSize: CustomCanvasSize;
  customSizeOpen?: boolean;
  onCustomSizeOpenChange?: (open: boolean) => void;
  onShapeChange: (shape: InvitationShape) => void;
  onCustomSizeChange: (size: CustomCanvasSize) => void;
}) {
  const [internalCustomOpen, setInternalCustomOpen] = useState(false);
  const customOpen = customSizeOpen ?? internalCustomOpen;
  const setCustomOpen = onCustomSizeOpenChange ?? setInternalCustomOpen;

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
          setCustomOpen(false);
        }}
      />
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
          Click or drag a text box onto the canvas, then style it on the right.
        </p>
      </div>
      <button
        type="button"
        draggable
        onClick={() => onAddText()}
        onDragStart={(event) => {
          setInsertDragData(event.dataTransfer, { type: "text" });
        }}
        onDragEnd={() => clearInsertDragData()}
        className="w-full cursor-grab rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-black/90 active:cursor-grabbing"
      >
        + Add text
      </button>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-grey">
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
            draggable
            onClick={() => onAddText(id)}
            onDragStart={(event) => {
              setInsertDragData(event.dataTransfer, { type: "text", preset: id });
            }}
            onDragEnd={() => clearInsertDragData()}
            className={`w-full cursor-grab rounded-xl border border-black/10 bg-white px-3 py-3 text-left text-black hover:border-signature/40 active:cursor-grabbing ${className}`}
          >
            {label}
          </button>
        ))}
      </div>
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
  const textures = useMemo(() => {
    return Array.from(
      new Set(pages.map((p) => p.backgroundTexture || "none")),
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
          Click the card to edit colour, pattern, and border on the right.
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-grey">
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
        <p className="mb-2 text-[11px] font-medium tracking-wide text-grey">
          Background patterns
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
        <p className="mb-2 text-[11px] font-medium tracking-wide text-grey">
          Paper textures
        </p>
        <div className="flex flex-wrap gap-1.5">
          {textures.map((texture) => (
            <span
              key={texture}
              className="rounded-full bg-soft-grey px-2.5 py-1 text-[11px] font-semibold capitalize text-grey"
            >
              {texture}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-grey">
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
  customSizeOpen,
  onCustomSizeOpenChange,
  pages,
  defaultElementColor,
  onDefaultElementColorChange,
  onShapeChange,
  onCustomSizeChange,
  onAddText,
  onAddLibraryElement,
  onAddImageSrc,
  onAddWidget,
  onApplyTemplate,
  onCollapse,
}: EditorLeftPanelProps) {
  return (
    <aside className="relative z-10 flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
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
            customSizeOpen={customSizeOpen}
            onCustomSizeOpenChange={onCustomSizeOpenChange}
            onShapeChange={onShapeChange}
            onCustomSizeChange={onCustomSizeChange}
          />
        ) : activeTool === "elements" ? (
          <ToolElementsPanel
            defaultColor={defaultElementColor}
            onDefaultColorChange={onDefaultElementColorChange}
            onAddLibraryElement={onAddLibraryElement}
          />
        ) : activeTool === "text" ? (
          <TextPresetsPanel onAddText={onAddText} />
        ) : activeTool === "images" ? (
          <ToolImagesPanel onAddImageSrc={onAddImageSrc} />
        ) : activeTool === "uploads" ? (
          <ToolUploadsPanel onAddImageSrc={(src) => onAddImageSrc(src)} />
        ) : activeTool === "interactive" ? (
          <ToolInteractivePanel onAddWidget={onAddWidget} />
        ) : activeTool === "templates" ? (
          <ToolTemplatesPanel onApplyTemplate={onApplyTemplate} />
        ) : activeTool === "background" ? (
          <BackgroundSummaryPanel pages={pages} />
        ) : (
          <div>
            <h2 className="text-base font-semibold capitalize text-black">
              {activeTool}
            </h2>
            <p className="mt-2 text-sm text-grey">
              Use the right panel to style the selected element.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
