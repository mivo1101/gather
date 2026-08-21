import type { CanvasElement, WidgetConfig } from "./canvas-elements";
import {
  createBlankPageElements,
  createDefaultWidgetConfig,
  createTextElement,
  createWidgetElement,
  normalizeElements,
} from "./canvas-elements";

export type InvitationPageKind = "design" | "rsvp" | "location";
export type InvitationPageRole = "cover" | "details" | "location" | "rsvp";

export interface InvitationLocation {
  venue: string;
  address: string;
  /** Query used for Google Maps embed + open link */
  mapsQuery: string;
  /** Button label shown to guests (editable in the editor) */
  ctaLabel?: string;
  /**
   * Optional override for the button URL.
   * When empty, the open link is built from mapsQuery / venue+address.
   */
  ctaUrl?: string;
}

export type RsvpQuestionType =
  | "attend"
  | "short_text"
  | "single_choice"
  | "multi_choice";

export interface RsvpChoiceOption {
  id: string;
  label: string;
}

export interface RsvpQuestion {
  id: string;
  type: RsvpQuestionType;
  label: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  /** attend buttons */
  yesLabel?: string;
  noLabel?: string;
  /** choice options */
  options?: RsvpChoiceOption[];
}

export interface RsvpTheme {
  background: string;
  surface?: string;
  accent: string;
  text: string;
  muted: string;
  buttonStyle: "pill" | "square" | "outline" | "chip";
  headingFont: "playfair" | "urbanist" | "caveat";
  bodyFont: "playfair" | "urbanist" | "caveat";
}

export interface RsvpConfig {
  eyebrow?: string;
  title: string;
  note?: string;
  theme: RsvpTheme;
  questions: RsvpQuestion[];
}

export type PaperTexture =
  | "none"
  | "cotton"
  | "linen"
  | "handmade"
  | "pressed";

export type PaperTextureBlend = "soft-light" | "multiply" | "overlay";

export interface InvitationPage {
  id: string;
  name: string;
  /** Guest-facing purpose used to organise the invitation flow. */
  role: InvitationPageRole;
  /** design = canvas; rsvp / location = interactive guest pages */
  kind: InvitationPageKind;
  elements: CanvasElement[];
  /** Card background colour */
  backgroundColor: string;
  /** Optional decorative pattern over the background */
  backgroundPattern?: "none" | "dots" | "grid" | "stripes" | "waves";
  /** Optional realistic paper surface layered above the card colour. */
  backgroundTexture?: PaperTexture;
  /** Paper texture strength from 0-100. */
  backgroundTextureOpacity?: number;
  /** Optional colour wash applied to the paper fibers. */
  backgroundTextureTint?: string;
  /** How the paper surface interacts with the base card colour. */
  backgroundTextureBlend?: PaperTextureBlend;
  /** Optional card border */
  border?: {
    style: "none" | "solid" | "dashed" | "double" | "ornament";
    color: string;
    width: number;
  } | null;
  /** Present when kind is location */
  location?: InvitationLocation | null;
  /** Present when kind is rsvp */
  rsvpConfig?: RsvpConfig | null;
}

export type InvitationCanvasShape =
  | "portrait"
  | "landscape"
  | "square"
  | "custom";

export type InvitationSizeUnit = "px" | "cm" | "mm" | "in";

export interface InvitationCustomSize {
  width: number;
  height: number;
  unit: InvitationSizeUnit;
}

export const DEFAULT_INVITATION_CUSTOM_SIZE: InvitationCustomSize = {
  width: 10,
  height: 15,
  unit: "cm",
};

export interface InvitationContent {
  invite: {
    eyebrow: string;
    headline: string;
    message: string;
    hosts: string;
  };
  details: {
    venue: string;
    address: string;
    time: string;
    dressCode: string;
    website: string;
  };
  rsvp: {
    prompt: string;
    note: string;
  };
  thanks: {
    message: string;
    signOff: string;
  };
  /** Card layout orientation / custom canvas size */
  shape: InvitationCanvasShape;
  customSize: InvitationCustomSize;
  /** Active page elements (kept in sync for compatibility) */
  elements: CanvasElement[];
  /** All invitation cards/pages */
  pages: InvitationPage[];
  activePageId: string;
}

