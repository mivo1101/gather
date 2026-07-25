"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { CanvasElement } from "@/lib/data/canvas-elements";
import { widgetKindLabel } from "@/lib/data/canvas-elements";
import type { InvitationPage } from "@/lib/data/invitation-content";
import {
  DuplicateIcon,
  GridIcon,
  LockIcon,
  MoreIcon,
  PencilIcon,
  RotateIcon,
  TrashIcon,
} from "./editor-icons";
import type {
  CustomCanvasSize,
  InvitationShape,
} from "./editor-types";
import {
  CanvasImageContent,
  cardAspectRatio,
  clampImageFit,
  isSquareFrame,
  normalizeImageOffset,
  normalizeImageScale,
} from "./CanvasImageContent";
import { CanvasWidgetView } from "./CanvasWidgetView";
import { isPatternGraphicSrc } from "@/lib/data/element-library";
import { ShapeGraphic } from "./ShapeGraphic";
import {
  fillBoxStyle,
  fillTextStyle,
  isGradient,
  normalizeHex,
} from "@/lib/color-utils";
import { effectsToCss } from "@/lib/element-effects";

function effectStyle(el: CanvasElement): CSSProperties {
  return effectsToCss(el.style.effects, el.style.color);
}

function patternOverlay(
  pattern: NonNullable<InvitationPage["backgroundPattern"]>,
): CSSProperties | null {
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
      return null;
  }
}

function ShapeElementView({ kind, color }: { kind: string; color: string }) {
  return <ShapeGraphic kind={kind} color={color} />;
}

function DividerElementView({
  variant,
  color,
}: {
  variant: string;
  color: string;
}) {
  const solid = isGradient(color) ? normalizeHex("#1F2D22") : color;
  const box = fillBoxStyle(color);

  if (variant === "dashed") {
    return (
      <div
        className="w-full border-t-2 border-dashed"
        style={{ borderColor: solid }}
      />
    );
  }
  if (variant === "dotted") {
    return (
      <div
        className="w-full border-t-2 border-dotted"
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
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full" style={box} />
        ))}
      </div>
    );
  }
  if (variant === "diamond") {
    return (
      <div className="flex w-full items-center gap-2">
        <span className="h-px flex-1" style={box} />
        <span className="h-2 w-2 rotate-45" style={box} />
        <span className="h-px flex-1" style={box} />
      </div>
    );
  }
  return <div className="h-0.5 w-full rounded-full" style={box} />;
}

interface EditorCanvasProps {
  shape: InvitationShape;
  customSize?: CustomCanvasSize;
  elements: CanvasElement[];
  selectedId: string | null;
  editingId: string | null;
  showGrid: boolean;
  zoom: number;
  backgroundColor: string;
  backgroundPattern?: NonNullable<InvitationPage["backgroundPattern"]>;
  border?: InvitationPage["border"];
  canvasSelected: boolean;
  onToggleGrid: () => void;
  onSelect: (id: string | null) => void;
  onSelectCanvas: () => void;
  onClearSelection: () => void;
  onStartEdit: (id: string) => void;
  onStopEdit: () => void;
  onChangeElement: (id: string, patch: Partial<CanvasElement>) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRotate: (id: string) => void;
  /** Called before a mutating interaction so the parent can snapshot history */
  onBeforeChange?: () => void;
}

function fontFamilyClass(family: CanvasElement["style"]["fontFamily"]) {
  switch (family) {
    case "caveat":
      return "font-[family-name:var(--font-cursive)]";
    case "urbanist":
      return "font-sans";
    case "playfair":
    default:
      return "font-[family-name:var(--font-playfair)]";
  }
}

function fontWeightValue(style: CanvasElement["style"]) {
  if (style.bold || style.fontWeight === "bold") return 700;
  if (style.fontWeight === "medium") return 500;
  return 400;
}

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
type DragMode = "move" | "resize" | "pan-image" | "scale-image";

