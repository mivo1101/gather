"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
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
import { canvasFontFamilyClass } from "@/lib/canvas-fonts";
import { effectsToCss } from "@/lib/element-effects";
import { paperTextureLayerStyle } from "@/lib/paper-textures";
import { designCanvasSize } from "./canvas-metrics";
import {
  clearInsertDragData,
  getInsertDragData,
  hasInsertDragData,
  type EditorInsertPayload,
} from "@/lib/editor-insert-dnd";

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

function ShapeElementView({
  kind,
  color,
  borderColor,
  borderWidth,
}: {
  kind: string;
  color: string;
  borderColor?: string;
  borderWidth?: number;
}) {
  return (
    <ShapeGraphic
      kind={kind}
      color={color}
      borderColor={borderColor}
      borderWidth={borderWidth}
    />
  );
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
  selectedIds: string[];
  editingId: string | null;
  showGrid: boolean;
  zoom: number;
  backgroundColor: string;
  backgroundPattern?: NonNullable<InvitationPage["backgroundPattern"]>;
  backgroundTexture?: InvitationPage["backgroundTexture"];
  backgroundTextureOpacity?: number;
  backgroundTextureTint?: string;
  backgroundTextureBlend?: InvitationPage["backgroundTextureBlend"];
  border?: InvitationPage["border"];
  canvasSelected: boolean;
  onToggleGrid: () => void;
  onSelect: (id: string | null) => void;
  onToggleSelect: (id: string) => void;
  onSelectMany: (ids: string[]) => void;
  onSelectCanvas: () => void;
  onClearSelection: () => void;
  onStartEdit: (id: string) => void;
  onStopEdit: () => void;
  onChangeElement: (id: string, patch: Partial<CanvasElement>) => void;
  onChangeElements?: (
    updates: Array<{ id: string; patch: Partial<CanvasElement> }>,
  ) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteMany: (ids: string[]) => void;
  onToggleLock: (id: string) => void;
  onRotate: (id: string) => void;
  /** Called before a mutating interaction so the parent can snapshot history */
  onBeforeChange?: () => void;
  /** Panel → canvas drag-and-drop insert. */
  onInsertDrop?: (
    payload: EditorInsertPayload,
    drop: { clientX: number; clientY: number; canvas: HTMLElement },
  ) => void;
}

function fontWeightValue(style: CanvasElement["style"]) {
  if (style.bold || style.fontWeight === "bold") return 700;
  if (style.fontWeight === "medium") return 500;
  return 400;
}

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
type DragMode = "move" | "resize" | "pan-image" | "scale-image";

type Point = { x: number; y: number };

function rotatedBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  rotation = 0,
) {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const corners = [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ].map((point) => {
    const dx = point.x - centerX;
    const dy = point.y - centerY;
    return {
      x: centerX + dx * cos - dy * sin,
      y: centerY + dx * sin + dy * cos,
    };
  });

  const left = Math.min(...corners.map((point) => point.x));
  const right = Math.max(...corners.map((point) => point.x));
  const top = Math.min(...corners.map((point) => point.y));
  const bottom = Math.max(...corners.map((point) => point.y));
  return { left, right, top, bottom };
}

const EDGE_SNAP_DISTANCE = 1.2;
const EDGE_RELEASE_DISTANCE = 3;

function applyEdgeResistance(
  x: number,
  y: number,
  width: number,
  height: number,
  rotation = 0,
) {
  let nextX = x;
  let nextY = y;
  let bounds = rotatedBounds(nextX, nextY, width, height, rotation);
  const horizontalCandidates = [
    bounds.left >= -EDGE_RELEASE_DISTANCE &&
    bounds.left <= EDGE_SNAP_DISTANCE
      ? { edge: "left" as const, correction: -bounds.left }
      : null,
    bounds.right <= 100 + EDGE_RELEASE_DISTANCE &&
    bounds.right >= 100 - EDGE_SNAP_DISTANCE
      ? { edge: "right" as const, correction: 100 - bounds.right }
      : null,
  ].filter(
    (
      candidate,
    ): candidate is { edge: "left" | "right"; correction: number } =>
      candidate !== null,
  );
  const horizontal = horizontalCandidates.sort(
    (a, b) => Math.abs(a.correction) - Math.abs(b.correction),
  )[0];
  if (horizontal) nextX += horizontal.correction;

  bounds = rotatedBounds(nextX, nextY, width, height, rotation);
  const verticalCandidates = [
    bounds.top >= -EDGE_RELEASE_DISTANCE &&
    bounds.top <= EDGE_SNAP_DISTANCE
      ? { edge: "top" as const, correction: -bounds.top }
      : null,
    bounds.bottom <= 100 + EDGE_RELEASE_DISTANCE &&
    bounds.bottom >= 100 - EDGE_SNAP_DISTANCE
      ? { edge: "bottom" as const, correction: 100 - bounds.bottom }
      : null,
  ].filter(
    (
      candidate,
    ): candidate is { edge: "top" | "bottom"; correction: number } =>
      candidate !== null,
  );
  const vertical = verticalCandidates.sort(
    (a, b) => Math.abs(a.correction) - Math.abs(b.correction),
  )[0];
  if (vertical) nextY += vertical.correction;

  return {
    x: nextX,
    y: nextY,
    edges: {
      left: horizontal?.edge === "left",
      right: horizontal?.edge === "right",
      top: vertical?.edge === "top",
      bottom: vertical?.edge === "bottom",
    },
  };
}

