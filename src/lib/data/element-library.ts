import type { CanvasElement } from "./canvas-elements";
import {
  createDividerElement,
  createImageElement,
  createShapeElement,
  createTextElement,
  type DividerStyle,
  type ImageFrame,
  type ShapeKind,
} from "./canvas-elements";
import type { CanvasFontFamily } from "@/lib/canvas-fonts";
import {
  EMPTY_IMAGE_FRAME_SRC,
  IMAGE_FRAME_OPTIONS,
} from "@/components/editor/image-frames";
import {
  NUMBER_ART_STYLES,
  artworkDefaultColor,
} from "@/components/editor/artwork-catalog";

/** Top-level browse categories (Canva-style) */
export type ElementCategoryId =
  | "patterns"
  | "shapes"
  | "dividers"
  | "frames";

/** Sub-filters inside Patterns */
export type PatternSubcategoryId =
  | "all"
  | "flowers"
  | "birthday"
  | "wedding"
  | "graduation"
  | "monogram"
  | "icons"
  | "social"
  | "envelopes"
  | "numbers"
  | "others";

/** Sub-filters inside Shapes (Canva-style groups) */
export type ShapeSubcategoryId =
  | "all"
  | "lines"
  | "basic"
  | "polygons"
  | "stars";

/** Glyph placed as a text element - monograms, numbers, ampersands. */
export interface LibraryMark {
  glyph: string;
  fontFamily: CanvasFontFamily;
  fontSize: number;
}

export interface LibraryElement {
  id: string;
  name: string;
  category: ElementCategoryId;
  /** Subcategory for Patterns */
  subcategory?: Exclude<PatternSubcategoryId, "all">;
  /** Subcategory for Shapes */
  shapeGroup?: Exclude<ShapeSubcategoryId, "all">;
  preview: string;
  kind: "pattern" | "shape" | "divider" | "monogram" | "frame" | "artwork";
  shapeKind?: ShapeKind;
  dividerStyle?: DividerStyle;
  /** Photo frame dropped as an empty placeholder, ready for an image. */
  frame?: ImageFrame;
  /** Typeset mark for monogram-style elements. */
  mark?: LibraryMark;
  /** Ink this element is placed with, when its own colour is part of it. */
  defaultColor?: string;
  tags?: string[];
}

