import type { WidgetKind } from "@/lib/data/canvas-elements";
import type { LibraryElement } from "@/lib/data/element-library";

/** MIME type for panel → canvas insert drags. */
export const EDITOR_INSERT_MIME = "application/x-gather-insert";

export type EditorInsertPayload =
  | { type: "library"; item: LibraryElement }
  | { type: "text"; preset?: "heading" | "subheading" | "body" }
  | { type: "image"; src: string }
  | {
      type: "stock";
      imageUrl: string;
      downloadLocation: string;
    }
  | { type: "widget"; kind: WidgetKind };

/** In-memory payload — custom MIME types are often unavailable during dragover. */
let activeInsertPayload: EditorInsertPayload | null = null;

export function setInsertDragData(
  dataTransfer: DataTransfer,
  payload: EditorInsertPayload,
) {
  activeInsertPayload = payload;
  dataTransfer.setData(EDITOR_INSERT_MIME, JSON.stringify(payload));
  dataTransfer.setData("text/plain", payloadLabel(payload));
  dataTransfer.effectAllowed = "copy";
}

export function clearInsertDragData() {
  activeInsertPayload = null;
}

export function getInsertDragData(
  dataTransfer: DataTransfer,
): EditorInsertPayload | null {
  if (activeInsertPayload) return activeInsertPayload;
  const raw = dataTransfer.getData(EDITOR_INSERT_MIME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EditorInsertPayload;
  } catch {
    return null;
  }
}

export function hasInsertDragData(dataTransfer?: DataTransfer): boolean {
  if (activeInsertPayload) return true;
  if (!dataTransfer) return false;
  return Array.from(dataTransfer.types).includes(EDITOR_INSERT_MIME);
}

/** Place an element so its centre lands under the pointer. */
export function clientPointToCanvasPercent(
  canvasEl: HTMLElement,
  clientX: number,
  clientY: number,
  elementWidthPct: number,
  elementHeightPct: number,
): { x: number; y: number } {
  const rect = canvasEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return {
      x: Math.max(0, (100 - elementWidthPct) / 2),
      y: Math.max(0, (100 - elementHeightPct) / 2),
    };
  }
  const width = Math.max(1, Math.min(100, elementWidthPct));
  const height = Math.max(1, Math.min(100, elementHeightPct));
  const cx = ((clientX - rect.left) / rect.width) * 100;
  const cy = ((clientY - rect.top) / rect.height) * 100;
  return {
    x: Math.max(0, Math.min(100 - width, cx - width / 2)),
    y: Math.max(0, Math.min(100 - height, cy - height / 2)),
  };
}

function payloadLabel(payload: EditorInsertPayload): string {
  switch (payload.type) {
    case "library":
      return payload.item.name;
    case "text":
      return payload.preset ? `Text (${payload.preset})` : "Text";
    case "image":
      return "Image";
    case "stock":
      return "Stock photo";
    case "widget":
      return payload.kind;
  }
}