function findSmartAlignment(
  moving: ReturnType<typeof rotatedBounds>,
  others: Array<ReturnType<typeof rotatedBounds>>,
) {
  const movingCenterX = (moving.left + moving.right) / 2;
  const movingCenterY = (moving.top + moving.bottom) / 2;
  const horizontalCandidates = [
    { correction: 50 - movingCenterX, guide: 50 },
    ...others.flatMap((bounds) => [
      { correction: bounds.left - moving.left, guide: bounds.left },
      {
        correction:
          (bounds.left + bounds.right) / 2 - movingCenterX,
        guide: (bounds.left + bounds.right) / 2,
      },
      { correction: bounds.right - moving.right, guide: bounds.right },
    ]),
  ]
    .filter((candidate) => Math.abs(candidate.correction) <= 0.8)
    .sort(
      (a, b) => Math.abs(a.correction) - Math.abs(b.correction),
    );
  const verticalCandidates = [
    { correction: 50 - movingCenterY, guide: 50 },
    ...others.flatMap((bounds) => [
      { correction: bounds.top - moving.top, guide: bounds.top },
      {
        correction:
          (bounds.top + bounds.bottom) / 2 - movingCenterY,
        guide: (bounds.top + bounds.bottom) / 2,
      },
      { correction: bounds.bottom - moving.bottom, guide: bounds.bottom },
    ]),
  ]
    .filter((candidate) => Math.abs(candidate.correction) <= 0.8)
    .sort(
      (a, b) => Math.abs(a.correction) - Math.abs(b.correction),
    );

  return {
    dx: horizontalCandidates[0]?.correction ?? 0,
    dy: verticalCandidates[0]?.correction ?? 0,
    vertical: horizontalCandidates[0]?.guide ?? null,
    horizontal: verticalCandidates[0]?.guide ?? null,
  };
}

function clipPolygon(
  polygon: Point[],
  inside: (point: Point) => boolean,
  intersect: (start: Point, end: Point) => Point,
) {
  const result: Point[] = [];
  for (let index = 0; index < polygon.length; index += 1) {
    const start = polygon[index];
    const end = polygon[(index + 1) % polygon.length];
    const startInside = inside(start);
    const endInside = inside(end);
    if (startInside && endInside) {
      result.push(end);
    } else if (startInside && !endInside) {
      result.push(intersect(start, end));
    } else if (!startInside && endInside) {
      result.push(intersect(start, end), end);
    }
  }
  return result;
}

