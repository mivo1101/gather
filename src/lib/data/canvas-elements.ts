export type TextAlign = "left" | "center" | "right" | "justify";
export type VerticalAlign = "top" | "middle" | "bottom";
export type ImageFrame = "none" | "square" | "circle" | "heart" | "rounded";

export interface ElementEffects {
  shadow?: boolean;
  glow?: boolean;
  outline?: boolean;
  shadowInset?: boolean;
}

export interface ElementStyle {
  fontFamily: "playfair" | "urbanist" | "caveat";
  fontSize: number;
  fontWeight: "regular" | "medium" | "bold";
  color: string;
  textAlign: TextAlign;
  lineHeight: number;
  letterSpacing: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  verticalAlign?: VerticalAlign;
  frame?: ImageFrame;
  effects?: ElementEffects;
}

export type CanvasElementType = "text" | "image" | "divider" | "shape";

export type ShapeKind =
  | "square"
  | "rectangle"
  | "circle"
  | "triangle"
  | "line"
  | "diamond"
  | "heart"
  | "star";

export type DividerStyle =
  | "solid"
  | "dashed"
  | "dotted"
  | "double"
  | "thick"
  | "dots"
  | "diamond";

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  /** Position as % of canvas width/height */
  x: number;
  y: number;
  /** Width as % of canvas */
  width: number;
  /** Optional height as % of canvas (images / shapes) */
  height?: number;
  rotation: number;
  locked: boolean;
  /**
   * Text content, image src, shape kind, or divider style.
   */
  content: string;
  style: ElementStyle;
}

function createDefaultTextStyle(
  overrides?: Partial<ElementStyle>,
): ElementStyle {
  return {
    fontFamily: "playfair",
    fontSize: 18,
    fontWeight: "regular",
    color: "#1F2D22",
    textAlign: "center",
    lineHeight: 1.2,
    letterSpacing: 0,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    verticalAlign: "top",
    frame: "none",
    ...overrides,
    effects: { ...overrides?.effects },
  };
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Default wedding invitation layout as editable elements */
export function createDefaultElements(): CanvasElement[] {
  return [
    {
      id: uid("text"),
      type: "text",
      x: 10,
      y: 8,
      width: 80,
      rotation: 0,
      locked: false,
      content: "YOU'RE INVITED TO",
      style: createDefaultTextStyle({
        fontFamily: "urbanist",
        fontSize: 11,
        letterSpacing: 3,
        fontWeight: "bold",
      }),
    },
    {
      id: uid("text"),
      type: "text",
      x: 10,
      y: 16,
      width: 80,
      rotation: 0,
      locked: false,
      content: "Emma\n& Lucas",
      style: createDefaultTextStyle({
        fontFamily: "playfair",
        fontSize: 42,
        lineHeight: 1.05,
      }),
    },
    {
      id: uid("text"),
      type: "text",
      x: 10,
      y: 38,
      width: 80,
      rotation: 0,
      locked: false,
      content: "WEDDING CELEBRATION",
      style: createDefaultTextStyle({
        fontFamily: "urbanist",
        fontSize: 11,
        letterSpacing: 2.5,
        fontWeight: "bold",
      }),
    },
    {
      id: uid("text"),
      type: "text",
      x: 10,
      y: 48,
      width: 80,
      rotation: 0,
      locked: false,
      content: "JULY  ·  SATURDAY  18  ·  4:00 PM\nJULY 2027",
      style: createDefaultTextStyle({
        fontFamily: "urbanist",
        fontSize: 12,
        letterSpacing: 1.5,
        lineHeight: 1.6,
        fontWeight: "medium",
      }),
    },
    {
      id: uid("text"),
      type: "text",
      x: 10,
      y: 68,
      width: 80,
      rotation: 0,
      locked: false,
      content: "THE GARDEN VALLEY",
      style: createDefaultTextStyle({
        fontFamily: "urbanist",
        fontSize: 12,
        letterSpacing: 2,
        fontWeight: "bold",
      }),
    },
    {
      id: uid("text"),
      type: "text",
      x: 10,
      y: 74,
      width: 80,
      rotation: 0,
      locked: false,
      content: "123 Blossom Lane, Melbourne VIC",
      style: createDefaultTextStyle({
        fontFamily: "urbanist",
        fontSize: 11,
        color: "#1F2D22B3",
      }),
    },
    {
      id: uid("text"),
      type: "text",
      x: 10,
      y: 84,
      width: 80,
      rotation: 0,
      locked: false,
      content: "Reception to follow",
      style: createDefaultTextStyle({
        fontFamily: "playfair",
        fontSize: 13,
        italic: true,
        color: "#1F2D22B3",
      }),
    },
    {
      id: uid("image"),
      type: "image",
      x: 68,
      y: -2,
      width: 38,
      height: 22,
      rotation: 0,
      locked: false,
      content: "/images/flowers/flower-8.png",
      style: createDefaultTextStyle(),
    },
    {
      id: uid("image"),
      type: "image",
      x: -6,
      y: 82,
      width: 38,
      height: 22,
      rotation: 0,
      locked: false,
      content: "/images/flowers/flower-3.png",
      style: createDefaultTextStyle(),
    },
  ];
}

export function normalizeElements(raw: unknown): CanvasElement[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return createDefaultElements();
  }

  return raw.map((item) => {
    const el = item as Partial<CanvasElement>;
    return {
      id: el.id ?? uid("el"),
      type: el.type ?? "text",
      x: typeof el.x === "number" ? el.x : 10,
      y: typeof el.y === "number" ? el.y : 10,
      width: typeof el.width === "number" ? el.width : 80,
      height: el.height,
      rotation: typeof el.rotation === "number" ? el.rotation : 0,
      locked: Boolean(el.locked),
      content: typeof el.content === "string" ? el.content : "Text",
      style: createDefaultTextStyle(el.style),
    };
  });
}

