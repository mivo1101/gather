import { contrastingInk } from "@/lib/color-utils";
import type { CanvasFontFamily } from "@/lib/canvas-fonts";

export type TextAlign = "left" | "center" | "right" | "justify";
export type VerticalAlign = "top" | "middle" | "bottom";
export type ImageFrame =
  | "none"
  | "square"
  | "rounded"
  | "circle"
  | "arch"
  | "heart"
  | "triangle"
  | "inverted-triangle"
  | "diamond"
  | "pentagon"
  | "hexagon"
  | "octagon"
  | "star"
  | "badge"
  | "scallop";

export type EffectKind = "none" | "drop" | "glow" | "echo";

export interface ElementEffects {
  /** Active effect preset — preferred over legacy booleans. */
  kind?: EffectKind;
  /** Shadow angle in degrees (Canva-style; 0 = right, -90 = up). */
  direction?: number;
  /** Distance of the shadow from the shape. */
  offset?: number;
  /** Shadow blur radius. */
  blur?: number;
  /** 0 = solid, 100 = invisible. */
  transparency?: number;
  /** @deprecated Prefer `kind: "drop"` */
  shadow?: boolean;
  /** @deprecated Prefer `kind: "glow"` */
  glow?: boolean;
  /** @deprecated Prefer `kind` presets */
  outline?: boolean;
  /** @deprecated Prefer `kind: "drop"` with inset rendering if needed */
  shadowInset?: boolean;
}

export interface ElementStyle {
  fontFamily: CanvasFontFamily;
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
  /** Photo zoom inside the frame (1 = cover). */
  imageScale?: number;
  /** Photo pan inside the frame, % of frame size from center. */
  imageOffsetX?: number;
  imageOffsetY?: number;
  /** Optional inner border for vector/basic shape elements. */
  shapeBorderColor?: string;
  /** Shape border thickness in screen pixels. */
  shapeBorderWidth?: number;
}

export type WidgetKind =
  | "map"
  | "attend"
  | "short_text"
  | "single_choice"
  | "multi_choice";

/** Human-facing name for a widget kind (badges, tool panels). */
export function widgetKindLabel(kind: WidgetKind): string {
  switch (kind) {
    case "map":
      return "Map";
    case "attend":
      return "Yes / No";
    case "short_text":
      return "Open answer";
    case "single_choice":
      return "Single choice";
    case "multi_choice":
      return "Multi choice";
  }
}

export interface WidgetChoiceOption {
  id: string;
  label: string;
}

/** Shared chrome for widget surfaces (buttons, inputs, options). */
export interface WidgetChromeStyle {
  /** CSS color or `transparent` */
  background: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: "none" | "solid" | "dashed";
  /** Corner radius in px */
  radius: number;
  textColor?: string;
}

export interface WidgetLabelStyle {
  color: string;
}

export interface MapWidgetConfig {
  kind: "map";
  /** Search query for the embed only — venue/address are separate text elements */
  mapsQuery: string;
  /** Corner radius of the map frame in px */
  radius: number;
  /** Optional button below the map that opens Google Maps in a new tab */
  showButton: boolean;
  buttonLabel: string;
  buttonStyle: WidgetChromeStyle;
}

export interface AttendWidgetConfig {
  kind: "attend";
  label: string;
  yesLabel: string;
  noLabel: string;
  required?: boolean;
  labelStyle: WidgetLabelStyle;
  buttonStyle: WidgetChromeStyle;
}

export interface ShortTextWidgetConfig {
  kind: "short_text";
  label: string;
  placeholder: string;
  required?: boolean;
  labelStyle: WidgetLabelStyle;
  fieldStyle: WidgetChromeStyle;
}

export interface ChoiceWidgetConfig {
  kind: "single_choice" | "multi_choice";
  label: string;
  options: WidgetChoiceOption[];
  required?: boolean;
  labelStyle: WidgetLabelStyle;
  optionStyle: WidgetChromeStyle;
}

export type WidgetConfig =
  | MapWidgetConfig
  | AttendWidgetConfig
  | ShortTextWidgetConfig
  | ChoiceWidgetConfig;

