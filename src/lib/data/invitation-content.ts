import type { CanvasElement } from "./canvas-elements";
import {
  createBlankPageElements,
  createDefaultElements,
  normalizeElements,
} from "./canvas-elements";

export type EditorCardId = "invite" | "details" | "rsvp" | "thanks";

export interface InvitationPage {
  id: string;
  name: string;
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

export const EDITOR_CARDS: {
  id: EditorCardId;
  label: string;
  description: string;
}[] = [
  {
    id: "invite",
    label: "Invitation",
    description: "Headline and welcome message",
  },
  {
    id: "details",
    label: "Event details",
    description: "Venue, time, and dress code",
  },
  {
    id: "rsvp",
    label: "RSVP",
    description: "Response prompt for guests",
  },
  {
    id: "thanks",
    label: "Thank you",
    description: "Closing message",
  },
];

function pageId() {
  return `page_${Math.random().toString(36).slice(2, 9)}`;
}

export function createPage(
  name: string,
  elements: CanvasElement[],
  backgroundColor = "#fff8f4",
): InvitationPage {
  return {
    id: pageId(),
    name,
    elements,
    backgroundColor,
    backgroundPattern: "none",
    border: null,
  };
}

export function createDefaultContent(input?: {
  title?: string;
  location?: string;
}): InvitationContent {
  const title = input?.title?.trim() || "a special gathering";
  const location = input?.location?.trim() || "The Grand Pavilion";
  const elements = createDefaultElements();
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

function normalizePages(
  raw: unknown,
  fallbackElements: CanvasElement[],
): { pages: InvitationPage[]; activePageId: string; elements: CanvasElement[] } {
  if (Array.isArray(raw) && raw.length > 0) {
    const pages = raw.map((item, index) => {
      const page = item as Partial<InvitationPage>;
      return {
        id: page.id ?? pageId(),
        name: page.name ?? `Page ${index + 1}`,
        elements: normalizeElements(page.elements),
        backgroundColor: page.backgroundColor || "#fff8f4",
        backgroundPattern: page.backgroundPattern || "none",
        border: page.border ?? null,
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
