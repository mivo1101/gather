export type EditorToolId =
  | "templates"
  | "layout"
  | "elements"
  | "text"
  | "images"
  | "uploads"
  | "background"
  | "qr"
  | "brand";

export type InvitationShape = "portrait" | "landscape" | "square" | "custom";
export type PreviewDevice = "desktop" | "mobile" | "fullscreen";
export type PropertiesTab = "style" | "position" | "content";

export type SizeUnit = "px" | "cm" | "mm" | "in";

export type CustomCanvasSize = {
  width: number;
  height: number;
  unit: SizeUnit;
};

export const SIZE_UNITS: { id: SizeUnit; label: string }[] = [
  { id: "px", label: "px" },
  { id: "cm", label: "cm" },
  { id: "mm", label: "mm" },
  { id: "in", label: "in" },
];

export const DEFAULT_CUSTOM_SIZE: CustomCanvasSize = {
  width: 10,
  height: 15,
  unit: "cm",
};

export function formatCustomSize(size: CustomCanvasSize): string {
  const w = Number.isFinite(size.width) ? trimNum(size.width) : "—";
  const h = Number.isFinite(size.height) ? trimNum(size.height) : "—";
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
  { id: "elements", label: "Elements" },
  { id: "text", label: "Text" },
  { id: "images", label: "Images" },
  { id: "uploads", label: "Uploads" },
  { id: "background", label: "Background" },
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