function canvasClipPath(el: CanvasElement): CSSProperties["clipPath"] {
  const width = Math.max(0.001, el.width);
  const height = Math.max(0.001, el.height ?? 20);
  const bounds = rotatedBounds(
    el.x,
    el.y,
    width,
    height,
    el.rotation,
  );
  if (
    bounds.left >= 0 &&
    bounds.right <= 100 &&
    bounds.top >= 0 &&
    bounds.bottom <= 100
  ) {
    return undefined;
  }

  const centerX = el.x + width / 2;
  const centerY = el.y + height / 2;
  const radians = (el.rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  let polygon: Point[] = [
    { x: el.x, y: el.y },
    { x: el.x + width, y: el.y },
    { x: el.x + width, y: el.y + height },
    { x: el.x, y: el.y + height },
  ].map((point) => {
    const dx = point.x - centerX;
    const dy = point.y - centerY;
    return {
      x: centerX + dx * cos - dy * sin,
      y: centerY + dx * sin + dy * cos,
    };
  });

  const verticalIntersection =
    (edgeX: number) => (start: Point, end: Point) => {
      const progress = (edgeX - start.x) / (end.x - start.x);
      return {
        x: edgeX,
        y: start.y + (end.y - start.y) * progress,
      };
    };
  const horizontalIntersection =
    (edgeY: number) => (start: Point, end: Point) => {
      const progress = (edgeY - start.y) / (end.y - start.y);
      return {
        x: start.x + (end.x - start.x) * progress,
        y: edgeY,
      };
    };

  polygon = clipPolygon(
    polygon,
    (point) => point.x >= 0,
    verticalIntersection(0),
  );
  polygon = clipPolygon(
    polygon,
    (point) => point.x <= 100,
    verticalIntersection(100),
  );
  polygon = clipPolygon(
    polygon,
    (point) => point.y >= 0,
    horizontalIntersection(0),
  );
  polygon = clipPolygon(
    polygon,
    (point) => point.y <= 100,
    horizontalIntersection(100),
  );
  if (polygon.length < 3) return "inset(100%)";

  const localPoints = polygon.map((point) => {
    const dx = point.x - centerX;
    const dy = point.y - centerY;
    const unrotatedX = centerX + dx * cos + dy * sin;
    const unrotatedY = centerY - dx * sin + dy * cos;
    return {
      x: ((unrotatedX - el.x) / width) * 100,
      y: ((unrotatedY - el.y) / height) * 100,
    };
  });
  return `polygon(${localPoints
    .map((point) => `${point.x.toFixed(3)}% ${point.y.toFixed(3)}%`)
    .join(", ")})`;
}

export function EditorCanvas({
  shape,
  customSize,
  elements,
  selectedId,
  selectedIds,
  editingId,
  showGrid,
  zoom,
  backgroundColor,
  backgroundPattern = "none",
  backgroundTexture = "none",
  backgroundTextureOpacity = 22,
  backgroundTextureTint = "#ffffff",
  backgroundTextureBlend = "soft-light",
  border = null,
  canvasSelected,
  onToggleGrid,
  onSelect,
  onToggleSelect,
  onSelectMany,
  onSelectCanvas,
  onClearSelection,
  onStartEdit,
  onStopEdit,
  onChangeElement,
  onChangeElements,
  onDuplicate,
  onDelete,
  onDeleteMany,
  onToggleLock,
  onRotate,
  onBeforeChange,
  onInsertDrop,
}: EditorCanvasProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [insertDragOver, setInsertDragOver] = useState(false);
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
  const [marquee, setMarquee] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    startedOutside: boolean;
  } | null>(null);
  const marqueeRef = useRef<typeof marquee>(null);
  const [alignmentGuides, setAlignmentGuides] = useState({
    vertical: null as number | null,
    horizontal: null as number | null,
  });
  const [edgeGuides, setEdgeGuides] = useState({
    left: false,
    right: false,
    top: false,
    bottom: false,
  });
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
    group?: Array<{ id: string; x: number; y: number }>;
    groupBounds?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
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
  const designSize = useMemo(
    () => designCanvasSize(aspect),
    [aspect],
  );
  const elementBoundsOnCanvas = useCallback((el: CanvasElement) => {
    const canvas = canvasRef.current;
    const node = canvasRef.current?.querySelector<HTMLElement>(
      `[data-canvas-element-id="${CSS.escape(el.id)}"]`,
    );
    const measuredHeight =
      canvas && node && canvas.clientHeight > 0
        ? (node.offsetHeight / canvas.clientHeight) * 100
        : null;
    const fallbackHeight = el.height ?? measuredHeight ??
      (el.type === "text"
        ? Math.max(2, el.content.split("\n").length * 4)
        : 20);
    return rotatedBounds(
      el.x,
      el.y,
      el.width,
      fallbackHeight,
      el.rotation,
    );
  }, []);
  const multiSelectionBounds = useMemo(() => {
    if (selectedIds.length < 2) return null;
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    if (selected.length < 2) return null;
    const bounds = selected.map(elementBoundsOnCanvas);
    const left = Math.min(...bounds.map((item) => item.left));
    const top = Math.min(...bounds.map((item) => item.top));
    const right = Math.max(...bounds.map((item) => item.right));
    const bottom = Math.max(...bounds.map((item) => item.bottom));
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  }, [elementBoundsOnCanvas, elements, selectedIds]);

  const fitScale = useMemo(() => {
    const isTall = aspect < 0.95; // portrait / tall custom
    const isSquarish = aspect >= 0.95 && aspect <= 1.05; // square-ish cards are height-limited too
    const padX = isTall ? 112 : 120;
    // Tall cards are height-limited — leave clearer top/bottom margin
    const padY = isTall || isSquarish ? 140 : 88;
    const availW = Math.max(160, viewportSize.width - padX);
    const availH = Math.max(160, viewportSize.height - padY);
    // Portrait / square shouldn't fill the full column; keep ~same visual gaps as landscape
    const maxH = isTall || isSquarish ? availH * 0.9 : availH;
    return Math.min(
      availW / designSize.width,
      maxH / designSize.height,
    );
  }, [
    aspect,
    designSize.height,
    designSize.width,
    viewportSize.height,
    viewportSize.width,
  ]);
  const displayScale = Math.max(0.01, fitScale * zoomScale);
  const uiScale = 1 / displayScale;

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
      if (!drag) {
        const activeMarquee = marqueeRef.current;
        if (!activeMarquee) return;
        const current = clientToPercent(event.clientX, event.clientY);
        const next = {
          ...activeMarquee,
          currentX: Math.min(100, Math.max(0, current.x)),
          currentY: Math.min(100, Math.max(0, current.y)),
        };
        marqueeRef.current = next;
        setMarquee(next);
        return;
      }
      const el = elements.find((item) => item.id === drag.id);
      if (!el || el.locked) return;

      const current = clientToPercent(event.clientX, event.clientY);
      const dx = current.x - drag.startX;
      const dy = current.y - drag.startY;

      if (drag.mode === "move") {
        if (drag.group && drag.groupBounds) {
          let nextDx = dx;
          let nextDy = dy;
          const groupIds = new Set(drag.group.map((item) => item.id));
          const alignment = findSmartAlignment(
            rotatedBounds(
              drag.groupBounds.x + nextDx,
              drag.groupBounds.y + nextDy,
              drag.groupBounds.width,
              drag.groupBounds.height,
            ),
            elements
              .filter((item) => !groupIds.has(item.id))
              .map(elementBoundsOnCanvas),
          );
          nextDx += alignment.dx;
          nextDy += alignment.dy;
          const resisted = applyEdgeResistance(
            drag.groupBounds.x + nextDx,
            drag.groupBounds.y + nextDy,
            drag.groupBounds.width,
            drag.groupBounds.height,
          );
          nextDx += resisted.x - (drag.groupBounds.x + nextDx);
          nextDy += resisted.y - (drag.groupBounds.y + nextDy);
          setAlignmentGuides({
            vertical: alignment.vertical,
            horizontal: alignment.horizontal,
          });
          setEdgeGuides(resisted.edges);
          const updates = drag.group.map((item) => ({
            id: item.id,
            patch: {
              x: Math.min(95, Math.max(-20, item.x + nextDx)),
              y: Math.min(95, Math.max(-20, item.y + nextDy)),
            },
          }));
          if (onChangeElements) onChangeElements(updates);
          else {
            for (const update of updates) {
              onChangeElement(update.id, update.patch);
            }
          }
        } else {
          let nextX = Math.min(95, Math.max(-20, drag.origX + dx));
          let nextY = Math.min(95, Math.max(-20, drag.origY + dy));
          const alignment = findSmartAlignment(
            rotatedBounds(
              nextX,
              nextY,
              drag.origW,
              drag.origH,
              el.rotation,
            ),
            elements
              .filter((item) => item.id !== el.id)
              .map(elementBoundsOnCanvas),
          );
          nextX += alignment.dx;
          nextY += alignment.dy;
          const resisted = applyEdgeResistance(
            nextX,
            nextY,
            drag.origW,
            drag.origH,
            el.rotation,
          );
          nextX = resisted.x;
          nextY = resisted.y;
          setAlignmentGuides({
            vertical: alignment.vertical,
            horizontal: alignment.horizontal,
          });
          setEdgeGuides(resisted.edges);
          onChangeElement(drag.id, { x: nextX, y: nextY });
        }
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
        const cornerResize = drag.handle.length === 2;
        const keepRatio =
          cornerResize && (el.type === "image" || el.type === "shape");
        // Icons and other vector shapes remain crisp at very small sizes.
        // Keep their resize floor low while retaining a selectable wrapper.
        const minWidth = el.type === "shape" ? 2 : 8;
        const minHeight = el.type === "shape" ? 1.5 : 6;
        let nextW = drag.origW;
        let nextH = drag.origH;
        let nextX = drag.origX;
        let nextY = drag.origY;

        if (drag.handle.includes("e")) {
          nextW = Math.min(100, Math.max(minWidth, drag.origW + dx));
        }
        if (drag.handle.includes("w")) {
          nextW = Math.min(100, Math.max(minWidth, drag.origW - dx));
          nextX = drag.origX + (drag.origW - nextW);
        }
        if (drag.handle.includes("s")) {
          nextH = Math.min(100, Math.max(minHeight, drag.origH + dy));
        }
        if (drag.handle.includes("n")) {
          nextH = Math.min(100, Math.max(minHeight, drag.origH - dy));
          nextY = drag.origY + (drag.origH - nextH);
        }

        if (keepRatio && drag.origW > 0 && drag.origH > 0) {
          const ratio = drag.origH / drag.origW;
          if (
            drag.handle === "e" ||
            drag.handle === "w" ||
            drag.handle === "se" ||
            drag.handle === "ne"
          ) {
            nextH = Math.min(100, Math.max(minHeight, nextW * ratio));
            if (drag.handle.includes("n")) {
              nextY = drag.origY + (drag.origH - nextH);
            }
            if (drag.handle.includes("w")) {
              nextX = drag.origX + (drag.origW - nextW);
            }
          } else {
            nextW = Math.min(
              100,
              Math.max(minWidth, nextH / Math.max(ratio, 0.001)),
            );
            if (drag.handle.includes("w")) {
              nextX = drag.origX + (drag.origW - nextW);
            }
            if (drag.handle.includes("n")) {
              nextY = drag.origY + (drag.origH - nextH);
            }
          }
        }

        const bounds = rotatedBounds(
          nextX,
          nextY,
          nextW,
          nextH,
          el.rotation,
        );
        setEdgeGuides({
          left: bounds.left <= 1.2,
          right: bounds.right >= 98.8,
          top: bounds.top <= 1.2,
          bottom: bounds.bottom >= 98.8,
        });
        onChangeElement(drag.id, {
          x: nextX,
          y: nextY,
          width: nextW,
          height:
            el.type === "text" && !el.height ? el.height : nextH,
        });
      }
    },
    [
      clientToPercent,
      elementBoundsOnCanvas,
      elements,
      onChangeElement,
      onChangeElements,
    ],
  );

  const endDrag = useCallback(() => {
    const activeMarquee = marqueeRef.current;
    if (activeMarquee) {
      const left = Math.min(activeMarquee.startX, activeMarquee.currentX);
      const right = Math.max(activeMarquee.startX, activeMarquee.currentX);
      const top = Math.min(activeMarquee.startY, activeMarquee.currentY);
      const bottom = Math.max(activeMarquee.startY, activeMarquee.currentY);
      const moved = right - left > 0.5 || bottom - top > 0.5;

      if (moved) {
        const ids = elements
          .filter((el) => {
            const bounds = elementBoundsOnCanvas(el);
            return (
              bounds.left < right &&
              bounds.right > left &&
              bounds.top < bottom &&
              bounds.bottom > top
            );
          })
          .map((el) => el.id);
        onSelectMany(ids);
      } else if (activeMarquee.startedOutside) {
        onClearSelection();
      } else {
        onSelectCanvas();
      }
      marqueeRef.current = null;
      setMarquee(null);
    }
    dragRef.current = null;
    setAlignmentGuides({ vertical: null, horizontal: null });
    setEdgeGuides({
      left: false,
      right: false,
      top: false,
      bottom: false,
    });
  }, [
    elementBoundsOnCanvas,
    elements,
    onClearSelection,
    onSelectCanvas,
    onSelectMany,
  ]);

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
      if ((!selectedId && selectedIds.length === 0) || editingId) return;
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
        if (selectedIds.length > 1) onDeleteMany(selectedIds);
        else if (selectedId) onDelete(selectedId);
      }
      if (
        selectedId &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "d"
      ) {
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
    onDeleteMany,
    onDuplicate,
    onStopEdit,
    selectedId,
    selectedIds,
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
    const movingSelection =
      mode === "move" && selectedIds.length > 1 && selectedIds.includes(id);
    if (!movingSelection) onSelect(id);
    if (mode !== "pan-image" && mode !== "scale-image") {
      onStopEdit();
    }
    if (el.locked) return;
    setEdgeGuides({
      left: false,
      right: false,
      top: false,
      bottom: false,
    });
    onBeforeChange?.();
    const point = clientToPercent(event.clientX, event.clientY);
    const groupElements = movingSelection
      ? elements.filter(
          (item) => selectedIds.includes(item.id) && !item.locked,
        )
      : [];
    const measuredGroupBounds = groupElements.map(elementBoundsOnCanvas);
    const groupBounds =
      groupElements.length > 1
        ? {
            x: Math.min(...measuredGroupBounds.map((item) => item.left)),
            y: Math.min(...measuredGroupBounds.map((item) => item.top)),
            width:
              Math.max(...measuredGroupBounds.map((item) => item.right)) -
              Math.min(...measuredGroupBounds.map((item) => item.left)),
            height:
              Math.max(...measuredGroupBounds.map((item) => item.bottom)) -
              Math.min(...measuredGroupBounds.map((item) => item.top)),
          }
        : undefined;
    const measuredElementBounds = elementBoundsOnCanvas(el);
    dragRef.current = {
      id,
      mode,
      handle,
      startX: point.x,
      startY: point.y,
      origX: el.x,
      origY: el.y,
      origW: el.width,
      origH: el.height
        ? el.height
        : measuredElementBounds.bottom - measuredElementBounds.top,
      origScale: normalizeImageScale(el.style.imageScale),
      origOffsetX: normalizeImageOffset(
        el.style.imageOffsetX,
        el.style.imageScale,
      ),
      origOffsetY: normalizeImageOffset(
        el.style.imageOffsetY,
        el.style.imageScale,
      ),
      group:
        groupElements.length > 1
          ? groupElements.map((item) => ({
              id: item.id,
              x: item.x,
              y: item.y,
            }))
          : undefined,
      groupBounds,
    };
  };

  const fitTextWidth = (
    event: ReactMouseEvent,
    id: string,
    edge: "e" | "w",
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const el = elements.find((item) => item.id === id);
    const canvas = canvasRef.current;
    const isGuestName =
      el?.type === "widget" && el.widget?.kind === "guest_name";
    if (!el || (el.type !== "text" && !isGuestName) || !canvas) return;

    const renderedText = canvas.querySelector<HTMLElement>(
      `[data-canvas-element-id="${CSS.escape(id)}"] [data-canvas-text]`,
    );
    if (!renderedText) return;
    const computed = window.getComputedStyle(renderedText);
    const ruler = document.createElement("span");
    ruler.setAttribute("aria-hidden", "true");
    Object.assign(ruler.style, {
      position: "fixed",
      left: "-10000px",
      top: "-10000px",
      display: "inline-block",
      width: "max-content",
      maxWidth: "none",
      visibility: "hidden",
      pointerEvents: "none",
      whiteSpace: "pre",
      overflowWrap: "normal",
      wordBreak: "normal",
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      fontStyle: computed.fontStyle,
      letterSpacing: computed.letterSpacing,
      lineHeight: computed.lineHeight,
    });
    const text = isGuestName ? "Guest name" : el.content;
    ruler.textContent =
      text
        .split("\n")
        .sort((a, b) => b.length - a.length)[0] || " ";
    document.body.appendChild(ruler);
    const measuredWidth = ruler.getBoundingClientRect().width;
    ruler.remove();

    const canvasWidth = Math.max(1, canvas.clientWidth);
    const naturalWidth = Math.max(
      3,
      ((Math.ceil(measuredWidth) + 10) / canvasWidth) * 100,
    );
    const right = el.x + el.width;
    const nextWidth = Math.min(100, naturalWidth);
    const anchoredX = edge === "w" ? right - nextWidth : el.x;
    // Preserve the double-clicked edge when possible, then shift only enough
    // to keep the natural-width box on the canvas.
    const nextX = Math.min(100 - nextWidth, Math.max(0, anchoredX));
    onBeforeChange?.();
    onChangeElement(id, {
      x: nextX,
      width: nextWidth,
      height: el.type === "text" ? undefined : el.height,
    });
  };

  const beginMarquee = (
    event: ReactPointerEvent,
    startedOutside: boolean,
  ) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    onStopEdit();
    const point = clientToPercent(event.clientX, event.clientY);
    const nextMarquee = {
      startX: Math.min(100, Math.max(0, point.x)),
      startY: Math.min(100, Math.max(0, point.y)),
      currentX: Math.min(100, Math.max(0, point.x)),
      currentY: Math.min(100, Math.max(0, point.y)),
      startedOutside,
    };
    marqueeRef.current = nextMarquee;
    setMarquee(nextMarquee);
  };
  const groupDragAnchorId =
    selectedIds.find(
      (id) => !elements.find((element) => element.id === id)?.locked,
    ) ?? null;

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
        onPointerDown={(event) => {
          const target = event.target as HTMLElement;
          if (
            canvasRef.current?.contains(target) ||
            target.closest(
              "button, a, input, textarea, select, [role='button']",
            )
          ) {
            return;
          }
          beginMarquee(event, true);
        }}
      >
        <div
          className="relative shrink-0"
          style={{
            width: designSize.width * displayScale,
            height: designSize.height * displayScale,
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div
            style={{
              width: designSize.width,
              height: designSize.height,
              transform: `scale(${displayScale})`,
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
                  : insertDragOver
                    ? "outline outline-2 outline-signature/70 outline-offset-2"
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
              onPointerDown={(event) => beginMarquee(event, false)}
              onDragEnterCapture={(event) => {
                if (!onInsertDrop || !hasInsertDragData(event.dataTransfer)) {
                  return;
                }
                event.preventDefault();
                setInsertDragOver(true);
              }}
              onDragOverCapture={(event) => {
                if (!onInsertDrop || !hasInsertDragData(event.dataTransfer)) {
                  return;
                }
                // Capture phase so drops work over existing canvas elements.
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
                setInsertDragOver(true);
              }}
              onDragLeave={(event) => {
                if (
                  event.currentTarget.contains(
                    event.relatedTarget as Node | null,
                  )
                ) {
                  return;
                }
                setInsertDragOver(false);
              }}
              onDropCapture={(event) => {
                if (!onInsertDrop) return;
                const payload = getInsertDragData(event.dataTransfer);
                setInsertDragOver(false);
                clearInsertDragData();
                if (!payload) return;
                event.preventDefault();
                event.stopPropagation();
                const canvas = canvasRef.current;
                if (!canvas) return;
                onInsertDrop(payload, {
                  clientX: event.clientX,
                  clientY: event.clientY,
                  canvas,
                });
              }}
            >
            {backgroundTexture !== "none" && (
              <div
                className="pointer-events-none absolute inset-0"
                data-paper-texture={backgroundTexture}
                style={paperTextureLayerStyle({
                  texture: backgroundTexture,
                  opacity: backgroundTextureOpacity,
                  tint: backgroundTextureTint,
                  blend: backgroundTextureBlend,
                })}
                aria-hidden="true"
              />
            )}
            {backgroundPattern !== "none" && (
              <div
                className="pointer-events-none absolute inset-0"
                style={patternOverlay(backgroundPattern) ?? undefined}
                aria-hidden="true"
              />
            )}
            {showGrid && (
              <>
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
                    backgroundSize: "10% 10%",
                  }}
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-y-0 left-1/2 z-30 w-[0.5px] -translate-x-1/2 bg-signature/40"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 top-1/2 z-30 h-[0.5px] -translate-y-1/2 bg-signature/40"
                  aria-hidden="true"
                />
              </>
            )}

            {alignmentGuides.vertical !== null && (
              <div
                className="pointer-events-none absolute inset-y-0 z-40 w-[0.5px] -translate-x-1/2 bg-signature/70"
                style={{ left: `${alignmentGuides.vertical}%` }}
                aria-hidden="true"
              />
            )}
            {alignmentGuides.horizontal !== null && (
              <div
                className="pointer-events-none absolute inset-x-0 z-40 h-[0.5px] -translate-y-1/2 bg-signature/70"
                style={{ top: `${alignmentGuides.horizontal}%` }}
                aria-hidden="true"
              />
            )}
            {edgeGuides.left && (
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-50 w-[0.5px] bg-signature/70"
                aria-hidden="true"
              />
            )}
            {edgeGuides.right && (
              <div
                className="pointer-events-none absolute inset-y-0 right-0 z-50 w-[0.5px] bg-signature/70"
                aria-hidden="true"
              />
            )}
            {edgeGuides.top && (
              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-50 h-[0.5px] bg-signature/70"
                aria-hidden="true"
              />
            )}
            {edgeGuides.bottom && (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-50 h-[0.5px] bg-signature/70"
                aria-hidden="true"
              />
            )}

            {elements.map((el) => {
              const isSelected = selectedIds.includes(el.id);
              const isOnlySelection =
                isSelected && selectedIds.length === 1;
              const isEditing = el.id === editingId;
              const isGuestNameWidget =
                el.type === "widget" && el.widget?.kind === "guest_name";

              return (
                <div
                  key={el.id}
                  data-canvas-element-id={el.id}
                  className="absolute z-10"
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.width}%`,
                    height: el.height ? `${el.height}%` : undefined,
                    transform: `rotate(${el.rotation}deg)`,
                  }}
                  onPointerDown={(event) => {
                    if (event.shiftKey && !isEditing) {
                      event.preventDefault();
                      event.stopPropagation();
                      onStopEdit();
                      onToggleSelect(el.id);
                      return;
                    }
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
                      (el.type === "widget" && !isGuestNameWidget) ||
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
                  {isOnlySelection && isEditing && el.type === "image" && !el.locked && (
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

                  {isOnlySelection && !isEditing && (
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
                        (el.type === "widget" && !isGuestNameWidget) ||
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
                        ? "outline outline-1 outline-signature/80 outline-offset-0"
                        : "hover:outline hover:outline-1 hover:outline-signature/35 hover:outline-offset-0"
                    } ${
                      el.locked
                        ? "cursor-default opacity-90"
                        : isEditing && el.type === "image"
                          ? "cursor-grab active:cursor-grabbing"
                          : "cursor-move"
                    }`}
                  >
                    <div
                      className="relative h-full w-full"
                      style={{
                        ...(el.type === "image" ? undefined : effectStyle(el)),
                        clipPath: canvasClipPath(el),
                      }}
                    >
                    {el.type === "text" &&
                      (isEditing ? (
                        <textarea
                          autoFocus
                          rows={1}
                          value={el.content}
                          ref={(node) => {
                            if (!node || el.height) return;
                            node.style.height = "0px";
                            const lineHeight =
                              el.style.fontSize * el.style.lineHeight;
                            const inferredLines = Math.max(
                              1,
                              Math.round(
                                (node.scrollHeight -
                                  el.style.fontSize * 0.3) /
                                  lineHeight,
                              ),
                            );
                            const explicitLines = node.value.split("\n").length;
                            node.style.height = `${
                              Math.max(inferredLines, explicitLines) *
                              lineHeight
                            }px`;
                          }}
                          onChange={(e) => {
                            if (!el.height) {
                              e.currentTarget.style.height = "0px";
                              const lineHeight =
                                el.style.fontSize * el.style.lineHeight;
                              const inferredLines = Math.max(
                                1,
                                Math.round(
                                  (e.currentTarget.scrollHeight -
                                    el.style.fontSize * 0.3) /
                                    lineHeight,
                                ),
                              );
                              const explicitLines =
                                e.currentTarget.value.split("\n").length;
                              e.currentTarget.style.height = `${
                                Math.max(inferredLines, explicitLines) *
                                lineHeight
                              }px`;
                            }
                            onChangeElement(el.id, { content: e.target.value })
                          }}
                          onBlur={onStopEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") onStopEdit();
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          className={`w-full resize-none overflow-hidden bg-white/40 p-0 outline-none ${canvasFontFamilyClass(el.style.fontFamily)}`}
                          style={{
                            height: el.height ? "100%" : undefined,
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
                            minHeight: el.height
                              ? "100%"
                              : `${el.style.fontSize * el.style.lineHeight}px`,
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
                            data-canvas-text
                            className={`w-full whitespace-pre-wrap break-words ${canvasFontFamilyClass(el.style.fontFamily)}`}
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
                      />
                    )}

                    {el.type === "shape" && (
                      <ShapeElementView
                        kind={el.content}
                        color={el.style.color}
                        borderColor={el.style.shapeBorderColor}
                        borderWidth={el.style.shapeBorderWidth}
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
                        elementStyle={el.style}
                        surfaceColor={backgroundColor}
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
                    </div>

                    {isOnlySelection && isEditing && el.type === "image" && !el.locked && (
                      <>
                        {(() => {
                          const fit = clampImageFit({
                            imageScale: el.style.imageScale,
                            imageOffsetX: el.style.imageOffsetX,
                            imageOffsetY: el.style.imageOffsetY,
                          });
                          const { imageScale: scale } = fit;
                          return (
                            <div
                              className="pointer-events-none absolute z-20 border border-dashed border-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
                              style={{
                                left: `calc(50% - ${scale * 50}%)`,
                                top: `calc(50% - ${scale * 50}%)`,
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

                    {isOnlySelection && !isEditing && !el.locked && (
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
                              className: "h-[7px] w-[7px] rounded-full",
                              cursor: "nwse-resize",
                            },
                            {
                              id: "n" as const,
                              style: {
                                left: "50%",
                                top: 0,
                                transform: `translate(-50%, -50%) scale(${uiScale})`,
                              },
                              className: "h-[5px] w-[9px] rounded-full",
                              cursor: "ns-resize",
                            },
                            {
                              id: "ne" as const,
                              style: {
                                right: 0,
                                top: 0,
                                transform: `translate(50%, -50%) scale(${uiScale})`,
                              },
                              className: "h-[7px] w-[7px] rounded-full",
                              cursor: "nesw-resize",
                            },
                            {
                              id: "e" as const,
                              style: {
                                right: 0,
                                top: "50%",
                                transform: `translate(50%, -50%) scale(${uiScale})`,
                              },
                              className: "h-[9px] w-[5px] rounded-full",
                              cursor: "ew-resize",
                            },
                            {
                              id: "se" as const,
                              style: {
                                right: 0,
                                bottom: 0,
                                transform: `translate(50%, 50%) scale(${uiScale})`,
                              },
                              className: "h-[7px] w-[7px] rounded-full",
                              cursor: "nwse-resize",
                            },
                            {
                              id: "s" as const,
                              style: {
                                left: "50%",
                                bottom: 0,
                                transform: `translate(-50%, 50%) scale(${uiScale})`,
                              },
                              className: "h-[5px] w-[9px] rounded-full",
                              cursor: "ns-resize",
                            },
                            {
                              id: "sw" as const,
                              style: {
                                left: 0,
                                bottom: 0,
                                transform: `translate(-50%, 50%) scale(${uiScale})`,
                              },
                              className: "h-[7px] w-[7px] rounded-full",
                              cursor: "nesw-resize",
                            },
                            {
                              id: "w" as const,
                              style: {
                                left: 0,
                                top: "50%",
                                transform: `translate(-50%, -50%) scale(${uiScale})`,
                              },
                              className: "h-[9px] w-[5px] rounded-full",
                              cursor: "ew-resize",
                            },
                          ] as const
                        ).map((handle) => (
                          <span
                            key={handle.id}
                            data-resize-handle={handle.id}
                            role="presentation"
                            className={`absolute z-30 border border-signature/55 bg-white ${handle.className}`}
                            style={{ ...handle.style, cursor: handle.cursor }}
                            onPointerDown={(event) =>
                              startDrag(event, el.id, "resize", handle.id)
                            }
                            onDoubleClick={
                              (el.type === "text" || isGuestNameWidget) &&
                              (handle.id === "e" || handle.id === "w")
                                ? (event) =>
                                    fitTextWidth(event, el.id, handle.id)
                                : undefined
                            }
                          />
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {multiSelectionBounds && (
              <div
                data-multi-selection-bounds
                className={`absolute z-30 border border-dashed border-signature/45 ${
                  groupDragAnchorId ? "cursor-move" : "cursor-default"
                }`}
                style={{
                  left: `${multiSelectionBounds.x}%`,
                  top: `${multiSelectionBounds.y}%`,
                  width: `${multiSelectionBounds.width}%`,
                  height: `${multiSelectionBounds.height}%`,
                }}
                onPointerDown={(event) => {
                  if (event.shiftKey) {
                    event.preventDefault();
                    event.stopPropagation();
                    const underlying = document
                      .elementsFromPoint(event.clientX, event.clientY)
                      .map((node) =>
                        node.closest<HTMLElement>(
                          "[data-canvas-element-id]",
                        ),
                      )
                      .find((node) => node !== null);
                    const id = underlying?.dataset.canvasElementId;
                    if (id) onToggleSelect(id);
                    return;
                  }
                  if (groupDragAnchorId) {
                    startDrag(event, groupDragAnchorId, "move");
                  }
                }}
                aria-hidden="true"
              >
                <span
                  className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-signature px-2 py-0.5 text-[10px] font-semibold text-white"
                  style={{
                    transform: `translate(-50%, calc(-100% - 6px)) scale(${uiScale})`,
                    transformOrigin: "bottom center",
                  }}
                >
                  {selectedIds.length} selected
                </span>
              </div>
            )}

            {marquee && (
              <div
                className="pointer-events-none absolute z-50 border border-signature bg-signature/10"
                style={{
                  left: `${Math.min(marquee.startX, marquee.currentX)}%`,
                  top: `${Math.min(marquee.startY, marquee.currentY)}%`,
                  width: `${Math.abs(marquee.currentX - marquee.startX)}%`,
                  height: `${Math.abs(marquee.currentY - marquee.startY)}%`,
                }}
                aria-hidden="true"
              />
            )}
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
                  onClick: () =>
                    selectedIds.length > 1
                      ? onDeleteMany(selectedIds)
                      : selectedId && onDelete(selectedId),
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