const CORE_ELEMENTS: LibraryElement[] = [
  // Patterns - Flowers
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
  // Patterns - Birthday graphics
  {
    id: "birthday-01",
    name: "Celebration cake",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-01.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-02",
    name: "Layered birthday cake",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-02.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-03",
    name: "Navy party hat",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-03.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-04",
    name: "Striped party hat",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-04.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-05",
    name: "Polka dot party hat",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-05.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-06",
    name: "Coral party hat",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-06.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-07",
    name: "Starry party hat",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-07.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-08",
    name: "Celebration party hat",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-08.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-09",
    name: "Pastel balloons",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-09.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-10",
    name: "Bright balloons",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-10.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-11",
    name: "Candle cake",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-11.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-12",
    name: "Birthday stars",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-12.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-13",
    name: "Red gift",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-13.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-14",
    name: "Teal gift",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-14.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-15",
    name: "Vanilla cupcake",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-15.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-16",
    name: "Heart cupcake",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-16.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-17",
    name: "Playful birthday wish",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-17.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-18",
    name: "Cupcake surprise",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-18.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-19",
    name: "Confetti popper",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-19.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-20",
    name: "Party popper",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-20.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-21",
    name: "Bold birthday wish",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-21.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-22",
    name: "Balloon bouquet",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-22.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-23",
    name: "Let's party banner",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-23.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-24",
    name: "Tiered party cake",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-24.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-25",
    name: "Party elephant",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-25.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-26",
    name: "Ribbon gift",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-26.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-27",
    name: "Teal present",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-27.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-28",
    name: "Tall birthday wish",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-28.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-29",
    name: "Happy birthday wish",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-29.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },
  {
    id: "birthday-30",
    name: "Sprinkle cupcake",
    category: "patterns",
    subcategory: "birthday",
    preview: "/images/graphics/birthday/stickers/birthday-30.png",
    kind: "pattern",
    tags: ["birthday", "graphic", "sticker", "party", "celebration"],
  },

  // Patterns - Wedding
  {
    id: "wedding-romantic-botanical",
    name: "Romantic botanical arrangement",
    category: "patterns",
    subcategory: "wedding",
    preview: "/images/graphics/wedding/editorial/romantic-botanical.png",
    kind: "pattern",
    tags: ["wedding", "floral", "flowers", "roses", "botanical", "editorial"],
  },
  {
    id: "wedding-heirloom-rings",
    name: "Heirloom wedding rings",
    category: "patterns",
    subcategory: "wedding",
    preview: "/images/graphics/wedding/editorial/heirloom-rings.png",
    kind: "pattern",
    tags: ["wedding", "rings", "diamond", "gold", "engagement", "jewellery"],
  },
  {
    id: "wedding-champagne-toast",
    name: "Crystal champagne toast",
    category: "patterns",
    subcategory: "wedding",
    preview: "/images/graphics/wedding/editorial/champagne-toast.png",
    kind: "pattern",
    tags: ["wedding", "champagne", "toast", "glasses", "celebration", "crystal"],
  },
  {
    id: "wedding-gilded-flourish",
    name: "Gilded botanical flourish",
    category: "patterns",
    subcategory: "wedding",
    preview: "/images/graphics/wedding/editorial/gilded-flourish.png",
    kind: "pattern",
    tags: ["wedding", "gold", "flourish", "ornament", "baroque", "luxury"],
  },
  {
    id: "wedding-ivory-satin-bow",
    name: "Ivory satin bow",
    category: "patterns",
    subcategory: "wedding",
    preview: "/images/graphics/wedding/editorial/ivory-satin-bow.png",
    kind: "pattern",
    tags: ["wedding", "bow", "ribbon", "satin", "silk", "ivory"],
  },
  {
    id: "wedding-pearl-cake",
    name: "Pearl wedding cake",
    category: "patterns",
    subcategory: "wedding",
    preview: "/images/graphics/wedding/editorial/pearl-wedding-cake.png",
    kind: "pattern",
    tags: ["wedding", "cake", "gold", "pearls", "patisserie", "celebration"],
  },
  // Patterns - Wedding stickers
  ...[
    ["blush-floral-cake", "Blush floral cake", ["cake", "blush", "flowers"]],
    ["silver-floral-cake", "Silver floral cake", ["cake", "silver", "flowers"]],
    ["blush-rose-bouquet", "Blush rose bouquet", ["bouquet", "roses", "blush"]],
    ["garden-rose-bouquet", "Garden rose bouquet", ["bouquet", "roses", "garden"]],
    ["rose-boutonniere", "Blush rose boutonniere", ["boutonniere", "rose", "blush"]],
    ["fern-boutonniere", "Fern boutonniere", ["boutonniere", "fern", "flowers"]],
    ["ribbon-rose-corsage", "Ribbon rose corsage", ["corsage", "rose", "ribbon"]],
    ["floral-table-spray", "Blush floral spray", ["floral", "spray", "roses"]],
    ["interlocked-wedding-bands", "Interlocked wedding bands", ["rings", "bands", "rose gold"]],
    ["diamond-engagement-ring", "Diamond engagement ring", ["engagement", "diamond", "ring"]],
    ["rose-gold-solitaire", "Rose gold solitaire", ["engagement", "solitaire", "ring"]],
    ["champagne-flutes", "Champagne flutes", ["champagne", "flutes", "toast"]],
    ["vintage-lockets", "Vintage wedding lockets", ["locket", "vintage", "silver"]],
    ["olive-leaf-sprig", "Olive leaf sprig", ["olive", "leaves", "greenery"]],
    ["wedding-doves", "Wedding doves", ["doves", "birds", "love"]],
    ["wedding-swans", "Wedding swans", ["swans", "birds", "love"]],
    ["vintage-wedding-car", "Vintage wedding car", ["car", "vintage", "transport"]],
    ["silver-ribbon-gift", "Silver ribbon gift", ["gift", "present", "ribbon"]],
    ["silver-gift-pair", "Silver gift pair", ["gifts", "presents", "ribbon"]],
  ].map(([slug, name, tags]) => ({
    id: `wedding-sticker-${slug as string}`,
    name: name as string,
    category: "patterns" as const,
    subcategory: "wedding" as const,
    preview: `/images/graphics/wedding/stickers/${slug as string}.png`,
    kind: "pattern" as const,
    tags: ["wedding", "sticker", ...(tags as string[])],
  })),

  ...[
    ["embracing-couple", "Embracing couple silhouette"],
    ["standing-couple", "Standing couple silhouette"],
    ["proposal-couple", "Proposal couple silhouette"],
    ["bench-conversation", "Seated couple silhouette"],
    ["garden-arch-couple", "Garden arch couple silhouette"],
    ["embrace-with-dog", "Couple with dog silhouette"],
  ].map(([slug, name]) => ({
    id: `wedding-silhouette-${slug}`,
    name,
    category: "patterns" as const,
    subcategory: "wedding" as const,
    preview: `/images/graphics/wedding/silhouettes/${slug}-preview.png`,
    kind: "pattern" as const,
    tags: ["wedding", "couple", "silhouette", "editorial", "recolourable"],
  })),

  // Patterns - Wedding watercolours
  ...[
    ["back-view-couple", "Watercolour back-view couple", ["couple", "bride", "groom", "back view"]],
    ["first-dance-couple", "Watercolour first dance", ["couple", "dance", "bride", "groom"]],
    ["botanical-corner", "Watercolour botanical corner", ["flowers", "botanical", "corner", "roses"]],
    ["painted-wedding-cake", "Watercolour wedding cake", ["cake", "flowers", "patisserie"]],
    ["champagne-toast", "Watercolour champagne toast", ["champagne", "glasses", "toast"]],
    ["intertwined-hands", "Watercolour intertwined hands", ["hands", "wedding band", "intimate", "close up"]],
    ["running-newlyweds", "Watercolour running newlyweds", ["couple", "movement", "running", "back view"]],
    ["getaway-car", "Watercolour getaway car", ["car", "convertible", "flowers", "departure"]],
    ["open-ring-box", "Watercolour open ring box", ["rings", "ring box", "pearls", "still life"]],
    ["olive-tree-ceremony", "Watercolour olive tree ceremony", ["ceremony", "olive tree", "arch", "outdoor"]],
  ].map(([slug, name, tags]) => ({
    id: `wedding-watercolour-${slug as string}`,
    name: name as string,
    category: "patterns" as const,
    subcategory: "wedding" as const,
    preview: `/images/graphics/wedding/watercolour/${slug as string}.png`,
    kind: "pattern" as const,
    tags: ["wedding", "watercolour", "watercolor", "painted", "brush", "fine art", ...(tags as string[])],
  })),

  // Patterns - Graduation
  ...[
    ["watercolour-cap-toss", "Watercolour cap toss", ["graduate", "jump", "cap", "movement", "painted"]],
    ["leather-diploma-folio", "Leather diploma folio", ["diploma", "leather", "ribbon", "wax seal", "tactile"]],
    ["paper-cut-future-city", "Paper-cut future city", ["book", "city", "future", "paper cut", "dimensional"]],
    ["embroidered-future-patch", "Embroidered future lantern", ["embroidery", "velvet", "beads", "lantern", "textile"]],
    ["linocut-graduate-procession", "Linocut graduate procession", ["graduates", "friends", "procession", "linocut", "printmaking"]],
    ["gouache-graduate-portrait", "Gouache graduate portrait", ["graduate", "portrait", "gouache", "books", "fashion"]],
    ["paper-collage-friends", "Paper collage friendship huddle", ["friends", "group", "huddle", "paper collage", "bouquet"]],
    ["watercolour-friends-resting", "Watercolour friendship moment", ["friends", "pair", "resting", "watercolour", "reflective"]],
    ["editorial-graduate-group", "Editorial graduate group", ["graduates", "group portrait", "formal", "charcoal", "fashion"]],
    ["overhead-friendship-circle", "Overhead friendship circle", ["friends", "group", "overhead", "circle", "pastel"]],
    ["watercolour-joyful-graduate", "Joyful watercolour graduate", ["graduate", "portrait", "face", "laughing", "watercolour"]],
    ["oil-pastel-proud-graduate", "Proud oil-pastel graduate", ["graduate", "portrait", "face", "confident", "oil pastel"]],
    ["screenprint-laughing-graduate", "Laughing screenprint graduate", ["graduate", "portrait", "face", "laughing", "screenprint"]],
    ["watercolour-graduate-friends", "Candid graduate friends", ["graduates", "friends", "faces", "group portrait", "watercolour"]],
    ["ink-wash-calm-graduate", "Calm ink-wash graduate", ["graduate", "portrait", "face", "calm", "ink wash", "east asian", "light medium skin"]],
    ["oil-pastel-cap-lift", "Joyful oil-pastel cap lift", ["graduate", "portrait", "face", "cap lift", "oil pastel", "south asian", "deep skin"]],
    ["paper-cut-proud-graduate", "Proud paper-cut graduate", ["graduate", "portrait", "face", "hijab", "paper cut", "middle eastern", "north african", "olive skin"]],
    ["risograph-playful-graduate", "Playful risograph graduate", ["graduate", "portrait", "face", "risograph", "nonbinary", "southeast asian", "tan skin"]],
    ["pencil-reflective-graduate", "Reflective pencil graduate", ["graduate", "portrait", "face", "freckles", "colored pencil", "fair skin", "red hair"]],
    ["ink-watercolour-bob-graduate", "Ink-wash tassel portrait", ["graduate", "woman", "portrait", "face", "ink wash", "watercolour", "east asian", "light skin", "black bob"]],
    ["screenprint-flower-graduate", "Screenprint flower graduate", ["graduate", "woman", "portrait", "face", "screenprint", "southeast asian", "tan skin", "flower"]],
    ["embroidered-freckled-graduate", "Embroidered freckled graduate", ["graduate", "woman", "portrait", "face", "embroidery", "white", "fair skin", "freckles", "strawberry blonde"]],
    ["paper-relief-portfolio-graduate", "Paper-relief portfolio graduate", ["graduate", "woman", "portrait", "face", "paper relief", "white", "olive fair skin", "brunette", "portfolio"]],
    ["vietnamese-ao-dai-graduate-woman", "Vietnamese áo dài graduate", ["graduate", "woman", "full body", "vietnamese", "vietnam", "áo dài", "ao dai", "white silk", "watercolour"]],
    ["vietnamese-ao-dai-graduate-man", "Vietnamese male áo dài graduate", ["graduate", "man", "full body", "vietnamese", "vietnam", "áo dài", "ao dai", "burgundy silk", "gouache"]],
    ["vietnamese-graduate-friends", "Vietnamese graduate friends", ["graduates", "woman", "man", "portrait", "vietnamese", "vietnam", "áo dài", "ao dai", "friends", "watercolour"]],
    ["vietnamese-graduation-friend-group", "Vietnamese graduation friend group", ["graduates", "friends", "group", "seven people", "vietnamese", "vietnam", "graduation gowns", "celebration", "portrait"]],
  ].map(([slug, name, tags]) => ({
    id: `graduation-${slug as string}`,
    name: name as string,
    category: "patterns" as const,
    subcategory: "graduation" as const,
    preview: `/images/graphics/graduation/editorial/${slug as string}.png`,
    kind: "pattern" as const,
    tags: ["graduation", "editorial", "celebration", ...(tags as string[])],
  })),

  // Patterns - Graduation stickers
  ...[
    ["confetti-mortarboard", "Confetti mortarboard", ["mortarboard", "cap", "confetti", "ribbon"]],
    ["study-stack", "Graduation study stack", ["books", "diploma", "glasses", "study"]],
    ["graduation-keepsake-box", "Graduation keepsake box", ["keepsake", "diploma", "photo", "key"]],
    ["celebration-cake", "Graduation celebration cake", ["cake", "candles", "mortarboard", "party"]],
    ["next-chapter-suitcase", "Next chapter suitcase", ["suitcase", "travel", "future", "diploma"]],
    ["graduation-bouquet", "Graduation bouquet", ["flowers", "bouquet", "diploma", "mortarboard"]],
  ].map(([slug, name, tags]) => ({
    id: `graduation-sticker-${slug as string}`,
    name: name as string,
    category: "patterns" as const,
    subcategory: "graduation" as const,
    preview: `/images/graphics/graduation/stickers/${slug as string}.png`,
    kind: "pattern" as const,
    tags: ["graduation", "sticker", "shiny", "white border", ...(tags as string[])],
  })),

  // Patterns - Monogram
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
  // Patterns - Icons (placed as shapes so tile + canvas match)
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
  {
    id: "icon-sparkles",
    name: "Sparkles",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_sparkles",
    tags: ["icon", "sparkles", "shine", "celebration", "party"],
  },
  {
    id: "icon-wine",
    name: "Wine glass",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_wine",
    tags: ["icon", "wine", "glass", "drink", "dinner"],
  },
  {
    id: "icon-cocktail",
    name: "Cocktail",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_cocktail",
    tags: ["icon", "cocktail", "drink", "party", "bar"],
  },
  {
    id: "icon-ribbon",
    name: "Ribbon",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_ribbon",
    tags: ["icon", "ribbon", "bow", "gift", "award"],
  },
  {
    id: "icon-candle",
    name: "Candle",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_candle",
    tags: ["icon", "candle", "light", "dinner", "birthday"],
  },
  // Patterns - Animated emoji (system emoji + CSS motion)
  {
    id: "emoji-wave",
    name: "Wave",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_wave",
    tags: ["icon", "emoji", "wave", "hello", "animated"],
  },
  {
    id: "emoji-heart",
    name: "Heart",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_heart",
    tags: ["icon", "emoji", "heart", "love", "animated"],
  },
  {
    id: "emoji-party",
    name: "Party",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_party",
    tags: ["icon", "emoji", "party", "celebration", "animated"],
  },
  {
    id: "emoji-clap",
    name: "Clap",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_clap",
    tags: ["icon", "emoji", "clap", "applause", "animated"],
  },
  {
    id: "emoji-sparkles",
    name: "Sparkles",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_sparkles",
    tags: ["icon", "emoji", "sparkles", "shine", "animated"],
  },
  {
    id: "emoji-balloon",
    name: "Balloon",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_balloon",
    tags: ["icon", "emoji", "balloon", "party", "animated"],
  },
  {
    id: "emoji-cake",
    name: "Cake",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_cake",
    tags: ["icon", "emoji", "cake", "birthday", "animated"],
  },
  {
    id: "emoji-rings",
    name: "Ring",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_rings",
    tags: ["icon", "emoji", "ring", "wedding", "animated"],
  },
  {
    id: "emoji-cheers",
    name: "Cheers",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_cheers",
    tags: ["icon", "emoji", "cheers", "toast", "animated"],
  },
  {
    id: "emoji-bouquet",
    name: "Bouquet",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_bouquet",
    tags: ["icon", "emoji", "bouquet", "flowers", "animated"],
  },
  {
    id: "emoji-kiss",
    name: "Kiss",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_kiss",
    tags: ["icon", "emoji", "kiss", "love", "animated"],
  },
  {
    id: "emoji-love-letter",
    name: "Love letter",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_love_letter",
    tags: ["icon", "emoji", "letter", "love", "animated"],
  },
  {
    id: "emoji-gift",
    name: "Gift",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_gift",
    tags: ["icon", "emoji", "gift", "present", "animated"],
  },
  {
    id: "emoji-rose",
    name: "Rose",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_rose",
    tags: ["icon", "emoji", "rose", "flower", "animated"],
  },
  {
    id: "emoji-party-face",
    name: "Party face",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_party_face",
    tags: ["icon", "emoji", "party", "celebration", "animated"],
  },
  {
    id: "emoji-raised-hands",
    name: "Raised hands",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "emoji_raised_hands",
    tags: ["icon", "emoji", "hands", "celebrate", "animated"],
  },
  // Patterns - Coloured icons (shown in Icons)
  {
    id: "colour-heart",
    name: "Heart",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_colour_heart",
    tags: ["icon", "coloured", "heart", "love"],
  },
  {
    id: "colour-star",
    name: "Star",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_colour_star",
    tags: ["icon", "coloured", "star"],
  },
  {
    id: "colour-sparkles",
    name: "Sparkles",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_colour_sparkles",
    tags: ["icon", "coloured", "sparkles", "celebration"],
  },
  {
    id: "colour-wine",
    name: "Wine glass",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_colour_wine",
    tags: ["icon", "coloured", "wine", "drink"],
  },
  {
    id: "colour-cocktail",
    name: "Cocktail",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_colour_cocktail",
    tags: ["icon", "coloured", "cocktail", "drink"],
  },
  {
    id: "colour-gift",
    name: "Gift",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_colour_gift",
    tags: ["icon", "coloured", "gift", "present"],
  },
  {
    id: "colour-cake",
    name: "Cake",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_colour_cake",
    tags: ["icon", "coloured", "cake", "birthday"],
  },
  {
    id: "colour-rings",
    name: "Rings",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_colour_rings",
    tags: ["icon", "coloured", "rings", "wedding"],
  },
  {
    id: "colour-envelope",
    name: "Envelope",
    category: "patterns",
    subcategory: "icons",
    preview: "",
    kind: "shape",
    shapeKind: "icon_colour_envelope",
    tags: ["icon", "coloured", "envelope", "mail", "invitation"],
  },
  // Patterns - Social (placeholders)
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
  // Shapes - Lines
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
  // Shapes - Basic
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
  // Shapes - Polygons
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
  // Shapes - Stars
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

/** Photo frames, browsable before a picture is chosen. */
const FRAME_ELEMENTS: LibraryElement[] = IMAGE_FRAME_OPTIONS.filter(
  (frame) => frame.id !== "none",
).map((frame) => ({
  id: `frame-${frame.id}`,
  name: frame.label,
  category: "frames",
  preview: "",
  kind: "frame",
  frame: frame.id,
  tags: [
    "frame",
    "photo",
    "picture",
    frame.label.toLowerCase(),
    frame.group === "decorative" ? "decorative ornate border" : "shape",
  ],
}));

/**
 * Artwork numerals. These are illustrations, not type - a guest who just wants
 * a number in a font uses the Text tool; these are here to decorate.
 */
const NUMBER_ELEMENTS: LibraryElement[] = NUMBER_ART_STYLES.flatMap((style) =>
  Array.from({ length: 10 }, (_, digit) => ({
    id: `number-${style.id}-${digit}`,
    name: `${digit}`,
    category: "patterns" as const,
    subcategory: "numbers" as const,
    preview: "",
    kind: "artwork" as const,
    shapeKind: `art_number_${style.id}_${digit}` as ShapeKind,
    defaultColor: style.defaultColor,
    tags: [
      "number",
      "numeral",
      "digit",
      String(digit),
      style.label,
      "artwork",
    ],
  })),
);

const SOCIAL_CHANNELS: {
  id: string;
  name: string;
  shapeKind: ShapeKind;
  color: string;
  tags: string[];
}[] = [
  {
    id: "facebook",
    name: "Facebook",
    shapeKind: "icon_social_facebook",
    color: "#1877F2",
    tags: ["meta"],
  },
  {
    id: "instagram",
    name: "Instagram",
    shapeKind: "icon_social_instagram",
    color: "#E1306C",
    tags: ["photo", "insta"],
  },
  {
    id: "x",
    name: "X",
    shapeKind: "icon_social_x",
    color: "#111111",
    tags: ["twitter"],
  },
  {
    id: "tiktok",
    name: "TikTok",
    shapeKind: "icon_social_tiktok",
    color: "#111111",
    tags: ["video"],
  },
  {
    id: "youtube",
    name: "YouTube",
    shapeKind: "icon_social_youtube",
    color: "#FF0000",
    tags: ["video"],
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    shapeKind: "icon_social_whatsapp",
    color: "#25D366",
    tags: ["chat", "message"],
  },
  {
    id: "telegram",
    name: "Telegram",
    shapeKind: "icon_social_telegram",
    color: "#26A5E4",
    tags: ["chat", "message"],
  },
  {
    id: "messenger",
    name: "Messenger",
    shapeKind: "icon_social_messenger",
    color: "#0084FF",
    tags: ["chat", "meta"],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    shapeKind: "icon_social_linkedin",
    color: "#0A66C2",
    tags: ["work"],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    shapeKind: "icon_social_pinterest",
    color: "#E60023",
    tags: ["board", "inspiration"],
  },
  {
    id: "snapchat",
    name: "Snapchat",
    shapeKind: "icon_social_snapchat",
    color: "#E4C400",
    tags: ["ghost", "chat"],
  },
  {
    id: "threads",
    name: "Threads",
    shapeKind: "icon_social_threads",
    color: "#111111",
    tags: ["meta"],
  },
  {
    id: "zalo",
    name: "Zalo",
    shapeKind: "icon_social_zalo",
    color: "#0068FF",
    tags: ["chat", "message"],
  },
  {
    id: "line",
    name: "LINE",
    shapeKind: "icon_social_line",
    color: "#06C755",
    tags: ["chat", "message"],
  },
  {
    id: "spotify",
    name: "Spotify",
    shapeKind: "icon_social_spotify",
    color: "#1DB954",
    tags: ["music", "playlist"],
  },
  {
    id: "website",
    name: "Website",
    shapeKind: "icon_social_globe",
    color: "#1F2D22",
    tags: ["web", "globe", "link"],
  },
  {
    id: "email",
    name: "Email",
    shapeKind: "icon_social_mail",
    color: "#1F2D22",
    tags: ["mail", "contact"],
  },
  {
    id: "phone",
    name: "Phone",
    shapeKind: "icon_social_phone",
    color: "#1F2D22",
    tags: ["call", "contact"],
  },
];

const SOCIAL_ELEMENTS: LibraryElement[] = SOCIAL_CHANNELS.map((channel) => ({
  id: `social-${channel.id}`,
  name: channel.name,
  category: "patterns",
  subcategory: "social",
  preview: "",
  kind: "shape",
  shapeKind: channel.shapeKind,
  defaultColor: channel.color,
  tags: ["social", "logo", "channel", channel.name.toLowerCase(), ...channel.tags],
}));

/**
 * Envelopes and wax seals - photographed artwork, cut out of the supplied
 * sheets. These are placed as images, so what a guest drops on the card is the
 * piece itself rather than a drawing of one.
 */
const ENVELOPE_ART: { file: string; name: string; tags: string[] }[] = [
  {
    file: "envelope-gold-lace",
    name: "Gold lace envelope",
    tags: ["gold", "lace", "liner", "card"],
  },
  {
    file: "envelope-sage-botanical",
    name: "Sage botanical envelope",
    tags: ["sage", "green", "botanical", "liner"],
  },
  {
    file: "envelope-navy-ginkgo",
    name: "Navy ginkgo envelope",
    tags: ["navy", "blue", "ginkgo", "pattern"],
  },
];

const SEAL_ART: { file: string; name: string; tags: string[] }[] = [
  { file: "seal-burgundy", name: "Burgundy seal", tags: ["red", "classic"] },
  { file: "seal-forest", name: "Forest seal", tags: ["green"] },
  { file: "seal-gold", name: "Gold seal", tags: ["gold", "metallic"] },
  { file: "seal-ivory", name: "Ivory seal", tags: ["cream", "neutral"] },
  { file: "seal-terracotta", name: "Terracotta seal", tags: ["rust", "clay"] },
  {
    file: "seal-black-square",
    name: "Black square seal",
    tags: ["black", "square", "modern"],
  },
  {
    file: "seal-ivory-scallop",
    name: "Scalloped ivory seal",
    tags: ["cream", "square", "scallop"],
  },
  { file: "seal-sage-oval", name: "Sage oval seal", tags: ["green", "oval"] },
  { file: "seal-white", name: "White seal", tags: ["white", "minimal"] },
  { file: "seal-navy", name: "Navy seal", tags: ["blue", "classic"] },
  {
    file: "seal-mustard-oval",
    name: "Mustard oval seal",
    tags: ["yellow", "ochre", "oval"],
  },
  { file: "seal-blush", name: "Blush seal", tags: ["pink", "soft"] },
  {
    file: "seal-rose-burgundy",
    name: "Rose seal",
    tags: ["red", "flower", "rose", "pressed"],
  },
  {
    file: "seal-bow-forest",
    name: "Bow seal",
    tags: ["green", "bow", "ribbon", "pressed"],
  },
  {
    file: "seal-monogram-gold",
    name: "Monogram seal",
    tags: ["gold", "monogram", "initials", "pressed"],
  },
  {
    file: "seal-lily-ivory",
    name: "Lily of the valley seal",
    tags: ["cream", "flower", "pressed"],
  },
  {
    file: "seal-anchor-terracotta",
    name: "Anchor seal",
    tags: ["rust", "anchor", "nautical", "pressed"],
  },
  {
    file: "seal-bouquet-silver",
    name: "Bouquet seal",
    tags: ["silver", "flowers", "pressed"],
  },
  {
    file: "seal-bow-white",
    name: "White bow seal",
    tags: ["white", "bow", "ribbon", "pressed"],
  },
  {
    file: "seal-lion-navy",
    name: "Lion seal",
    tags: ["blue", "lion", "crest", "pressed"],
  },
  {
    file: "seal-monogram-mustard",
    name: "Script monogram seal",
    tags: ["ochre", "monogram", "initials", "pressed"],
  },
  {
    file: "seal-wren-blush",
    name: "Wren seal",
    tags: ["pink", "bird", "pressed"],
  },
  {
    file: "seal-compass-bronze",
    name: "Compass seal",
    tags: ["bronze", "compass", "travel", "pressed"],
  },
  {
    file: "seal-lavender-copper",
    name: "Lavender seal",
    tags: ["copper", "lavender", "flower", "pressed"],
  },
  {
    file: "seal-moon-lilac",
    name: "Moon phase seal",
    tags: ["purple", "moon", "celestial", "pressed"],
  },
  {
    file: "seal-raven-silver",
    name: "Raven seal",
    tags: ["silver", "bird", "raven", "pressed"],
  },
  {
    file: "seal-wave-blue",
    name: "Wave seal",
    tags: ["blue", "wave", "sea", "pressed"],
  },
  {
    file: "seal-mushroom-forest",
    name: "Mushroom seal",
    tags: ["green", "mushroom", "woodland", "pressed"],
  },
  {
    file: "seal-initial-ivory",
    name: "Initial seal",
    tags: ["cream", "letter", "monogram", "pressed"],
  },
  {
    file: "seal-olive-heart",
    name: "Olive heart seal",
    tags: ["burgundy", "heart", "olive", "pressed"],
  },
];

const LETTER_ART: { file: string; name: string; tags: string[] }[] = [
  {
    file: "letter-embossed-forest",
    name: "Embossed forest letter",
    tags: ["green", "embossed", "border", "formal"],
  },
  {
    file: "letter-ornate-navy",
    name: "Ornate navy letter",
    tags: ["navy", "gold", "ornate", "baroque", "formal"],
  },
  {
    file: "letter-embossed-white",
    name: "Embossed white letter",
    tags: ["white", "embossed", "minimal", "formal"],
  },
  {
    file: "letter-embossed-slate",
    name: "Embossed slate letter",
    tags: ["slate", "grey", "embossed", "border"],
  },
  {
    file: "letter-deco-emerald",
    name: "Deco emerald letter",
    tags: ["emerald", "green", "deco", "geometric"],
  },
  {
    file: "letter-laurel-blush",
    name: "Laurel blush letter",
    tags: ["blush", "pink", "laurel", "wreath"],
  },
  {
    file: "letter-ornate-burgundy",
    name: "Ornate burgundy letter",
    tags: ["burgundy", "red", "ornate", "border"],
  },
  {
    file: "letter-folk-terracotta",
    name: "Folk terracotta letter",
    tags: ["terracotta", "rust", "folk", "moon"],
  },
  {
    file: "letter-fine-gold",
    name: "Fine gold letter",
    tags: ["gold", "champagne", "fine", "border"],
  },
];

const ENVELOPE_ELEMENTS: LibraryElement[] = [
  ...ENVELOPE_ART.map((piece) => ({
    id: piece.file,
    name: piece.name,
    category: "patterns" as const,
    subcategory: "envelopes" as const,
    preview: `/images/graphics/envelopes/${piece.file}.webp`,
    kind: "artwork" as const,
    tags: ["envelope", "post", "mail", "stationery", ...piece.tags],
  })),
  ...LETTER_ART.map((piece) => ({
    id: piece.file,
    name: piece.name,
    category: "patterns" as const,
    subcategory: "envelopes" as const,
    preview: `/images/graphics/envelopes/${piece.file}.webp`,
    kind: "artwork" as const,
    tags: ["letter", "paper", "card", "stationery", ...piece.tags],
  })),
  ...SEAL_ART.map((piece) => ({
    id: piece.file,
    name: piece.name,
    category: "patterns" as const,
    subcategory: "envelopes" as const,
    preview: `/images/graphics/envelopes/${piece.file}.webp`,
    kind: "artwork" as const,
    tags: ["seal", "wax", "envelope", "stationery", ...piece.tags],
  })),
];

/** Decorative objects that belong to no single occasion. */
const OTHER_ARTWORK: { kind: string; name: string; tags: string[] }[] = [
  { kind: "art_bow", name: "Silk bow", tags: ["bow", "ribbon", "gift"] },
  {
    kind: "art_ribbon",
    name: "Ribbon tail",
    tags: ["ribbon", "silk", "streamer"],
  },
  {
    kind: "art_candle",
    name: "Taper candle",
    tags: ["candle", "flame", "evening", "dinner"],
  },
  {
    kind: "art_pen",
    name: "Fountain pen",
    tags: ["pen", "write", "sign", "rsvp"],
  },
  {
    kind: "art_ink_quill",
    name: "Ink and quill",
    tags: ["ink", "quill", "write", "vintage"],
  },
  {
    kind: "art_coupe",
    name: "Champagne coupe",
    tags: ["drink", "toast", "celebrate", "glass"],
  },
  {
    kind: "art_sprig",
    name: "Pressed sprig",
    tags: ["botanical", "leaves", "flower", "greenery"],
  },
  {
    kind: "art_key",
    name: "Vintage key",
    tags: ["key", "home", "housewarming"],
  },
  {
    kind: "art_tag",
    name: "Gift tag",
    tags: ["tag", "label", "place card", "favour"],
  },
  {
    kind: "art_pearls",
    name: "Pearl strand",
    tags: ["pearls", "jewellery", "swag", "garland"],
  },
  {
    kind: "art_stamp",
    name: "Postage stamp",
    tags: ["stamp", "post", "mail", "travel"],
  },
  {
    kind: "art_confetti",
    name: "Confetti",
    tags: ["confetti", "party", "celebrate"],
  },
];

function artworkElements(
  pieces: { kind: string; name: string; tags: string[] }[],
  subcategory: "others",
): LibraryElement[] {
  return pieces.map((piece) => ({
    id: piece.kind.replace(/_/g, "-"),
    name: piece.name,
    category: "patterns",
    subcategory,
    // Set this to a /images/graphics path to swap in painted artwork later -
    // an item with a preview is placed as an image instead of vector art.
    preview: "",
    kind: "artwork",
    shapeKind: piece.kind as ShapeKind,
    defaultColor: artworkDefaultColor(piece.kind),
    tags: ["decoration", ...piece.tags],
  }));
}

const OTHER_ELEMENTS = artworkElements(OTHER_ARTWORK, "others");

export const LIBRARY_ELEMENTS: LibraryElement[] = [
  ...CORE_ELEMENTS,
  ...FRAME_ELEMENTS,
  ...ENVELOPE_ELEMENTS,
  ...NUMBER_ELEMENTS,
  ...SOCIAL_ELEMENTS,
  ...OTHER_ELEMENTS,
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

/** Line-art patterns colour-tinted via CSS mask (botanical flowers, etc.). */
export function isPatternGraphicSrc(src: string): boolean {
  return src.startsWith("/images/flowers/");
}

/** Wedding silhouettes have a fixed white outline and a separately tintable interior. */
export function isWeddingSilhouetteSrc(src: string): boolean {
  return (
    src.startsWith("/images/graphics/wedding/silhouettes/") ||
    src.startsWith("/images/graphics/wedding-silhouettes/")
  );
}

/** Full-colour library stickers/graphics - render as images, not tint masks. */
export function isLibraryGraphicSrc(src: string): boolean {
  return src.startsWith("/images/graphics/");
}

/** Any decorative library asset from Elements → Graphics. */
export function isDecorativeGraphicSrc(src: string): boolean {
  return isPatternGraphicSrc(src) || isLibraryGraphicSrc(src);
}

/** Glyph + style for monogram / social marks placed as text on the canvas. */
function patternMarkSpec(id: string): LibraryMark {
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

/** A library item's glyph: its own mark, or the legacy id lookup. */
export function libraryMarkSpec(item: LibraryElement): LibraryMark {
  return item.mark ?? patternMarkSpec(item.id);
}

export function createElementFromLibrary(item: LibraryElement): CanvasElement {
  if (item.kind === "frame") {
    const frame = item.frame ?? "square";
    const base = createImageElement(EMPTY_IMAGE_FRAME_SRC, "#000000");
    return {
      ...base,
      width: 44,
      height: 32,
      // No frameColor: an unset ornament ink lets each frame keep its own
      // palette, so switching frames in the picker recolours with it.
      style: { ...base.style, frame },
    };
  }
  if (item.kind === "artwork") {
    // Photographed artwork wins; vector art is what a piece falls back to.
    if (item.preview) return createImageElement(item.preview, "#1F2D22");
    if (item.shapeKind) {
      return createShapeElement(item.shapeKind, item.defaultColor ?? "#1F2D22");
    }
  }
  if (item.kind === "pattern") {
    return createImageElement(item.preview, "#1F2D22");
  }
  if (item.kind === "divider") {
    return createDividerElement(item.dividerStyle ?? "solid");
  }
  if (item.kind === "shape" && item.shapeKind) {
    return createShapeElement(item.shapeKind);
  }
  const mark = libraryMarkSpec(item);
  return createTextElement({
    content: mark.glyph,
    width: item.mark
      ? Math.min(46, 12 + mark.glyph.length * 9)
      : item.id === "mono-initials"
        ? 36
        : 28,
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