export function createTextElement(partial?: Partial<CanvasElement>): CanvasElement {
  return {
    id: uid("text"),
    type: "text",
    x: 20,
    y: 40,
    width: 60,
    rotation: 0,
    locked: false,
    content: "Double-click to edit",
    ...partial,
    style: createDefaultTextStyle({ fontSize: 20, ...partial?.style }),
  };
}

export function createImageElement(
  src = "/images/flowers/flower-8.png",
  color = "#1F2D22",
): CanvasElement {
  return {
    id: uid("image"),
    type: "image",
    x: 25,
    y: 30,
    width: 50,
    height: 28,
    rotation: 0,
    locked: false,
    content: src,
    style: createDefaultTextStyle({ color }),
  };
}

export function createShapeElement(
  kind: ShapeKind = "square",
  color = "#1F2D22",
): CanvasElement {
  return {
    id: uid("shape"),
    type: "shape",
    x: 35,
    y: 40,
    width: kind === "line" ? 50 : kind === "rectangle" ? 40 : 28,
    height: kind === "line" ? 2 : kind === "rectangle" ? 22 : 16,
    rotation: 0,
    locked: false,
    content: kind,
    style: createDefaultTextStyle({ color }),
  };
}

export function createDividerElement(
  variant: DividerStyle = "solid",
  color = "#ff60aa",
): CanvasElement {
  return {
    id: uid("divider"),
    type: "divider",
    x: 20,
    y: 50,
    width: 60,
    height: variant === "thick" ? 2 : 1.5,
    rotation: 0,
    locked: false,
    content: variant,
    style: createDefaultTextStyle({ color }),
  };
}

/** Sparse starter page — mostly blank for additional cards */
export function createBlankPageElements(): CanvasElement[] {
  return [
    createTextElement({
      x: 15,
      y: 40,
      width: 70,
      content: "New card",
      style: createDefaultTextStyle({
        fontFamily: "playfair",
        fontSize: 28,
      }),
    }),
  ];
}


