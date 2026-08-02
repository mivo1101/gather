import type { CanvasElement } from "./canvas-elements";
import {
  createDividerElement,
  createImageElement,
  createShapeElement,
  createTextElement,
  type DividerStyle,
  type ShapeKind,
} from "./canvas-elements";

/** Top-level browse categories (Canva-style) */
export type ElementCategoryId = "patterns" | "shapes" | "dividers";

/** Sub-filters inside Patterns */
export type PatternSubcategoryId =
  | "all"
  | "flowers"
  | "monogram"
  | "icons"
  | "social";

/** Sub-filters inside Shapes (Canva-style groups) */
export type ShapeSubcategoryId =
  | "all"
  | "lines"
  | "basic"
  | "polygons"
  | "stars";

export interface LibraryElement {
  id: string;
  name: string;
  category: ElementCategoryId;
  /** Subcategory for Patterns */
  subcategory?: Exclude<PatternSubcategoryId, "all">;
  /** Subcategory for Shapes */
  shapeGroup?: Exclude<ShapeSubcategoryId, "all">;
  preview: string;
  kind: "pattern" | "shape" | "divider" | "monogram";
  shapeKind?: ShapeKind;
  dividerStyle?: DividerStyle;
  tags?: string[];
}

export const ELEMENT_CATEGORIES: {
  id: ElementCategoryId;
  label: string;
}[] = [
  { id: "patterns", label: "Patterns" },
  { id: "shapes", label: "Shapes" },
  { id: "dividers", label: "Dividers" },
];

export const PATTERN_SUBCATEGORIES: {
  id: PatternSubcategoryId;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "flowers", label: "Flowers" },
  { id: "monogram", label: "Monogram" },
  { id: "icons", label: "Icons" },
  { id: "social", label: "Social" },
];

export const SHAPE_SUBCATEGORIES: {
  id: ShapeSubcategoryId;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "lines", label: "Lines" },
  { id: "basic", label: "Basic shapes" },
  { id: "polygons", label: "Polygons" },
  { id: "stars", label: "Stars" },
];

