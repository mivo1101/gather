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
import { CanvasImageContent, cardAspectRatio } from "./CanvasImageContent";
import { isPatternGraphicSrc } from "@/lib/data/element-library";
import { ShapeGraphic } from "./ShapeGraphic";

function effectStyle(el: CanvasElement): CSSProperties {
  const effects = el.style.effects ?? {};
  const filter: string[] = [];
  if (effects.glow) filter.push("drop-shadow(0 0 6px rgba(255,96,170,0.55))");
  let boxShadow: string | undefined;
  if (effects.shadowInset) {
    boxShadow = "inset 0 2px 8px rgba(0,0,0,0.28)";
  } else if (effects.shadow) {
    boxShadow = "0 6px 16px rgba(0,0,0,0.22)";
  }
  return {
    filter: filter.length ? filter.join(" ") : undefined,
    boxShadow,
    outline: effects.outline ? `1.5px solid ${el.style.color}` : undefined,
    outlineOffset: effects.outline ? 2 : undefined,
  };
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
  if (variant === "dashed") {
    return (
      <div
        className="w-full border-t-2 border-dashed"
        style={{ borderColor: color }}
      />
    );
  }
  if (variant === "dotted") {
    return (
      <div
        className="w-full border-t-2 border-dotted"
        style={{ borderColor: color }}
      />
    );
  }
  if (variant === "double") {
    return (
      <div
        className="w-full border-t-[3px] border-double"
        style={{ borderColor: color }}
      />
    );
  }
  if (variant === "thick") {
    return (
      <div
        className="h-2 w-full rounded-full"
        style={{ backgroundColor: color }}
      />
    );
  }
  if (variant === "dots") {
    return (
      <div className="flex w-full items-center justify-between px-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    );
  }
  if (variant === "diamond") {
    return (
      <div className="flex w-full items-center gap-2">
        <span className="h-px flex-1" style={{ backgroundColor: color }} />
        <span
          className="h-2 w-2 rotate-45"
          style={{ backgroundColor: color }}
        />
        <span className="h-px flex-1" style={{ backgroundColor: color }} />
      </div>
    );
  }
  return (
    <div
      className="h-0.5 w-full rounded-full"
      style={{ backgroundColor: color }}
    />
  );
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

type DragMode = "move" | "resize";

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
  const dragRef = useRef<{
    id: string;
    mode: DragMode;
    handle: "nw" | "ne" | "sw" | "se";
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);

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
      } else {
        const keepRatio = el.type === "image";
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
          const ratio = drag.origH / drag.origW;
          if (drag.handle === "se" || drag.handle === "ne") {
            nextH = Math.min(100, Math.max(6, nextW * ratio));
            if (drag.handle === "ne") {
              nextY = drag.origY + (drag.origH - nextH);
            }
          } else {
            nextW = Math.min(100, Math.max(8, nextH / ratio));
            if (drag.handle === "nw" || drag.handle === "sw") {
              nextX = drag.origX + (drag.origW - nextW);
            }
            if (drag.handle === "nw") {
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
    [clientToPercent, elements, onChangeElement],
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
    handle: "nw" | "ne" | "sw" | "se" = "se",
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const el = elements.find((item) => item.id === id);
    if (!el) return;
    onSelect(id);
    onStopEdit();
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
    };
  };

  return (
    <section
      className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#f3f1ef]"
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
                backgroundColor,
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
                    if (isEditing) return;
                    startDrag(event, el.id, "move");
                  }}
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    if (el.type === "text" && !el.locked) {
                      onSelect(el.id);
                      onStartEdit(el.id);
                    }
                  }}
                >
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
                      <span className="rounded-full bg-signature/10 px-2 py-0.5 text-[10px] font-semibold capitalize text-signature">
                        {el.type}
                      </span>
                      {el.type === "text" && !el.locked && (
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
                          Edit
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
                    } ${el.locked ? "cursor-default opacity-90" : "cursor-move"}`}
                    style={effectStyle(el)}
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
                            {el.content || "Double-click to edit"}
                          </div>
                        </div>
                      ))}

                    {el.type === "image" && (
                      <CanvasImageContent
                        src={el.content}
                        color={el.style.color}
                        frame={el.style.frame}
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

                    {isSelected && !isEditing && !el.locked && (
                      <>
                        {(
                          [
                            ["nw", "-left-1 -top-1", "nwse-resize"],
                            ["ne", "-right-1 -top-1", "nesw-resize"],
                            ["sw", "-left-1 -bottom-1", "nesw-resize"],
                            ["se", "-right-1 -bottom-1", "nwse-resize"],
                          ] as const
                        ).map(([handle, pos, cursor]) => (
                          <span
                            key={handle}
                            role="presentation"
                            className={`absolute z-30 h-2 w-2 rounded-full bg-signature ${pos}`}
                            style={{
                              cursor,
                              transform: `scale(${uiScale})`,
                              transformOrigin:
                                handle === "nw"
                                  ? "top left"
                                  : handle === "ne"
                                    ? "top right"
                                    : handle === "sw"
                                      ? "bottom left"
                                      : "bottom right",
                            }}
                            onPointerDown={(event) =>
                              startDrag(event, el.id, "resize", handle)
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
    </section>
  );
}