function pageId() {
  return `page_${Math.random().toString(36).slice(2, 9)}`;
}

function createPage(
  name: string,
  elements: CanvasElement[],
  backgroundColor = "#ffffff",
  role: InvitationPageRole = "details",
): InvitationPage {
  return {
    id: pageId(),
    name,
    role,
    kind: "design",
    elements,
    backgroundColor,
    backgroundPattern: "none",
    backgroundTexture: "none",
    backgroundTextureOpacity: 22,
    backgroundTextureTint: "#ffffff",
    backgroundTextureBlend: "soft-light",
    border: null,
    location: null,
    rsvpConfig: null,
  };
}

function normalizeCanvasShape(raw: unknown): InvitationCanvasShape {
  if (
    raw === "portrait" ||
    raw === "landscape" ||
    raw === "square" ||
    raw === "custom"
  ) {
    return raw;
  }
  return "portrait";
}

function normalizeCustomSize(raw: unknown): InvitationCustomSize {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_INVITATION_CUSTOM_SIZE };
  const value = raw as Partial<InvitationCustomSize>;
  const unit =
    value.unit === "px" ||
    value.unit === "cm" ||
    value.unit === "mm" ||
    value.unit === "in"
      ? value.unit
      : DEFAULT_INVITATION_CUSTOM_SIZE.unit;
  const width =
    typeof value.width === "number" && Number.isFinite(value.width) && value.width > 0
      ? value.width
      : DEFAULT_INVITATION_CUSTOM_SIZE.width;
  const height =
    typeof value.height === "number" &&
    Number.isFinite(value.height) &&
    value.height > 0
      ? value.height
      : DEFAULT_INVITATION_CUSTOM_SIZE.height;
  return { width, height, unit };
}

export function createDefaultContent(input?: {
  title?: string;
  location?: string;
  shape?: InvitationCanvasShape;
  customSize?: InvitationCustomSize;
}): InvitationContent {
  const title = input?.title?.trim() || "a special gathering";
  const location = input?.location?.trim() || "The Grand Pavilion";
  // New invitations start blank - templates apply premade layouts later
  const elements: CanvasElement[] = [];
  const page = createPage("Cover", elements, "#ffffff", "cover");

  return {
    invite: {
      eyebrow: "You're invited",
      headline: title === "Untitled invitation" ? "Experience Gather" : title,
      message:
        "Join us for an unforgettable celebration with the people who matter most.",
      hosts: "Emily & James",
    },
    details: {
      venue: location,
      address: "Melbourne, Australia",
      time: "4:30 PM",
      dressCode: "Semi Formal",
      website: "www.gather.app",
    },
    rsvp: {
      prompt: "Will you be joining us?",
      note: "Please respond by 1 June",
    },
    thanks: {
      message: "We can't wait to celebrate with you.",
      signOff: "With love,",
    },
    shape: input?.shape ?? "portrait",
    customSize: input?.customSize
      ? normalizeCustomSize(input.customSize)
      : { ...DEFAULT_INVITATION_CUSTOM_SIZE },
    elements,
    pages: [page],
    activePageId: page.id,
  };
}

function normalizePageKind(raw: unknown): InvitationPageKind {
  if (raw === "rsvp" || raw === "location" || raw === "design") return raw;
  return "design";
}

function isInvitationPageRole(raw: unknown): raw is InvitationPageRole {
  return (
    raw === "cover" ||
    raw === "details" ||
    raw === "location" ||
    raw === "rsvp"
  );
}