export type CanvasElementType =
  | "text"
  | "image"
  | "divider"
  | "shape"
  | "widget";

export type ShapeKind =
  | "square"
  | "rectangle"
  | "rounded_square"
  | "circle"
  | "oval"
  | "triangle"
  | "triangle_down"
  | "diamond"
  | "parallelogram"
  | "trapezoid"
  | "cross"
  | "semicircle"
  | "line"
  | "line_dashed"
  | "line_dotted"
  | "arrow"
  | "arrow_thin"
  | "pentagon"
  | "hexagon"
  | "hexagon_flat"
  | "octagon"
  | "heart"
  | "star"
  | "star_4"
  | "star_6"
  | "star_8"
  | "burst"
  | "icon_clock"
  | "icon_calendar"
  | "icon_location"
  | "icon_bell"
  | "icon_envelope"
  | "icon_gift"
  | "icon_camera"
  | "icon_music"
  | "icon_cake"
  | "icon_rings";

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
   * Text content, image src, shape kind, divider style, or widget kind.
   */
  content: string;
  style: ElementStyle;
  /** Present when type is widget */
  widget?: WidgetConfig | null;
  /** Optional hyperlink for text (and other) elements — Canva-style Link */
  href?: string | null;
}

/** Converts legacy radius keywords ("sm", "lg"…) and clamps numbers to px. */
export function normalizeRadius(raw: unknown, fallback = 0): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.max(0, raw);
  }
  switch (raw) {
    case "none":
      return 0;
    case "sm":
      return 6;
    case "md":
      return 12;
    case "lg":
      return 18;
    case "full":
      return 999;
    default:
      return fallback;
  }
}

function defaultChrome(
  overrides?: Partial<WidgetChromeStyle>,
): WidgetChromeStyle {
  const merged = {
    background: "transparent",
    borderColor: "#1F2D22",
    borderWidth: 1,
    borderStyle: "solid" as const,
    radius: 999,
    textColor: "#1F2D22",
    ...overrides,
  };
  return { ...merged, radius: normalizeRadius(merged.radius, 999) };
}

function defaultLabel(color = "#1F2D22"): WidgetLabelStyle {
  return { color };
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
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item) => {
    const el = item as Partial<CanvasElement>;
    const type = normalizeElementType(el.type);
    return {
      id: el.id ?? uid("el"),
      type,
      x: typeof el.x === "number" ? el.x : 10,
      y: typeof el.y === "number" ? el.y : 10,
      width: typeof el.width === "number" ? el.width : 80,
      height: el.height,
      rotation: typeof el.rotation === "number" ? el.rotation : 0,
      locked: Boolean(el.locked),
      content:
        typeof el.content === "string"
          ? el.content
          : type === "widget"
            ? "map"
            : "Text",
      style: createDefaultTextStyle(el.style),
      widget:
        type === "widget"
          ? normalizeWidgetConfig(el.widget, el.content)
          : null,
      href: typeof el.href === "string" && el.href.trim() ? el.href.trim() : null,
    };
  });
}

function normalizeElementType(raw: unknown): CanvasElementType {
  if (
    raw === "text" ||
    raw === "image" ||
    raw === "divider" ||
    raw === "shape" ||
    raw === "widget"
  ) {
    return raw;
  }
  return "text";
}

