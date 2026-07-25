import type { CanvasElement } from "./canvas-elements";
import {
  createBlankPageElements,
  normalizeElements,
} from "./canvas-elements";

export type InvitationPageKind = "design" | "rsvp" | "location";

export interface InvitationLocation {
  venue: string;
  address: string;
  /** Query used for Google Maps embed + open link */
  mapsQuery: string;
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

export interface InvitationPage {
  id: string;
  name: string;
  /** design = canvas; rsvp / location = interactive guest pages */
  kind: InvitationPageKind;
  elements: CanvasElement[];
  /** Card background colour */
  backgroundColor: string;
  /** Optional decorative pattern over the background */
  backgroundPattern?: "none" | "dots" | "grid" | "stripes" | "waves";
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
  backgroundColor = "#fff8f4",
): InvitationPage {
  return {
    id: pageId(),
    name,
    kind: "design",
    elements,
    backgroundColor,
    backgroundPattern: "none",
    border: null,
    location: null,
    rsvpConfig: null,
  };
}

export function createDefaultContent(input?: {
  title?: string;
  location?: string;
}): InvitationContent {
  const title = input?.title?.trim() || "a special gathering";
  const location = input?.location?.trim() || "The Grand Pavilion";
  // New invitations start blank — templates apply premade layouts later
  const elements: CanvasElement[] = [];
  const page = createPage("Page 1", elements);

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
    elements,
    pages: [page],
    activePageId: page.id,
  };
}

function normalizePageKind(raw: unknown): InvitationPageKind {
  if (raw === "rsvp" || raw === "location" || raw === "design") return raw;
  return "design";
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
  return { venue, address, mapsQuery };
}

function normalizeRsvpConfig(raw: unknown): RsvpConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<RsvpConfig>;
  if (!value.title || !Array.isArray(value.questions) || !value.theme) {
    return null;
  }
  return value as RsvpConfig;
}

function normalizePages(
  raw: unknown,
  fallbackElements: CanvasElement[],
): { pages: InvitationPage[]; activePageId: string; elements: CanvasElement[] } {
  if (Array.isArray(raw) && raw.length > 0) {
    const pages = raw.map((item, index) => {
      const page = item as Partial<InvitationPage>;
      const kind = normalizePageKind(page.kind);
      return {
        id: page.id ?? pageId(),
        name: page.name ?? `Page ${index + 1}`,
        kind,
        elements: kind === "design" ? normalizeElements(page.elements) : [],
        backgroundColor: page.backgroundColor || "#fff8f4",
        backgroundPattern: page.backgroundPattern || "none",
        border: page.border ?? null,
        location: kind === "location" ? normalizeLocation(page.location) : null,
        rsvpConfig: kind === "rsvp" ? normalizeRsvpConfig(page.rsvpConfig) : null,
      };
    });
    return {
      pages,
      activePageId: pages[0].id,
      elements: pages[0].elements,
    };
  }

  const page = createPage("Page 1", fallbackElements);
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
  const normalized = normalizePages(value.pages, elements);
  const active =
    normalized.pages.find((page) => page.id === value.activePageId) ??
    normalized.pages[0];

  return {
    invite: { ...defaults.invite, ...value.invite },
    details: { ...defaults.details, ...value.details },
    rsvp: { ...defaults.rsvp, ...value.rsvp },
    thanks: { ...defaults.thanks, ...value.thanks },
    pages: normalized.pages,
    activePageId: active.id,
    elements: active.elements,
  };
}

export function createBlankPage(pageNumber: number): InvitationPage {
  return createPage(`Page ${pageNumber}`, createBlankPageElements());
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
        label: "Short answer",
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
    kind: "rsvp",
    elements: [],
    backgroundColor: config.theme.background,
    backgroundPattern: "none",
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
    kind: "location",
    elements: [],
    backgroundColor: "#ffffff",
    backgroundPattern: "none",
    border: null,
    location: {
      venue,
      address,
      mapsQuery: [venue, address].filter(Boolean).join(", "),
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