function inferPageRole(
  page: Partial<InvitationPage>,
  index: number,
  legacyKind: InvitationPageKind,
): InvitationPageRole {
  if (index === 0) return "cover";
  if (isInvitationPageRole(page.role) && page.role !== "cover") {
    return page.role;
  }
  if (legacyKind === "location") return "location";
  if (legacyKind === "rsvp") return "rsvp";

  const name = page.name?.toLowerCase() ?? "";
  if (/rsvp|response|respond/.test(name)) return "rsvp";
  if (/location|venue|map/.test(name)) return "location";

  const elements = Array.isArray(page.elements) ? page.elements : [];
  if (elements.some((element) => element.widget?.kind === "map")) {
    return "location";
  }
  if (
    elements.some(
      (element) =>
        element.widget &&
        element.widget.kind !== "map" &&
        element.widget.kind !== "guest_name",
    )
  ) {
    return "rsvp";
  }

  return "details";
}

export function invitationPageRoleLabel(role: InvitationPageRole) {
  switch (role) {
    case "cover":
      return "Cover";
    case "location":
      return "Location";
    case "rsvp":
      return "RSVP";
    case "details":
      return "Details";
  }
}

export function enforceInvitationPageRoles(
  pages: InvitationPage[],
): InvitationPage[] {
  return pages.map((page, index) => ({
    ...page,
    role:
      index === 0
        ? "cover"
        : page.role === "cover"
          ? "details"
          : page.role,
  }));
}

function normalizeLocation(raw: unknown): InvitationLocation | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<InvitationLocation>;
  const venue = typeof value.venue === "string" ? value.venue : "";
  const address = typeof value.address === "string" ? value.address : "";
  const mapsQuery =
    typeof value.mapsQuery === "string"
      ? value.mapsQuery
      : [venue, address].filter(Boolean).join(", ");
  if (!venue && !address && !mapsQuery) return null;
  return {
    venue,
    address,
    mapsQuery,
    ctaLabel:
      typeof value.ctaLabel === "string" && value.ctaLabel.trim()
        ? value.ctaLabel
        : "Open in Google Maps",
    ctaUrl: typeof value.ctaUrl === "string" ? value.ctaUrl : "",
  };
}

function normalizeRsvpConfig(raw: unknown): RsvpConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<RsvpConfig>;
  if (!value.title || !Array.isArray(value.questions) || !value.theme) {
    return null;
  }
  return value as RsvpConfig;
}

export function elementsFromLocationPage(
  location: InvitationLocation | null | undefined,
  backgroundHint?: string,
  shape: InvitationCanvasShape = "portrait",
): CanvasElement[] {
  const loc = location ?? {
    venue: "Venue",
    address: "",
    mapsQuery: "",
    ctaLabel: "Open in Google Maps",
    ctaUrl: "",
  };
  const mapsQuery =
    loc.mapsQuery || [loc.venue, loc.address].filter(Boolean).join(", ");
  const textColor = backgroundHint === "#000000" ? "#ffffff" : "#000000";
  const muted = backgroundHint === "#000000" ? "#c7c7cc" : "#8E8E93";
  const isLandscape = shape === "landscape";

  return [
    createTextElement({
      content: "LOCATION",
      x: isLandscape ? 7 : 10,
      y: isLandscape ? 16 : 6,
      width: isLandscape ? 34 : 80,
      style: {
        fontFamily: "urbanist",
        fontSize: isLandscape ? 9 : 11,
        letterSpacing: 3,
        fontWeight: "bold",
        color: "#FF60AA",
        textAlign: isLandscape ? "left" : "center",
        lineHeight: 1.2,
        bold: true,
        italic: false,
        underline: false,
        strike: false,
      },
    }),
    createTextElement({
      content: loc.venue || "Venue",
      x: isLandscape ? 7 : 10,
      y: isLandscape ? 31 : 12,
      width: isLandscape ? 34 : 80,
      style: {
        fontFamily: "playfair",
        fontSize: isLandscape ? 20 : 28,
        fontWeight: "bold",
        color: textColor,
        textAlign: isLandscape ? "left" : "center",
        lineHeight: isLandscape ? 1.08 : 1.15,
        bold: true,
        italic: false,
        underline: false,
        strike: false,
        letterSpacing: 0,
      },
    }),
    createTextElement({
      content: loc.address || "",
      x: isLandscape ? 7 : 12,
      y: isLandscape ? 62 : 20,
      width: isLandscape ? 34 : 76,
      style: {
        fontFamily: "urbanist",
        fontSize: isLandscape ? 10 : 13,
        color: muted,
        textAlign: isLandscape ? "left" : "center",
        lineHeight: 1.3,
        fontWeight: "regular",
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        letterSpacing: 0,
      },
    }),
    createWidgetElement("map", {
      x: isLandscape ? 47 : 8,
      y: isLandscape ? 8 : 28,
      width: isLandscape ? 46 : 84,
      height: isLandscape ? 84 : 56,
      widget: {
        kind: "map",
        mapsQuery,
        radius: 18,
        showButton: true,
        buttonLabel: loc.ctaLabel || "Open in Google Maps",
        buttonStyle: {
          background: textColor,
          textColor: backgroundHint === "#000000" ? "#000000" : "#FFFFFF",
          borderColor: textColor,
          borderWidth: 0,
          borderStyle: "none",
          radius: 999,
        },
      },
    }),
  ];
}