function normalizeWidgetConfig(
  raw: unknown,
  contentHint?: string,
): WidgetConfig {
  const fallbackKind: WidgetKind =
    contentHint === "attend" ||
    contentHint === "short_text" ||
    contentHint === "single_choice" ||
    contentHint === "multi_choice" ||
    contentHint === "map"
      ? contentHint
      : "map";

  const defaults = createDefaultWidgetConfig(fallbackKind);
  if (!raw || typeof raw !== "object") return defaults;

  const value = raw as Record<string, unknown> & { kind?: string };
  const kind = (value.kind as WidgetKind) || fallbackKind;

  if (kind === "map") {
    const base = defaults as MapWidgetConfig;
    const legacyVenue = typeof value.venue === "string" ? value.venue : "";
    const legacyAddress = typeof value.address === "string" ? value.address : "";
    const mapsQuery =
      typeof value.mapsQuery === "string" && value.mapsQuery.trim()
        ? value.mapsQuery
        : [legacyVenue, legacyAddress].filter(Boolean).join(", ") ||
          base.mapsQuery;
    // Legacy configs stored radius inside `chrome`
    const legacyChrome =
      value.chrome && typeof value.chrome === "object"
        ? (value.chrome as Record<string, unknown>)
        : null;
    const radius = normalizeRadius(
      value.radius ?? legacyChrome?.radius,
      base.radius,
    );
    return {
      kind: "map",
      mapsQuery,
      radius,
      showButton:
        typeof value.showButton === "boolean"
          ? value.showButton
          : base.showButton,
      buttonLabel:
        typeof value.buttonLabel === "string" && value.buttonLabel.trim()
          ? value.buttonLabel
          : base.buttonLabel,
      buttonStyle: defaultChrome({
        ...base.buttonStyle,
        ...(typeof value.buttonStyle === "object" && value.buttonStyle
          ? (value.buttonStyle as Partial<WidgetChromeStyle>)
          : {}),
      }),
    };
  }

  if (kind === "attend") {
    const base = defaults as AttendWidgetConfig;
    return {
      kind: "attend",
      label: typeof value.label === "string" ? value.label : base.label,
      yesLabel:
        typeof value.yesLabel === "string" ? value.yesLabel : base.yesLabel,
      noLabel: typeof value.noLabel === "string" ? value.noLabel : base.noLabel,
      required: Boolean(value.required ?? base.required),
      labelStyle: {
        ...base.labelStyle,
        ...(typeof value.labelStyle === "object" && value.labelStyle
          ? (value.labelStyle as WidgetLabelStyle)
          : {}),
      },
      buttonStyle: defaultChrome({
        ...base.buttonStyle,
        ...(typeof value.buttonStyle === "object" && value.buttonStyle
          ? (value.buttonStyle as Partial<WidgetChromeStyle>)
          : {}),
      }),
    };
  }

  if (kind === "short_text") {
    const base = defaults as ShortTextWidgetConfig;
    return {
      kind: "short_text",
      label: typeof value.label === "string" ? value.label : base.label,
      placeholder:
        typeof value.placeholder === "string"
          ? value.placeholder
          : base.placeholder,
      required: Boolean(value.required ?? base.required),
      labelStyle: {
        ...base.labelStyle,
        ...(typeof value.labelStyle === "object" && value.labelStyle
          ? (value.labelStyle as WidgetLabelStyle)
          : {}),
      },
      fieldStyle: defaultChrome({
        ...base.fieldStyle,
        ...(typeof value.fieldStyle === "object" && value.fieldStyle
          ? (value.fieldStyle as Partial<WidgetChromeStyle>)
          : {}),
      }),
    };
  }

  const base = defaults as ChoiceWidgetConfig;
  const options = Array.isArray(value.options)
    ? (value.options as WidgetChoiceOption[])
    : base.options;
  return {
    kind,
    label: typeof value.label === "string" ? value.label : base.label,
    required: Boolean(value.required ?? base.required),
    options: options.map((o) => ({
      id: o.id || uid("opt"),
      label: o.label || "Option",
    })),
    labelStyle: {
      ...base.labelStyle,
      ...(typeof value.labelStyle === "object" && value.labelStyle
        ? (value.labelStyle as WidgetLabelStyle)
        : {}),
    },
    optionStyle: defaultChrome({
      ...base.optionStyle,
      ...(typeof value.optionStyle === "object" && value.optionStyle
        ? (value.optionStyle as Partial<WidgetChromeStyle>)
        : {}),
    }),
  };
}