export const LIBRARY_ELEMENTS: LibraryElement[] = [
  // Patterns — Flowers
  {
    id: "floral-corner-bloom",
    name: "Corner bloom",
    category: "patterns",
    subcategory: "flowers",
    preview: "/images/flowers/flower-3.png",
    kind: "pattern",
    tags: ["flower", "corner", "bloom", "pattern"],
  },
  {
    id: "floral-spray",
    name: "Spray",
    category: "patterns",
    subcategory: "flowers",
    preview: "/images/flowers/flower-8.png",
    kind: "pattern",
    tags: ["flower", "spray", "pattern"],
  },
  {
    id: "floral-wreath",
    name: "Wreath sprig",
    category: "patterns",
    subcategory: "flowers",
    preview: "/images/flowers/flower-1.png",
    kind: "pattern",
    tags: ["flower", "sprig", "pattern"],
  },
  {
    id: "floral-cascade",
    name: "Cascade",
    category: "patterns",
    subcategory: "flowers",
    preview: "/images/flowers/flower-2.png",
    kind: "pattern",
    tags: ["flower", "pattern"],
  },
  {
    id: "floral-branch",
    name: "Branch",
    category: "patterns",
    subcategory: "flowers",
    preview: "/images/flowers/flower-4.png",
    kind: "pattern",
    tags: ["flower", "branch", "pattern"],
  },
  {
    id: "floral-tall",
    name: "Tall stem",
    category: "patterns",
    subcategory: "flowers",
    preview: "/images/flowers/flower-5.png",
    kind: "pattern",
    tags: ["flower", "pattern"],
  },
  {
    id: "floral-pair",
    name: "Leaf pair",
    category: "patterns",
    subcategory: "flowers",
    preview: "/images/flowers/flower-6.png",
    kind: "pattern",
    tags: ["flower", "leaf", "pattern"],
  },
  {
    id: "floral-arch",
    name: "Arch sprig",
    category: "patterns",
    subcategory: "flowers",
    preview: "/images/flowers/flower-7.png",
    kind: "pattern",
    tags: ["flower", "pattern"],
  },
  // Patterns — Monogram
  {
    id: "mono-circle",
    name: "Circle mark",
    category: "patterns",
    subcategory: "monogram",
    preview: "",
    kind: "monogram",
    tags: ["monogram", "circle", "pattern"],
  },
  {
    id: "mono-script",
    name: "Script mark",
    category: "patterns",
    subcategory: "monogram",
    preview: "",
    kind: "monogram",
    tags: ["monogram", "script", "pattern"],
  },
  {
    id: "mono-initials",
    name: "Initials frame",
    category: "patterns",
    subcategory: "monogram",
    preview: "",
    kind: "monogram",
    tags: ["monogram", "initials", "pattern"],
  },
  // Patterns — Icons (placed as shapes so tile + canvas match)
  {
    id: "icon-heart",
    name: "Heart",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "heart",
    tags: ["icon", "heart", "pattern"],
  },
  {
    id: "icon-star",
    name: "Star",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "star",
    tags: ["icon", "star", "pattern"],
  },
  {
    id: "icon-clock",
    name: "Clock",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_clock",
    tags: ["icon", "clock", "time", "event"],
  },
  {
    id: "icon-calendar",
    name: "Calendar",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_calendar",
    tags: ["icon", "calendar", "date", "event"],
  },
  {
    id: "icon-location",
    name: "Location",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_location",
    tags: ["icon", "location", "pin", "map", "venue"],
  },
  {
    id: "icon-bell",
    name: "Bell",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_bell",
    tags: ["icon", "bell", "notification", "reminder"],
  },
  {
    id: "icon-envelope",
    name: "Envelope",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_envelope",
    tags: ["icon", "mail", "envelope", "invitation", "rsvp"],
  },
  {
    id: "icon-gift",
    name: "Gift",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_gift",
    tags: ["icon", "gift", "present", "registry"],
  },
  {
    id: "icon-camera",
    name: "Camera",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_camera",
    tags: ["icon", "camera", "photo", "photography"],
  },
  {
    id: "icon-music",
    name: "Music",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_music",
    tags: ["icon", "music", "song", "dance"],
  },
  {
    id: "icon-cake",
    name: "Cake",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_cake",
    tags: ["icon", "cake", "birthday", "celebration"],
  },
  {
    id: "icon-rings",
    name: "Rings",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_rings",
    tags: ["icon", "rings", "wedding", "marriage"],
  },
  // Patterns — Social (placeholders)
  {
    id: "social-web",
    name: "Website",
    category: "patterns",
    subcategory: "social",
    preview: "",
    kind: "monogram",
    tags: ["social", "web", "pattern"],
  },
  {
    id: "social-handle",
    name: "Handle",
    category: "patterns",
    subcategory: "social",
    preview: "",
    kind: "monogram",
    tags: ["social", "handle", "pattern"],
  },
  // Shapes — Lines
  {
    id: "shape-line",
    name: "Line",
    category: "shapes",
    shapeGroup: "lines",
    preview: "",
    kind: "shape",
    shapeKind: "line",
    tags: ["shape", "line"],
  },
  {
    id: "shape-line-dashed",
    name: "Dashed line",
    category: "shapes",
    shapeGroup: "lines",
    preview: "",
    kind: "shape",
    shapeKind: "line_dashed",
    tags: ["shape", "line", "dashed"],
  },
  {
    id: "shape-line-dotted",
    name: "Dotted line",
    category: "shapes",
    shapeGroup: "lines",
    preview: "",
    kind: "shape",
    shapeKind: "line_dotted",
    tags: ["shape", "line", "dotted"],
  },
  {
    id: "shape-arrow",
    name: "Arrow",
    category: "shapes",
    shapeGroup: "lines",
    preview: "",
    kind: "shape",
    shapeKind: "arrow",
    tags: ["shape", "arrow", "line"],
  },
  {
    id: "shape-arrow-thin",
    name: "Thin arrow",
    category: "shapes",
    shapeGroup: "lines",
    preview: "",
    kind: "shape",
    shapeKind: "arrow_thin",
    tags: ["shape", "arrow", "line"],
  },
  // Shapes — Basic
  {
    id: "shape-square",
    name: "Square",
    category: "shapes",
    shapeGroup: "basic",
    preview: "",
    kind: "shape",
    shapeKind: "square",
    tags: ["shape", "square", "basic"],
  },
  {
    id: "shape-rounded-square",
    name: "Rounded square",
    category: "shapes",
    shapeGroup: "basic",
    preview: "",
    kind: "shape",
    shapeKind: "rounded_square",
    tags: ["shape", "rounded", "square", "basic"],
  },
  {
    id: "shape-rectangle",
    name: "Rectangle",
    category: "shapes",
    shapeGroup: "basic",
    preview: "",
    kind: "shape",
    shapeKind: "rectangle",
    tags: ["shape", "rectangle", "basic"],
  },
  {
    id: "shape-circle",
    name: "Circle",
    category: "shapes",
    shapeGroup: "basic",
    preview: "",
    kind: "shape",
    shapeKind: "circle",
    tags: ["shape", "circle", "basic"],
  },
  {
    id: "shape-oval",
    name: "Oval",
    category: "shapes",
    shapeGroup: "basic",
    preview: "",
    kind: "shape",
    shapeKind: "oval",
    tags: ["shape", "oval", "ellipse", "basic"],
  },
  {
    id: "shape-triangle",
    name: "Triangle",
    category: "shapes",
    shapeGroup: "basic",
    preview: "",
    kind: "shape",
    shapeKind: "triangle",
    tags: ["shape", "triangle", "basic"],
  },
  {
    id: "shape-triangle-down",
    name: "Triangle down",
    category: "shapes",
    shapeGroup: "basic",
    preview: "",
    kind: "shape",
    shapeKind: "triangle_down",
    tags: ["shape", "triangle", "basic"],
  },
  {
    id: "shape-diamond",
    name: "Diamond",
    category: "shapes",
    shapeGroup: "basic",
    preview: "",
    kind: "shape",
    shapeKind: "diamond",
    tags: ["shape", "diamond", "basic"],
  },
  {
    id: "shape-parallelogram",
    name: "Parallelogram",
    category: "shapes",
    shapeGroup: "basic",
    preview: "",
    kind: "shape",
    shapeKind: "parallelogram",
    tags: ["shape", "parallelogram", "basic"],
  },
  {
    id: "shape-trapezoid",
    name: "Trapezoid",
    category: "shapes",
    shapeGroup: "basic",
    preview: "",
    kind: "shape",
    shapeKind: "trapezoid",
    tags: ["shape", "trapezoid", "basic"],
  },
  {
    id: "shape-cross",
    name: "Cross",
    category: "shapes",
    shapeGroup: "basic",
    preview: "",
    kind: "shape",
    shapeKind: "cross",
    tags: ["shape", "cross", "plus", "basic"],
  },
  {
    id: "shape-semicircle",
    name: "Semicircle",
    category: "shapes",
    shapeGroup: "basic",
    preview: "",
    kind: "shape",
    shapeKind: "semicircle",
    tags: ["shape", "semicircle", "basic"],
  },
  {
    id: "shape-heart",
    name: "Heart",
    category: "shapes",
    shapeGroup: "basic",
    preview: "",
    kind: "shape",
    shapeKind: "heart",
    tags: ["shape", "heart", "basic"],
  },
  // Shapes — Polygons
  {
    id: "shape-pentagon",
    name: "Pentagon",
    category: "shapes",
    shapeGroup: "polygons",
    preview: "",
    kind: "shape",
    shapeKind: "pentagon",
    tags: ["shape", "pentagon", "polygon"],
  },
  {
    id: "shape-hexagon",
    name: "Hexagon",
    category: "shapes",
    shapeGroup: "polygons",
    preview: "",
    kind: "shape",
    shapeKind: "hexagon",
    tags: ["shape", "hexagon", "polygon"],
  },
  {
    id: "shape-hexagon-flat",
    name: "Flat hexagon",
    category: "shapes",
    shapeGroup: "polygons",
    preview: "",
    kind: "shape",
    shapeKind: "hexagon_flat",
    tags: ["shape", "hexagon", "polygon"],
  },
  {
    id: "shape-octagon",
    name: "Octagon",
    category: "shapes",
    shapeGroup: "polygons",
    preview: "",
    kind: "shape",
    shapeKind: "octagon",
    tags: ["shape", "octagon", "polygon"],
  },
  // Shapes — Stars
  {
    id: "shape-star-4",
    name: "4-point star",
    category: "shapes",
    shapeGroup: "stars",
    preview: "",
    kind: "shape",
    shapeKind: "star_4",
    tags: ["shape", "star"],
  },
  {
    id: "shape-star",
    name: "5-point star",
    category: "shapes",
    shapeGroup: "stars",
    preview: "",
    kind: "shape",
    shapeKind: "star",
    tags: ["shape", "star"],
  },
  {
    id: "shape-star-6",
    name: "6-point star",
    category: "shapes",
    shapeGroup: "stars",
    preview: "",
    kind: "shape",
    shapeKind: "star_6",
    tags: ["shape", "star"],
  },
  {
    id: "shape-star-8",
    name: "8-point star",
    category: "shapes",
    shapeGroup: "stars",
    preview: "",
    kind: "shape",
    shapeKind: "star_8",
    tags: ["shape", "star"],
  },
  {
    id: "shape-burst",
    name: "Burst",
    category: "shapes",
    shapeGroup: "stars",
    preview: "",
    kind: "shape",
    shapeKind: "burst",
    tags: ["shape", "star", "burst"],
  },
  // Dividers
  {
    id: "divider-solid",
    name: "Solid line",
    category: "dividers",
    preview: "",
    kind: "divider",
    dividerStyle: "solid",
    tags: ["divider", "line"],
  },
  {
    id: "divider-dashed",
    name: "Dashed",
    category: "dividers",
    preview: "",
    kind: "divider",
    dividerStyle: "dashed",
    tags: ["divider", "dashed"],
  },
  {
    id: "divider-dotted",
    name: "Dotted",
    category: "dividers",
    preview: "",
    kind: "divider",
    dividerStyle: "dotted",
    tags: ["divider", "dotted"],
  },
  {
    id: "divider-double",
    name: "Double line",
    category: "dividers",
    preview: "",
    kind: "divider",
    dividerStyle: "double",
    tags: ["divider", "double"],
  },
  {
    id: "divider-thick",
    name: "Thick bar",
    category: "dividers",
    preview: "",
    kind: "divider",
    dividerStyle: "thick",
    tags: ["divider", "thick"],
  },
  {
    id: "divider-dots",
    name: "Dot row",
    category: "dividers",
    preview: "",
    kind: "divider",
    dividerStyle: "dots",
    tags: ["divider", "dots"],
  },
  {
    id: "divider-diamond",
    name: "Diamond rule",
    category: "dividers",
    preview: "",
    kind: "divider",
    dividerStyle: "diamond",
    tags: ["divider", "diamond"],
  },
];