export function elementsFromRsvpPage(
  config: RsvpConfig | null | undefined,
  shape: InvitationCanvasShape = "portrait",
): CanvasElement[] {
  const cfg = config ?? createDefaultRsvpConfig();
  const accent = cfg.theme.accent || "#1F2D22";
  const isLandscape = shape === "landscape";
  const elements: CanvasElement[] = [
    createTextElement({
      content: cfg.eyebrow || "RSVP",
      x: isLandscape ? 7 : 10,
      y: isLandscape ? 15 : 6,
      width: isLandscape ? 31 : 80,
      style: {
        fontFamily: "urbanist",
        fontSize: isLandscape ? 8 : 11,
        letterSpacing: isLandscape ? 2.2 : 3,
        fontWeight: "bold",
        color: accent,
        textAlign: isLandscape ? "left" : "center",
        lineHeight: 1.2,
        bold: true,
        italic: false,
        underline: false,
        strike: false,
      },
    }),
    createTextElement({
      content: cfg.title,
      x: isLandscape ? 7 : 8,
      y: isLandscape ? 30 : 12,
      width: isLandscape ? 31 : 84,
      style: {
        fontFamily: cfg.theme.headingFont || "playfair",
        fontSize: isLandscape ? 19 : 26,
        fontWeight: "bold",
        color: cfg.theme.text || "#1F2D22",
        textAlign: isLandscape ? "left" : "center",
        lineHeight: isLandscape ? 1.08 : 1.15,
        bold: true,
        italic: false,
        underline: false,
        strike: false,
        letterSpacing: 0,
      },
    }),
  ];

  if (cfg.note) {
    elements.push(
      createTextElement({
        content: cfg.note,
        x: isLandscape ? 7 : 12,
        y: isLandscape ? 67 : 24,
        width: isLandscape ? 31 : 76,
        style: {
          fontFamily: cfg.theme.bodyFont || "urbanist",
          fontSize: isLandscape ? 9 : 13,
          color: cfg.theme.muted || "#8E8E93",
          textAlign: isLandscape ? "left" : "center",
          lineHeight: 1.3,
          fontWeight: "regular",
          bold: false,
          italic: false,
          underline: false,
          strike: false,
          letterSpacing: 0,
        },
      }),
    );
  }

  let y = cfg.note ? 32 : 28;
  for (const [questionIndex, question] of cfg.questions.entries()) {
    const kind =
      question.type === "attend"
        ? "attend"
        : question.type === "short_text"
          ? "short_text"
          : question.type === "multi_choice"
            ? "multi_choice"
            : "single_choice";

    const base = createDefaultWidgetConfig(kind, {
      surfaceColor: cfg.theme.surface ?? cfg.theme.background,
    });
    let widget: WidgetConfig;
    if (kind === "attend" && base.kind === "attend") {
      widget = {
        ...base,
        label: question.label,
        yesLabel: question.yesLabel || "Yes",
        noLabel: question.noLabel || "No",
        required: question.required,
        labelStyle: { color: cfg.theme.text || accent },
        buttonStyle: {
          ...base.buttonStyle,
          borderColor: accent,
          textColor: accent,
          background: "transparent",
        },
      };
    } else if (kind === "short_text" && base.kind === "short_text") {
      widget = {
        ...base,
        label: question.label,
        placeholder: question.placeholder || "Type here…",
        required: question.required,
        labelStyle: { color: cfg.theme.text || accent },
        fieldStyle: {
          ...base.fieldStyle,
          background:
            cfg.theme.surface ?? cfg.theme.background ?? "#ffffff",
          borderColor: accent,
          textColor: cfg.theme.text || accent,
        },
      };
    } else if (
      (kind === "single_choice" || kind === "multi_choice") &&
      (base.kind === "single_choice" || base.kind === "multi_choice")
    ) {
      widget = {
        ...base,
        kind,
        label: question.label,
        required: question.required,
        options: (question.options || []).map((o) => ({ ...o })),
        labelStyle: { color: cfg.theme.text || accent },
        optionStyle: {
          ...base.optionStyle,
          background:
            cfg.theme.surface ?? cfg.theme.background ?? "#ffffff",
          borderColor: accent,
          textColor: cfg.theme.text || accent,
        },
      };
    } else {
      widget = base;
    }

    const optionCount =
      widget.kind === "single_choice" || widget.kind === "multi_choice"
        ? widget.options.length
        : 0;
    const height =
      kind === "attend"
        ? isLandscape
          ? 68
          : 20
        : kind === "short_text"
          ? isLandscape
            ? 58
            : 12
          : isLandscape
            ? Math.min(76, 28 + optionCount * 16)
            : Math.min(28, 8 + optionCount * 5);
    const landscapeColumn = questionIndex % 2;
    const landscapeX = landscapeColumn === 0 ? 42 : 66;
    const landscapeY =
      12 + Math.floor(questionIndex / 2) * 78;
    const landscapeWidth = landscapeColumn === 0 ? 21 : 31;

    elements.push(
      createWidgetElement(kind, {
        x: isLandscape ? landscapeX : 10,
        y: isLandscape ? landscapeY : y,
        width: isLandscape ? landscapeWidth : 80,
        height,
        widget,
      }, cfg.theme.surface ?? cfg.theme.background),
    );
    if (!isLandscape) {
      y += height + 4;
    }
  }

  return elements;
}