export function createDefaultWidgetConfig(
  kind: WidgetKind,
  options?: { surfaceColor?: string | null },
): WidgetConfig {
  const { ink, muted, fill } = contrastingInk(options?.surfaceColor);

  switch (kind) {
    case "map":
      return {
        kind: "map",
        mapsQuery: "Melbourne, Australia",
        radius: 18,
        showButton: true,
        buttonLabel: "Open in Google Maps",
        buttonStyle: defaultChrome({
          background: ink,
          textColor: isLightInk(ink) ? "#1F2D22" : "#FFFFFF",
          borderColor: ink,
          borderWidth: 0,
          borderStyle: "none",
          radius: 999,
        }),
      };
    case "attend":
      return {
        kind: "attend",
        label: "Will you join us?",
        yesLabel: "Yes, I'll be there",
        noLabel: "Sorry, I can't make it",
        required: true,
        labelStyle: defaultLabel(ink),
        buttonStyle: defaultChrome({
          background: "transparent",
          borderColor: ink,
          textColor: ink,
          borderWidth: 1.5,
          radius: 999,
        }),
      };
    case "short_text":
      return {
        kind: "short_text",
        label: "Your answer",
        placeholder: "Type here…",
        required: false,
        labelStyle: defaultLabel(ink),
        fieldStyle: defaultChrome({
          background: fill,
          borderColor: muted,
          textColor: ink,
          borderWidth: 1,
          radius: 999,
        }),
      };
    case "single_choice":
      return {
        kind: "single_choice",
        label: "Choose one",
        required: false,
        options: [
          { id: uid("opt"), label: "Option A" },
          { id: uid("opt"), label: "Option B" },
        ],
        labelStyle: defaultLabel(ink),
        optionStyle: defaultChrome({
          background: fill,
          borderColor: muted,
          textColor: ink,
          borderWidth: 1,
          radius: 12,
        }),
      };
    case "multi_choice":
      return {
        kind: "multi_choice",
        label: "Select all that apply",
        required: false,
        options: [
          { id: uid("opt"), label: "Option A" },
          { id: uid("opt"), label: "Option B" },
          { id: uid("opt"), label: "Option C" },
        ],
        labelStyle: defaultLabel(ink),
        optionStyle: defaultChrome({
          background: fill,
          borderColor: muted,
          textColor: ink,
          borderWidth: 1,
          radius: 12,
        }),
      };
  }
}

function isLightInk(ink: string) {
  return ink.toUpperCase() === "#FFFFFF";
}

export function createWidgetElement(
  kind: WidgetKind,
  partial?: Partial<CanvasElement>,
  surfaceColor?: string | null,
): CanvasElement {
  const defaults =
    kind === "map"
      ? { x: 10, y: 28, width: 80, height: 42 }
      : kind === "attend"
        ? { x: 12, y: 36, width: 76, height: 22 }
        : kind === "short_text"
          ? { x: 12, y: 40, width: 76, height: 14 }
          : { x: 12, y: 34, width: 76, height: 28 };

  return {
    id: uid("widget"),
    type: "widget",
    rotation: 0,
    locked: false,
    content: kind,
    ...defaults,
    ...partial,
    style: createDefaultTextStyle({
      fontFamily: "urbanist",
      fontSize: 14,
      color: "#1F2D22",
      ...partial?.style,
    }),
    widget: partial?.widget
      ? ({ ...createDefaultWidgetConfig(kind, { surfaceColor }), ...partial.widget, kind } as WidgetConfig)
      : createDefaultWidgetConfig(kind, { surfaceColor }),
  };
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
  const isLine =
    kind === "line" || kind === "line_dashed" || kind === "line_dotted";
  const isArrow = kind === "arrow" || kind === "arrow_thin";
  const isWide =
    kind === "rectangle" ||
    kind === "oval" ||
    kind === "parallelogram" ||
    kind === "trapezoid" ||
    kind === "semicircle";
  const isIcon = kind.startsWith("icon_");

  return {
    id: uid("shape"),
    type: "shape",
    x: isIcon ? 41 : 35,
    y: 40,
    width: isLine || isArrow ? 50 : isWide ? 40 : isIcon ? 18 : 28,
    height: isLine ? 2 : isArrow ? 10 : isWide ? 22 : isIcon ? 18 : 16,
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

/** Empty starter page for new cards */
export function createBlankPageElements(): CanvasElement[] {
  return [];
}
