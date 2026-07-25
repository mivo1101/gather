import type { CanvasElement, ElementStyle, ImageFrame } from "./canvas-elements";
import {
  createDefaultContent,
  type InvitationContent,
  type InvitationPage,
  type RsvpConfig,
} from "./invitation-content";

export type TemplateCategoryId =
  | "wedding"
  | "birthday"
  | "baby"
  | "corporate"
  | "dinner"
  | "other";

export interface TemplateCategory {
  id: TemplateCategoryId;
  title: string;
  description: string;
  tint: string;
}

export interface TemplatePage {
  name: string;
  kind: "design" | "rsvp" | "location";
  backgroundColor: string;
  elements: CanvasElement[];
  location?: {
    venue: string;
    address: string;
    mapsQuery: string;
  } | null;
  rsvpConfig?: RsvpConfig | null;
}

export interface InvitationTemplate {
  id: string;
  categoryId: Exclude<TemplateCategoryId, "other">;
  title: string;
  description: string;
  pages: TemplatePage[];
}

/** Free Unsplash photos used across catalog templates. */
const IMG = {
  weddingCouple:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
  weddingKiss:
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
  weddingWalk:
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80",
  weddingDetail:
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
  venueGarden:
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80",
  portraitMan:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
  portraitWoman:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
  birthdayParty:
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80",
  cake:
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
  friends:
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
  baby:
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80",
  nursery:
    "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=900&q=80",
  softBaby:
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
  conference:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80",
  office:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
  team:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
  dinner:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  cocktails:
    "https://images.unsplash.com/photo-1514362545857-3bc165cdb387?auto=format&fit=crop&w=900&q=80",
  gardenTable:
    "https://images.unsplash.com/photo-1478144592103-25e218a04891?auto=format&fit=crop&w=900&q=80",
  cityMap:
    "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=80",
} as const;

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: "wedding",
    title: "Wedding",
    description: "Ceremonies, receptions, and save-the-dates",
    tint: "bg-[#fce4ef]",
  },
  {
    id: "birthday",
    title: "Birthday",
    description: "Milestone parties and celebrations",
    tint: "bg-[#ffe8d6]",
  },
  {
    id: "baby",
    title: "Baby & shower",
    description: "Baby showers, gender reveals, and naming days",
    tint: "bg-[#e8f3ff]",
  },
  {
    id: "corporate",
    title: "Corporate",
    description: "Launches, dinners, and team events",
    tint: "bg-[#e4f3ec]",
  },
  {
    id: "dinner",
    title: "Dinner & gathering",
    description: "Intimate dinners and house parties",
    tint: "bg-[#f3efe8]",
  },
  {
    id: "other",
    title: "Other events",
    description: "Anniversaries, openings, and custom occasions",
    tint: "bg-soft-grey",
  },
];