export function searchLibraryElements(query: string): LibraryElement[] {
  const q = query.trim().toLowerCase();
  if (!q) return LIBRARY_ELEMENTS;
  return LIBRARY_ELEMENTS.filter((item) => {
    const hay = [
      item.name,
      item.category,
      item.subcategory ?? "",
      ...(item.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

/** Decorative pattern graphics (flowers etc.) — not photos/videos. */
export function isPatternGraphicSrc(src: string): boolean {
  return src.startsWith("/images/flowers/");
}

/** Glyph + style for monogram / social marks placed as text on the canvas. */
export function patternMarkSpec(id: string): {
  glyph: string;
  fontFamily: "playfair" | "caveat" | "urbanist";
  fontSize: number;
} {
  switch (id) {
    case "mono-circle":
      return { glyph: "◯", fontFamily: "playfair", fontSize: 40 };
    case "mono-script":
      return { glyph: "ℰ", fontFamily: "caveat", fontSize: 48 };
    case "mono-initials":
      return { glyph: "A · B", fontFamily: "playfair", fontSize: 28 };
    case "social-web":
      return { glyph: "www", fontFamily: "urbanist", fontSize: 18 };
    case "social-handle":
      return { glyph: "@", fontFamily: "urbanist", fontSize: 36 };
    default:
      return { glyph: "◆", fontFamily: "playfair", fontSize: 36 };
  }
}

export function createElementFromLibrary(item: LibraryElement): CanvasElement {
  if (item.kind === "pattern") {
    return createImageElement(item.preview, "#1F2D22");
  }
  if (item.kind === "divider") {
    return createDividerElement(item.dividerStyle ?? "solid");
  }
  if (item.kind === "shape" && item.shapeKind) {
    return createShapeElement(item.shapeKind);
  }
  const mark = patternMarkSpec(item.id);
  return createTextElement({
    content: mark.glyph,
    width: item.id === "mono-initials" ? 36 : 28,
    x: 36,
    y: 40,
    style: {
      fontFamily: mark.fontFamily,
      fontSize: mark.fontSize,
      fontWeight: "regular",
      color: "#1f2d22",
      textAlign: "center",
      lineHeight: 1,
      letterSpacing: 0,
      bold: false,
      italic: false,
      underline: false,
      strike: false,
    },
  });
}