export function EditorCanvas({
  shape,
  customSize,
  elements,
  selectedId,
  editingId,
  showGrid,
  zoom,
  backgroundColor,
  backgroundPattern = "none",
  border = null,
  canvasSelected,
  onToggleGrid,
  onSelect,
  onSelectCanvas,
  onClearSelection,
  onStartEdit,
  onStopEdit,
  onChangeElement,
  onDuplicate,
  onDelete,
  onToggleLock,
  onRotate,
  onBeforeChange,
}: EditorCanvasProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const photoFitIdsRef = useRef(new Set<string>());
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    elementId: string;
  } | null>(null);
  const [linkPrompt, setLinkPrompt] = useState<{
    elementId: string;
    value: string;
  } | null>(null);
  const dragRef = useRef<{
    id: string;
    mode: DragMode;
    handle: ResizeHandle;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
    origScale: number;
    origOffsetX: number;
    origOffsetY: number;
  } | null>(null);

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [contextMenu]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const update = () => {
      setViewportSize({
        width: node.clientWidth,
        height: node.clientHeight,
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const aspect = cardAspectRatio(shape, customSize);
  const zoomScale = zoom / 100;
  const uiScale = zoom > 0 ? 100 / zoom : 1;

  // 100% = card fits the workspace with breathing room for chrome
  const fitSize = useMemo(() => {
    const isTall = aspect < 0.95; // portrait / tall custom
    const padX = isTall ? 112 : 120;
    // Tall cards are height-limited — leave clearer top/bottom margin
    const padY = isTall ? 140 : 88;
    const availW = Math.max(160, viewportSize.width - padX);
    const availH = Math.max(160, viewportSize.height - padY);
    // Portrait shouldn't fill the full column; keep ~same visual gaps as landscape
    const maxH = isTall ? availH * 0.9 : availH;
    let width = availW;
    let height = width / aspect;
    if (height > maxH) {
      height = maxH;
      width = height * aspect;
    }
    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }, [aspect, viewportSize.height, viewportSize.width]);

  const clientToPercent = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const el = elements.find((item) => item.id === drag.id);
      if (!el || el.locked) return;

      const current = clientToPercent(event.clientX, event.clientY);
      const dx = current.x - drag.startX;
      const dy = current.y - drag.startY;

      if (drag.mode === "move") {
        onChangeElement(drag.id, {
          x: Math.min(95, Math.max(-20, drag.origX + dx)),
          y: Math.min(95, Math.max(-20, drag.origY + dy)),
        });
      } else if (drag.mode === "pan-image") {
        // dx/dy are in card %; convert roughly to frame-relative %
        const frameW = Math.max(1, drag.origW);
        const frameH = Math.max(1, drag.origH);
        const fit = clampImageFit({
          imageScale: drag.origScale,
          imageOffsetX: drag.origOffsetX + (dx / frameW) * 100,
          imageOffsetY: drag.origOffsetY + (dy / frameH) * 100,
        });
        onChangeElement(drag.id, {
          style: {
            ...el.style,
            ...fit,
          },
        });
      } else if (drag.mode === "scale-image") {
        // Outward drag on any corner should zoom in.
        const sx = drag.handle.includes("w") ? -1 : 1;
        const sy = drag.handle.includes("n") ? -1 : 1;
        const delta =
          (sx * (dx / Math.max(1, drag.origW)) +
            sy * (dy / Math.max(1, drag.origH))) /
          2;
        const fit = clampImageFit({
          imageScale: drag.origScale * (1 + delta * 1.5),
          imageOffsetX: drag.origOffsetX,
          imageOffsetY: drag.origOffsetY,
        });
        onChangeElement(drag.id, {
          style: {
            ...el.style,
            ...fit,
          },
        });
      } else {
        const keepRatio = el.type === "image";
        const forceVisualSquare =
          el.type === "image" && isSquareFrame(el.style.frame);
        let nextW = drag.origW;
        let nextH = drag.origH;
        let nextX = drag.origX;
        let nextY = drag.origY;

        if (drag.handle.includes("e")) {
          nextW = Math.min(100, Math.max(8, drag.origW + dx));
        }
        if (drag.handle.includes("w")) {
          nextW = Math.min(100, Math.max(8, drag.origW - dx));
          nextX = drag.origX + (drag.origW - nextW);
        }
        if (drag.handle.includes("s")) {
          nextH = Math.min(100, Math.max(6, drag.origH + dy));
        }
        if (drag.handle.includes("n")) {
          nextH = Math.min(100, Math.max(6, drag.origH - dy));
          nextY = drag.origY + (drag.origH - nextH);
        }

        if (keepRatio && drag.origW > 0 && drag.origH > 0) {
          const cardAspect = cardAspectRatio(shape, customSize);
          const ratio = forceVisualSquare
            ? cardAspect
            : drag.origH / drag.origW;
          if (
            drag.handle === "e" ||
            drag.handle === "w" ||
            drag.handle === "se" ||
            drag.handle === "ne"
          ) {
            nextH = Math.min(100, Math.max(6, nextW * ratio));
            if (drag.handle.includes("n")) {
              nextY = drag.origY + (drag.origH - nextH);
            }
            if (drag.handle.includes("w")) {
              nextX = drag.origX + (drag.origW - nextW);
            }
          } else {
            nextW = Math.min(100, Math.max(8, nextH / Math.max(ratio, 0.001)));
            if (drag.handle.includes("w")) {
              nextX = drag.origX + (drag.origW - nextW);
            }
            if (drag.handle.includes("n")) {
              nextY = drag.origY + (drag.origH - nextH);
            }
          }
        }

        onChangeElement(drag.id, {
          x: nextX,
          y: nextY,
          width: nextW,
          height:
            el.type === "text" && !el.height ? el.height : nextH,
        });
      }
    },
    [clientToPercent, customSize, elements, onChangeElement, shape],
  );

  const endDrag = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
    };
  }, [endDrag, onPointerMove]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (editingId && event.key === "Escape") {
        event.preventDefault();
        onStopEdit();
        return;
      }
      if (!selectedId || editingId) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (canvasSelected) {
        if (event.key === "Escape") {
          onClearSelection();
          onStopEdit();
        }
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        onDelete(selectedId);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        onDuplicate(selectedId);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        const selected = elements.find((el) => el.id === selectedId);
        if (selected?.type === "text") {
          event.preventDefault();
          setLinkPrompt({
            elementId: selected.id,
            value: selected.href || "",
          });
        }
      }
      if (event.key === "Escape") {
        onClearSelection();
        onStopEdit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    canvasSelected,
    editingId,
    elements,
    onClearSelection,
    onDelete,
    onDuplicate,
    onStopEdit,
    selectedId,
  ]);

  const startDrag = (
    event: ReactPointerEvent,
    id: string,
    mode: DragMode,
    handle: ResizeHandle = "se",
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const el = elements.find((item) => item.id === id);
    if (!el) return;
    onSelect(id);
    if (mode !== "pan-image" && mode !== "scale-image") {
      onStopEdit();
    }
    if (el.locked) return;
    onBeforeChange?.();
    const point = clientToPercent(event.clientX, event.clientY);
    dragRef.current = {
      id,
      mode,
      handle,
      startX: point.x,
      startY: point.y,
      origX: el.x,
      origY: el.y,
      origW: el.width,
      origH: el.height ?? 20,
      origScale: normalizeImageScale(el.style.imageScale),
      origOffsetX: normalizeImageOffset(
        el.style.imageOffsetX,
        el.style.imageScale,
      ),
      origOffsetY: normalizeImageOffset(
        el.style.imageOffsetY,
        el.style.imageScale,
      ),
    };
  };

  return (
    <section
      className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-soft-grey"
      onPointerDown={() => {
        onClearSelection();
        onStopEdit();
      }}
    >
      <div
        ref={viewportRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-6 pb-28"
      >
        <div
          className="relative shrink-0"
          style={{
            width: fitSize.width * zoomScale,
            height: fitSize.height * zoomScale,
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div
            style={{
              width: fitSize.width,
              height: fitSize.height,
              transform: `scale(${zoomScale})`,
              transformOrigin: "top left",
            }}
          >
            <div
              ref={canvasRef}
              role="presentation"
              className={`relative h-full w-full cursor-pointer rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.12)] ${
                selectedId ? "overflow-visible" : "overflow-hidden"
              } ${
                canvasSelected
                  ? "outline outline-2 outline-signature outline-offset-2"
                  : ""
              }`}
              style={{
                ...fillBoxStyle(backgroundColor),
                boxShadow:
                  border && border.style !== "none"
                    ? undefined
                    : "0 20px 50px rgba(0,0,0,0.12)",
                borderStyle:
                  border && border.style !== "none"
                    ? border.style === "ornament"
                      ? "double"
                      : border.style
                    : undefined,
                borderWidth:
                  border && border.style !== "none" ? border.width : undefined,
                borderColor:
                  border && border.style !== "none" ? border.color : undefined,
              }}
              onPointerDown={() => {
                onSelectCanvas();
                onStopEdit();
              }}
            >
            {backgroundPattern !== "none" && (
              <div
                className="pointer-events-none absolute inset-0"
                style={patternOverlay(backgroundPattern) ?? undefined}
                aria-hidden="true"
              />
            )}
            {showGrid && (
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
                  backgroundSize: "10% 10%",
                }}
                aria-hidden="true"
              />
            )}

            {elements.map((el) => {
              const isSelected = el.id === selectedId;
              const isEditing = el.id === editingId;

              return (
                <div
                  key={el.id}
                  className={`absolute ${isSelected ? "z-20" : "z-10"}`}
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.width}%`,
                    height: el.height ? `${el.height}%` : undefined,
                    transform: `rotate(${el.rotation}deg)`,
                  }}
                  onPointerDown={(event) => {
                    if (isEditing && el.type === "image") {
                      startDrag(event, el.id, "pan-image");
                      return;
                    }
                    if (isEditing) return;
                    startDrag(event, el.id, "move");
                  }}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onSelect(el.id);
                    setContextMenu({
                      x: event.clientX,
                      y: event.clientY,
                      elementId: el.id,
                    });
                  }}
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    if (el.locked) return;
                    if (
                      el.type === "text" ||
                      el.type === "widget" ||
                      (el.type === "image" && !isPatternGraphicSrc(el.content))
                    ) {
                      onSelect(el.id);
                      onStartEdit(el.id);
                    }
                  }}
                  onWheel={(event) => {
                    if (!isEditing || el.type !== "image" || el.locked) return;
                    event.preventDefault();
                    event.stopPropagation();
                    const delta = event.deltaY > 0 ? -0.08 : 0.08;
                    const fit = clampImageFit({
                      imageScale: (el.style.imageScale ?? 1) + delta,
                      imageOffsetX: el.style.imageOffsetX,
                      imageOffsetY: el.style.imageOffsetY,
                    });
                    onChangeElement(el.id, {
                      style: {
                        ...el.style,
                        ...fit,
                      },
                    });
                  }}
                >
                  {isSelected && isEditing && el.type === "image" && !el.locked && (
                    <div
                      className="absolute left-1/2 z-40 flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-black/5 bg-white px-1.5 py-1 shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
                      style={{
                        top: 0,
                        transform: `translate(-50%, calc(-100% - 8px)) scale(${uiScale})`,
                        transformOrigin: "bottom center",
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <span className="whitespace-nowrap px-2 text-[10px] font-semibold text-grey">
                        Drag to pan · scroll to zoom
                      </span>
                      <button
                        type="button"
                        className="rounded-full bg-black px-2.5 py-1 text-[11px] font-semibold text-white"
                        onClick={onStopEdit}
                      >
                        Done
                      </button>
                    </div>
                  )}

                  {isSelected && !isEditing && (
                    <div
                      className="absolute left-1/2 z-40 flex items-center gap-0.5 rounded-full border border-black/5 bg-white px-1.5 py-1 shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
                      style={{
                        top: 0,
                        transform: `translate(-50%, calc(-100% - 8px)) scale(${uiScale})`,
                        transformOrigin: "bottom center",
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <span className="shrink-0 whitespace-nowrap rounded-full bg-signature/10 px-2 py-0.5 text-[10px] font-semibold capitalize text-signature">
                        {el.type === "widget" && el.widget
                          ? widgetKindLabel(el.widget.kind)
                          : el.type}
                      </span>
                      {(el.type === "text" ||
                        el.type === "widget" ||
                        (el.type === "image" &&
                          !isPatternGraphicSrc(el.content))) &&
                        !el.locked && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold text-grey hover:bg-soft-grey hover:text-black"
                          aria-label="Edit"
                          onClick={() => {
                            onSelect(el.id);
                            onStartEdit(el.id);
                          }}
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                          {el.type === "image" ? "Fit" : "Edit"}
                        </button>
                      )}
                      {el.type === "text" && !el.locked && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold text-grey hover:bg-soft-grey hover:text-black"
                          aria-label="Link"
                          title="Link ⌘K"
                          onClick={() => {
                            setLinkPrompt({
                              elementId: el.id,
                              value: el.href || "",
                            });
                          }}
                        >
                          Link
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-grey hover:bg-soft-grey hover:text-black"
                        aria-label="Duplicate"
                        onClick={() => onDuplicate(el.id)}
                      >
                        <DuplicateIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-grey hover:bg-soft-grey hover:text-black"
                        aria-label="Delete"
                        onClick={() => onDelete(el.id)}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-grey hover:bg-soft-grey hover:text-black"
                        aria-label="More"
                        onClick={() => onToggleLock(el.id)}
                        title={el.locked ? "Unlock" : "Lock"}
                      >
                        <MoreIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <div
                    className={`relative h-full w-full ${
                      isSelected
                        ? "outline outline-2 outline-signature outline-offset-2"
                        : "hover:outline hover:outline-1 hover:outline-signature/40 hover:outline-offset-2"
                    } ${
                      el.locked
                        ? "cursor-default opacity-90"
                        : isEditing && el.type === "image"
                          ? "cursor-grab active:cursor-grabbing"
                          : "cursor-move"
                    }`}
                    style={el.type === "image" ? undefined : effectStyle(el)}
                  >
                    {el.type === "text" &&
                      (isEditing ? (
                        <textarea
                          autoFocus
                          value={el.content}
                          onChange={(e) =>
                            onChangeElement(el.id, { content: e.target.value })
                          }
                          onBlur={onStopEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") onStopEdit();
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          className={`w-full resize-none bg-white/40 outline-none ${fontFamilyClass(el.style.fontFamily)}`}
                          style={{
                            fontSize: `${el.style.fontSize}px`,
                            fontWeight: fontWeightValue(el.style),
                            ...fillTextStyle(
                              isGradient(el.style.color)
                                ? normalizeHex("#1F2D22")
                                : el.style.color,
                            ),
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
                            minHeight: "1.5em",
                          }}
                        />
                      ) : (
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
                            className={`w-full whitespace-pre-wrap break-words ${fontFamilyClass(el.style.fontFamily)}`}
                            style={{
                              fontSize: `${el.style.fontSize}px`,
                              fontWeight: fontWeightValue(el.style),
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
                            {el.content || "Double-click to edit"}
                          </div>
                        </div>
                      ))}

                    {el.type === "image" && (
                      <CanvasImageContent
                        src={el.content}
                        color={el.style.color}
                        frame={el.style.frame}
                        effects={el.style.effects}
                        imageScale={el.style.imageScale}
                        imageOffsetX={el.style.imageOffsetX}
                        imageOffsetY={el.style.imageOffsetY}
                        cropEditing={isEditing}
                        onNaturalSize={
                          isPatternGraphicSrc(el.content)
                            ? undefined
                            : (nw, nh) => {
                                if (photoFitIdsRef.current.has(el.id)) return;
                                photoFitIdsRef.current.add(el.id);
                                const imageAspect = nw / nh;
                                const nextH =
                                  (el.width *
                                    cardAspectRatio(shape, customSize)) /
                                  imageAspect;
                                const height = Math.min(
                                  100,
                                  Math.max(6, Math.round(nextH * 10) / 10),
                                );
                                if (Math.abs(height - (el.height || 0)) > 0.5) {
                                  onChangeElement(el.id, { height });
                                }
                              }
                        }
                      />
                    )}

                    {el.type === "shape" && (
                      <ShapeElementView
                        kind={el.content}
                        color={el.style.color}
                      />
                    )}

                    {el.type === "divider" && (
                      <DividerElementView
                        variant={el.content || "solid"}
                        color={el.style.color}
                      />
                    )}

                    {el.type === "widget" && el.widget && (
                      <CanvasWidgetView
                        widget={el.widget}
                        interactive={false}
                        editing={isEditing}
                        onChange={(widget) =>
                          onChangeElement(el.id, {
                            widget,
                            content: widget.kind,
                          })
                        }
                        onStopEdit={onStopEdit}
                        className="h-full w-full"
                      />
                    )}

                    {isSelected && isEditing && el.type === "image" && !el.locked && (
                      <>
                        {(() => {
                          const fit = clampImageFit({
                            imageScale: el.style.imageScale,
                            imageOffsetX: el.style.imageOffsetX,
                            imageOffsetY: el.style.imageOffsetY,
                          });
                          const { imageScale: scale, imageOffsetX: ox, imageOffsetY: oy } =
                            fit;
                          return (
                            <div
                              className="pointer-events-none absolute z-20 border border-dashed border-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
                              style={{
                                left: `calc(50% + ${ox}% - ${scale * 50}%)`,
                                top: `calc(50% + ${oy}% - ${scale * 50}%)`,
                                width: `${scale * 100}%`,
                                height: `${scale * 100}%`,
                              }}
                            >
                              {(
                                [
                                  [
                                    "nw",
                                    "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
                                    "nwse-resize",
                                  ],
                                  [
                                    "ne",
                                    "right-0 top-0 translate-x-1/2 -translate-y-1/2",
                                    "nesw-resize",
                                  ],
                                  [
                                    "sw",
                                    "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
                                    "nesw-resize",
                                  ],
                                  [
                                    "se",
                                    "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
                                    "nwse-resize",
                                  ],
                                ] as const
                              ).map(([id, pos, cursor]) => (
                                <span
                                  key={id}
                                  role="presentation"
                                  className={`pointer-events-auto absolute z-30 h-2.5 w-2.5 rounded-full border border-black/15 bg-white shadow-sm ${pos}`}
                                  style={{ cursor }}
                                  onPointerDown={(event) =>
                                    startDrag(event, el.id, "scale-image", id)
                                  }
                                />
                              ))}
                            </div>
                          );
                        })()}
                      </>
                    )}

                    {isSelected && !isEditing && !el.locked && (
                      <>
                        {(
                          [
                            {
                              id: "nw" as const,
                              style: {
                                left: 0,
                                top: 0,
                                transform: `translate(-50%, -50%) scale(${uiScale})`,
                              },
                              className: "h-2.5 w-2.5 rounded-full",
                              cursor: "nwse-resize",
                            },
                            {
                              id: "n" as const,
                              style: {
                                left: "50%",
                                top: 0,
                                transform: `translate(-50%, -50%) scale(${uiScale})`,
                              },
                              className: "h-1.5 w-3 rounded-full",
                              cursor: "ns-resize",
                            },
                            {
                              id: "ne" as const,
                              style: {
                                right: 0,
                                top: 0,
                                transform: `translate(50%, -50%) scale(${uiScale})`,
                              },
                              className: "h-2.5 w-2.5 rounded-full",
                              cursor: "nesw-resize",
                            },
                            {
                              id: "e" as const,
                              style: {
                                right: 0,
                                top: "50%",
                                transform: `translate(50%, -50%) scale(${uiScale})`,
                              },
                              className: "h-3 w-1.5 rounded-full",
                              cursor: "ew-resize",
                            },
                            {
                              id: "se" as const,
                              style: {
                                right: 0,
                                bottom: 0,
                                transform: `translate(50%, 50%) scale(${uiScale})`,
                              },
                              className: "h-2.5 w-2.5 rounded-full",
                              cursor: "nwse-resize",
                            },
                            {
                              id: "s" as const,
                              style: {
                                left: "50%",
                                bottom: 0,
                                transform: `translate(-50%, 50%) scale(${uiScale})`,
                              },
                              className: "h-1.5 w-3 rounded-full",
                              cursor: "ns-resize",
                            },
                            {
                              id: "sw" as const,
                              style: {
                                left: 0,
                                bottom: 0,
                                transform: `translate(-50%, 50%) scale(${uiScale})`,
                              },
                              className: "h-2.5 w-2.5 rounded-full",
                              cursor: "nesw-resize",
                            },
                            {
                              id: "w" as const,
                              style: {
                                left: 0,
                                top: "50%",
                                transform: `translate(-50%, -50%) scale(${uiScale})`,
                              },
                              className: "h-3 w-1.5 rounded-full",
                              cursor: "ew-resize",
                            },
                          ] as const
                        ).map((handle) => (
                          <span
                            key={handle.id}
                            role="presentation"
                            className={`absolute z-30 border border-black/15 bg-white shadow-sm ${handle.className}`}
                            style={{ ...handle.style, cursor: handle.cursor }}
                            onPointerDown={(event) =>
                              startDrag(event, el.id, "resize", handle.id)
                            }
                          />
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          <div className="absolute top-1/2 -right-11 z-30 hidden -translate-y-1/2 flex-col gap-0.5 rounded-full border border-black/5 bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)] lg:flex">
            {(
              [
                {
                  label: "Grid",
                  icon: GridIcon,
                  active: showGrid,
                  onClick: onToggleGrid,
                },
                {
                  label: "Lock",
                  icon: LockIcon,
                  onClick: () => selectedId && onToggleLock(selectedId),
                },
                {
                  label: "Duplicate",
                  icon: DuplicateIcon,
                  onClick: () => selectedId && onDuplicate(selectedId),
                },
                {
                  label: "Rotate",
                  icon: RotateIcon,
                  onClick: () => selectedId && onRotate(selectedId),
                },
                {
                  label: "Delete",
                  icon: TrashIcon,
                  onClick: () => selectedId && onDelete(selectedId),
                },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                    "active" in item && item.active
                      ? "bg-signature/15 text-signature"
                      : "text-grey hover:bg-soft-grey hover:text-black"
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {contextMenu && (
        <div
          className="fixed z-[90] min-w-[180px] overflow-hidden rounded-xl border border-black/10 bg-white py-1 shadow-[0_12px_32px_rgba(0,0,0,0.16)]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onPointerDown={(e) => e.stopPropagation()}
          role="menu"
        >
          {(() => {
            const target = elements.find((el) => el.id === contextMenu.elementId);
            if (!target) return null;
            return (
              <>
                {target.type === "text" && (
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-soft-grey"
                    onClick={() => {
                      setLinkPrompt({
                        elementId: target.id,
                        value: target.href || "",
                      });
                      setContextMenu(null);
                    }}
                  >
                    <span>Link</span>
                    <span className="text-[11px] text-grey">⌘K</span>
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-soft-grey"
                  onClick={() => {
                    onDuplicate(target.id);
                    setContextMenu(null);
                  }}
                >
                  <span>Duplicate</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-signature hover:bg-soft-grey"
                  onClick={() => {
                    onDelete(target.id);
                    setContextMenu(null);
                  }}
                >
                  <span>Delete</span>
                </button>
              </>
            );
          })()}
        </div>
      )}

      {linkPrompt && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/30 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_20px_48px_rgba(0,0,0,0.2)]"
            role="dialog"
            aria-label="Edit link"
          >
            <p className="text-sm font-semibold text-black">Link</p>
            <p className="mt-1 text-xs text-grey">
              Add a URL to this text (Google Maps, website, RSVP form…).
            </p>
            <input
              autoFocus
              type="url"
              value={linkPrompt.value}
              onChange={(e) =>
                setLinkPrompt({ ...linkPrompt, value: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onBeforeChange?.();
                  onChangeElement(linkPrompt.elementId, {
                    href: linkPrompt.value.trim() || null,
                  });
                  setLinkPrompt(null);
                }
                if (e.key === "Escape") setLinkPrompt(null);
              }}
              placeholder="https://"
              className="mt-3 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  onBeforeChange?.();
                  onChangeElement(linkPrompt.elementId, { href: null });
                  setLinkPrompt(null);
                }}
                className="rounded-full px-3 py-2 text-sm font-semibold text-grey hover:bg-soft-grey hover:text-black"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={() => setLinkPrompt(null)}
                className="rounded-full border border-black/10 px-3 py-2 text-sm font-semibold text-black hover:bg-soft-grey"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onBeforeChange?.();
                  onChangeElement(linkPrompt.elementId, {
                    href: linkPrompt.value.trim() || null,
                  });
                  setLinkPrompt(null);
                }}
                className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