function normalizePages(
  raw: unknown,
  fallbackElements: CanvasElement[],
  shape: InvitationCanvasShape,
): { pages: InvitationPage[]; activePageId: string; elements: CanvasElement[] } {
  if (Array.isArray(raw) && raw.length > 0) {
    const pages = raw.map((item, index) => {
      const page = item as Partial<InvitationPage>;
      const kind = normalizePageKind(page.kind);
      const role = inferPageRole(page, index, kind);

      // Legacy fixed RSVP / Location pages → freeform design pages with widgets
      if (kind === "location") {
        const location = normalizeLocation(page.location);
        return {
          id: page.id ?? pageId(),
          name: page.name ?? `Page ${index + 1}`,
          role,
          kind: "design" as const,
          elements: elementsFromLocationPage(
            location,
            page.backgroundColor,
            shape,
          ),
          backgroundColor: page.backgroundColor || "#ffffff",
          backgroundPattern: page.backgroundPattern || "none",
          backgroundTexture: page.backgroundTexture || "none",
          backgroundTextureOpacity: page.backgroundTextureOpacity ?? 22,
          backgroundTextureTint: page.backgroundTextureTint || "#ffffff",
          backgroundTextureBlend:
            page.backgroundTextureBlend || "soft-light",
          border: page.border ?? null,
          location: null,
          rsvpConfig: null,
        };
      }

      if (kind === "rsvp") {
        const rsvpConfig = normalizeRsvpConfig(page.rsvpConfig);
        return {
          id: page.id ?? pageId(),
          name: page.name ?? `Page ${index + 1}`,
          role,
          kind: "design" as const,
          elements: elementsFromRsvpPage(rsvpConfig, shape),
          backgroundColor:
            page.backgroundColor ||
            rsvpConfig?.theme.background ||
            "#ffffff",
          backgroundPattern: page.backgroundPattern || "none",
          backgroundTexture: page.backgroundTexture || "none",
          backgroundTextureOpacity: page.backgroundTextureOpacity ?? 22,
          backgroundTextureTint: page.backgroundTextureTint || "#ffffff",
          backgroundTextureBlend:
            page.backgroundTextureBlend || "soft-light",
          border: page.border ?? null,
          location: null,
          rsvpConfig: null,
        };
      }

      return {
        id: page.id ?? pageId(),
        name: page.name ?? `Page ${index + 1}`,
        role,
        kind: "design" as const,
        elements: normalizeElements(page.elements),
        backgroundColor: page.backgroundColor || "#ffffff",
        backgroundPattern: page.backgroundPattern || "none",
        backgroundTexture: page.backgroundTexture || "none",
        backgroundTextureOpacity: page.backgroundTextureOpacity ?? 22,
        backgroundTextureTint: page.backgroundTextureTint || "#ffffff",
        backgroundTextureBlend:
          page.backgroundTextureBlend || "soft-light",
        border: page.border ?? null,
        location: null,
        rsvpConfig: null,
      };
    });
    return {
      pages,
      activePageId: pages[0].id,
      elements: pages[0].elements,
    };
  }

  const page = createPage("Cover", fallbackElements, "#ffffff", "cover");
  return {
    pages: [page],
    activePageId: page.id,
    elements: fallbackElements,
  };
}

