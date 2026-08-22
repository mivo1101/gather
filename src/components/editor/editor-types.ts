import type {
  InvitationCanvasShape,
  InvitationCustomSize,
  InvitationSizeUnit,
} from "@/lib/data/invitation-content";
import { DEFAULT_INVITATION_CUSTOM_SIZE } from "@/lib/data/invitation-content";

export type EditorToolId =
  | "templates"
  | "layout"
  | "elements"
  | "text"
  | "images"
  | "uploads"
  | "interactive"
  | "background"
  | "qr"
  | "brand";

export type InvitationShape = InvitationCanvasShape;
export type PropertiesTab = "style" | "position";

export type SizeUnit = InvitationSizeUnit;

export type CustomCanvasSize = InvitationCustomSize;

export const SIZE_UNITS: { id: SizeUnit; label: string }[] = [
  { id: "px", label: "px" },
  { id: "cm", label: "cm" },
  { id: "mm", label: "mm" },
  { id: "in", label: "in" },
];

export const DEFAULT_CUSTOM_SIZE: CustomCanvasSize = {
  ...DEFAULT_INVITATION_CUSTOM_SIZE,
};

export function formatCustomSize(size: CustomCanvasSize): string {
  const w = Number.isFinite(size.width) ? trimNum(size.width) : "-";
  const h = Number.isFinite(size.height) ? trimNum(size.height) : "-";
  return `${w} × ${h} ${size.unit}`;
}

function trimNum(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}

/** Special selection id when the card background is selected */
export const CANVAS_SELECTION_ID = "__canvas__";

export const EDITOR_TOOLS: {
  id: EditorToolId;
  label: string;
}[] = [
  { id: "templates", label: "Templates" },
  { id: "layout", label: "Layout" },
  { id: "background", label: "Background" },
  { id: "text", label: "Text" },
  { id: "elements", label: "Elements" },
  { id: "images", label: "Images" },
  { id: "uploads", label: "Uploads" },
  { id: "interactive", label: "Interactive" },
  { id: "qr", label: "QR Code" },
  { id: "brand", label: "Brand Kit" },
];

export const INVITATION_SHAPES: {
  id: InvitationShape;
  label: string;
  size: string;
}[] = [
  { id: "portrait", label: "Portrait", size: "1080 × 1920 px" },
  { id: "landscape", label: "Landscape", size: "1920 × 1080 px" },
  { id: "square", label: "Square", size: "1080 × 1080 px" },
  { id: "custom", label: "Custom size", size: "Set your own" },
];