function style(overrides?: Partial<ElementStyle>): ElementStyle {
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

function text(
  id: string,
  content: string,
  x: number,
  y: number,
  width: number,
  styleOverrides?: Partial<ElementStyle>,
): CanvasElement {
  return {
    id,
    type: "text",
    x,
    y,
    width,
    rotation: 0,
    locked: false,
    content,
    style: style(styleOverrides),
  };
}

function image(
  id: string,
  src: string,
  x: number,
  y: number,
  width: number,
  height: number,
  opts?: { color?: string; frame?: ImageFrame },
): CanvasElement {
  return {
    id,
    type: "image",
    x,
    y,
    width,
    height,
    rotation: 0,
    locked: false,
    content: src,
    style: style({
      color: opts?.color ?? "#1F2D22",
      frame: opts?.frame ?? "none",
    }),
  };
}

function shape(
  id: string,
  kind: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
): CanvasElement {
  return {
    id,
    type: "shape",
    x,
    y,
    width,
    height,
    rotation: 0,
    locked: false,
    content: kind,
    style: style({ color }),
  };
}

function divider(
  id: string,
  x: number,
  y: number,
  width: number,
  color: string,
): CanvasElement {
  return {
    id,
    type: "divider",
    x,
    y,
    width,
    height: 1.5,
    rotation: 0,
    locked: false,
    content: "solid",
    style: style({ color }),
  };
}

function design(
  name: string,
  backgroundColor: string,
  elements: CanvasElement[],
): TemplatePage {
  return {
    name,
    kind: "design",
    backgroundColor,
    elements,
    location: null,
  };
}

function locationPage(
  venue: string,
  address: string,
  mapsQuery?: string,
): TemplatePage {
  return {
    name: "Location",
    kind: "location",
    backgroundColor: "#ffffff",
    elements: [],
    location: {
      venue,
      address,
      mapsQuery: mapsQuery || [venue, address].filter(Boolean).join(", "),
    },
  };
}

function rsvpPage(config: RsvpConfig): TemplatePage {
  return {
    name: "RSVP",
    kind: "rsvp",
    backgroundColor: config.theme.background,
    elements: [],
    location: null,
    rsvpConfig: config,
  };
}

/** Catalog — multi-page templates with interactive Location + RSVP. */
export const INVITATION_TEMPLATES: InvitationTemplate[] = [
  {
    id: "wedding-photo-suite",
    categoryId: "wedding",
    title: "Photo Cover Suite",
    description: "Full-bleed cover photo + details + RSVP",
    pages: [
      design("Cover", "#1a1512", [
        image("wps_c_img", IMG.weddingKiss, 0, 0, 100, 78, { frame: "square" }),
        text("wps_c_names", "ANNABELLE AND KEVIN", 8, 82, 84, {
          fontFamily: "playfair",
          fontSize: 16,
          letterSpacing: 2,
          color: "#ffffff",
          fontWeight: "bold",
        }),
        text("wps_c_date", "AUGUST 23, 2027", 8, 90, 84, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 3,
          color: "#ffffffcc",
        }),
      ]),
      design("Details", "#ffffff", [
        text("wps_d_eyebrow", "YOU ARE INVITED TO THE WEDDING OF", 8, 8, 84, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 2,
          fontWeight: "bold",
          color: "#444444",
        }),
        text("wps_d_names", "annabelle + kevin", 8, 18, 84, {
          fontFamily: "caveat",
          fontSize: 42,
          color: "#111111",
        }),
        image("wps_d_p1", IMG.weddingWalk, 12, 38, 36, 18, { frame: "rounded" }),
        image("wps_d_p2", IMG.weddingDetail, 52, 38, 36, 18, {
          frame: "rounded",
        }),
        text("wps_d_date", "08.23.27", 10, 62, 80, {
          fontFamily: "urbanist",
          fontSize: 28,
          letterSpacing: 4,
          fontWeight: "bold",
        }),
        text(
          "wps_d_when",
          "at THREE O'CLOCK IN THE AFTERNOON\nThe Village Restaurant\nNew York, NY",
          10,
          72,
          80,
          {
            fontFamily: "urbanist",
            fontSize: 11,
            letterSpacing: 1,
            lineHeight: 1.55,
            color: "#333333",
          },
        ),
        text("wps_d_note", "reception to follow", 10, 90, 80, {
          fontFamily: "caveat",
          fontSize: 18,
          color: "#555555",
        }),
      ]),
      locationPage("The Village Restaurant", "New York, NY", "The Village Restaurant New York NY"),
      rsvpPage({
        eyebrow: "Kindly reply",
        title: "Will you celebrate with us?",
        note: "Please respond by June 20, 2027",
        theme: {
          background: "#faf8f5",
          surface: "#ffffff",
          accent: "#1a1512",
          text: "#1a1512",
          muted: "#6b635c",
          buttonStyle: "outline",
          headingFont: "playfair",
          bodyFont: "urbanist",
        },
        questions: [
          {
            id: "attend",
            type: "attend",
            label: "",
            yesLabel: "Joyfully accept",
            noLabel: "Respectfully decline",
          },
          {
            id: "guests",
            type: "short_text",
            label: "Number of guests",
            placeholder: "e.g. 2",
          },
        ],
      }),
    ],
  },
  {
    id: "wedding-arch-modern",
    categoryId: "wedding",
    title: "Arch Modern",
    description: "Arched portrait cover with clean details",
    pages: [
      design("Cover", "#ffffff", [
        image("wam_c_img", IMG.weddingCouple, 14, 6, 72, 62, { frame: "arch" }),
        text("wam_c_names", "Avery + Jordan", 10, 74, 80, {
          fontFamily: "caveat",
          fontSize: 36,
        }),
        text("wam_c_date", "09.24.2027", 10, 88, 80, {
          fontFamily: "urbanist",
          fontSize: 12,
          letterSpacing: 4,
          fontWeight: "medium",
          color: "#666666",
        }),
      ]),
      design("Details", "#ffffff", [
        text("wam_d_names", "Avery + Jordan", 10, 10, 80, {
          fontFamily: "caveat",
          fontSize: 34,
        }),
        text(
          "wam_d_invite",
          "JOYFULLY INVITE YOU TO THE\nCELEBRATION OF THEIR MARRIAGE",
          10,
          28,
          80,
          {
            fontFamily: "urbanist",
            fontSize: 11,
            letterSpacing: 1.5,
            lineHeight: 1.6,
            fontWeight: "medium",
          },
        ),
        divider("wam_d_t", 18, 44, 64, "#111111"),
        text("wam_d_row", "Saturday     SEPT 24 2027     4:00pm", 8, 48, 84, {
          fontFamily: "urbanist",
          fontSize: 12,
          letterSpacing: 1,
          fontWeight: "bold",
        }),
        divider("wam_d_b", 18, 56, 64, "#111111"),
        text("wam_d_venue", "DESERT FALLS ESTATE", 10, 64, 80, {
          fontFamily: "urbanist",
          fontSize: 13,
          letterSpacing: 2,
          fontWeight: "bold",
        }),
        text("wam_d_addr", "924 DESERT FALLS DRIVE, SAN DIEGO, CA", 10, 72, 80, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 1,
          color: "#555555",
        }),
        text("wam_d_note", "dinner + dancing to follow", 10, 84, 80, {
          fontFamily: "caveat",
          fontSize: 18,
        }),
      ]),
      locationPage("Desert Falls Estate", "924 Desert Falls Drive, San Diego, CA", "Desert Falls Estate San Diego CA"),
      rsvpPage({
        eyebrow: "RSVP",
        title: "Save your seat",
        note: "Kindly reply by August 1, 2027",
        theme: {
          background: "#ffffff",
          surface: "#f7f4ef",
          accent: "#111111",
          text: "#111111",
          muted: "#777777",
          buttonStyle: "square",
          headingFont: "caveat",
          bodyFont: "urbanist",
        },
        questions: [
          {
            id: "attend",
            type: "attend",
            label: "Attendance",
            yesLabel: "I'll be there",
            noLabel: "Can't make it",
          },
          {
            id: "song",
            type: "short_text",
            label: "Any song we must play?",
            placeholder: "Optional",
          },
        ],
      }),
    ],
  },
  {
    id: "wedding-winery-classic",
    categoryId: "wedding",
    title: "Winery Classic",
    description: "Script names, serif details, soft florals",
    pages: [
      design("Cover", "#fffdf9", [
        image("wwc_c_f1", "/images/flowers/flower-8.png", 58, 2, 42, 24),
        image("wwc_c_f2", "/images/flowers/flower-3.png", -4, 8, 36, 20),
        text("wwc_c_eyebrow", "TOGETHER WITH THEIR FAMILIES", 10, 36, 80, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 2,
          fontWeight: "bold",
          color: "#6b5a4a",
        }),
        text("wwc_c_names", "Samantha &\nFredrick", 10, 46, 80, {
          fontFamily: "caveat",
          fontSize: 40,
          lineHeight: 1.05,
        }),
        text("wwc_c_ask", "invite you to celebrate their marriage", 10, 78, 80, {
          fontFamily: "playfair",
          fontSize: 13,
          italic: true,
          color: "#5a4a3a",
        }),
      ]),
      design("Details", "#ffffff", [
        text("wwc_d_venue", "Nonsense Winery", 10, 16, 80, {
          fontFamily: "playfair",
          fontSize: 24,
          italic: true,
        }),
        text("wwc_d_addr", "43-53 Nye Rd, Nonsense Lane VIC 3225", 10, 28, 80, {
          fontFamily: "urbanist",
          fontSize: 12,
          color: "#555555",
        }),
        divider("wwc_d_line", 30, 40, 40, "#c4a574"),
        text("wwc_d_date", "28th of March 2027", 10, 48, 80, {
          fontFamily: "playfair",
          fontSize: 18,
        }),
        text("wwc_d_time", "4:00pm", 10, 58, 80, {
          fontFamily: "urbanist",
          fontSize: 16,
          fontWeight: "medium",
        }),
        text("wwc_d_note", "Reception to follow at the estate", 10, 72, 80, {
          fontFamily: "caveat",
          fontSize: 18,
          color: "#6b5a4a",
        }),
        image("wwc_d_img", IMG.venueGarden, 20, 82, 60, 14, { frame: "rounded" }),
      ]),
      locationPage("Nonsense Winery", "43-53 Nye Rd, Nonsense Lane VIC 3225", "Nonsense Winery VIC Australia"),
      rsvpPage({
        eyebrow: "Répondez s'il vous plaît",
        title: "Join us at the winery?",
        note: "RSVP by December 15th",
        theme: {
          background: "#f8f3ec",
          surface: "#ffffff",
          accent: "#6b5a4a",
          text: "#3d3228",
          muted: "#8a7355",
          buttonStyle: "pill",
          headingFont: "caveat",
          bodyFont: "playfair",
        },
        questions: [
          {
            id: "attend",
            type: "attend",
            label: "",
            yesLabel: "Yes, with pleasure",
            noLabel: "Sadly, no",
          },
          {
            id: "wine",
            type: "single_choice",
            label: "Preferred pour at dinner",
            options: [
              { id: "red", label: "Red" },
              { id: "white", label: "White" },
              { id: "sparkling", label: "Sparkling" },
              { id: "none", label: "No wine" },
            ],
          },
        ],
      }),
    ],
  },

  // ── Birthday ─────────────────────────────────────────────,
  {
    id: "birthday-milestone-70",
    categoryId: "birthday",
    title: "Milestone Seventy",
    description: "Photo collage number with classic details",
    pages: [
      design("Cover", "#ffffff", [
        text("bm7_c_look", "look who's", 10, 8, 80, {
          fontFamily: "caveat",
          fontSize: 28,
          color: "#333333",
        }),
        image("bm7_c_p1", IMG.friends, 12, 22, 34, 28, { frame: "rounded" }),
        image("bm7_c_p2", IMG.portraitWoman, 52, 22, 34, 28, {
          frame: "rounded",
        }),
        text("bm7_c_num", "70", 10, 52, 80, {
          fontFamily: "playfair",
          fontSize: 72,
          fontWeight: "bold",
          color: "#1a1a1a",
        }),
        text("bm7_c_join", "please join us to celebrate", 10, 78, 80, {
          fontFamily: "playfair",
          fontSize: 13,
          italic: true,
        }),
        text("bm7_c_title", "TIFFANY'S 70TH BIRTHDAY", 10, 88, 80, {
          fontFamily: "playfair",
          fontSize: 14,
          letterSpacing: 2,
          fontWeight: "bold",
        }),
      ]),
      design("Details", "#fafafa", [
        text("bm7_d_when", "SATURDAY  |  MARCH 14  |  3:00 PM", 8, 20, 84, {
          fontFamily: "urbanist",
          fontSize: 12,
          letterSpacing: 1.5,
          fontWeight: "bold",
        }),
        divider("bm7_d_line", 25, 32, 50, "#999999"),
        text("bm7_d_venue", "HARBOUR HOUSE", 10, 42, 80, {
          fontFamily: "urbanist",
          fontSize: 16,
          letterSpacing: 3,
          fontWeight: "bold",
        }),
        text("bm7_d_addr", "88 SEASIDE AVE, MELBOURNE VIC", 10, 52, 80, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 1,
          color: "#555555",
        }),
        image("bm7_d_cake", IMG.cake, 22, 64, 56, 26, { frame: "rounded" }),
      ]),
      locationPage("Harbour House", "88 Seaside Ave, Melbourne VIC", "Harbour House Seaside Ave Melbourne"),
      rsvpPage({
        eyebrow: "Please reply",
        title: "Can you celebrate Tiffany?",
        note: "RSVP to James by February 28",
        theme: {
          background: "#ffffff",
          surface: "#fafafa",
          accent: "#1a1a1a",
          text: "#1a1a1a",
          muted: "#777777",
          buttonStyle: "outline",
          headingFont: "playfair",
          bodyFont: "urbanist",
        },
        questions: [
          {
            id: "attend",
            type: "attend",
            label: "",
            yesLabel: "Yes — wouldn't miss it",
            noLabel: "Unable to attend",
          },
          {
            id: "memory",
            type: "short_text",
            label: "Share a favourite memory (optional)",
            placeholder: "A line for the guest book…",
          },
        ],
      }),
    ],
  },
  {
    id: "birthday-big-one-20",
    categoryId: "birthday",
    title: "The Big One",
    description: "Arch portrait, bold age, party energy",
    pages: [
      design("Cover", "#f2f0ec", [
        text("bb2_c_big", "IT'S A BIG ONE", 8, 8, 50, {
          fontFamily: "urbanist",
          fontSize: 12,
          letterSpacing: 2,
          fontWeight: "bold",
          textAlign: "left",
        }),
        text("bb2_c_name", "Seb is…", 8, 18, 48, {
          fontFamily: "caveat",
          fontSize: 28,
          textAlign: "left",
        }),
        text("bb2_c_age", "20", 8, 55, 48, {
          fontFamily: "urbanist",
          fontSize: 72,
          fontWeight: "bold",
          color: "#c9a227",
          textAlign: "left",
        }),
        image("bb2_c_photo", IMG.portraitMan, 48, 8, 46, 72, { frame: "arch" }),
        shape("bb2_c_dot1", "circle", 12, 42, 4, 2.5, "#c9a227"),
        shape("bb2_c_dot2", "circle", 40, 50, 3, 2, "#888888"),
        shape("bb2_c_dot3", "circle", 22, 70, 5, 3, "#c9a227"),
      ]),
      design("Details", "#1c1c1c", [
        text("bb2_d_join", "JOIN US TO CELEBRATE", 10, 18, 80, {
          fontFamily: "urbanist",
          fontSize: 12,
          letterSpacing: 3,
          fontWeight: "bold",
          color: "#ffffff",
        }),
        text("bb2_d_when", "ON 9/14 AT 5PM", 10, 30, 80, {
          fontFamily: "urbanist",
          fontSize: 22,
          fontWeight: "bold",
          color: "#c9a227",
        }),
        text("bb2_d_venue", "DUSTY'S CELLAR\n29 GRAND RIVER", 10, 48, 80, {
          fontFamily: "urbanist",
          fontSize: 14,
          letterSpacing: 1,
          lineHeight: 1.6,
          color: "#ffffff",
        }),
        image("bb2_d_party", IMG.birthdayParty, 15, 70, 70, 22, {
          frame: "rounded",
        }),
      ]),
      locationPage("Dusty's Cellar", "29 Grand River", "Dusty's Cellar 29 Grand River"),
      rsvpPage({
        eyebrow: "Reply",
        title: "You in for the big one?",
        note: "Reply to Shelia by September 1",
        theme: {
          background: "#1c1c1c",
          surface: "#2a2a2a",
          accent: "#c9a227",
          text: "#ffffff",
          muted: "#aaaaaa",
          buttonStyle: "pill",
          headingFont: "urbanist",
          bodyFont: "urbanist",
        },
        questions: [
          {
            id: "attend",
            type: "attend",
            label: "",
            yesLabel: "Hell yes!",
            noLabel: "Can't make it",
          },
          {
            id: "anthem",
            type: "short_text",
            label: "Drop a party anthem",
            placeholder: "Artist — song title",
          },
        ],
      }),
    ],
  },
  {
    id: "birthday-twenty-one-gold",
    categoryId: "birthday",
    title: "Twenty One Gold",
    description: "Script headline with split date grid",
    pages: [
      design("Cover", "#ffffff", [
        text("btg_c_script", "Twenty One", 8, 22, 84, {
          fontFamily: "caveat",
          fontSize: 52,
          color: "#b8952e",
        }),
        text("btg_c_join", "PLEASE JOIN US TO CELEBRATE", 10, 48, 80, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 2,
          color: "#888888",
        }),
        divider("btg_c_t", 18, 58, 64, "#b8952e"),
        text("btg_c_title", "ALEX'S 21ST BIRTHDAY", 10, 62, 80, {
          fontFamily: "urbanist",
          fontSize: 15,
          letterSpacing: 2,
          fontWeight: "bold",
        }),
        divider("btg_c_b", 18, 72, 64, "#b8952e"),
      ]),
      design("Details", "#ffffff", [
        text("btg_d_day", "SUNDAY", 12, 18, 30, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 2,
          fontWeight: "bold",
          color: "#777777",
          textAlign: "left",
        }),
        text("btg_d_num", "10", 12, 28, 30, {
          fontFamily: "urbanist",
          fontSize: 48,
          fontWeight: "bold",
          textAlign: "left",
        }),
        text("btg_d_mon", "SEPTEMBER", 12, 48, 30, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 1,
          fontWeight: "bold",
          color: "#777777",
          textAlign: "left",
        }),
        shape("btg_d_rule", "line", 48, 22, 2, 40, "#dddddd"),
        text(
          "btg_d_info",
          "LOT 100 68 CHAMBERS RD\nHAY VALLEY\n\nCOMMENCING AT 1:00 PM\n\nRSVP BY 1 SEPTEMBER\nBRANDON 0444 123 321",
          54,
          18,
          40,
          {
            fontFamily: "urbanist",
            fontSize: 10,
            letterSpacing: 0.5,
            lineHeight: 1.55,
            textAlign: "left",
            color: "#444444",
          },
        ),
        image("btg_d_img", IMG.friends, 12, 68, 76, 24, { frame: "rounded" }),
      ]),
      locationPage("Lot 100", "68 Chambers Rd, Hay Valley", "68 Chambers Rd Hay Valley"),
      rsvpPage({
        eyebrow: "RSVP",
        title: "Coming to Alex's 21st?",
        note: "Please reply by 1 September",
        theme: {
          background: "#faf6ee",
          surface: "#ffffff",
          accent: "#b8952e",
          text: "#2a2418",
          muted: "#8a7a55",
          buttonStyle: "chip",
          headingFont: "caveat",
          bodyFont: "urbanist",
        },
        questions: [
          {
            id: "attend",
            type: "attend",
            label: "Attendance",
            yesLabel: "Count me in",
            noLabel: "Regrets",
          },
          {
            id: "drink",
            type: "multi_choice",
            label: "What are you drinking?",
            hint: "Select all that apply",
            options: [
              { id: "champagne", label: "Champagne" },
              { id: "cocktail", label: "Cocktails" },
              { id: "beer", label: "Beer" },
              { id: "soft", label: "Soft drinks" },
            ],
          },
        ],
      }),
    ],
  },

  // ── Baby ─────────────────────────────────────────────────,
  {
    id: "baby-soft-clouds",
    categoryId: "baby",
    title: "Soft Clouds",
    description: "Airy cover photo + shower details + gifts",
    pages: [
      design("Cover", "#f3f8ff", [
        image("bsc_c_img", IMG.baby, 10, 8, 80, 48, { frame: "rounded" }),
        text("bsc_c_label", "BABY SHOWER", 10, 62, 80, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 4,
          fontWeight: "bold",
          color: "#4a7ab5",
        }),
        text("bsc_c_title", "A little one\nis on the way", 10, 70, 80, {
          fontFamily: "playfair",
          fontSize: 30,
          lineHeight: 1.15,
          color: "#2a4a6a",
        }),
      ]),
      design("Details", "#ffffff", [
        text("bsc_d_hosts", "Celebrating Harper & Jordan", 10, 14, 80, {
          fontFamily: "urbanist",
          fontSize: 13,
          color: "#4a7ab5",
        }),
        text("bsc_d_when", "SATURDAY  ·  22 MAY  ·  2 PM", 10, 28, 80, {
          fontFamily: "urbanist",
          fontSize: 13,
          letterSpacing: 1,
          fontWeight: "bold",
        }),
        text("bsc_d_venue", "Cloud House Cafe\n14 Skyline Road", 10, 42, 80, {
          fontFamily: "playfair",
          fontSize: 18,
          lineHeight: 1.4,
        }),
        image("bsc_d_map", IMG.venueGarden, 15, 62, 70, 28, { frame: "rounded" }),
      ]),
      locationPage("Cloud House Cafe", "14 Skyline Road, Melbourne", "Cloud House Cafe Melbourne"),
      rsvpPage({
        eyebrow: "Baby shower",
        title: "Will you join our shower?",
        note: "RSVP by 8 May",
        theme: {
          background: "#f3f8ff",
          surface: "#ffffff",
          accent: "#4a7ab5",
          text: "#2a4a6a",
          muted: "#6a8aaa",
          buttonStyle: "pill",
          headingFont: "playfair",
          bodyFont: "urbanist",
        },
        questions: [
          {
            id: "attend",
            type: "attend",
            label: "",
            yesLabel: "Yes, can't wait",
            noLabel: "Sorry, I can't",
          },
          {
            id: "gift",
            type: "single_choice",
            label: "Planning a gift?",
            options: [
              { id: "registry", label: "From the registry" },
              { id: "own", label: "Something of my own" },
              { id: "presence", label: "Presence is present" },
            ],
          },
        ],
      }),
    ],
  },
  {
    id: "baby-neutral-nursery",
    categoryId: "baby",
    title: "Neutral Nursery",
    description: "Warm neutrals across cover, details, RSVP",
    pages: [
      design("Cover", "#f7f3ec", [
        image("bnn_c_img", IMG.nursery, 15, 10, 70, 50, { frame: "arch" }),
        text("bnn_c_title", "Baby Chen", 10, 68, 80, {
          fontFamily: "playfair",
          fontSize: 32,
        }),
        text("bnn_c_sub", "is almost here", 10, 82, 80, {
          fontFamily: "caveat",
          fontSize: 24,
          color: "#8a7355",
        }),
      ]),
      design("Details", "#ffffff", [
        text("bnn_d_eyebrow", "PLEASE JOIN US FOR A BRUNCH", 10, 16, 80, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 2,
          fontWeight: "bold",
        }),
        divider("bnn_d_line", 35, 28, 30, "#c4a574"),
        text("bnn_d_when", "11 AM  ·  6 June 2027", 10, 36, 80, {
          fontFamily: "urbanist",
          fontSize: 16,
          fontWeight: "medium",
        }),
        text("bnn_d_venue", "The Nest Studio\n22 Willow Lane", 10, 52, 80, {
          fontFamily: "playfair",
          fontSize: 18,
          lineHeight: 1.4,
        }),
        image("bnn_d_soft", IMG.softBaby, 20, 72, 60, 20, { frame: "rounded" }),
      ]),
      locationPage("The Nest Studio", "22 Willow Lane", "The Nest Studio Willow Lane"),
      rsvpPage({
        eyebrow: "Brunch RSVP",
        title: "Can you make brunch?",
        note: "Kindly reply by 20 May",
        theme: {
          background: "#f7f3ec",
          surface: "#ffffff",
          accent: "#8a7355",
          text: "#3d3228",
          muted: "#9a8a72",
          buttonStyle: "outline",
          headingFont: "playfair",
          bodyFont: "urbanist",
        },
        questions: [
          {
            id: "attend",
            type: "attend",
            label: "",
            yesLabel: "I'll be there",
            noLabel: "Can't make it",
          },
          {
            id: "allergies",
            type: "multi_choice",
            label: "Any food allergies?",
            hint: "Select all that apply",
            options: [
              { id: "nuts", label: "Nuts" },
              { id: "dairy", label: "Dairy" },
              { id: "gluten", label: "Gluten" },
              { id: "eggs", label: "Eggs" },
              { id: "none", label: "None" },
            ],
          },
        ],
      }),
    ],
  },
  {
    id: "baby-pink-blue",
    categoryId: "baby",
    title: "Pink & Blue Reveal",
    description: "Playful reveal cover + party plan + RSVP",
    pages: [
      design("Cover", "#fff5f8", [
        text("bpb_c_title", "Boy or Girl?", 10, 22, 80, {
          fontFamily: "caveat",
          fontSize: 44,
          color: "#ff60aa",
        }),
        text("bpb_c_body", "Join our gender reveal\nparty for baby Lee", 10, 48, 80, {
          fontFamily: "urbanist",
          fontSize: 15,
          lineHeight: 1.5,
        }),
        shape("bpb_c_heart", "heart", 42, 72, 16, 12, "#7eb8ff"),
      ]),
      design("Details", "#ffffff", [
        text("bpb_d_when", "SUNDAY  ·  4 PM", 10, 16, 80, {
          fontFamily: "urbanist",
          fontSize: 14,
          letterSpacing: 2,
          fontWeight: "bold",
        }),
        text("bpb_d_venue", "River Gardens\nPicnic lawn & pavilion", 10, 30, 80, {
          fontFamily: "playfair",
          fontSize: 20,
          lineHeight: 1.4,
        }),
        image("bpb_d_img", IMG.softBaby, 15, 52, 70, 32, { frame: "rounded" }),
      ]),
      locationPage("River Gardens", "Picnic lawn & pavilion", "River Gardens Melbourne"),
      rsvpPage({
        eyebrow: "Guess + RSVP",
        title: "Coming to the reveal?",
        note: "RSVP by 10 March",
        theme: {
          background: "#fff5f8",
          surface: "#ffffff",
          accent: "#ff60aa",
          text: "#3a2a35",
          muted: "#9a7a88",
          buttonStyle: "chip",
          headingFont: "caveat",
          bodyFont: "urbanist",
        },
        questions: [
          {
            id: "attend",
            type: "attend",
            label: "Attendance",
            yesLabel: "Yes!",
            noLabel: "Can't make it",
          },
          {
            id: "guess",
            type: "single_choice",
            label: "Your guess?",
            options: [
              { id: "boy", label: "Boy" },
              { id: "girl", label: "Girl" },
              { id: "twins", label: "Twins?!" },
            ],
          },
        ],
      }),
    ],
  },

  // ── Corporate ────────────────────────────────────────────,
  {
    id: "corporate-product-launch",
    categoryId: "corporate",
    title: "Product Launch",
    description: "Bold cover, agenda, venue map",
    pages: [
      design("Cover", "#0f1f1a", [
        image("cpl_c_img", IMG.conference, 0, 0, 100, 55, { frame: "square" }),
        text("cpl_c_eye", "YOU'RE INVITED", 10, 62, 80, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 4,
          fontWeight: "bold",
          color: "#6dcaa0",
        }),
        text("cpl_c_title", "Gather 2.0\nLaunch Evening", 10, 72, 80, {
          fontFamily: "urbanist",
          fontSize: 30,
          fontWeight: "bold",
          lineHeight: 1.1,
          color: "#ffffff",
        }),
      ]),
      design("Agenda", "#f4f6f5", [
        text("cpl_a_title", "Evening agenda", 10, 12, 80, {
          fontFamily: "urbanist",
          fontSize: 22,
          fontWeight: "bold",
        }),
        text(
          "cpl_a_list",
          "6:30  Doors & drinks\n7:00  Welcome keynote\n7:30  Product demo\n8:15  Networking",
          12,
          30,
          76,
          {
            fontFamily: "urbanist",
            fontSize: 14,
            lineHeight: 1.85,
            textAlign: "left",
          },
        ),
        text("cpl_a_when", "Wed 18 Nov · Innovation Hub", 10, 82, 80, {
          fontFamily: "urbanist",
          fontSize: 12,
          fontWeight: "medium",
          color: "#2f7a5b",
        }),
      ]),
      locationPage("Innovation Hub", "Level 4, 200 Collins St, Melbourne VIC 3000", "200 Collins Street Melbourne"),
      rsvpPage({
        eyebrow: "Registration",
        title: "Confirm your seat",
        note: "Please RSVP by 1 November",
        theme: {
          background: "#f4f6f5",
          surface: "#ffffff",
          accent: "#2f7a5b",
          text: "#0f1f1a",
          muted: "#5a7a6a",
          buttonStyle: "square",
          headingFont: "urbanist",
          bodyFont: "urbanist",
        },
        questions: [
          {
            id: "attend",
            type: "attend",
            label: "",
            yesLabel: "I'll attend",
            noLabel: "Unable to attend",
          },
          {
            id: "role",
            type: "single_choice",
            label: "You're joining as",
            options: [
              { id: "press", label: "Press" },
              { id: "partner", label: "Partner" },
              { id: "customer", label: "Customer" },
              { id: "team", label: "Team" },
            ],
          },
        ],
      }),
    ],
  },
  {
    id: "corporate-team-dinner",
    categoryId: "corporate",
    title: "Team Dinner",
    description: "Understated cover + menu night + RSVP",
    pages: [
      design("Cover", "#ffffff", [
        text("ctd_c_eye", "ANNUAL DINNER", 10, 20, 80, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 4,
          fontWeight: "bold",
        }),
        text("ctd_c_title", "Together\nat the table", 10, 34, 80, {
          fontFamily: "playfair",
          fontSize: 38,
          lineHeight: 1.1,
        }),
        divider("ctd_c_line", 35, 62, 30, "#1F2D22"),
        text("ctd_c_when", "Friday 7 PM · Ember Restaurant", 10, 70, 80, {
          fontFamily: "urbanist",
          fontSize: 13,
          fontWeight: "medium",
        }),
      ]),
      design("Evening", "#1a1a1a", [
        image("ctd_e_img", IMG.dinner, 10, 8, 80, 40, { frame: "rounded" }),
        text("ctd_e_title", "An evening for the team", 10, 56, 80, {
          fontFamily: "playfair",
          fontSize: 22,
          color: "#ffffff",
        }),
        text(
          "ctd_e_body",
          "Three courses · open bar · awards\nSmart casual dress",
          10,
          72,
          80,
          {
            fontFamily: "urbanist",
            fontSize: 13,
            lineHeight: 1.6,
            color: "#ffffffcc",
          },
        ),
      ]),
      locationPage("Ember Restaurant", "Melbourne CBD", "Ember Restaurant Melbourne"),
      rsvpPage({
        eyebrow: "Team dinner",
        title: "Will you join us?",
        note: "Please RSVP by 1 November",
        theme: {
          background: "#ffffff",
          surface: "#f6f6f6",
          accent: "#1F2D22",
          text: "#1F2D22",
          muted: "#6b6b6b",
          buttonStyle: "outline",
          headingFont: "playfair",
          bodyFont: "urbanist",
        },
        questions: [
          {
            id: "attend",
            type: "attend",
            label: "",
            yesLabel: "Yes, count me in",
            noLabel: "I can't make it",
          },
          {
            id: "meal",
            type: "single_choice",
            label: "Main preference",
            options: [
              { id: "beef", label: "Beef" },
              { id: "fish", label: "Fish" },
              { id: "veg", label: "Vegetarian" },
              { id: "vegan", label: "Vegan" },
            ],
          },
        ],
      }),
    ],
  },
  {
    id: "corporate-conference",
    categoryId: "corporate",
    title: "Conference Summit",
    description: "Summit cover, schedule, location",
    pages: [
      design("Cover", "#eef2f0", [
        text("cc_c_eye", "SUMMIT 2027", 10, 16, 80, {
          fontFamily: "urbanist",
          fontSize: 12,
          letterSpacing: 5,
          fontWeight: "bold",
          color: "#2f7a5b",
        }),
        text("cc_c_title", "Designing\nMoments", 10, 30, 80, {
          fontFamily: "urbanist",
          fontSize: 42,
          fontWeight: "bold",
          lineHeight: 1.05,
        }),
        text("cc_c_sub", "Two days · Keynotes · Workshops", 10, 72, 80, {
          fontFamily: "urbanist",
          fontSize: 13,
        }),
      ]),
      design("Schedule", "#ffffff", [
        text("cc_s_title", "Day one highlights", 10, 12, 80, {
          fontFamily: "urbanist",
          fontSize: 18,
          fontWeight: "bold",
        }),
        text(
          "cc_s_list",
          "09:00  Registration\n10:00  Opening keynote\n13:00  Breakout sessions\n16:30  Closing panel",
          12,
          28,
          76,
          {
            fontFamily: "urbanist",
            fontSize: 13,
            lineHeight: 1.85,
            textAlign: "left",
          },
        ),
        image("cc_s_img", IMG.conference, 12, 70, 76, 22, { frame: "rounded" }),
      ]),
      locationPage("Melbourne Convention Centre", "1 Convention Centre Pl, South Wharf VIC", "Melbourne Convention and Exhibition Centre"),
      rsvpPage({
        eyebrow: "Summit RSVP",
        title: "Which days will you attend?",
        note: "Register by 1 October",
        theme: {
          background: "#eef2f0",
          surface: "#ffffff",
          accent: "#2f7a5b",
          text: "#122018",
          muted: "#5a7a6a",
          buttonStyle: "chip",
          headingFont: "urbanist",
          bodyFont: "urbanist",
        },
        questions: [
          {
            id: "days",
            type: "multi_choice",
            label: "Select all that apply",
            options: [
              { id: "day1", label: "Day 1 — Keynotes" },
              { id: "day2", label: "Day 2 — Workshops" },
              { id: "dinner", label: "Networking dinner" },
            ],
          },
          {
            id: "company",
            type: "short_text",
            label: "Company / organisation",
            placeholder: "Your company name",
          },
        ],
      }),
    ],
  },

  // ── Dinner ───────────────────────────────────────────────,
  {
    id: "dinner-intimate-supper",
    categoryId: "dinner",
    title: "Intimate Supper",
    description: "Quiet cover, courses, address card",
    pages: [
      design("Cover", "#faf6f1", [
        text("dis_c_eye", "DINNER", 10, 18, 80, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 5,
          fontWeight: "bold",
        }),
        text("dis_c_title", "An evening\nat ours", 10, 32, 80, {
          fontFamily: "playfair",
          fontSize: 38,
          lineHeight: 1.1,
        }),
        text("dis_c_body", "Six courses · conversation · candlelight", 10, 68, 80, {
          fontFamily: "urbanist",
          fontSize: 12,
          italic: true,
          color: "#1F2D22B3",
        }),
        text("dis_c_when", "Sat 7:30 PM", 10, 82, 80, {
          fontFamily: "urbanist",
          fontSize: 14,
          fontWeight: "medium",
        }),
      ]),
      design("Menu night", "#1f1c1a", [
        image("dis_m_img", IMG.dinner, 8, 8, 84, 40, { frame: "rounded" }),
        text("dis_m_title", "On the table", 10, 56, 80, {
          fontFamily: "playfair",
          fontSize: 24,
          color: "#ffffff",
        }),
        text(
          "dis_m_body",
          "Amuse · starter · main\ncheese · dessert · digestif",
          10,
          72,
          80,
          {
            fontFamily: "urbanist",
            fontSize: 13,
            lineHeight: 1.6,
            color: "#ffffffcc",
          },
        ),
      ]),
      locationPage("48 Olive Street", "Apartment 3B", "48 Olive Street Melbourne"),
      rsvpPage({
        eyebrow: "Supper",
        title: "Can we set a place for you?",
        note: "Please RSVP by Thursday",
        theme: {
          background: "#faf6f1",
          surface: "#ffffff",
          accent: "#1F2D22",
          text: "#1F2D22",
          muted: "#7a6f64",
          buttonStyle: "outline",
          headingFont: "playfair",
          bodyFont: "urbanist",
        },
        questions: [
          {
            id: "attend",
            type: "attend",
            label: "",
            yesLabel: "Yes, I'll come",
            noLabel: "I can't this time",
          },
          {
            id: "allergies",
            type: "multi_choice",
            label: "Any allergies or restrictions?",
            hint: "Select all that apply",
            options: [
              { id: "shellfish", label: "Shellfish" },
              { id: "nuts", label: "Nuts" },
              { id: "sesame", label: "Sesame" },
              { id: "dairy", label: "Dairy" },
              { id: "gluten", label: "Gluten" },
              { id: "none", label: "None" },
            ],
          },
        ],
      }),
    ],
  },
  {
    id: "dinner-garden-party",
    categoryId: "dinner",
    title: "Garden Party",
    description: "Outdoor cover, lawn details, find-us map",
    pages: [
      design("Cover", "#f4f8f2", [
        image("dgp_c_img", IMG.gardenTable, 8, 6, 84, 52, { frame: "rounded" }),
        text("dgp_c_title", "Garden\nGathering", 10, 64, 80, {
          fontFamily: "playfair",
          fontSize: 36,
          lineHeight: 1.05,
        }),
        text("dgp_c_sub", "Drinks on the lawn · dinner under the lights", 10, 88, 80, {
          fontFamily: "urbanist",
          fontSize: 11,
          color: "#1F2D22B3",
        }),
      ]),
      design("Details", "#ffffff", [
        text("dgp_d_when", "Sunday · 5 PM", 10, 16, 80, {
          fontFamily: "urbanist",
          fontSize: 16,
          fontWeight: "bold",
        }),
        text("dgp_d_venue", "Riverview Gardens", 10, 30, 80, {
          fontFamily: "playfair",
          fontSize: 26,
        }),
        text(
          "dgp_d_body",
          "Lawn games from 5\nLong-table dinner at 7\nBring a light layer",
          10,
          48,
          80,
          {
            fontFamily: "urbanist",
            fontSize: 14,
            lineHeight: 1.7,
          },
        ),
        image("dgp_d_f", "/images/flowers/flower-8.png", 64, 78, 30, 16),
      ]),
      locationPage("Riverview Gardens", "12 River Bend Road", "Riverview Gardens Melbourne"),
      rsvpPage({
        eyebrow: "Garden gathering",
        title: "Joining us on the lawn?",
        note: "RSVP by Friday",
        theme: {
          background: "#f4f8f2",
          surface: "#ffffff",
          accent: "#3d5c3a",
          text: "#243528",
          muted: "#6a7a65",
          buttonStyle: "pill",
          headingFont: "playfair",
          bodyFont: "urbanist",
        },
        questions: [
          {
            id: "attend",
            type: "attend",
            label: "",
            yesLabel: "Yes — see you there",
            noLabel: "Can't make it",
          },
          {
            id: "bring",
            type: "short_text",
            label: "Bringing anything to share?",
            hint: "Optional — dessert, blooms, a playlist…",
            placeholder: "I'll bring…",
          },
        ],
      }),
    ],
  },
  {
    id: "dinner-cocktail-hour",
    categoryId: "dinner",
    title: "Cocktail Hour",
    description: "Dark cover, drinks menu, velvet venue",
    pages: [
      design("Cover", "#1f1c1a", [
        image("dch_c_img", IMG.cocktails, 0, 0, 100, 55, { frame: "square" }),
        text("dch_c_eye", "COCKTAILS", 10, 62, 80, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 5,
          fontWeight: "bold",
          color: "#ff60aa",
        }),
        text("dch_c_title", "Sip & Stay", 10, 72, 80, {
          fontFamily: "playfair",
          fontSize: 40,
          color: "#ffffff",
        }),
        text("dch_c_when", "Thu 6–9 PM", 10, 88, 80, {
          fontFamily: "urbanist",
          fontSize: 13,
          color: "#ffffffcc",
        }),
      ]),
      design("The hour", "#2a2420", [
        text("dch_h_title", "On the bar", 10, 16, 80, {
          fontFamily: "caveat",
          fontSize: 34,
          color: "#ff60aa",
        }),
        text(
          "dch_h_list",
          "Signature spritz\nHouse negroni\nZero-proof highball\nCanapés circulating",
          12,
          40,
          76,
          {
            fontFamily: "urbanist",
            fontSize: 14,
            lineHeight: 1.8,
            color: "#ffffff",
            textAlign: "left",
          },
        ),
      ]),
      locationPage("The Velvet Room", "Melbourne", "The Velvet Room Melbourne"),
      rsvpPage({
        eyebrow: "Cocktails",
        title: "Sip with us?",
        note: "RSVP soon — space is limited",
        theme: {
          background: "#1f1c1a",
          surface: "#2a2420",
          accent: "#ff60aa",
          text: "#ffffff",
          muted: "#b0a8a0",
          buttonStyle: "pill",
          headingFont: "caveat",
          bodyFont: "urbanist",
        },
        questions: [
          {
            id: "attend",
            type: "attend",
            label: "",
            yesLabel: "I'm in",
            noLabel: "Not this time",
          },
          {
            id: "drink",
            type: "single_choice",
            label: "First round on us — pick one",
            options: [
              { id: "spritz", label: "Signature spritz" },
              { id: "negroni", label: "House negroni" },
              { id: "zero", label: "Zero-proof" },
              { id: "surprise", label: "Surprise me" },
            ],
          },
        ],
      }),
    ],
  },

];