/** Merge stored JSON with defaults so older rows still edit cleanly. */
export function normalizeContent(
  raw: unknown,
  fallback?: { title?: string; location?: string },
): InvitationContent {
  const defaults = createDefaultContent(fallback);
  if (!raw || typeof raw !== "object") return defaults;

  const value = raw as Partial<InvitationContent> & {
    elements?: unknown;
    pages?: unknown;
    activePageId?: string;
  };

  const elements = normalizeElements(value.elements);
  const shape = normalizeCanvasShape(value.shape);
  const normalized = normalizePages(value.pages, elements, shape);
  const active =
    normalized.pages.find((page) => page.id === value.activePageId) ??
    normalized.pages[0];

  return {
    invite: { ...defaults.invite, ...value.invite },
    details: { ...defaults.details, ...value.details },
    rsvp: { ...defaults.rsvp, ...value.rsvp },
    thanks: { ...defaults.thanks, ...value.thanks },
    shape,
    customSize: normalizeCustomSize(value.customSize),
    pages: normalized.pages,
    activePageId: active.id,
    elements: active.elements,
  };
}

export function createBlankPage(pageNumber: number): InvitationPage {
  return createPage(
    pageNumber === 1 ? "Cover" : `Details ${pageNumber - 1}`,
    createBlankPageElements(),
    "#ffffff",
    pageNumber === 1 ? "cover" : "details",
  );
}

function questionId() {
  return `q_${Math.random().toString(36).slice(2, 9)}`;
}

function optionId() {
  return `opt_${Math.random().toString(36).slice(2, 9)}`;
}

/** Default RSVP theme used for new RSVP pages. */
export function createDefaultRsvpTheme(): RsvpTheme {
  return {
    background: "#ffffff",
    surface: "#f6f6f6",
    accent: "#1F2D22",
    text: "#1F2D22",
    muted: "#8E8E93",
    buttonStyle: "pill",
    headingFont: "playfair",
    bodyFont: "urbanist",
  };
}

/** Default multi-question RSVP config for a blank RSVP page. */
export function createDefaultRsvpConfig(): RsvpConfig {
  return {
    eyebrow: "RSVP",
    title: "Will you be joining us?",
    note: "Please respond soon",
    theme: createDefaultRsvpTheme(),
    questions: [
      {
        id: questionId(),
        type: "attend",
        label: "Your reply",
        yesLabel: "Yes, I'll be there",
        noLabel: "Sorry, I can't make it",
        required: true,
      },
    ],
  };
}

/** Create a blank question of the given type for the builder. */
export function createRsvpQuestion(type: RsvpQuestionType): RsvpQuestion {
  const id = questionId();
  switch (type) {
    case "attend":
      return {
        id,
        type: "attend",
        label: "Your reply",
        yesLabel: "Yes, I'll be there",
        noLabel: "Sorry, I can't make it",
        required: true,
      };
    case "short_text":
      return {
        id,
        type: "short_text",
        label: "Your answer",
        placeholder: "Type here…",
        required: false,
      };
    case "single_choice":
      return {
        id,
        type: "single_choice",
        label: "Choose one",
        required: false,
        options: [
          { id: optionId(), label: "Option A" },
          { id: optionId(), label: "Option B" },
        ],
      };
    case "multi_choice":
      return {
        id,
        type: "multi_choice",
        label: "Select all that apply",
        required: false,
        options: [
          { id: optionId(), label: "Option A" },
          { id: optionId(), label: "Option B" },
          { id: optionId(), label: "Option C" },
        ],
      };
  }
}

export function createRsvpChoiceOption(label = "New option"): RsvpChoiceOption {
  return { id: optionId(), label };
}

/** Add an interactive RSVP page with a starter attend question. */
export function createRsvpPage(_pageNumber?: number): InvitationPage {
  const config = createDefaultRsvpConfig();
  return {
    id: pageId(),
    name: "RSVP",
    role: "rsvp",
    kind: "rsvp",
    elements: [],
    backgroundColor: config.theme.background,
    backgroundPattern: "none",
    backgroundTexture: "none",
    backgroundTextureOpacity: 22,
    backgroundTextureTint: "#ffffff",
    backgroundTextureBlend: "soft-light",
    border: null,
    location: null,
    rsvpConfig: config,
  };
}

/** Add an interactive Location page with venue + map fields. */
export function createLocationPage(
  _pageNumber?: number,
  fallback?: { venue?: string; address?: string },
): InvitationPage {
  const venue = fallback?.venue?.trim() || "The Grand Pavilion";
  const address = fallback?.address?.trim() || "Melbourne, Australia";
  return {
    id: pageId(),
    name: "Location",
    role: "location",
    kind: "location",
    elements: [],
    backgroundColor: "#ffffff",
    backgroundPattern: "none",
    backgroundTexture: "none",
    backgroundTextureOpacity: 22,
    backgroundTextureTint: "#ffffff",
    backgroundTextureBlend: "soft-light",
    border: null,
    location: {
      venue,
      address,
      mapsQuery: [venue, address].filter(Boolean).join(", "),
      ctaLabel: "Open in Google Maps",
      ctaUrl: "",
    },
    rsvpConfig: null,
  };
}

export function googleMapsEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

export function googleMapsOpenUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Strip element data from every page except the cover.
 *
 * List screens (`/home`, `/invitations`) only ever render `pages[0]`, but the
 * full canvas JSON of every page was being serialised into the RSC payload -
 * tens of kB per invitation for content nothing on screen reads. Page objects
 * are kept so `pages.length` (the "N pages" badge) stays correct.
 *
 * Do NOT use this for screens that read the whole design, e.g. the event detail
 * page, which scans every page for map widgets to prefill the location.
 */
export function coverPageOnly(content: InvitationContent): InvitationContent {
  const pages = content.pages;
  if (!pages || pages.length < 2) return content;
  return {
    ...content,
    pages: pages.map((page, index) =>
      index === 0 ? page : { ...page, elements: [] },
    ),
  };
}