export function getTemplateById(
  id: string,
): InvitationTemplate | undefined {
  return INVITATION_TEMPLATES.find((template) => template.id === id);
}

export function getTemplatesByCategory(
  categoryId: TemplateCategoryId,
): InvitationTemplate[] {
  return INVITATION_TEMPLATES.filter(
    (template) => template.categoryId === categoryId,
  );
}

function remappedElements(elements: CanvasElement[]): CanvasElement[] {
  const stamp = Math.random().toString(36).slice(2, 7);
  return elements.map((el) => ({
    ...el,
    id: `${el.id}_${stamp}`,
    style: { ...el.style, effects: { ...el.style.effects } },
  }));
}

/** Build invitation content from a catalog template (all pages). */
export function contentFromTemplate(
  template: InvitationTemplate,
): InvitationContent {
  const pages: InvitationPage[] = template.pages.map((templatePage, index) => {
    const pageId = `page_${Math.random().toString(36).slice(2, 9)}`;
    return {
      id: pageId,
      name: templatePage.name || `Page ${index + 1}`,
      kind: templatePage.kind,
      elements:
        templatePage.kind === "design"
          ? remappedElements(templatePage.elements)
          : [],
      backgroundColor: templatePage.backgroundColor,
      backgroundPattern: "none" as const,
      border: null,
      location: templatePage.kind === "location" ? templatePage.location ?? null : null,
      rsvpConfig: templatePage.kind === "rsvp" ? templatePage.rsvpConfig ?? null : null,
    };
  });

  const firstDesign =
    pages.find((page) => page.kind === "design") ?? pages[0];
  const location = template.pages.find((page) => page.kind === "location");
  const rsvp = template.pages.find((page) => page.kind === "rsvp");
  const base = createDefaultContent({ title: template.title });

  return {
    ...base,
    invite: {
      ...base.invite,
      headline: template.title,
    },
    details: {
      ...base.details,
      venue: location?.location?.venue || base.details.venue,
      address: location?.location?.address || base.details.address,
    },
    rsvp: {
      prompt: rsvp?.rsvpConfig?.title || base.rsvp.prompt,
      note: rsvp?.rsvpConfig?.note || base.rsvp.note,
    },
    elements: firstDesign.elements,
    pages,
    activePageId: firstDesign.id,
  };
}

/** Cover page for card thumbnails. */
export function templatePreviewPage(
  template: InvitationTemplate,
): Pick<InvitationPage, "elements" | "backgroundColor"> {
  const cover =
    template.pages.find((page) => page.kind === "design") ?? template.pages[0];
  return {
    elements: cover?.elements ?? [],
    backgroundColor: cover?.backgroundColor ?? "#fff8f4",
  };
}
