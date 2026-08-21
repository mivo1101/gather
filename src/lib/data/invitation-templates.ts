import type {
  CanvasElement,
  ElementStyle,
  ImageFrame,
  ShapeKind,
  WidgetChromeStyle,
} from "./canvas-elements";
import {
  DEFAULT_INVITATION_CUSTOM_SIZE,
  createDefaultContent,
  elementsFromLocationPage,
  elementsFromRsvpPage,
  type InvitationCanvasShape,
  type InvitationContent,
  type InvitationCustomSize,
  type InvitationPage,
  type InvitationPageRole,
  type RsvpConfig,
} from "./invitation-content";
import velvetVowsSnapshot from "./template-snapshots/velvet-vows.json";

export type TemplateCategoryId =
  | "wedding"
  | "birthday"
  | "graduation"
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
  /** Guest-facing purpose; inferred from `kind` when omitted. */
  role?: InvitationPageRole;
  backgroundColor: string;
  backgroundPattern?: InvitationPage["backgroundPattern"];
  backgroundTexture?: InvitationPage["backgroundTexture"];
  backgroundTextureOpacity?: number;
  backgroundTextureTint?: string;
  backgroundTextureBlend?: InvitationPage["backgroundTextureBlend"];
  border?: InvitationPage["border"];
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
  categoryId: TemplateCategoryId;
  title: string;
  description: string;
  /** Event name given to invitations created from this template. */
  eventTitle?: string;
  shape?: InvitationCanvasShape;
  /** Required when `shape` is "custom" - the card's real-world dimensions. */
  customSize?: InvitationCustomSize;
  /** Venue prefill for the event hub - designs carry their own map widget. */
  venue?: { name: string; address: string };
  /** RSVP prefill for the event hub - designs carry their own RSVP widgets. */
  rsvpPrompt?: { prompt: string; note: string };
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
    "https://images.unsplash.com/photo-1546015720-b8b30df5aa27?auto=format&fit=crop&w=900&q=80",
  conference:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80",
  office:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
  team:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
  dinner:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  cocktails:
    "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=900&q=80",
  gardenTable:
    "https://images.unsplash.com/photo-1478144592103-25e218a04891?auto=format&fit=crop&w=900&q=80",
  vineyard:
    "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=80",
  tablescape:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80",
  rooftopNight:
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=900&q=80",
  nightCrowd:
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80",
  babyFeet:
    "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=900&q=80",
  speaker:
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80",
  workshop:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
  barRoom:
    "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=900&q=80",
  medPlate:
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80",
  gradPortraitWoman:
    "https://images.unsplash.com/photo-1618355776464-8666794d2520?auto=format&fit=crop&w=900&q=80",
  gradBouquetWoman:
    "https://images.unsplash.com/photo-1623945352596-36d5d9f21f70?auto=format&fit=crop&w=900&q=80",
  gradCapGownWoman:
    "https://images.unsplash.com/photo-1633061273472-7c62356c7329?auto=format&fit=crop&w=900&q=80",
  gradGreatHall:
    "https://images.unsplash.com/photo-1775748265132-a5575dea2994?auto=format&fit=crop&w=900&q=80",
  gradCampus:
    "https://images.unsplash.com/photo-1774600787193-8310b7571c73?auto=format&fit=crop&w=900&q=80",
  gradCapToss:
    "https://images.unsplash.com/photo-1570897234456-a6d0a709574f?auto=format&fit=crop&w=900&q=80",
  gradToast:
    "https://images.unsplash.com/photo-1699730164892-d7c433524ff3?auto=format&fit=crop&w=900&q=80",
  gradSparklers:
    "https://images.unsplash.com/photo-1643186921363-d9fb2191f798?auto=format&fit=crop&w=900&q=80",
  homeKeys:
    "https://images.unsplash.com/photo-1742318592061-15c5f19e1e47?auto=format&fit=crop&w=900&q=80",
  livingRoomFire:
    "https://images.unsplash.com/photo-1671966550483-bed07f4c93b4?auto=format&fit=crop&w=900&q=80",
  christmasTable:
    "https://images.unsplash.com/photo-1606568939710-ad9c1f460dd2?auto=format&fit=crop&w=900&q=80",
  christmasTree:
    "https://images.unsplash.com/photo-1639610406535-0cc671a0f20a?auto=format&fit=crop&w=900&q=80",
  nyeFireworks:
    "https://images.unsplash.com/photo-1785736098574-08df6360ec2c?auto=format&fit=crop&w=900&q=80",
  champagneSparkler:
    "https://images.unsplash.com/photo-1609421141185-8a4f37a5d063?auto=format&fit=crop&w=900&q=80",
  easterNest:
    "https://images.unsplash.com/photo-1522570778432-5c3580febe04?auto=format&fit=crop&w=900&q=80",
  easterTulips:
    "https://images.unsplash.com/photo-1676701460812-4b2c6caf52a1?auto=format&fit=crop&w=900&q=80",
  springRanunculus:
    "https://images.unsplash.com/photo-1777542847415-5861b43a6e16?auto=format&fit=crop&w=900&q=80",
  officeHighFive:
    "https://images.unsplash.com/photo-1752650735509-58f11eaa2e10?auto=format&fit=crop&w=900&q=80",
  studioWoman:
    "https://images.unsplash.com/photo-1744686909434-fd158fca1c35?auto=format&fit=crop&w=900&q=80",
  airportWindow:
    "https://images.unsplash.com/photo-1769084701646-eb49280dae4e?auto=format&fit=crop&w=900&q=80",
  planeGoldenHour:
    "https://images.unsplash.com/photo-1785961400724-fd33ba5940b3?auto=format&fit=crop&w=900&q=80",
  farewellHug:
    "https://images.unsplash.com/photo-1637297661859-1d77077828ff?auto=format&fit=crop&w=900&q=80",
  annivSunset:
    "https://images.unsplash.com/photo-1648135925922-f53cfce6eb11?auto=format&fit=crop&w=900&q=80",
  annivCouple:
    "https://images.unsplash.com/photo-1702944334266-de048195f995?auto=format&fit=crop&w=900&q=80",
  annivHandsField:
    "https://images.unsplash.com/photo-1636280788355-550a9496655d?auto=format&fit=crop&w=900&q=80",
  engageRingHands:
    "https://images.unsplash.com/photo-1755311903451-d9c9cfe2803b?auto=format&fit=crop&w=900&q=80",
  engageRingPair:
    "https://images.unsplash.com/photo-1598692306282-e19a70fb4545?auto=format&fit=crop&w=900&q=80",
  hensGarden:
    "https://images.unsplash.com/photo-1771435399681-108d5d28708d?auto=format&fit=crop&w=900&q=80",
  hensPicnic:
    "https://images.unsplash.com/photo-1725573839625-0a1ddd342964?auto=format&fit=crop&w=900&q=80",
  hensCake:
    "https://images.unsplash.com/photo-1556713304-7a0dfeadff38?auto=format&fit=crop&w=900&q=80",
  discoNeon:
    "https://images.unsplash.com/photo-1694848162927-433c9d2f8b03?auto=format&fit=crop&w=900&q=80",
  fringeParty:
    "https://images.unsplash.com/photo-1638417568260-32cd7abd212c?auto=format&fit=crop&w=900&q=80",
  sparklerGlass:
    "https://images.unsplash.com/photo-1527275393322-8ddae8bd5de9?auto=format&fit=crop&w=900&q=80",
  colourCrowd:
    "https://images.unsplash.com/photo-1664762903793-f36665a15b55?auto=format&fit=crop&w=900&q=80",
  balloonWoman:
    "https://images.unsplash.com/photo-1645107913326-f491ef40bfda?auto=format&fit=crop&w=900&q=80",
  neonCake:
    "https://images.unsplash.com/photo-1664032655802-ef0a6895619a?auto=format&fit=crop&w=900&q=80",
  parentsField:
    "https://images.unsplash.com/flagged/photo-1567205862288-79cadffeed04?auto=format&fit=crop&w=900&q=80",
  parentsGreen:
    "https://images.unsplash.com/flagged/photo-1567205862314-5c3948eb5831?auto=format&fit=crop&w=900&q=80",
  showerTable:
    "https://images.unsplash.com/photo-1602427671164-c6fadaf10766?auto=format&fit=crop&w=900&q=80",
  teamOutdoors:
    "https://images.unsplash.com/photo-1592591281836-af5e5904c466?auto=format&fit=crop&w=900&q=80",
  teamHands:
    "https://images.unsplash.com/photo-1704386651981-0729a60da579?auto=format&fit=crop&w=900&q=80",
  teamHike:
    "https://images.unsplash.com/photo-1755718670108-18b2ef83dc3a?auto=format&fit=crop&w=900&q=80",
  goldBokeh:
    "https://images.unsplash.com/photo-1514214460829-5f081763862a?auto=format&fit=crop&w=900&q=80",
  eoyCelebration:
    "https://images.unsplash.com/photo-1755863025632-fb029d8c4447?auto=format&fit=crop&w=900&q=80",
  welcomeOfficeChat:
    "https://images.unsplash.com/photo-1653771925801-91e5d0ed1972?auto=format&fit=crop&w=900&q=80",
  welcomeTableOverhead:
    "https://images.unsplash.com/photo-1657394399009-6da68d48cf7a?auto=format&fit=crop&w=900&q=80",
  reunionTableOverhead:
    "https://images.unsplash.com/photo-1681579289875-6c1b0f2129f9?auto=format&fit=crop&w=900&q=80",
  reunionFamilyTable:
    "https://images.unsplash.com/photo-1582299515123-01e678069cb5?auto=format&fit=crop&w=900&q=80",
  reunionLaugh:
    "https://images.unsplash.com/photo-1731475761027-0b6b33b74547?auto=format&fit=crop&w=900&q=80",
  raceRunners:
    "https://images.unsplash.com/photo-1783216509038-ca3d8ef40e4f?auto=format&fit=crop&w=900&q=80",
  raceMedal:
    "https://images.unsplash.com/photo-1776705865382-585208da8045?auto=format&fit=crop&w=900&q=80",
  raceStartLine:
    "https://images.unsplash.com/photo-1578559025843-be9f0eb5617e?auto=format&fit=crop&w=900&q=80",
} as const;

/** Recolourable line-art and full-colour stickers shipped with the editor. */
const ART = {
  sprigThin: "/images/flowers/flower-1.png",
  sprigLeaf: "/images/flowers/flower-2.png",
  branch: "/images/flowers/flower-3.png",
  wildflower: "/images/flowers/flower-4.png",
  eucalyptus: "/images/flowers/flower-5.png",
  bloom: "/images/flowers/flower-6.png",
  bell: "/images/flowers/flower-7.png",
  spray: "/images/flowers/flower-8.png",
  gildedFlourish: "/images/graphics/wedding/editorial/gilded-flourish.png",
  satinBow: "/images/graphics/wedding/editorial/ivory-satin-bow.png",
  botanicalCorner: "/images/graphics/wedding/watercolour/botanical-corner.png",
  romanticBotanical: "/images/graphics/wedding/editorial/romantic-botanical.png",
  heirloomRings: "/images/graphics/wedding/editorial/heirloom-rings.png",
  champagneToast: "/images/graphics/wedding/watercolour/champagne-toast.png",
  oliveSprig: "/images/graphics/wedding/stickers/olive-leaf-sprig.png",
  oliveCeremony: "/images/graphics/wedding/watercolour/olive-tree-ceremony.png",
  intertwinedHands: "/images/graphics/wedding/watercolour/intertwined-hands.png",
  standingCouple: "/images/graphics/wedding/silhouettes/standing-couple-preview.png",
  archCouple: "/images/graphics/wedding/silhouettes/garden-arch-couple-preview.png",
  balloons: "/images/graphics/birthday/stickers/birthday-09.png",
  partyCake: "/images/graphics/birthday/stickers/birthday-11.png",
  confettiCone: "/images/graphics/birthday/stickers/birthday-19.png",
  starBurst: "/images/graphics/birthday/stickers/birthday-12.png",
  letsParty: "/images/graphics/birthday/stickers/birthday-23.png",
  gradGroup: "/images/graphics/graduation/editorial/editorial-graduate-group.png",
  gradAoDaiWoman:
    "/images/graphics/graduation/editorial/vietnamese-ao-dai-graduate-woman.png",
  gradAoDaiMan:
    "/images/graphics/graduation/editorial/vietnamese-ao-dai-graduate-man.png",
  gradFriends:
    "/images/graphics/graduation/editorial/vietnamese-graduation-friend-group.png",
  gradCapToss: "/images/graphics/graduation/editorial/watercolour-cap-toss.png",
  gradJoyful:
    "/images/graphics/graduation/editorial/watercolour-joyful-graduate.png",
  gradFutureCity:
    "/images/graphics/graduation/editorial/paper-cut-future-city.png",
  gradFuturePatch:
    "/images/graphics/graduation/editorial/embroidered-future-patch.png",
  gradProcession:
    "/images/graphics/graduation/editorial/linocut-graduate-procession.png",
  gradDiploma: "/images/graphics/graduation/editorial/leather-diploma-folio.png",
  gradPortrait:
    "/images/graphics/graduation/editorial/gouache-graduate-portrait.png",
  gradMortarboard:
    "/images/graphics/graduation/stickers/confetti-mortarboard.png",
  gradBouquet: "/images/graphics/graduation/stickers/graduation-bouquet.png",
  gradSuitcase:
    "/images/graphics/graduation/stickers/next-chapter-suitcase.png",
  gradStudyStack: "/images/graphics/graduation/stickers/study-stack.png",
  gradCake: "/images/graphics/graduation/stickers/celebration-cake.png",
  gradKeepsake:
    "/images/graphics/graduation/stickers/graduation-keepsake-box.png",
  lockets: "/images/graphics/wedding/stickers/vintage-lockets.png",
  benchCouple: "/images/graphics/wedding/silhouettes/bench-conversation-preview.png",
  firstDance: "/images/graphics/wedding/watercolour/first-dance-couple.png",
  ringBox: "/images/graphics/wedding/watercolour/open-ring-box.png",
  solitaire: "/images/graphics/wedding/stickers/diamond-engagement-ring.png",
  proposalCouple: "/images/graphics/wedding/silhouettes/proposal-couple-preview.png",
  champagneFlutes: "/images/graphics/wedding/stickers/champagne-flutes.png",
  blushBouquet: "/images/graphics/wedding/stickers/blush-rose-bouquet.png",
  roseCorsage: "/images/graphics/wedding/stickers/ribbon-rose-corsage.png",
  blushCake: "/images/graphics/wedding/stickers/blush-floral-cake.png",
  tableSpray: "/images/graphics/wedding/stickers/floral-table-spray.png",
  giftPair: "/images/graphics/wedding/stickers/silver-gift-pair.png",
  doves: "/images/graphics/wedding/stickers/wedding-doves.png",
  fireworksCone: "/images/graphics/birthday/stickers/birthday-20.png",
  happyBirthdayInk: "/images/graphics/birthday/stickers/birthday-21.png",
  balloonTrio: "/images/graphics/birthday/stickers/birthday-22.png",
  giftTeal: "/images/graphics/birthday/stickers/birthday-27.png",
  cupcakeCoral: "/images/graphics/birthday/stickers/birthday-30.png",
  partyElephant: "/images/graphics/birthday/stickers/birthday-25.png",
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
    id: "graduation",
    title: "Graduation",
    description: "Ceremonies, class-of parties, and new chapters",
    tint: "bg-[#e6e9f5]",
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
    description: "Housewarmings, holidays, farewells, and milestones",
    tint: "bg-soft-grey",
  },
];

/* ── Canvas geometry ──────────────────────────────────────────────────────
 * Element x/width are % of card width, y/height are % of card height, so a
 * visually square element needs `height% = width% × cardAspect`.
 * Font sizes are absolute px on a fixed design canvas:
 *   portrait 304×540 · square 540×540 · landscape 760×428.
 * ---------------------------------------------------------------------- */
const PORTRAIT = 9 / 16;
const SQUARE = 1;
const LANDSCAPE = 16 / 9;

/** Height % that renders `width` % as a visual square on this card shape. */
function sq(width: number, aspect: number): number {
  return Math.round(width * aspect * 100) / 100;
}

interface Palette {
  /** Page background */
  bg: string;
  /** Primary type colour */
  ink: string;
  /** Secondary type colour */
  muted: string;
  /** Highlight used for eyebrows, icons, and rules */
  accent: string;
  /** Readable type colour on top of `accent` fills */
  onAccent: string;
  /** Card / panel fill layered over `bg` */
  surface: string;
}

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
  opts?: {
    color?: string;
    frame?: ImageFrame;
    rotation?: number;
    scale?: number;
    offsetX?: number;
    offsetY?: number;
    effects?: ElementStyle["effects"];
  },
): CanvasElement {
  return {
    id,
    type: "image",
    x,
    y,
    width,
    height,
    rotation: opts?.rotation ?? 0,
    locked: false,
    content: src,
    style: style({
      color: opts?.color ?? "#1F2D22",
      frame: opts?.frame ?? "none",
      imageScale: opts?.scale,
      imageOffsetX: opts?.offsetX,
      imageOffsetY: opts?.offsetY,
      effects: opts?.effects,
    }),
  };
}

function shape(
  id: string,
  kind: ShapeKind,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  opts?: {
    rotation?: number;
    borderColor?: string;
    borderWidth?: number;
    effects?: ElementStyle["effects"];
  },
): CanvasElement {
  return {
    id,
    type: "shape",
    x,
    y,
    width,
    height,
    rotation: opts?.rotation ?? 0,
    locked: false,
    content: kind,
    style: style({
      color,
      shapeBorderColor: opts?.borderColor,
      shapeBorderWidth: opts?.borderWidth,
      effects: opts?.effects,
    }),
  };
}

/**
 * Vertical photo scrim. Shape fills drop hex alpha (`normalizeHex` trims to
 * 6 digits), so translucency has to come from a CSS gradient.
 */
function scrim(
  id: string,
  y: number,
  height: number,
  rgb: string,
  opacity = 0.95,
): CanvasElement {
  return shape(
    id,
    "rectangle",
    0,
    y,
    100,
    height,
    `linear-gradient(180deg, rgba(${rgb},0) 0%, rgba(${rgb},${(opacity * 0.45).toFixed(2)}) 26%, rgba(${rgb},${(opacity * 0.85).toFixed(2)}) 55%, rgba(${rgb},${opacity}) 100%)`,
  );
}

/** Soft drop shadow used on floating cards and cut-outs. */
function lift(offset = 8, blur = 14, transparency = 62): ElementStyle["effects"] {
  return { kind: "drop", direction: 90, offset, blur, transparency };
}

function divider(
  id: string,
  x: number,
  y: number,
  width: number,
  color: string,
  variant: "solid" | "thick" | "dashed" | "dotted" | "diamond" | "dots" = "solid",
): CanvasElement {
  return {
    id,
    type: "divider",
    x,
    y,
    width,
    height: variant === "thick" ? 2 : 1.5,
    rotation: 0,
    locked: false,
    content: variant,
    style: style({ color }),
  };
}

function chrome(overrides: Partial<WidgetChromeStyle>): WidgetChromeStyle {
  return {
    background: "transparent",
    borderColor: "#1F2D22",
    borderWidth: 1,
    borderStyle: "solid",
    radius: 999,
    ...overrides,
  };
}

/** Personalised "Dear <guest>" line - the widget resolves each guest's name. */
function guestName(
  id: string,
  x: number,
  y: number,
  width: number,
  styleOverrides?: Partial<ElementStyle>,
): CanvasElement {
  return {
    id,
    type: "widget",
    x,
    y,
    width,
    height: 8,
    rotation: 0,
    locked: false,
    content: "guest_name",
    style: style({ verticalAlign: "middle", ...styleOverrides }),
    widget: { kind: "guest_name" },
  };
}

function mapWidget(
  id: string,
  opts: {
    x: number;
    y: number;
    width: number;
    height: number;
    query: string;
    radius?: number;
    label?: string;
    button: Partial<WidgetChromeStyle>;
  },
): CanvasElement {
  return {
    id,
    type: "widget",
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    rotation: 0,
    locked: false,
    content: "map",
    style: style({ fontFamily: "urbanist", fontSize: 14 }),
    widget: {
      kind: "map",
      mapsQuery: opts.query,
      radius: opts.radius ?? 14,
      showButton: true,
      buttonLabel: opts.label ?? "Open in Google Maps",
      buttonStyle: chrome({ borderStyle: "none", borderWidth: 0, ...opts.button }),
    },
  };
}

function attendWidget(
  id: string,
  opts: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    yes: string;
    no: string;
    labelColor: string;
    button: Partial<WidgetChromeStyle>;
  },
): CanvasElement {
  return {
    id,
    type: "widget",
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    rotation: 0,
    locked: false,
    content: "attend",
    style: style({ fontFamily: "urbanist", fontSize: 14 }),
    widget: {
      kind: "attend",
      label: opts.label,
      yesLabel: opts.yes,
      noLabel: opts.no,
      required: true,
      labelStyle: { color: opts.labelColor },
      buttonStyle: chrome(opts.button),
    },
  };
}

function shortTextWidget(
  id: string,
  opts: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    placeholder: string;
    labelColor: string;
    field: Partial<WidgetChromeStyle>;
  },
): CanvasElement {
  return {
    id,
    type: "widget",
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    rotation: 0,
    locked: false,
    content: "short_text",
    style: style({ fontFamily: "urbanist", fontSize: 14 }),
    widget: {
      kind: "short_text",
      label: opts.label,
      placeholder: opts.placeholder,
      required: false,
      labelStyle: { color: opts.labelColor },
      fieldStyle: chrome(opts.field),
    },
  };
}

function choiceWidget(
  id: string,
  kind: "single_choice" | "multi_choice",
  opts: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    options: { id: string; label: string }[];
    labelColor: string;
    option: Partial<WidgetChromeStyle>;
    required?: boolean;
  },
): CanvasElement {
  return {
    id,
    type: "widget",
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    rotation: 0,
    locked: false,
    content: kind,
    style: style({ fontFamily: "urbanist", fontSize: 14 }),
    widget: {
      kind,
      label: opts.label,
      options: opts.options.map((option) => ({ ...option })),
      required: opts.required ?? false,
      labelStyle: { color: opts.labelColor },
      optionStyle: chrome({ radius: 10, ...opts.option }),
    },
  };
}

/**
 * Icon + label detail line (date, time, dress code…).
 * `size` is the icon width in % of card width; the icon is squared for `aspect`.
 */
function detailRow(
  id: string,
  icon: ShapeKind,
  label: string,
  opts: {
    x: number;
    y: number;
    width: number;
    aspect: number;
    iconColor: string;
    textColor: string;
    size?: number;
    fontSize?: number;
    gap?: number;
    fontFamily?: ElementStyle["fontFamily"];
    letterSpacing?: number;
    fontWeight?: ElementStyle["fontWeight"];
  },
): CanvasElement[] {
  const size = opts.size ?? 4.2;
  const gap = opts.gap ?? 2.4;
  const fontSize = opts.fontSize ?? 11;
  const iconHeight = sq(size, opts.aspect);
  // Nudge the glyph so its optical centre lines up with the cap height.
  const iconY = opts.y + (fontSize * 0.16) / 5.4;
  return [
    shape(`${id}_icon`, icon, opts.x, iconY, size, iconHeight, opts.iconColor),
    text(`${id}_label`, label, opts.x + size + gap, opts.y, opts.width, {
      fontFamily: opts.fontFamily ?? "urbanist",
      fontSize,
      fontWeight: opts.fontWeight ?? "medium",
      color: opts.textColor,
      textAlign: "left",
      letterSpacing: opts.letterSpacing ?? 0,
      lineHeight: 1.35,
    }),
  ];
}

interface PageOptions {
  role?: InvitationPageRole;
  pattern?: InvitationPage["backgroundPattern"];
  texture?: InvitationPage["backgroundTexture"];
  textureOpacity?: number;
  textureTint?: string;
  textureBlend?: InvitationPage["backgroundTextureBlend"];
  border?: InvitationPage["border"];
}

function page(
  name: string,
  role: InvitationPageRole,
  backgroundColor: string,
  elements: CanvasElement[],
  opts?: PageOptions,
): TemplatePage {
  return {
    name,
    kind: "design",
    role,
    backgroundColor,
    backgroundPattern: opts?.pattern ?? "none",
    backgroundTexture: opts?.texture ?? "none",
    backgroundTextureOpacity: opts?.textureOpacity ?? 22,
    backgroundTextureTint: opts?.textureTint ?? "#ffffff",
    backgroundTextureBlend: opts?.textureBlend ?? "soft-light",
    border: opts?.border ?? null,
    elements,
    location: null,
  };
}

/**
 * Plain design page without a declared role - kept for hand-built templates
 * that spread it and set their own background pattern / border.
 */
function design(
  name: string,
  backgroundColor: string,
  elements: CanvasElement[],
): TemplatePage {
  return { name, kind: "design", backgroundColor, elements, location: null };
}

const VELVET_VOWS_PAGES =
  velvetVowsSnapshot.pages as unknown as TemplatePage[];

/* ── Wedding ──────────────────────────────────────────────────────────── */

/** Warm ivory + espresso, photography-led. */
const PHOTO_SUITE: Palette = {
  bg: "#F4EDE6",
  ink: "#241A17",
  muted: "#7C6A60",
  accent: "#A5734C",
  onAccent: "#FFFFFF",
  surface: "#FFFAF5",
};

const weddingPhotoSuite: InvitationTemplate = {
  id: "wedding-photo-suite",
  categoryId: "wedding",
  title: "Photo Cover Suite",
  description:
    "Full-bleed photography, ivory paper, and a bronze-trimmed venue map",
  eventTitle: "Annabelle & Kevin's wedding",
  venue: { name: "The Village Restaurant", address: "New York, NY" },
  rsvpPrompt: {
    prompt: "Will you celebrate with us?",
    note: "Please respond by 20 June 2027",
  },
  pages: [
    page("Cover", "cover", PHOTO_SUITE.ink, [
      image("wps_c_photo", IMG.weddingKiss, 0, 0, 100, 100, {
        frame: "square",
        offsetY: -18,
      }),
      scrim("wps_c_scrim", 38, 62, "26,18,16", 0.97),
      text("wps_c_eyebrow", "TOGETHER WITH THEIR FAMILIES", 8, 67, 84, {
        fontFamily: "urbanist",
        fontSize: 8,
        letterSpacing: 3,
        fontWeight: "bold",
        color: "#C9B5A8",
      }),
      text("wps_c_names", "ANNABELLE\n& KEVIN", 8, 72, 84, {
        fontFamily: "italiana",
        fontSize: 30,
        letterSpacing: 3,
        lineHeight: 1.12,
        color: "#FFFFFF",
      }),
      divider("wps_c_rule", 44, 87, 12, "#C99C6B"),
      text("wps_c_date", "23 AUGUST 2027  ·  NEW YORK", 8, 89.5, 84, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 2.4,
        fontWeight: "medium",
        color: "#D8C7BC",
      }),
    ]),
    page(
      "Invitation",
      "details",
      PHOTO_SUITE.bg,
      [
        image("wps_i_photo", IMG.weddingWalk, 12, 5, 76, 30, {
          frame: "arch",
          effects: lift(6, 16, 68),
        }),
        guestName("wps_i_guest", 10, 37.5, 80, {
          fontFamily: "great-vibes",
          fontSize: 26,
          color: PHOTO_SUITE.accent,
          textAlign: "center",
        }),
        text("wps_i_lead", "you are invited to the wedding of", 10, 45.5, 80, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.2,
          fontWeight: "medium",
          color: PHOTO_SUITE.muted,
        }),
        text("wps_i_names", "Annabelle & Kevin", 8, 49.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 34,
          lineHeight: 1.1,
          color: PHOTO_SUITE.ink,
        }),
        divider("wps_i_rule", 38, 60, 24, "#D9C4B0"),
        ...detailRow("wps_i_date", "icon_calendar", "Monday, 23 August 2027", {
          x: 20,
          y: 64.5,
          width: 62,
          aspect: PORTRAIT,
          iconColor: PHOTO_SUITE.accent,
          textColor: PHOTO_SUITE.ink,
          fontSize: 11,
        }),
        ...detailRow("wps_i_time", "icon_clock", "Three o'clock in the afternoon", {
          x: 20,
          y: 70,
          width: 62,
          aspect: PORTRAIT,
          iconColor: PHOTO_SUITE.accent,
          textColor: PHOTO_SUITE.ink,
          fontSize: 11,
        }),
        ...detailRow("wps_i_place", "icon_location", "The Village Restaurant, NY", {
          x: 20,
          y: 75.5,
          width: 62,
          aspect: PORTRAIT,
          iconColor: PHOTO_SUITE.accent,
          textColor: PHOTO_SUITE.ink,
          fontSize: 11,
        }),
        text("wps_i_note", "reception & dancing to follow", 10, 84, 80, {
          fontFamily: "great-vibes",
          fontSize: 19,
          color: PHOTO_SUITE.accent,
        }),
        image("wps_i_sprig", ART.oliveSprig, 76, 86, 22, 12.5, {
          rotation: 12,
        }),
      ],
      { texture: "cotton", textureOpacity: 30, textureTint: "#F7EFE6", textureBlend: "multiply" },
    ),
    page(
      "Venue",
      "location",
      PHOTO_SUITE.bg,
      [
        text("wps_v_eyebrow", "THE CELEBRATION", 8, 8, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: PHOTO_SUITE.accent,
        }),
        text("wps_v_venue", "The Village\nRestaurant", 8, 12.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 30,
          lineHeight: 1.08,
          color: PHOTO_SUITE.ink,
        }),
        text("wps_v_addr", "132 Main Street · New York, NY 10001", 10, 27, 80, {
          fontFamily: "urbanist",
          fontSize: 10,
          color: PHOTO_SUITE.muted,
        }),
        mapWidget("wps_v_map", {
          x: 8,
          y: 33,
          width: 84,
          height: 46,
          query: "The Village Restaurant New York NY",
          radius: 16,
          label: "Open in Google Maps",
          button: {
            background: PHOTO_SUITE.accent,
            textColor: PHOTO_SUITE.onAccent,
            borderColor: PHOTO_SUITE.accent,
            radius: 999,
          },
        }),
        ...detailRow("wps_v_park", "icon_sparkles", "Valet parking from 2:30 pm", {
          x: 12,
          y: 83,
          width: 70,
          aspect: PORTRAIT,
          iconColor: PHOTO_SUITE.accent,
          textColor: PHOTO_SUITE.muted,
          size: 3.6,
          fontSize: 10,
        }),
        ...detailRow("wps_v_dress", "icon_ribbon", "Black tie optional", {
          x: 12,
          y: 88,
          width: 70,
          aspect: PORTRAIT,
          iconColor: PHOTO_SUITE.accent,
          textColor: PHOTO_SUITE.muted,
          size: 3.6,
          fontSize: 10,
        }),
      ],
      { texture: "cotton", textureOpacity: 30, textureTint: "#F7EFE6", textureBlend: "multiply" },
    ),
    page(
      "RSVP",
      "rsvp",
      PHOTO_SUITE.bg,
      [
        image("wps_r_flourish", ART.botanicalCorner, -6, 1, 44, 25, {
          rotation: 0,
        }),
        text("wps_r_eyebrow", "KINDLY REPLY", 8, 27, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: PHOTO_SUITE.accent,
        }),
        text("wps_r_title", "Will you celebrate\nwith us?", 8, 31.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 29,
          lineHeight: 1.1,
          color: PHOTO_SUITE.ink,
        }),
        text("wps_r_note", "Please respond by 20 June 2027", 10, 45, 80, {
          fontFamily: "urbanist",
          fontSize: 10,
          color: PHOTO_SUITE.muted,
        }),
        attendWidget("wps_r_attend", {
          x: 18,
          y: 50,
          width: 64,
          height: 14,
          label: "",
          yes: "Joyfully accepts",
          no: "Regretfully declines",
          labelColor: PHOTO_SUITE.ink,
          button: {
            background: PHOTO_SUITE.surface,
            textColor: PHOTO_SUITE.ink,
            borderColor: PHOTO_SUITE.accent,
            borderWidth: 1,
            radius: 999,
          },
        }),
        shortTextWidget("wps_r_guests", {
          x: 18,
          y: 66,
          width: 64,
          height: 10,
          label: "Number of guests",
          placeholder: "e.g. 2",
          labelColor: PHOTO_SUITE.ink,
          field: {
            background: PHOTO_SUITE.surface,
            textColor: PHOTO_SUITE.ink,
            borderColor: "#D9C4B0",
            borderWidth: 1,
            radius: 999,
          },
        }),
        shortTextWidget("wps_r_song", {
          x: 18,
          y: 78,
          width: 64,
          height: 10,
          label: "A song to get you dancing",
          placeholder: "Artist - title",
          labelColor: PHOTO_SUITE.ink,
          field: {
            background: PHOTO_SUITE.surface,
            textColor: PHOTO_SUITE.ink,
            borderColor: "#D9C4B0",
            borderWidth: 1,
            radius: 999,
          },
        }),
        image("wps_r_rings", ART.heirloomRings, 73, 85.5, 24, 13.5),
      ],
      { texture: "cotton", textureOpacity: 30, textureTint: "#F7EFE6", textureBlend: "multiply" },
    ),
  ],
};

/** Gallery-white minimalism with a single arch photo. */
const ARCH_MODERN: Palette = {
  bg: "#FFFFFF",
  ink: "#111111",
  muted: "#7A7A7A",
  accent: "#111111",
  onAccent: "#FFFFFF",
  surface: "#F5F2EE",
};

const weddingArchModern: InvitationTemplate = {
  id: "wedding-arch-modern",
  categoryId: "wedding",
  title: "Arch Modern",
  description: "Gallery-white minimalism with an arched portrait and hairlines",
  eventTitle: "Avery & Jordan's wedding",
  venue: {
    name: "Desert Falls Estate",
    address: "924 Desert Falls Drive, San Diego, CA",
  },
  rsvpPrompt: {
    prompt: "Save your seat",
    note: "Kindly reply by 1 August 2027",
  },
  pages: [
    page("Cover", "cover", ARCH_MODERN.bg, [
      shape("wam_c_frame", "rectangle", 6, 3.5, 88, 93, "#FFFFFF", {
        borderColor: "#E4E0DA",
        borderWidth: 1,
      }),
      image("wam_c_photo", IMG.weddingCouple, 17, 9, 66, 52, {
        frame: "arch",
      }),
      text("wam_c_eyebrow", "SAVE THE DATE", 10, 65, 80, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 4,
        fontWeight: "bold",
        color: ARCH_MODERN.muted,
      }),
      text("wam_c_names", "Avery\n& Jordan", 10, 69.5, 80, {
        fontFamily: "bodoni-moda",
        fontSize: 32,
        lineHeight: 1.08,
        color: ARCH_MODERN.ink,
      }),
      divider("wam_c_rule", 42, 87, 16, "#111111"),
      text("wam_c_date", "09  ·  24  ·  2027", 10, 89.5, 80, {
        fontFamily: "urbanist",
        fontSize: 10,
        letterSpacing: 4,
        fontWeight: "medium",
        color: ARCH_MODERN.ink,
      }),
    ]),
    page("Invitation", "details", ARCH_MODERN.bg, [
      text("wam_i_eyebrow", "THE WEDDING OF", 8, 9, 84, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 4,
        fontWeight: "bold",
        color: ARCH_MODERN.muted,
      }),
      text("wam_i_names", "Avery & Jordan", 8, 13.5, 84, {
        fontFamily: "bodoni-moda",
        fontSize: 27,
        lineHeight: 1.1,
        color: ARCH_MODERN.ink,
      }),
      text(
        "wam_i_body",
        "request the pleasure of the company of",
        10,
        22.5,
        80,
        {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 1,
          lineHeight: 1.7,
          color: ARCH_MODERN.muted,
        },
      ),
      guestName("wam_i_guest", 10, 26.5, 80, {
        fontFamily: "bodoni-moda",
        fontSize: 19,
        color: ARCH_MODERN.ink,
        textAlign: "center",
      }),
      text(
        "wam_i_body2",
        "at the celebration of their marriage",
        10,
        33,
        80,
        {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 1,
          color: ARCH_MODERN.muted,
        },
      ),
      divider("wam_i_top", 12, 38.5, 76, "#111111"),
      text("wam_i_day", "SATURDAY", 12, 41, 24, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2,
        fontWeight: "bold",
        color: ARCH_MODERN.muted,
        textAlign: "left",
      }),
      text("wam_i_date", "SEPT 24 2027", 34, 41, 32, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2,
        fontWeight: "bold",
        color: ARCH_MODERN.ink,
      }),
      text("wam_i_time", "4:00 PM", 64, 41, 24, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2,
        fontWeight: "bold",
        color: ARCH_MODERN.muted,
        textAlign: "right",
      }),
      divider("wam_i_bottom", 12, 46, 76, "#111111"),
      image("wam_i_photo", IMG.weddingDetail, 12, 51, 76, 26, {
        frame: "square",
      }),
      text("wam_i_venue", "DESERT FALLS ESTATE", 8, 80, 84, {
        fontFamily: "urbanist",
        fontSize: 11,
        letterSpacing: 3,
        fontWeight: "bold",
        color: ARCH_MODERN.ink,
      }),
      text("wam_i_addr", "924 Desert Falls Drive, San Diego", 8, 84.5, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        color: ARCH_MODERN.muted,
      }),
      text("wam_i_note", "dinner + dancing to follow", 8, 90, 84, {
        fontFamily: "bodoni-moda",
        fontSize: 12,
        italic: true,
        color: ARCH_MODERN.ink,
      }),
    ]),
    page("Venue", "location", ARCH_MODERN.surface, [
      shape("wam_v_card", "rectangle", 0, 0, 100, 30, "#FFFFFF"),
      text("wam_v_eyebrow", "FIND US", 8, 7, 84, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 4,
        fontWeight: "bold",
        color: ARCH_MODERN.muted,
      }),
      text("wam_v_venue", "Desert Falls Estate", 8, 11.5, 84, {
        fontFamily: "bodoni-moda",
        fontSize: 24,
        lineHeight: 1.1,
        color: ARCH_MODERN.ink,
      }),
      text("wam_v_addr", "924 Desert Falls Drive · San Diego, CA", 8, 20.5, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        color: ARCH_MODERN.muted,
      }),
      mapWidget("wam_v_map", {
        x: 8,
        y: 35,
        width: 84,
        height: 44,
        query: "Desert Falls Estate San Diego CA",
        radius: 2,
        label: "Get directions",
        button: {
          background: ARCH_MODERN.ink,
          textColor: "#FFFFFF",
          borderColor: ARCH_MODERN.ink,
          radius: 2,
        },
      }),
      divider("wam_v_rule", 8, 83, 84, "#D7D2CB"),
      ...detailRow("wam_v_arrive", "icon_clock", "Arrive by 3:30 pm", {
        x: 10,
        y: 86,
        width: 40,
        aspect: PORTRAIT,
        iconColor: ARCH_MODERN.ink,
        textColor: ARCH_MODERN.muted,
        size: 3.4,
        fontSize: 9.5,
      }),
      ...detailRow("wam_v_dress", "icon_ribbon", "Cocktail attire", {
        x: 54,
        y: 86,
        width: 40,
        aspect: PORTRAIT,
        iconColor: ARCH_MODERN.ink,
        textColor: ARCH_MODERN.muted,
        size: 3.4,
        fontSize: 9.5,
      }),
    ]),
    page("RSVP", "rsvp", ARCH_MODERN.bg, [
      shape("wam_r_band", "rectangle", 0, 0, 100, 4, ARCH_MODERN.ink),
      text("wam_r_eyebrow", "RSVP", 8, 10, 84, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 5,
        fontWeight: "bold",
        color: ARCH_MODERN.muted,
      }),
      text("wam_r_title", "Save your seat", 8, 14.5, 84, {
        fontFamily: "bodoni-moda",
        fontSize: 27,
        color: ARCH_MODERN.ink,
      }),
      text("wam_r_note", "Kindly reply by 1 August 2027", 8, 24, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        color: ARCH_MODERN.muted,
      }),
      attendWidget("wam_r_attend", {
        x: 12,
        y: 30,
        width: 76,
        height: 14,
        label: "",
        yes: "I'll be there",
        no: "Can't make it",
        labelColor: ARCH_MODERN.ink,
        button: {
          background: "transparent",
          textColor: ARCH_MODERN.ink,
          borderColor: ARCH_MODERN.ink,
          borderWidth: 1,
          radius: 2,
        },
      }),
      choiceWidget("wam_r_meal", "single_choice", {
        x: 12,
        y: 47,
        width: 76,
        height: 24,
        label: "Dinner preference",
        options: [
          { id: "beef", label: "Slow-roasted beef" },
          { id: "fish", label: "Market fish" },
          { id: "garden", label: "Garden plate" },
        ],
        labelColor: ARCH_MODERN.ink,
        option: {
          background: ARCH_MODERN.surface,
          textColor: ARCH_MODERN.ink,
          borderColor: "#DAD5CE",
          borderWidth: 1,
          radius: 2,
        },
      }),
      shortTextWidget("wam_r_song", {
        x: 12,
        y: 74,
        width: 76,
        height: 10,
        label: "Any song we must play?",
        placeholder: "Optional",
        labelColor: ARCH_MODERN.ink,
        field: {
          background: ARCH_MODERN.surface,
          textColor: ARCH_MODERN.ink,
          borderColor: "#DAD5CE",
          borderWidth: 1,
          radius: 2,
        },
      }),
      shape("wam_r_band2", "rectangle", 0, 96, 100, 4, ARCH_MODERN.ink),
    ]),
  ],
};

/** Sun-warmed cream, terracotta line florals, engraved caps. */
const WINERY: Palette = {
  bg: "#FBF6EC",
  ink: "#3C2E22",
  muted: "#8A7358",
  accent: "#9C5F3C",
  onAccent: "#FFF8EF",
  surface: "#FFFDF8",
};

const weddingWineryClassic: InvitationTemplate = {
  id: "wedding-winery-classic",
  categoryId: "wedding",
  title: "Winery Classic",
  description:
    "Pressed-paper cream with terracotta florals and engraved lettering",
  eventTitle: "Samantha & Fredrick's wedding",
  venue: {
    name: "Coombe Yarra Valley",
    address: "673-675 Maroondah Hwy, Coldstream VIC 3770",
  },
  rsvpPrompt: {
    prompt: "Join us at the winery?",
    note: "Répondez s'il vous plaît by 15 December",
  },
  pages: [
    page(
      "Cover",
      "cover",
      WINERY.bg,
      [
        image("wwc_c_f1", ART.spray, 55, 1, 48, 21, {
          color: "#B08055",
        }),
        image("wwc_c_f2", ART.branch, -8, 4, 42, 19, {
          color: "#8E8B62",
          rotation: 8,
        }),
        text("wwc_c_eyebrow", "TOGETHER WITH THEIR FAMILIES", 8, 30, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 3,
          fontWeight: "bold",
          color: WINERY.muted,
        }),
        text("wwc_c_names", "Samantha\n& Fredrick", 6, 35, 88, {
          fontFamily: "great-vibes",
          fontSize: 44,
          lineHeight: 1.12,
          color: WINERY.ink,
        }),
        shape("wwc_c_rings", "icon_rings", 45.5, 55.5, 9, 5.1, WINERY.accent),
        text("wwc_c_ask", "invite you to celebrate their marriage", 10, 62, 80, {
          fontFamily: "forum",
          fontSize: 13,
          letterSpacing: 0.4,
          color: WINERY.muted,
        }),
        divider("wwc_c_rule", 36, 69, 28, "#C9A87F"),
        text("wwc_c_date", "TWENTY-EIGHTH OF MARCH", 8, 72.5, 84, {
          fontFamily: "cinzel-decorative",
          fontSize: 12,
          letterSpacing: 1.4,
          fontWeight: "bold",
          color: WINERY.ink,
        }),
        text("wwc_c_year", "TWO THOUSAND & TWENTY-SEVEN", 8, 77.5, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 2.6,
          fontWeight: "medium",
          color: WINERY.muted,
        }),
        image("wwc_c_f3", ART.branch, 28, 80, 44, 18, {
          color: "#8E8B62",
        }),
      ],
      {
        texture: "pressed",
        textureOpacity: 52,
        textureTint: "#F0DFC5",
        textureBlend: "multiply",
        border: { style: "solid", color: "#DCC7A4", width: 6 },
      },
    ),
    page(
      "Invitation",
      "details",
      WINERY.bg,
      [
        guestName("wwc_i_guest", 10, 8, 80, {
          fontFamily: "great-vibes",
          fontSize: 26,
          color: WINERY.accent,
          textAlign: "center",
        }),
        text("wwc_i_lead", "we would be honoured by your company", 8, 15, 84, {
          fontFamily: "forum",
          fontSize: 11.5,
          color: WINERY.muted,
        }),
        divider("wwc_i_rule1", 40, 21, 20, "#C9A87F", "diamond"),
        text("wwc_i_venue", "COOMBE YARRA VALLEY", 8, 25, 84, {
          fontFamily: "cinzel-decorative",
          fontSize: 17,
          letterSpacing: 1.6,
          fontWeight: "bold",
          color: WINERY.ink,
        }),
        text("wwc_i_addr", "673 Maroondah Hwy, Coldstream VIC", 8, 31, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: WINERY.muted,
        }),
        shape("wwc_i_card", "rounded_square", 12, 38, 76, 26, WINERY.surface, {
          borderColor: "#E3D2B6",
          borderWidth: 1,
        }),
        ...detailRow("wwc_i_date", "icon_calendar", "Sunday, 28 March 2027", {
          x: 19,
          y: 42.5,
          width: 62,
          aspect: PORTRAIT,
          iconColor: WINERY.accent,
          textColor: WINERY.ink,
          size: 3.8,
          fontSize: 10.5,
          fontFamily: "urbanist",
        }),
        ...detailRow("wwc_i_time", "icon_clock", "Ceremony at four o'clock", {
          x: 19,
          y: 48.5,
          width: 62,
          aspect: PORTRAIT,
          iconColor: WINERY.accent,
          textColor: WINERY.ink,
          size: 3.8,
          fontSize: 10.5,
        }),
        ...detailRow("wwc_i_wine", "icon_wine", "Dinner & dancing until late", {
          x: 19,
          y: 54.5,
          width: 62,
          aspect: PORTRAIT,
          iconColor: WINERY.accent,
          textColor: WINERY.ink,
          size: 3.8,
          fontSize: 10.5,
        }),
        image("wwc_i_photo", IMG.vineyard, 12, 67, 76, 21, {
          frame: "rounded",
        }),
        text("wwc_i_note", "Reception to follow at the estate", 8, 89.5, 84, {
          fontFamily: "great-vibes",
          fontSize: 19,
          color: WINERY.accent,
        }),
      ],
      {
        texture: "pressed",
        textureOpacity: 52,
        textureTint: "#F0DFC5",
        textureBlend: "multiply",
      },
    ),
    page(
      "Venue",
      "location",
      WINERY.bg,
      [
        image("wwc_v_sprig", ART.sprigThin, 68, 2, 34, 15, {
          color: "#8E8B62",
        }),
        text("wwc_v_eyebrow", "THE VINEYARD", 8, 10, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: WINERY.accent,
        }),
        text("wwc_v_venue", "Coombe Yarra Valley", 6, 14.5, 88, {
          fontFamily: "great-vibes",
          fontSize: 30,
          lineHeight: 1.1,
          color: WINERY.ink,
        }),
        text("wwc_v_addr", "673-675 Maroondah Hwy · Coldstream VIC", 8, 24.5, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: WINERY.muted,
        }),
        mapWidget("wwc_v_map", {
          x: 9,
          y: 30,
          width: 82,
          height: 45,
          query: "Coombe Yarra Valley Coldstream Victoria",
          radius: 14,
          label: "Open in Google Maps",
          button: {
            background: WINERY.accent,
            textColor: WINERY.onAccent,
            borderColor: WINERY.accent,
            radius: 999,
          },
        }),
        divider("wwc_v_rule", 32, 81, 36, "#C9A87F", "diamond"),
        text(
          "wwc_v_note",
          "Cellar door parking on site · shuttles from\nMelbourne depart at 2:30 pm",
          10,
          85,
          80,
          {
            fontFamily: "forum",
            fontSize: 10.5,
            lineHeight: 1.6,
            color: WINERY.muted,
          },
        ),
      ],
      {
        texture: "pressed",
        textureOpacity: 52,
        textureTint: "#F0DFC5",
        textureBlend: "multiply",
      },
    ),
    page(
      "RSVP",
      "rsvp",
      WINERY.bg,
      [
        image("wwc_r_f", ART.bloom, -6, 0, 40, 18, { color: "#B08055" }),
        text("wwc_r_eyebrow", "RÉPONDEZ S'IL VOUS PLAÎT", 8, 20, 84, {
          fontFamily: "urbanist",
          fontSize: 8,
          letterSpacing: 2.8,
          fontWeight: "bold",
          color: WINERY.accent,
        }),
        text("wwc_r_title", "Join us at\nthe winery?", 8, 24.5, 84, {
          fontFamily: "great-vibes",
          fontSize: 38,
          lineHeight: 1.05,
          color: WINERY.ink,
        }),
        text("wwc_r_note", "Kindly reply by 15 December", 8, 41, 84, {
          fontFamily: "forum",
          fontSize: 11,
          color: WINERY.muted,
        }),
        attendWidget("wwc_r_attend", {
          x: 16,
          y: 46,
          width: 68,
          height: 14,
          label: "",
          yes: "Yes, with pleasure",
          no: "Sadly, no",
          labelColor: WINERY.ink,
          button: {
            background: WINERY.accent,
            textColor: WINERY.onAccent,
            borderColor: WINERY.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("wwc_r_pour", "single_choice", {
          x: 16,
          y: 62,
          width: 68,
          height: 29,
          label: "Preferred pour at dinner",
          options: [
            { id: "red", label: "Shiraz" },
            { id: "white", label: "Chardonnay" },
            { id: "sparkling", label: "Sparkling" },
            { id: "none", label: "No wine, thank you" },
          ],
          labelColor: WINERY.ink,
          option: {
            background: WINERY.surface,
            textColor: WINERY.ink,
            borderColor: "#E3D2B6",
            borderWidth: 1,
            radius: 999,
          },
        }),
      ],
      {
        texture: "pressed",
        textureOpacity: 52,
        textureTint: "#F0DFC5",
        textureBlend: "multiply",
      },
    ),
  ],
};

/** Sand, driftwood and a single hot-pink accent - landscape editorial. */
const COASTAL: Palette = {
  bg: "#F3EAE0",
  ink: "#2E231D",
  muted: "#7E6A5D",
  accent: "#C2614F",
  onAccent: "#FFF6EF",
  surface: "#FFFAF4",
};

const weddingCoastalEditorial: InvitationTemplate = {
  id: "wedding-coastal-editorial-landscape",
  categoryId: "wedding",
  title: "Coastal Editorial",
  description:
    "Wide photo panels, sand-toned paper, and a terracotta accent line",
  eventTitle: "Maya & Theo's wedding",
  shape: "landscape",
  venue: { name: "The Dunes House", address: "3755 Point Nepean Rd, Portsea VIC" },
  rsvpPrompt: {
    prompt: "Will you be there?",
    note: "Please reply by 18 August 2027",
  },
  pages: [
    page(
      "Cover",
      "cover",
      COASTAL.bg,
      [
        shape("wce_c_panel", "rectangle", 0, 0, 47, 100, COASTAL.surface),
        text("wce_c_eyebrow", "TOGETHER BY THE SEA", 6, 16, 34, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.2,
          fontWeight: "bold",
          color: COASTAL.accent,
          textAlign: "left",
        }),
        text("wce_c_names", "Maya\n& Theo", 6, 26, 38, {
          fontFamily: "bodoni-moda",
          fontSize: 44,
          lineHeight: 1.02,
          color: COASTAL.ink,
          textAlign: "left",
        }),
        divider("wce_c_rule", 6, 68, 14, COASTAL.accent),
        text("wce_c_date", "18 · 10 · 2027", 6, 73, 34, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 3,
          fontWeight: "bold",
          color: COASTAL.ink,
          textAlign: "left",
        }),
        text("wce_c_place", "PORTSEA · VICTORIA", 6, 81, 34, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 2.4,
          fontWeight: "medium",
          color: COASTAL.muted,
          textAlign: "left",
        }),
        image("wce_c_photo", IMG.weddingWalk, 47, 0, 53, 100, {
          frame: "square",
        }),
        shape("wce_c_seal", "circle", 41, 42, 12, 21.3, COASTAL.accent),
        shape("wce_c_rings", "icon_rings", 43.6, 47, 6.8, 12.1, COASTAL.onAccent),
      ],
      { texture: "cotton", textureOpacity: 26, textureTint: "#F6EADC", textureBlend: "multiply" },
    ),
    page(
      "The celebration",
      "details",
      COASTAL.surface,
      [
        image("wce_d_photo", IMG.weddingDetail, 0, 0, 38, 100, {
          frame: "square",
        }),
        text("wce_d_eyebrow", "THE CELEBRATION", 44, 12, 32, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.2,
          fontWeight: "bold",
          color: COASTAL.accent,
          textAlign: "left",
        }),
        text("wce_d_title", "A ceremony\nat golden hour", 44, 21, 52, {
          fontFamily: "bodoni-moda",
          fontSize: 28,
          lineHeight: 1.14,
          color: COASTAL.ink,
          textAlign: "left",
        }),
        divider("wce_d_rule", 44, 46, 12, "#DCC6B4"),
        ...detailRow("wce_d_date", "icon_calendar", "Monday 18 October 2027", {
          x: 44,
          y: 52,
          width: 44,
          aspect: LANDSCAPE,
          iconColor: COASTAL.accent,
          textColor: COASTAL.ink,
          size: 2.4,
          gap: 1.4,
          fontSize: 11,
        }),
        ...detailRow("wce_d_time", "icon_clock", "Vows at 4:30 pm, dinner at 6", {
          x: 44,
          y: 63,
          width: 44,
          aspect: LANDSCAPE,
          iconColor: COASTAL.accent,
          textColor: COASTAL.ink,
          size: 2.4,
          gap: 1.4,
          fontSize: 11,
        }),
        ...detailRow("wce_d_place", "icon_location", "The Dunes House, Portsea", {
          x: 44,
          y: 74,
          width: 44,
          aspect: LANDSCAPE,
          iconColor: COASTAL.accent,
          textColor: COASTAL.ink,
          size: 2.4,
          gap: 1.4,
          fontSize: 11,
        }),
        text("wce_d_note", "reception & dancing to follow", 44, 86, 44, {
          fontFamily: "great-vibes",
          fontSize: 22,
          color: COASTAL.accent,
          textAlign: "left",
        }),
        image("wce_d_corner", ART.botanicalCorner, 80, 52, 22, 55, {
          rotation: 180,
        }),
      ],
      { texture: "cotton", textureOpacity: 26, textureTint: "#F6EADC", textureBlend: "multiply" },
    ),
    page(
      "Venue",
      "location",
      COASTAL.bg,
      [
        text("wce_v_eyebrow", "FIND YOUR WAY", 5, 13, 34, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.2,
          fontWeight: "bold",
          color: COASTAL.accent,
          textAlign: "left",
        }),
        text("wce_v_venue", "The Dunes\nHouse", 5, 21, 40, {
          fontFamily: "bodoni-moda",
          fontSize: 30,
          lineHeight: 1.08,
          color: COASTAL.ink,
          textAlign: "left",
        }),
        text("wce_v_addr", "3755 Point Nepean Road\nPortsea, Victoria 3944", 5, 44, 38, {
          fontFamily: "urbanist",
          fontSize: 10.5,
          lineHeight: 1.6,
          color: COASTAL.muted,
          textAlign: "left",
        }),
        divider("wce_v_rule", 5, 74, 12, COASTAL.accent),
        text("wce_v_note", "Ceremony on the lawn · flat shoes welcome", 5, 79, 40, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 0.6,
          color: COASTAL.muted,
          textAlign: "left",
        }),
        mapWidget("wce_v_map", {
          x: 49,
          y: 9,
          width: 46,
          height: 82,
          query: "Portsea Victoria Australia",
          radius: 14,
          label: "Open in Google Maps",
          button: {
            background: COASTAL.accent,
            textColor: COASTAL.onAccent,
            borderColor: COASTAL.accent,
            radius: 999,
          },
        }),
      ],
      { texture: "cotton", textureOpacity: 26, textureTint: "#F6EADC", textureBlend: "multiply" },
    ),
    page(
      "RSVP",
      "rsvp",
      COASTAL.surface,
      [
        image("wce_r_corner", ART.botanicalCorner, -4, 58, 24, 60, {}),
        text("wce_r_eyebrow", "MEET US BY THE SEA", 5, 14, 34, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.2,
          fontWeight: "bold",
          color: COASTAL.accent,
          textAlign: "left",
        }),
        text("wce_r_title", "Will you\nbe there?", 5, 23, 34, {
          fontFamily: "bodoni-moda",
          fontSize: 32,
          lineHeight: 1.08,
          color: COASTAL.ink,
          textAlign: "left",
        }),
        guestName("wce_r_guest", 5, 46, 32, {
          fontFamily: "great-vibes",
          fontSize: 24,
          color: COASTAL.accent,
          textAlign: "left",
        }),
        text("wce_r_note", "Please reply by 18 August 2027", 5, 56, 34, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: COASTAL.muted,
          textAlign: "left",
        }),
        attendWidget("wce_r_attend", {
          x: 42,
          y: 18,
          width: 25,
          height: 22,
          label: "Your reply",
          yes: "Meet you by the sea",
          no: "Sending our love",
          labelColor: COASTAL.ink,
          button: {
            background: COASTAL.accent,
            textColor: COASTAL.onAccent,
            borderColor: COASTAL.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("wce_r_meal", "single_choice", {
          x: 71,
          y: 18,
          width: 25,
          height: 30,
          label: "Dinner preference",
          options: [
            { id: "fish", label: "Market fish" },
            { id: "beef", label: "Slow-roasted beef" },
            { id: "garden", label: "Garden menu" },
          ],
          labelColor: COASTAL.ink,
          option: {
            background: COASTAL.bg,
            textColor: COASTAL.ink,
            borderColor: "#DCC6B4",
            borderWidth: 1,
            radius: 999,
          },
          required: true,
        }),
        shortTextWidget("wce_r_stay", {
          x: 42,
          y: 56,
          width: 54,
          height: 13,
          label: "Where are you staying? We'll help with transfers.",
          placeholder: "Hotel or suburb",
          labelColor: COASTAL.ink,
          field: {
            background: COASTAL.bg,
            textColor: COASTAL.ink,
            borderColor: "#DCC6B4",
            borderWidth: 1,
            radius: 999,
          },
        }),
      ],
      { texture: "cotton", textureOpacity: 26, textureTint: "#F6EADC", textureBlend: "multiply" },
    ),
  ],
};

/* ── Birthday ─────────────────────────────────────────────────────────── */

/** Ink black, champagne gold and a gilded flourish. */
const MILESTONE: Palette = {
  bg: "#12100E",
  ink: "#FFFFFF",
  muted: "#B5AC9B",
  accent: "#C9A227",
  onAccent: "#12100E",
  surface: "#1E1A16",
};

const birthdayMilestoneSeventy: InvitationTemplate = {
  id: "birthday-milestone-70",
  categoryId: "birthday",
  title: "Milestone Seventy",
  description: "Ink black and champagne gold for a landmark birthday",
  eventTitle: "Tiffany's 70th birthday",
  venue: { name: "Harbour House", address: "88 Beaconsfield Pde, Albert Park VIC" },
  rsvpPrompt: {
    prompt: "Can you celebrate Tiffany?",
    note: "RSVP to James by 28 February",
  },
  pages: [
    page("Cover", "cover", MILESTONE.bg, [
      shape("bm7_c_frame", "rectangle", 5, 3, 90, 94, "#12100E", {
        borderColor: MILESTONE.accent,
        borderWidth: 1,
      }),
      image("bm7_c_flourish", ART.gildedFlourish, 35, 6, 30, 17),
      image("bm7_c_flourish2", ART.gildedFlourish, 35, 77, 30, 17, {
        rotation: 180,
      }),
      text("bm7_c_eyebrow", "PLEASE JOIN US TO CELEBRATE", 10, 26, 80, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 3,
        fontWeight: "bold",
        color: MILESTONE.accent,
      }),
      text("bm7_c_number", "70", 10, 31, 80, {
        fontFamily: "bodoni-moda",
        fontSize: 88,
        lineHeight: 1,
        color: MILESTONE.accent,
      }),
      divider("bm7_c_rule", 38, 60.5, 24, MILESTONE.accent),
      text("bm7_c_name", "Tiffany", 10, 48, 80, {
        fontFamily: "great-vibes",
        fontSize: 42,
        color: MILESTONE.ink,
      }),
      text("bm7_c_when", "SATURDAY 14 MARCH  ·  3:00 PM", 8, 64, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2.6,
        fontWeight: "medium",
        color: "#D8CFC0",
      }),
      text("bm7_c_where", "HARBOUR HOUSE  ·  ALBERT PARK", 8, 68.5, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2.6,
        fontWeight: "medium",
        color: "#8E8574",
      }),
    ]),
    page("Invitation", "details", MILESTONE.surface, [
      image("bm7_i_photo", IMG.portraitWoman, 0, 0, 100, 42, {
        frame: "square",
      }),
      scrim("bm7_i_scrim", 24, 18, "30,26,22", 1),
      guestName("bm7_i_guest", 8, 45, 84, {
        fontFamily: "great-vibes",
        fontSize: 26,
        color: MILESTONE.accent,
      }),
      text("bm7_i_lead", "seventy years, and every one worth toasting", 6, 52, 88, {
        fontFamily: "bodoni-moda",
        fontSize: 12,
        italic: true,
        lineHeight: 1.5,
        color: "#D8CFC0",
      }),
      divider("bm7_i_rule", 40, 60, 20, MILESTONE.accent),
      ...detailRow("bm7_i_date", "icon_calendar", "Saturday, 14 March", {
        x: 22,
        y: 65,
        width: 60,
        aspect: PORTRAIT,
        iconColor: MILESTONE.accent,
        textColor: MILESTONE.ink,
        size: 3.8,
        fontSize: 11,
      }),
      ...detailRow("bm7_i_time", "icon_clock", "Three in the afternoon", {
        x: 22,
        y: 71,
        width: 60,
        aspect: PORTRAIT,
        iconColor: MILESTONE.accent,
        textColor: MILESTONE.ink,
        size: 3.8,
        fontSize: 11,
      }),
      ...detailRow("bm7_i_cake", "icon_cake", "Afternoon tea & speeches", {
        x: 22,
        y: 77,
        width: 60,
        aspect: PORTRAIT,
        iconColor: MILESTONE.accent,
        textColor: MILESTONE.ink,
        size: 3.8,
        fontSize: 11,
      }),
      ...detailRow("bm7_i_dress", "icon_ribbon", "Cocktail attire", {
        x: 22,
        y: 83,
        width: 60,
        aspect: PORTRAIT,
        iconColor: MILESTONE.accent,
        textColor: MILESTONE.ink,
        size: 3.8,
        fontSize: 11,
      }),
      text("bm7_i_note", "No gifts - your company is the present", 8, 91, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 1.4,
        color: "#8E8574",
      }),
    ]),
    page("Venue", "location", MILESTONE.bg, [
      text("bm7_v_eyebrow", "THE VENUE", 8, 8, 84, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: MILESTONE.accent,
      }),
      text("bm7_v_venue", "Harbour House", 8, 12.5, 84, {
        fontFamily: "bodoni-moda",
        fontSize: 27,
        color: MILESTONE.ink,
      }),
      text("bm7_v_addr", "88 Beaconsfield Parade · Albert Park VIC", 8, 21.5, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        color: "#8E8574",
      }),
      mapWidget("bm7_v_map", {
        x: 8,
        y: 28,
        width: 84,
        height: 46,
        query: "Beaconsfield Parade Albert Park Victoria",
        radius: 4,
        label: "Open in Google Maps",
        button: {
          background: MILESTONE.accent,
          textColor: MILESTONE.onAccent,
          borderColor: MILESTONE.accent,
          radius: 4,
        },
      }),
      divider("bm7_v_rule", 8, 78, 84, "#3A342B"),
      ...detailRow("bm7_v_park", "icon_location", "Parking beneath the building", {
        x: 10,
        y: 81.5,
        width: 74,
        aspect: PORTRAIT,
        iconColor: MILESTONE.accent,
        textColor: "#B5AC9B",
        size: 3.4,
        fontSize: 9.5,
      }),
      ...detailRow("bm7_v_tram", "icon_sparkles", "Trams 12 and 96 stop at the door", {
        x: 10,
        y: 87,
        width: 74,
        aspect: PORTRAIT,
        iconColor: MILESTONE.accent,
        textColor: "#B5AC9B",
        size: 3.4,
        fontSize: 9.5,
      }),
    ]),
    page("RSVP", "rsvp", MILESTONE.bg, [
      image("bm7_r_flourish", ART.gildedFlourish, 30, 3, 40, 22, {
        rotation: 0,
      }),
      text("bm7_r_eyebrow", "KINDLY REPLY", 8, 27, 84, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: MILESTONE.accent,
      }),
      text("bm7_r_title", "Can you celebrate\nTiffany?", 8, 31.5, 84, {
        fontFamily: "bodoni-moda",
        fontSize: 24,
        lineHeight: 1.2,
        color: MILESTONE.ink,
      }),
      text("bm7_r_note", "RSVP to James by 28 February", 8, 44, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        color: "#8E8574",
      }),
      attendWidget("bm7_r_attend", {
        x: 16,
        y: 49,
        width: 68,
        height: 14,
        label: "",
        yes: "Wouldn't miss it",
        no: "Unable to attend",
        labelColor: MILESTONE.ink,
        button: {
          background: MILESTONE.accent,
          textColor: MILESTONE.onAccent,
          borderColor: MILESTONE.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 4,
        },
      }),
      shortTextWidget("bm7_r_memory", {
        x: 16,
        y: 65,
        width: 68,
        height: 12,
        label: "Share a favourite memory of Tiffany",
        placeholder: "A line for the guest book…",
        labelColor: MILESTONE.ink,
        field: {
          background: MILESTONE.surface,
          textColor: MILESTONE.ink,
          borderColor: "#3A342B",
          borderWidth: 1,
          radius: 4,
        },
      }),
      shortTextWidget("bm7_r_guests", {
        x: 16,
        y: 79,
        width: 68,
        height: 12,
        label: "Who's coming with you?",
        placeholder: "Names of your party",
        labelColor: MILESTONE.ink,
        field: {
          background: MILESTONE.surface,
          textColor: MILESTONE.ink,
          borderColor: "#3A342B",
          borderWidth: 1,
          radius: 4,
        },
      }),
    ]),
  ],
};

/** Bone paper, charcoal and acid gold - loud, modern, twenty-something. */
const BIG_ONE: Palette = {
  bg: "#EFEBE4",
  ink: "#1B1B1B",
  muted: "#6E6A63",
  accent: "#C9A227",
  onAccent: "#1B1B1B",
  surface: "#1B1B1B",
};

const birthdayBigOne: InvitationTemplate = {
  id: "birthday-big-one-20",
  categoryId: "birthday",
  title: "The Big One",
  description: "Oversized numerals, arch portrait, and acid-gold energy",
  eventTitle: "Seb's 20th birthday",
  venue: { name: "Dusty's Cellar", address: "29 Grand River Ave" },
  rsvpPrompt: {
    prompt: "You in for the big one?",
    note: "Reply to Shelia by 1 September",
  },
  pages: [
    page(
      "Cover",
      "cover",
      BIG_ONE.bg,
      [
        shape("bb2_c_disc", "circle", -16, 44, 56, 31.5, BIG_ONE.accent),
        image("bb2_c_photo", IMG.portraitMan, 44, 6, 52, 60, {
          frame: "arch",
        }),
        text("bb2_c_eyebrow", "IT'S A BIG ONE", 7, 9, 40, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 2.6,
          fontWeight: "bold",
          color: BIG_ONE.muted,
          textAlign: "left",
        }),
        text("bb2_c_name", "Seb is…", 7, 15, 40, {
          fontFamily: "instrument-serif",
          fontSize: 30,
          color: BIG_ONE.ink,
          textAlign: "left",
        }),
        text("bb2_c_age", "20", -8, 48, 40, {
          fontFamily: "urbanist",
          fontSize: 82,
          fontWeight: "bold",
          lineHeight: 1,
          color: BIG_ONE.ink,
          textAlign: "center",
        }),
        divider("bb2_c_rule", 42, 71, 52, BIG_ONE.ink),
        text("bb2_c_when", "SAT 14 SEPT  ·  5 PM", 42, 74.5, 54, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 1.6,
          fontWeight: "bold",
          color: BIG_ONE.ink,
          textAlign: "left",
        }),
        text("bb2_c_where", "DUSTY'S CELLAR", 42, 80, 54, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 1.6,
          fontWeight: "medium",
          color: BIG_ONE.muted,
          textAlign: "left",
        }),
        text("bb2_c_addr", "29 GRAND RIVER AVE", 42, 84.5, 54, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 1.6,
          fontWeight: "medium",
          color: BIG_ONE.muted,
          textAlign: "left",
        }),
        image("bb2_c_confetti", ART.starBurst, 6, 78, 24, 13.5),
      ],
      { pattern: "dots" },
    ),
    page("Invitation", "details", BIG_ONE.surface, [
      text("bb2_i_eyebrow", "JOIN US TO CELEBRATE", 8, 9, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: BIG_ONE.accent,
      }),
      guestName("bb2_i_guest", 8, 13.5, 84, {
        fontFamily: "instrument-serif",
        fontSize: 28,
        color: "#FFFFFF",
      }),
      text("bb2_i_body", "you're on the list", 8, 21.5, 84, {
        fontFamily: "urbanist",
        fontSize: 10.5,
        letterSpacing: 1.4,
        color: "#A9A49A",
      }),
      shape("bb2_i_card", "rounded_square", 10, 28, 80, 30, "#262626"),
      ...detailRow("bb2_i_date", "icon_calendar", "Saturday 14 September", {
        x: 17,
        y: 32.5,
        width: 66,
        aspect: PORTRAIT,
        iconColor: BIG_ONE.accent,
        textColor: "#FFFFFF",
        size: 3.8,
        fontSize: 11,
      }),
      ...detailRow("bb2_i_time", "icon_clock", "5 pm until very late", {
        x: 17,
        y: 39,
        width: 66,
        aspect: PORTRAIT,
        iconColor: BIG_ONE.accent,
        textColor: "#FFFFFF",
        size: 3.8,
        fontSize: 11,
      }),
      ...detailRow("bb2_i_place", "icon_location", "Dusty's Cellar, 29 Grand River", {
        x: 17,
        y: 45.5,
        width: 66,
        aspect: PORTRAIT,
        iconColor: BIG_ONE.accent,
        textColor: "#FFFFFF",
        size: 3.8,
        fontSize: 11,
      }),
      ...detailRow("bb2_i_music", "icon_music", "DJ from 9 · dress to move", {
        x: 17,
        y: 52,
        width: 66,
        aspect: PORTRAIT,
        iconColor: BIG_ONE.accent,
        textColor: "#FFFFFF",
        size: 3.8,
        fontSize: 11,
      }),
      image("bb2_i_photo", IMG.birthdayParty, 10, 63, 80, 26, {
        frame: "rounded",
      }),
      text("bb2_i_note", "bring nothing but your dancing shoes", 8, 92, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 1.2,
        color: "#A9A49A",
      }),
    ]),
    page(
      "Venue",
      "location",
      BIG_ONE.bg,
      [
        shape("bb2_v_band", "rectangle", 0, 0, 100, 22, BIG_ONE.accent),
        text("bb2_v_eyebrow", "HERE'S WHERE", 8, 6, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: BIG_ONE.onAccent,
        }),
        text("bb2_v_venue", "Dusty's Cellar", 8, 10.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 28,
          color: BIG_ONE.onAccent,
        }),
        text("bb2_v_addr", "29 Grand River Avenue", 8, 25, 84, {
          fontFamily: "urbanist",
          fontSize: 10,
          fontWeight: "medium",
          color: BIG_ONE.muted,
        }),
        mapWidget("bb2_v_map", {
          x: 8,
          y: 31,
          width: 84,
          height: 46,
          query: "Grand River Avenue Detroit",
          radius: 18,
          label: "Get me there",
          button: {
            background: BIG_ONE.ink,
            textColor: "#FFFFFF",
            borderColor: BIG_ONE.ink,
            radius: 999,
          },
        }),
        ...detailRow("bb2_v_door", "icon_clock", "Doors 5 pm - don't be late", {
          x: 12,
          y: 82,
          width: 70,
          aspect: PORTRAIT,
          iconColor: BIG_ONE.ink,
          textColor: BIG_ONE.muted,
          size: 3.4,
          fontSize: 9.5,
        }),
        ...detailRow("bb2_v_ride", "icon_sparkles", "Rideshare drop-off on Grand River", {
          x: 12,
          y: 87.5,
          width: 70,
          aspect: PORTRAIT,
          iconColor: BIG_ONE.ink,
          textColor: BIG_ONE.muted,
          size: 3.4,
          fontSize: 9.5,
        }),
      ],
      { pattern: "dots" },
    ),
    page("RSVP", "rsvp", BIG_ONE.surface, [
      text("bb2_r_eyebrow", "REPLY", 8, 10, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 5,
        fontWeight: "bold",
        color: BIG_ONE.accent,
      }),
      text("bb2_r_title", "You in for\nthe big one?", 8, 15, 84, {
        fontFamily: "urbanist",
        fontSize: 30,
        fontWeight: "bold",
        lineHeight: 1.12,
        color: "#FFFFFF",
      }),
      text("bb2_r_note", "Reply to Shelia by 1 September", 8, 31, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        color: "#A9A49A",
      }),
      attendWidget("bb2_r_attend", {
        x: 12,
        y: 36,
        width: 76,
        height: 14,
        label: "",
        yes: "Hell yes",
        no: "Can't make it",
        labelColor: "#FFFFFF",
        button: {
          background: BIG_ONE.accent,
          textColor: BIG_ONE.onAccent,
          borderColor: BIG_ONE.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 999,
        },
      }),
      choiceWidget("bb2_r_arrive", "single_choice", {
        x: 12,
        y: 52,
        width: 76,
        height: 24,
        label: "When are you rolling in?",
        options: [
          { id: "early", label: "Right on 5" },
          { id: "dinner", label: "Around dinner" },
          { id: "late", label: "Straight to the dance floor" },
        ],
        labelColor: "#FFFFFF",
        option: {
          background: "#262626",
          textColor: "#FFFFFF",
          borderColor: "#3A3A3A",
          borderWidth: 1,
          radius: 999,
        },
      }),
      shortTextWidget("bb2_r_anthem", {
        x: 12,
        y: 79,
        width: 76,
        height: 12,
        label: "Drop a party anthem",
        placeholder: "Artist - song title",
        labelColor: "#FFFFFF",
        field: {
          background: "#262626",
          textColor: "#FFFFFF",
          borderColor: "#3A3A3A",
          borderWidth: 1,
          radius: 999,
        },
      }),
    ]),
  ],
};

/** Ivory, antique gold and a hand-script twenty-one. */
const GOLD21: Palette = {
  bg: "#FBF7F0",
  ink: "#2A2418",
  muted: "#8A7A55",
  accent: "#B0872B",
  onAccent: "#FFFCF5",
  surface: "#FFFFFF",
};

const birthdayTwentyOneGold: InvitationTemplate = {
  id: "birthday-twenty-one-gold",
  categoryId: "birthday",
  title: "Twenty One Gold",
  description: "Antique gold script with a split date grid on ivory",
  eventTitle: "Alex's 21st birthday",
  venue: { name: "Lot 100", address: "68 Chambers Rd, Hay Valley SA" },
  rsvpPrompt: {
    prompt: "Coming to Alex's 21st?",
    note: "Please reply by 1 September",
  },
  pages: [
    page(
      "Cover",
      "cover",
      GOLD21.bg,
      [
        shape("btg_c_frame", "rectangle", 6, 3.5, 88, 93, GOLD21.bg, {
          borderColor: "#D8BE7E",
          borderWidth: 1,
        }),
        text("btg_c_eyebrow", "PLEASE JOIN US TO CELEBRATE", 10, 20, 80, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 2.8,
          fontWeight: "bold",
          color: GOLD21.muted,
        }),
        text("btg_c_script", "Twenty One", 6, 26, 88, {
          fontFamily: "great-vibes",
          fontSize: 54,
          color: GOLD21.accent,
        }),
        divider("btg_c_rule1", 30, 45, 40, "#D8BE7E", "diamond"),
        text("btg_c_name", "ALEX", 10, 49.5, 80, {
          fontFamily: "cinzel-decorative",
          fontSize: 26,
          letterSpacing: 6,
          fontWeight: "bold",
          color: GOLD21.ink,
        }),
        divider("btg_c_rule2", 30, 60, 40, "#D8BE7E", "diamond"),
        text("btg_c_when", "SUNDAY, 10 SEPTEMBER", 10, 65, 80, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 2.6,
          fontWeight: "bold",
          color: GOLD21.ink,
        }),
        text("btg_c_time", "FROM ONE IN THE AFTERNOON", 10, 70, 80, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 2.4,
          color: GOLD21.muted,
        }),
        image("btg_c_bow", ART.satinBow, 34, 76, 32, 18),
      ],
      {
        texture: "linen",
        textureOpacity: 34,
        textureTint: "#F3E7CE",
        textureBlend: "multiply",
      },
    ),
    page(
      "Invitation",
      "details",
      GOLD21.bg,
      [
        guestName("btg_i_guest", 8, 8, 84, {
          fontFamily: "great-vibes",
          fontSize: 26,
          color: GOLD21.accent,
        }),
        text("btg_i_lead", "you're invited to Alex's twenty-first", 8, 15, 84, {
          fontFamily: "forum",
          fontSize: 11.5,
          color: GOLD21.muted,
        }),
        shape("btg_i_rule", "rectangle", 49.7, 24, 0.5, 25, "#D8BE7E"),
        text("btg_i_day", "SUNDAY", 10, 24, 34, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.4,
          fontWeight: "bold",
          color: GOLD21.muted,
          textAlign: "center",
        }),
        text("btg_i_num", "10", 10, 28.5, 34, {
          fontFamily: "bodoni-moda",
          fontSize: 54,
          lineHeight: 1,
          color: GOLD21.ink,
          textAlign: "center",
        }),
        text("btg_i_mon", "SEPTEMBER", 10, 41.5, 34, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.4,
          fontWeight: "bold",
          color: GOLD21.muted,
          textAlign: "center",
        }),
        ...detailRow("btg_i_time", "icon_clock", "From 1:00 pm", {
          x: 57,
          y: 25,
          width: 38,
          aspect: PORTRAIT,
          iconColor: GOLD21.accent,
          textColor: GOLD21.ink,
          size: 3.6,
          gap: 2,
          fontSize: 10,
        }),
        ...detailRow("btg_i_place", "icon_location", "Lot 100, Hay Valley", {
          x: 57,
          y: 31,
          width: 38,
          aspect: PORTRAIT,
          iconColor: GOLD21.accent,
          textColor: GOLD21.ink,
          size: 3.6,
          gap: 2,
          fontSize: 10,
        }),
        ...detailRow("btg_i_drink", "icon_cocktail", "Bar & grazing table", {
          x: 57,
          y: 37,
          width: 38,
          aspect: PORTRAIT,
          iconColor: GOLD21.accent,
          textColor: GOLD21.ink,
          size: 3.6,
          gap: 2,
          fontSize: 10,
        }),
        ...detailRow("btg_i_dress", "icon_ribbon", "Garden party dress", {
          x: 57,
          y: 43,
          width: 38,
          aspect: PORTRAIT,
          iconColor: GOLD21.accent,
          textColor: GOLD21.ink,
          size: 3.6,
          gap: 2,
          fontSize: 10,
        }),
        image("btg_i_photo", IMG.friends, 8, 55, 84, 30, {
          frame: "rounded",
        }),
        divider("btg_i_rule2", 34, 89, 32, "#D8BE7E", "diamond"),
        text("btg_i_note", "RSVP to Brandon 0444 123 321", 8, 92, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 1.6,
          color: GOLD21.muted,
        }),
      ],
      {
        texture: "linen",
        textureOpacity: 34,
        textureTint: "#F3E7CE",
        textureBlend: "multiply",
      },
    ),
    page(
      "Venue",
      "location",
      GOLD21.bg,
      [
        text("btg_v_eyebrow", "WHERE WE'RE CELEBRATING", 8, 9, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 3,
          fontWeight: "bold",
          color: GOLD21.accent,
        }),
        text("btg_v_venue", "Lot 100", 8, 13.5, 84, {
          fontFamily: "cinzel-decorative",
          fontSize: 28,
          letterSpacing: 2,
          fontWeight: "bold",
          color: GOLD21.ink,
        }),
        text("btg_v_addr", "68 Chambers Road · Hay Valley SA 5252", 8, 22, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: GOLD21.muted,
        }),
        mapWidget("btg_v_map", {
          x: 8,
          y: 28,
          width: 84,
          height: 47,
          query: "Lot 100 Chambers Road Hay Valley South Australia",
          radius: 14,
          label: "Open in Google Maps",
          button: {
            background: GOLD21.accent,
            textColor: GOLD21.onAccent,
            borderColor: GOLD21.accent,
            radius: 999,
          },
        }),
        divider("btg_v_rule", 34, 79, 32, "#D8BE7E", "diamond"),
        text(
          "btg_v_note",
          "Forty-five minutes from Adelaide · plenty of\non-site parking · rideshare available until late",
          8,
          83,
          84,
          {
            fontFamily: "forum",
            fontSize: 10.5,
            lineHeight: 1.6,
            color: GOLD21.muted,
          },
        ),
      ],
      {
        texture: "linen",
        textureOpacity: 34,
        textureTint: "#F3E7CE",
        textureBlend: "multiply",
      },
    ),
    page(
      "RSVP",
      "rsvp",
      GOLD21.bg,
      [
        text("btg_r_eyebrow", "RSVP", 8, 9, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 5,
          fontWeight: "bold",
          color: GOLD21.accent,
        }),
        text("btg_r_title", "Coming to\nAlex's 21st?", 8, 13, 84, {
          fontFamily: "great-vibes",
          fontSize: 38,
          lineHeight: 1.06,
          color: GOLD21.ink,
        }),
        text("btg_r_note", "Please reply by 1 September", 8, 30, 84, {
          fontFamily: "forum",
          fontSize: 11,
          color: GOLD21.muted,
        }),
        attendWidget("btg_r_attend", {
          x: 14,
          y: 35,
          width: 72,
          height: 14,
          label: "",
          yes: "Count me in",
          no: "Sending regrets",
          labelColor: GOLD21.ink,
          button: {
            background: GOLD21.accent,
            textColor: GOLD21.onAccent,
            borderColor: GOLD21.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("btg_r_drink", "multi_choice", {
          x: 14,
          y: 51,
          width: 72,
          height: 29,
          label: "What are you drinking?",
          options: [
            { id: "champagne", label: "Champagne" },
            { id: "cocktail", label: "Cocktails" },
            { id: "beer", label: "Beer & cider" },
            { id: "soft", label: "Soft drinks" },
          ],
          labelColor: GOLD21.ink,
          option: {
            background: GOLD21.surface,
            textColor: GOLD21.ink,
            borderColor: "#E4D6B4",
            borderWidth: 1,
            radius: 999,
          },
        }),
        image("btg_r_bow", ART.satinBow, 62, 80, 34, 19),
      ],
      {
        texture: "linen",
        textureOpacity: 34,
        textureTint: "#F3E7CE",
        textureBlend: "multiply",
      },
    ),
  ],
};

/** Midnight rooftop with a hot-pink glow - landscape party invite. */
const ROOFTOP: Palette = {
  bg: "#141017",
  ink: "#FFFFFF",
  muted: "#B9A8B4",
  accent: "#FF60AA",
  onAccent: "#3A0F27",
  surface: "#221A22",
};

const birthdayRooftopAfterglow: InvitationTemplate = {
  id: "birthday-rooftop-afterglow-landscape",
  categoryId: "birthday",
  title: "Rooftop Afterglow",
  description: "Midnight rooftop energy with neon pink and wide photo panels",
  eventTitle: "Nia's 30th birthday",
  shape: "landscape",
  venue: { name: "Luma Rooftop", address: "Level 12, 155 Collins St, Melbourne" },
  rsvpPrompt: {
    prompt: "Are you coming up?",
    note: "Reply by Friday so we can save your spot",
  },
  pages: [
    page("Cover", "cover", ROOFTOP.bg, [
      image("bra_c_photo", IMG.rooftopNight, 0, 0, 62, 100, {
        frame: "square",
      }),
      shape("bra_c_panel", "rectangle", 62, 0, 38, 100, ROOFTOP.accent),
      shape("bra_c_orb", "circle", 86, 4, 11, 19.6, "#FFC2DD"),
      text("bra_c_eyebrow", "ROOFTOP · SUNSET · LATE", 67, 26, 30, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2.6,
        fontWeight: "bold",
        color: ROOFTOP.onAccent,
        textAlign: "left",
      }),
      text("bra_c_age", "30", 66, 33, 32, {
        fontFamily: "urbanist",
        fontSize: 76,
        fontWeight: "bold",
        lineHeight: 1,
        color: "#FFFFFF",
        textAlign: "left",
      }),
      text("bra_c_name", "Nia's\nAfterglow", 67, 58, 30, {
        fontFamily: "instrument-serif",
        fontSize: 30,
        lineHeight: 1.04,
        color: "#FFFFFF",
        textAlign: "left",
      }),
      divider("bra_c_rule", 67, 80, 12, ROOFTOP.onAccent),
      text("bra_c_when", "SAT 12 OCT  ·  8 PM", 67, 84, 30, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 2,
        fontWeight: "bold",
        color: ROOFTOP.onAccent,
        textAlign: "left",
      }),
    ]),
    page("Party plan", "details", ROOFTOP.surface, [
      text("bra_d_eyebrow", "THE RUN SHEET", 5, 12, 34, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3,
        fontWeight: "bold",
        color: ROOFTOP.accent,
        textAlign: "left",
      }),
      text("bra_d_title", "Sunset first.\nAfterglow later.", 5, 21, 40, {
        fontFamily: "instrument-serif",
        fontSize: 32,
        lineHeight: 1.1,
        color: "#FFFFFF",
        textAlign: "left",
      }),
      ...detailRow("bra_d_1", "icon_cocktail", "7:30  Sunset spritz", {
        x: 5,
        y: 50,
        width: 34,
        aspect: LANDSCAPE,
        iconColor: ROOFTOP.accent,
        textColor: "#FFFFFF",
        size: 2.3,
        gap: 1.4,
        fontSize: 10.5,
      }),
      ...detailRow("bra_d_2", "icon_cake", "8:30  Dinner bites & cake", {
        x: 5,
        y: 61,
        width: 34,
        aspect: LANDSCAPE,
        iconColor: ROOFTOP.accent,
        textColor: "#FFFFFF",
        size: 2.3,
        gap: 1.4,
        fontSize: 10.5,
      }),
      ...detailRow("bra_d_3", "icon_music", "10:00  Dance floor opens", {
        x: 5,
        y: 72,
        width: 34,
        aspect: LANDSCAPE,
        iconColor: ROOFTOP.accent,
        textColor: "#FFFFFF",
        size: 2.3,
        gap: 1.4,
        fontSize: 10.5,
      }),
      ...detailRow("bra_d_4", "icon_sparkles", "Late   One more song", {
        x: 5,
        y: 83,
        width: 34,
        aspect: LANDSCAPE,
        iconColor: ROOFTOP.accent,
        textColor: "#FFFFFF",
        size: 2.3,
        gap: 1.4,
        fontSize: 10.5,
      }),
      image("bra_d_photo", IMG.nightCrowd, 46, 0, 54, 100, { frame: "square" }),
      shape("bra_d_tag", "rounded_square", 50, 72, 44, 20, ROOFTOP.accent, {
        effects: lift(6, 12, 55),
      }),
      text("bra_d_dress", "DRESS CODE\nWEAR SOMETHING THAT CATCHES LIGHT", 53, 77, 38, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 1.4,
        fontWeight: "bold",
        lineHeight: 1.5,
        color: ROOFTOP.onAccent,
        textAlign: "left",
      }),
    ]),
    page("Venue", "location", ROOFTOP.bg, [
      shape("bra_v_bar", "rectangle", 0, 0, 3, 100, ROOFTOP.accent),
      text("bra_v_eyebrow", "TAKE THE LIFT TO 12", 8, 14, 34, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3,
        fontWeight: "bold",
        color: ROOFTOP.accent,
        textAlign: "left",
      }),
      text("bra_v_venue", "Luma\nRooftop", 8, 22, 36, {
        fontFamily: "instrument-serif",
        fontSize: 34,
        lineHeight: 1.06,
        color: "#FFFFFF",
        textAlign: "left",
      }),
      text("bra_v_addr", "Level 12, 155 Collins Street\nMelbourne VIC 3000", 8, 45, 36, {
        fontFamily: "urbanist",
        fontSize: 10.5,
        lineHeight: 1.6,
        color: ROOFTOP.muted,
        textAlign: "left",
      }),
      ...detailRow("bra_v_note", "icon_sparkles", "ID at the door · rain plan indoors", {
        x: 8,
        y: 62,
        width: 38,
        aspect: LANDSCAPE,
        iconColor: ROOFTOP.accent,
        textColor: ROOFTOP.muted,
        size: 2.2,
        gap: 1.4,
        fontSize: 9.5,
      }),
      mapWidget("bra_v_map", {
        x: 51,
        y: 9,
        width: 44,
        height: 82,
        query: "155 Collins Street Melbourne",
        radius: 18,
        label: "Open in Google Maps",
        button: {
          background: ROOFTOP.accent,
          textColor: ROOFTOP.onAccent,
          borderColor: ROOFTOP.accent,
          radius: 999,
        },
      }),
    ]),
    page("RSVP", "rsvp", ROOFTOP.bg, [
      shape("bra_r_glow", "circle", -10, 52, 34, 60.4, "#3D1730"),
      text("bra_r_eyebrow", "GUEST LIST", 6, 13, 34, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: ROOFTOP.accent,
        textAlign: "left",
      }),
      text("bra_r_title", "Are you\ncoming up?", 6, 22, 34, {
        fontFamily: "instrument-serif",
        fontSize: 34,
        lineHeight: 1.06,
        color: "#FFFFFF",
        textAlign: "left",
      }),
      guestName("bra_r_guest", 6, 58, 32, {
        fontFamily: "urbanist",
        fontSize: 13,
        letterSpacing: 2.4,
        fontWeight: "bold",
        color: ROOFTOP.accent,
        textAlign: "left",
      }),
      text("bra_r_note", "Reply by Friday so we can save your spot", 6, 68, 34, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        lineHeight: 1.5,
        color: ROOFTOP.muted,
        textAlign: "left",
      }),
      attendWidget("bra_r_attend", {
        x: 44,
        y: 16,
        width: 24,
        height: 22,
        label: "Can you make it?",
        yes: "Up to the rooftop",
        no: "Dancing elsewhere",
        labelColor: "#FFFFFF",
        button: {
          background: ROOFTOP.accent,
          textColor: ROOFTOP.onAccent,
          borderColor: ROOFTOP.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 999,
        },
      }),
      choiceWidget("bra_r_arrive", "single_choice", {
        x: 72,
        y: 16,
        width: 24,
        height: 30,
        label: "When should we expect you?",
        options: [
          { id: "sunset", label: "Sunset drinks" },
          { id: "dinner", label: "Dinner time" },
          { id: "dance", label: "Straight to dancing" },
        ],
        labelColor: "#FFFFFF",
        option: {
          background: ROOFTOP.surface,
          textColor: "#FFFFFF",
          borderColor: "#3E3140",
          borderWidth: 1,
          radius: 999,
        },
      }),
      shortTextWidget("bra_r_song", {
        x: 44,
        y: 56,
        width: 52,
        height: 14,
        label: "One song that has to be played",
        placeholder: "Artist - song title",
        labelColor: "#FFFFFF",
        field: {
          background: ROOFTOP.surface,
          textColor: "#FFFFFF",
          borderColor: "#3E3140",
          borderWidth: 1,
          radius: 999,
        },
      }),
    ]),
  ],
};

/* ── Baby & shower ────────────────────────────────────────────────────── */

/** Sky blue, cotton paper, soft cloud shapes. */
const CLOUDS: Palette = {
  bg: "#EDF4FB",
  ink: "#23405C",
  muted: "#6E8CA8",
  accent: "#4A7AB5",
  onAccent: "#FFFFFF",
  surface: "#FFFFFF",
};

const babySoftClouds: InvitationTemplate = {
  id: "baby-soft-clouds",
  categoryId: "baby",
  title: "Soft Clouds",
  description: "Cloud-soft blues and cotton paper for a gentle baby shower",
  eventTitle: "Harper's baby shower",
  venue: { name: "Cloud House Cafe", address: "14 Skyline Road, Melbourne VIC" },
  rsvpPrompt: {
    prompt: "Will you join our shower?",
    note: "RSVP by 8 May",
  },
  pages: [
    page(
      "Cover",
      "cover",
      CLOUDS.bg,
      [
        shape("bsc_c_cloud1", "circle", -6, 3, 26, 14.6, "#FFFFFF"),
        shape("bsc_c_cloud2", "circle", 8, 0.5, 20, 11.3, "#FFFFFF"),
        shape("bsc_c_cloud3", "circle", 20, 4, 16, 9, "#FFFFFF"),
        shape("bsc_c_cloud4", "circle", 76, 6, 22, 12.4, "#DCEAF8"),
        shape("bsc_c_cloud5", "circle", 88, 3, 18, 10.1, "#DCEAF8"),
        image("bsc_c_photo", IMG.baby, 22, 17, 56, 31.5, {
          frame: "circle",
          effects: lift(6, 18, 70),
        }),
        text("bsc_c_eyebrow", "A BABY SHOWER FOR", 8, 55, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.6,
          fontWeight: "bold",
          color: CLOUDS.accent,
        }),
        text("bsc_c_title", "Baby Harper", 8, 60, 84, {
          fontFamily: "great-vibes",
          fontSize: 42,
          color: CLOUDS.ink,
        }),
        text("bsc_c_sub", "a little one is on the way", 8, 74, 84, {
          fontFamily: "forum",
          fontSize: 13,
          color: CLOUDS.muted,
        }),
        divider("bsc_c_rule", 40, 81, 20, "#A9C5E0"),
        text("bsc_c_when", "SATURDAY 22 MAY  ·  2 PM", 8, 83.5, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.4,
          fontWeight: "bold",
          color: CLOUDS.muted,
        }),
      ],
      { texture: "cotton", textureOpacity: 26, textureBlend: "multiply" },
    ),
    page(
      "Invitation",
      "details",
      CLOUDS.surface,
      [
        shape("bsc_i_top", "rectangle", 0, 0, 100, 16, CLOUDS.bg),
        shape("bsc_i_cloud", "circle", 70, 4, 26, 14.6, "#FFFFFF"),
        guestName("bsc_i_guest", 8, 5, 84, {
          fontFamily: "great-vibes",
          fontSize: 26,
          color: CLOUDS.accent,
        }),
        text("bsc_i_lead", "we'd love you there as we celebrate", 8, 19, 84, {
          fontFamily: "forum",
          fontSize: 12,
          color: CLOUDS.muted,
        }),
        text("bsc_i_hosts", "Harper & Wren", 8, 25, 84, {
          fontFamily: "instrument-serif",
          fontSize: 28,
          color: CLOUDS.ink,
        }),
        shape("bsc_i_card", "rounded_square", 10, 36, 80, 32, CLOUDS.bg),
        ...detailRow("bsc_i_date", "icon_calendar", "Saturday, 22 May", {
          x: 17,
          y: 40.5,
          width: 66,
          aspect: PORTRAIT,
          iconColor: CLOUDS.accent,
          textColor: CLOUDS.ink,
          size: 3.8,
          fontSize: 11,
        }),
        ...detailRow("bsc_i_time", "icon_clock", "Two in the afternoon", {
          x: 17,
          y: 47,
          width: 66,
          aspect: PORTRAIT,
          iconColor: CLOUDS.accent,
          textColor: CLOUDS.ink,
          size: 3.8,
          fontSize: 11,
        }),
        ...detailRow("bsc_i_place", "icon_location", "Cloud House Cafe", {
          x: 17,
          y: 53.5,
          width: 66,
          aspect: PORTRAIT,
          iconColor: CLOUDS.accent,
          textColor: CLOUDS.ink,
          size: 3.8,
          fontSize: 11,
        }),
        ...detailRow("bsc_i_gift", "icon_gift", "Books instead of cards", {
          x: 17,
          y: 60,
          width: 66,
          aspect: PORTRAIT,
          iconColor: CLOUDS.accent,
          textColor: CLOUDS.ink,
          size: 3.8,
          fontSize: 11,
        }),
        image("bsc_i_photo", IMG.babyFeet, 10, 72, 80, 20, {
          frame: "rounded",
        }),
      ],
      { texture: "cotton", textureOpacity: 22, textureBlend: "multiply" },
    ),
    page(
      "Venue",
      "location",
      CLOUDS.bg,
      [
        shape("bsc_v_cloud", "circle", 66, 2, 30, 16.9, "#FFFFFF"),
        text("bsc_v_eyebrow", "WHERE TO FIND US", 8, 10, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.2,
          fontWeight: "bold",
          color: CLOUDS.accent,
        }),
        text("bsc_v_venue", "Cloud House Cafe", 8, 14.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 28,
          color: CLOUDS.ink,
        }),
        text("bsc_v_addr", "14 Skyline Road · Melbourne VIC", 8, 23, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: CLOUDS.muted,
        }),
        mapWidget("bsc_v_map", {
          x: 8,
          y: 29,
          width: 84,
          height: 47,
          query: "Skyline Road Burwood Victoria",
          radius: 20,
          label: "Open in Google Maps",
          button: {
            background: CLOUDS.accent,
            textColor: CLOUDS.onAccent,
            borderColor: CLOUDS.accent,
            radius: 999,
          },
        }),
        divider("bsc_v_rule", 8, 80, 84, "#C6DAEC"),
        ...detailRow("bsc_v_park", "icon_location", "Street parking along Skyline Rd", {
          x: 10,
          y: 83.5,
          width: 74,
          aspect: PORTRAIT,
          iconColor: CLOUDS.accent,
          textColor: CLOUDS.muted,
          size: 3.4,
          fontSize: 9.5,
        }),
        ...detailRow("bsc_v_pram", "icon_sparkles", "Pram-friendly, high chairs on hand", {
          x: 10,
          y: 89,
          width: 74,
          aspect: PORTRAIT,
          iconColor: CLOUDS.accent,
          textColor: CLOUDS.muted,
          size: 3.4,
          fontSize: 9.5,
        }),
      ],
      { texture: "cotton", textureOpacity: 26, textureBlend: "multiply" },
    ),
    page(
      "RSVP",
      "rsvp",
      CLOUDS.bg,
      [
        shape("bsc_r_cloud1", "circle", -10, 2, 32, 18, "#FFFFFF"),
        shape("bsc_r_cloud2", "circle", 66, 6, 26, 14.6, "#DDEAF7"),
        text("bsc_r_eyebrow", "BABY SHOWER", 8, 18, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: CLOUDS.accent,
        }),
        text("bsc_r_title", "Will you join\nour shower?", 8, 22.5, 84, {
          fontFamily: "great-vibes",
          fontSize: 36,
          lineHeight: 1.08,
          color: CLOUDS.ink,
        }),
        text("bsc_r_note", "Kindly RSVP by 8 May", 8, 40, 84, {
          fontFamily: "forum",
          fontSize: 11,
          color: CLOUDS.muted,
        }),
        attendWidget("bsc_r_attend", {
          x: 14,
          y: 45,
          width: 72,
          height: 14,
          label: "",
          yes: "Yes, can't wait",
          no: "Sorry, I can't",
          labelColor: CLOUDS.ink,
          button: {
            background: CLOUDS.accent,
            textColor: CLOUDS.onAccent,
            borderColor: CLOUDS.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("bsc_r_gift", "single_choice", {
          x: 14,
          y: 61,
          width: 72,
          height: 24,
          label: "Planning a gift?",
          options: [
            { id: "registry", label: "From the registry" },
            { id: "own", label: "Something of my own" },
            { id: "presence", label: "Presence is the present" },
          ],
          labelColor: CLOUDS.ink,
          option: {
            background: CLOUDS.surface,
            textColor: CLOUDS.ink,
            borderColor: "#C6DAEC",
            borderWidth: 1,
            radius: 999,
          },
        }),
        text("bsc_r_ps", "Guess the birth date on arrival - prize for the closest!", 10, 86, 80, {
          fontFamily: "forum",
          fontSize: 10,
          lineHeight: 1.5,
          color: CLOUDS.muted,
        }),
      ],
      { texture: "cotton", textureOpacity: 26, textureBlend: "multiply" },
    ),
  ],
};

/** Oat, clay and olive - a calm, gender-neutral nursery palette. */
const NURSERY: Palette = {
  bg: "#F5F0E7",
  ink: "#3D3327",
  muted: "#8B7C67",
  accent: "#9A7B4F",
  onAccent: "#FFFCF6",
  surface: "#FFFDF9",
};

const babyNeutralNursery: InvitationTemplate = {
  id: "baby-neutral-nursery",
  categoryId: "baby",
  title: "Neutral Nursery",
  description: "Warm oat linen with olive sprigs and an arched portrait",
  eventTitle: "Baby Chen's welcome brunch",
  venue: { name: "The Nest Studio", address: "22 Willow Lane, Fitzroy VIC" },
  rsvpPrompt: {
    prompt: "Can you make brunch?",
    note: "Kindly reply by 20 May",
  },
  pages: [
    page(
      "Cover",
      "cover",
      NURSERY.bg,
      [
        image("bnn_c_sprig1", ART.bell, -6, 2, 34, 19, {
          color: "#8B9370",
        }),
        image("bnn_c_sprig2", ART.bell, 72, 2, 34, 19, {
          color: "#8B9370",
          rotation: 12,
        }),
        image("bnn_c_photo", IMG.nursery, 20, 20, 60, 42, {
          frame: "arch",
        }),
        text("bnn_c_eyebrow", "A BRUNCH TO WELCOME", 8, 66, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: NURSERY.accent,
        }),
        text("bnn_c_title", "Baby Chen", 8, 70.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 40,
          color: NURSERY.ink,
        }),
        text("bnn_c_sub", "is almost here", 8, 81, 84, {
          fontFamily: "great-vibes",
          fontSize: 26,
          color: NURSERY.accent,
        }),
        text("bnn_c_when", "SUNDAY 6 JUNE  ·  11 AM", 8, 90, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.4,
          fontWeight: "bold",
          color: NURSERY.muted,
        }),
      ],
      {
        texture: "linen",
        textureOpacity: 38,
        textureTint: "#EFE4D2",
        textureBlend: "multiply",
        border: { style: "solid", color: "#DFD2BC", width: 5 },
      },
    ),
    page(
      "Invitation",
      "details",
      NURSERY.bg,
      [
        guestName("bnn_i_guest", 8, 8, 84, {
          fontFamily: "great-vibes",
          fontSize: 26,
          color: NURSERY.accent,
        }),
        text("bnn_i_lead", "please join us for a slow, sunny brunch", 8, 15.5, 84, {
          fontFamily: "forum",
          fontSize: 11.5,
          lineHeight: 1.5,
          color: NURSERY.muted,
        }),
        divider("bnn_i_rule", 40, 22, 20, "#C7B08B", "diamond"),
        shape("bnn_i_card", "rounded_square", 10, 27, 80, 32, NURSERY.surface, {
          borderColor: "#E3D8C4",
          borderWidth: 1,
        }),
        ...detailRow("bnn_i_date", "icon_calendar", "Sunday, 6 June 2027", {
          x: 17,
          y: 31.5,
          width: 66,
          aspect: PORTRAIT,
          iconColor: NURSERY.accent,
          textColor: NURSERY.ink,
          size: 3.8,
          fontSize: 11,
        }),
        ...detailRow("bnn_i_time", "icon_clock", "Eleven in the morning", {
          x: 17,
          y: 38,
          width: 66,
          aspect: PORTRAIT,
          iconColor: NURSERY.accent,
          textColor: NURSERY.ink,
          size: 3.8,
          fontSize: 11,
        }),
        ...detailRow("bnn_i_place", "icon_location", "The Nest Studio, Fitzroy", {
          x: 17,
          y: 44.5,
          width: 66,
          aspect: PORTRAIT,
          iconColor: NURSERY.accent,
          textColor: NURSERY.ink,
          size: 3.8,
          fontSize: 11,
        }),
        ...detailRow("bnn_i_gift", "icon_gift", "A book for the nursery shelf", {
          x: 17,
          y: 51,
          width: 66,
          aspect: PORTRAIT,
          iconColor: NURSERY.accent,
          textColor: NURSERY.ink,
          size: 3.8,
          fontSize: 11,
        }),
        image("bnn_i_photo", IMG.softBaby, 10, 63, 80, 24, {
          frame: "rounded",
        }),
        text("bnn_i_note", "grazing table · fresh pastries · long lunch", 8, 90, 84, {
          fontFamily: "forum",
          fontSize: 10.5,
          color: NURSERY.muted,
        }),
      ],
      {
        texture: "linen",
        textureOpacity: 38,
        textureTint: "#EFE4D2",
        textureBlend: "multiply",
      },
    ),
    page(
      "Venue",
      "location",
      NURSERY.bg,
      [
        image("bnn_v_sprig", ART.wildflower, 68, 1, 34, 15, {
          color: "#8B9370",
        }),
        text("bnn_v_eyebrow", "THE STUDIO", 8, 11, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: NURSERY.accent,
        }),
        text("bnn_v_venue", "The Nest Studio", 8, 15.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 30,
          color: NURSERY.ink,
        }),
        text("bnn_v_addr", "22 Willow Lane · Fitzroy VIC 3065", 8, 24, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: NURSERY.muted,
        }),
        mapWidget("bnn_v_map", {
          x: 8,
          y: 30,
          width: 84,
          height: 46,
          query: "Fitzroy Melbourne Victoria",
          radius: 16,
          label: "Open in Google Maps",
          button: {
            background: NURSERY.accent,
            textColor: NURSERY.onAccent,
            borderColor: NURSERY.accent,
            radius: 999,
          },
        }),
        divider("bnn_v_rule", 34, 80, 32, "#C7B08B", "diamond"),
        text(
          "bnn_v_note",
          "Through the green door and up one flight ·\nlift access at the rear · little ones welcome",
          8,
          84,
          84,
          {
            fontFamily: "forum",
            fontSize: 10.5,
            lineHeight: 1.6,
            color: NURSERY.muted,
          },
        ),
      ],
      {
        texture: "linen",
        textureOpacity: 38,
        textureTint: "#EFE4D2",
        textureBlend: "multiply",
      },
    ),
    page(
      "RSVP",
      "rsvp",
      NURSERY.bg,
      [
        image("bnn_r_sprig", ART.eucalyptus, -8, 0, 36, 16, {
          color: "#8B9370",
        }),
        text("bnn_r_eyebrow", "BRUNCH RSVP", 8, 17, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: NURSERY.accent,
        }),
        text("bnn_r_title", "Can you\nmake brunch?", 8, 21.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 30,
          lineHeight: 1.12,
          color: NURSERY.ink,
        }),
        text("bnn_r_note", "Kindly reply by 20 May", 8, 37, 84, {
          fontFamily: "forum",
          fontSize: 11,
          color: NURSERY.muted,
        }),
        attendWidget("bnn_r_attend", {
          x: 14,
          y: 42,
          width: 72,
          height: 14,
          label: "",
          yes: "I'll be there",
          no: "Can't make it",
          labelColor: NURSERY.ink,
          button: {
            background: NURSERY.accent,
            textColor: NURSERY.onAccent,
            borderColor: NURSERY.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("bnn_r_diet", "multi_choice", {
          x: 14,
          y: 58,
          width: 72,
          height: 35,
          label: "Anything we should know about?",
          options: [
            { id: "nuts", label: "Nuts" },
            { id: "dairy", label: "Dairy" },
            { id: "gluten", label: "Gluten" },
            { id: "eggs", label: "Eggs" },
            { id: "none", label: "Nothing at all" },
          ],
          labelColor: NURSERY.ink,
          option: {
            background: NURSERY.surface,
            textColor: NURSERY.ink,
            borderColor: "#E3D8C4",
            borderWidth: 1,
            radius: 999,
          },
        }),
      ],
      {
        texture: "linen",
        textureOpacity: 38,
        textureTint: "#EFE4D2",
        textureBlend: "multiply",
      },
    ),
  ],
};

/** A split pink/blue reveal that keeps the secret until the last page. */
const REVEAL: Palette = {
  bg: "#FFF6F9",
  ink: "#3A2A35",
  muted: "#8C7482",
  accent: "#FF60AA",
  onAccent: "#FFFFFF",
  surface: "#FFFFFF",
};
const REVEAL_BLUE = "#5FA8E8";

const babyPinkBlueReveal: InvitationTemplate = {
  id: "baby-pink-blue",
  categoryId: "baby",
  title: "Pink & Blue Reveal",
  description: "A split pink-and-blue reveal party with a guess-the-answer RSVP",
  eventTitle: "Baby Lee's gender reveal",
  venue: { name: "River Gardens", address: "Picnic lawn & pavilion, Hawthorn VIC" },
  rsvpPrompt: {
    prompt: "Coming to the reveal?",
    note: "RSVP by 10 March",
  },
  pages: [
    page("Cover", "cover", REVEAL.bg, [
      shape("bpb_c_left", "rectangle", 0, 0, 50, 100, "#FFE4EF"),
      shape("bpb_c_right", "rectangle", 50, 0, 50, 100, "#E1F0FD"),
      shape("bpb_c_heart", "heart", 33, 12, 34, 19.1, REVEAL.accent),
      shape("bpb_c_heart2", "heart", 39, 17, 22, 12.4, REVEAL_BLUE),
      text("bpb_c_eyebrow", "A GENDER REVEAL PARTY", 8, 38, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: REVEAL.muted,
      }),
      text("bpb_c_title", "Boy\nor Girl?", 8, 43, 84, {
        fontFamily: "great-vibes",
        fontSize: 52,
        lineHeight: 1.02,
        color: REVEAL.ink,
      }),
      text("bpb_c_sub", "Baby Lee arrives this spring -\ncome help us find out", 8, 70, 84, {
        fontFamily: "forum",
        fontSize: 12,
        lineHeight: 1.6,
        color: REVEAL.muted,
      }),
      divider("bpb_c_rule", 40, 83, 20, REVEAL.accent),
      text("bpb_c_when", "SUNDAY 22 MARCH  ·  4 PM", 8, 86, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2.4,
        fontWeight: "bold",
        color: REVEAL.ink,
      }),
    ]),
    page("Invitation", "details", REVEAL.surface, [
      shape("bpb_i_band", "rectangle", 0, 0, 100, 6, REVEAL.accent),
      shape("bpb_i_band2", "rectangle", 0, 6, 100, 2, REVEAL_BLUE),
      guestName("bpb_i_guest", 8, 12, 84, {
        fontFamily: "great-vibes",
        fontSize: 28,
        color: REVEAL.accent,
      }),
      text("bpb_i_lead", "we're keeping it secret until 4:30 sharp", 8, 21, 84, {
        fontFamily: "forum",
        fontSize: 11.5,
        color: REVEAL.muted,
      }),
      shape("bpb_i_card", "rounded_square", 10, 28, 80, 32, "#FFF6F9"),
      ...detailRow("bpb_i_date", "icon_calendar", "Sunday, 22 March", {
        x: 17,
        y: 32.5,
        width: 66,
        aspect: PORTRAIT,
        iconColor: REVEAL.accent,
        textColor: REVEAL.ink,
        size: 3.8,
        fontSize: 11,
      }),
      ...detailRow("bpb_i_time", "icon_clock", "4 pm · reveal at 4:30", {
        x: 17,
        y: 39,
        width: 66,
        aspect: PORTRAIT,
        iconColor: REVEAL_BLUE,
        textColor: REVEAL.ink,
        size: 3.8,
        fontSize: 11,
      }),
      ...detailRow("bpb_i_place", "icon_location", "River Gardens picnic lawn", {
        x: 17,
        y: 45.5,
        width: 66,
        aspect: PORTRAIT,
        iconColor: REVEAL.accent,
        textColor: REVEAL.ink,
        size: 3.8,
        fontSize: 11,
      }),
      ...detailRow("bpb_i_dress", "icon_ribbon", "Wear your guess - pink or blue", {
        x: 17,
        y: 52,
        width: 66,
        aspect: PORTRAIT,
        iconColor: REVEAL_BLUE,
        textColor: REVEAL.ink,
        size: 3.8,
        fontSize: 11,
      }),
      image("bpb_i_photo", IMG.babyFeet, 10, 64, 80, 24, {
        frame: "rounded",
      }),
      text("bpb_i_note", "afternoon tea, lawn games & one very big balloon", 8, 91, 84, {
        fontFamily: "forum",
        fontSize: 10,
        color: REVEAL.muted,
      }),
    ]),
    page("Venue", "location", REVEAL.bg, [
      shape("bpb_v_left", "rectangle", 0, 0, 50, 22, "#FFE4EF"),
      shape("bpb_v_right", "rectangle", 50, 0, 50, 22, "#E1F0FD"),
      text("bpb_v_eyebrow", "MEET US ON THE LAWN", 8, 7, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.2,
        fontWeight: "bold",
        color: REVEAL.muted,
      }),
      text("bpb_v_venue", "River Gardens", 8, 11.5, 84, {
        fontFamily: "instrument-serif",
        fontSize: 28,
        color: REVEAL.ink,
      }),
      text("bpb_v_addr", "Picnic lawn & pavilion · Hawthorn VIC", 8, 25, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        color: REVEAL.muted,
      }),
      mapWidget("bpb_v_map", {
        x: 8,
        y: 31,
        width: 84,
        height: 46,
        query: "Hawthorn Victoria river gardens",
        radius: 20,
        label: "Open in Google Maps",
        button: {
          background: REVEAL.accent,
          textColor: REVEAL.onAccent,
          borderColor: REVEAL.accent,
          radius: 999,
        },
      }),
      ...detailRow("bpb_v_park", "icon_location", "Park on Yarra Street, walk two minutes", {
        x: 10,
        y: 82,
        width: 76,
        aspect: PORTRAIT,
        iconColor: REVEAL.accent,
        textColor: REVEAL.muted,
        size: 3.4,
        fontSize: 9.5,
      }),
      ...detailRow("bpb_v_rain", "icon_sparkles", "Pavilion covered if it rains", {
        x: 10,
        y: 87.5,
        width: 76,
        aspect: PORTRAIT,
        iconColor: REVEAL_BLUE,
        textColor: REVEAL.muted,
        size: 3.4,
        fontSize: 9.5,
      }),
    ]),
    page("RSVP", "rsvp", REVEAL.surface, [
      shape("bpb_r_left", "rectangle", 0, 0, 50, 12, "#FFE4EF"),
      shape("bpb_r_right", "rectangle", 50, 0, 50, 12, "#E1F0FD"),
      text("bpb_r_eyebrow", "GUESS + RSVP", 8, 17, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: REVEAL.muted,
      }),
      text("bpb_r_title", "Coming to\nthe reveal?", 8, 21.5, 84, {
        fontFamily: "great-vibes",
        fontSize: 38,
        lineHeight: 1.04,
        color: REVEAL.ink,
      }),
      text("bpb_r_note", "RSVP by 10 March", 8, 38, 84, {
        fontFamily: "forum",
        fontSize: 11,
        color: REVEAL.muted,
      }),
      attendWidget("bpb_r_attend", {
        x: 14,
        y: 43,
        width: 72,
        height: 14,
        label: "",
        yes: "Yes - save me a cupcake",
        no: "Can't make it",
        labelColor: REVEAL.ink,
        button: {
          background: REVEAL.accent,
          textColor: REVEAL.onAccent,
          borderColor: REVEAL.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 999,
        },
      }),
      choiceWidget("bpb_r_guess", "single_choice", {
        x: 14,
        y: 59,
        width: 72,
        height: 24,
        label: "Your guess?",
        options: [
          { id: "boy", label: "Boy" },
          { id: "girl", label: "Girl" },
          { id: "twins", label: "Twins?!" },
        ],
        labelColor: REVEAL.ink,
        option: {
          background: "#FFF6F9",
          textColor: REVEAL.ink,
          borderColor: "#F0D3E0",
          borderWidth: 1,
          radius: 999,
        },
        required: true,
      }),
      shape("bpb_r_band", "rectangle", 0, 94, 50, 6, "#FFE4EF"),
      shape("bpb_r_band2", "rectangle", 50, 94, 50, 6, "#E1F0FD"),
    ]),
  ],
};

/** Sage, blush and pressed wildflowers - landscape garden shower. */
const WILDFLOWER: Palette = {
  bg: "#F6F1E9",
  ink: "#5A4550",
  muted: "#7C8A72",
  accent: "#A8757F",
  onAccent: "#FFF8F5",
  surface: "#FCFAF6",
};

const babyLittleWildflower: InvitationTemplate = {
  id: "baby-little-wildflower-landscape",
  categoryId: "baby",
  title: "Little Wildflower",
  description: "Sage and blush garden shower laid out across a wide canvas",
  eventTitle: "Our garden baby shower",
  shape: "landscape",
  venue: {
    name: "The Glasshouse Garden",
    address: "36 Willow Lane, Melbourne VIC",
  },
  rsvpPrompt: {
    prompt: "Will you join the garden party?",
    note: "Please respond by 1 May",
  },
  pages: [
    page(
      "Cover",
      "cover",
      WILDFLOWER.bg,
      [
        shape("blw_c_blob", "oval", 2, 6, 44, 88, "#E5EBDD"),
        image("blw_c_photo", IMG.baby, 5, 9, 38, 82, { frame: "arch" }),
        image("blw_c_flower", ART.wildflower, 38, 46, 16, 50, {
          color: "#93A183",
        }),
        text("blw_c_eyebrow", "A GARDEN SHOWER FOR", 56, 17, 36, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3,
          fontWeight: "bold",
          color: WILDFLOWER.muted,
          textAlign: "left",
        }),
        text("blw_c_title", "our little\nwildflower", 55, 27, 42, {
          fontFamily: "great-vibes",
          fontSize: 44,
          lineHeight: 1.02,
          color: WILDFLOWER.ink,
          textAlign: "left",
        }),
        divider("blw_c_rule", 56, 70, 14, "#C6A9B1"),
        text("blw_c_when", "SUNDAY 16 MAY  ·  11 AM", 56, 75, 38, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 2,
          fontWeight: "bold",
          color: WILDFLOWER.ink,
          textAlign: "left",
        }),
        text("blw_c_where", "THE GLASSHOUSE GARDEN", 56, 83, 38, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2,
          fontWeight: "medium",
          color: WILDFLOWER.muted,
          textAlign: "left",
        }),
      ],
      { texture: "cotton", textureOpacity: 30, textureTint: "#F3EBDC", textureBlend: "multiply" },
    ),
    page(
      "Shower details",
      "details",
      WILDFLOWER.surface,
      [
        shape("blw_d_arc", "semicircle", 3, 8, 10, 34, "#DCE6D2"),
        text("blw_d_eyebrow", "THE MORNING", 5, 14, 34, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3,
          fontWeight: "bold",
          color: WILDFLOWER.muted,
          textAlign: "left",
        }),
        text("blw_d_title", "Tea, treats\n& sweet wishes", 5, 23, 44, {
          fontFamily: "instrument-serif",
          fontSize: 30,
          lineHeight: 1.1,
          color: WILDFLOWER.ink,
          textAlign: "left",
        }),
        ...detailRow("blw_d_date", "icon_calendar", "Sunday 16 May · 11 am", {
          x: 5,
          y: 55,
          width: 36,
          aspect: LANDSCAPE,
          iconColor: WILDFLOWER.accent,
          textColor: WILDFLOWER.ink,
          size: 2.3,
          gap: 1.4,
          fontSize: 10.5,
        }),
        ...detailRow("blw_d_place", "icon_location", "The Glasshouse Garden", {
          x: 5,
          y: 67,
          width: 36,
          aspect: LANDSCAPE,
          iconColor: WILDFLOWER.accent,
          textColor: WILDFLOWER.ink,
          size: 2.3,
          gap: 1.4,
          fontSize: 10.5,
        }),
        ...detailRow("blw_d_gift", "icon_gift", "Books instead of cards", {
          x: 5,
          y: 79,
          width: 36,
          aspect: LANDSCAPE,
          iconColor: WILDFLOWER.accent,
          textColor: WILDFLOWER.ink,
          size: 2.3,
          gap: 1.4,
          fontSize: 10.5,
        }),
        image("blw_d_photo", IMG.nursery, 52, 0, 48, 100, { frame: "square" }),
        image("blw_d_sprig", ART.sprigLeaf, 40, 60, 16, 46, {
          color: "#93A183",
          rotation: 20,
        }),
      ],
      { texture: "cotton", textureOpacity: 26, textureTint: "#F3EBDC", textureBlend: "multiply" },
    ),
    page(
      "Venue",
      "location",
      WILDFLOWER.bg,
      [
        image("blw_v_sprig", ART.sprigThin, 1, 1, 13, 36, { color: "#93A183" }),
        text("blw_v_eyebrow", "FIND THE GARDEN", 5, 44, 34, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3,
          fontWeight: "bold",
          color: WILDFLOWER.accent,
          textAlign: "left",
        }),
        text("blw_v_venue", "The Glasshouse\nGarden", 5, 53, 42, {
          fontFamily: "instrument-serif",
          fontSize: 28,
          lineHeight: 1.12,
          color: WILDFLOWER.ink,
          textAlign: "left",
        }),
        text("blw_v_addr", "36 Willow Lane, Melbourne VIC 3121", 5, 76, 40, {
          fontFamily: "urbanist",
          fontSize: 10,
          color: WILDFLOWER.muted,
          textAlign: "left",
        }),
        text("blw_v_note", "Gate code 1605 · park along Willow Lane", 5, 84, 40, {
          fontFamily: "urbanist",
          fontSize: 9,
          color: WILDFLOWER.muted,
          textAlign: "left",
        }),
        mapWidget("blw_v_map", {
          x: 51,
          y: 9,
          width: 44,
          height: 82,
          query: "Willow Lane Melbourne Victoria",
          radius: 18,
          label: "Open in Google Maps",
          button: {
            background: WILDFLOWER.accent,
            textColor: WILDFLOWER.onAccent,
            borderColor: WILDFLOWER.accent,
            radius: 999,
          },
        }),
      ],
      { texture: "cotton", textureOpacity: 30, textureTint: "#F3EBDC", textureBlend: "multiply" },
    ),
    page(
      "RSVP",
      "rsvp",
      WILDFLOWER.surface,
      [
        image("blw_r_flower", ART.bloom, -3, 60, 15, 44, { color: "#D8C2C8" }),
        text("blw_r_eyebrow", "A TINY REPLY", 5, 14, 34, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3,
          fontWeight: "bold",
          color: WILDFLOWER.accent,
          textAlign: "left",
        }),
        text("blw_r_title", "Will you join\nthe garden party?", 5, 23, 36, {
          fontFamily: "instrument-serif",
          fontSize: 26,
          lineHeight: 1.14,
          color: WILDFLOWER.ink,
          textAlign: "left",
        }),
        guestName("blw_r_guest", 5, 50, 34, {
          fontFamily: "great-vibes",
          fontSize: 24,
          color: WILDFLOWER.accent,
          textAlign: "left",
        }),
        text("blw_r_note", "Please respond by 1 May", 5, 62, 34, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: WILDFLOWER.muted,
          textAlign: "left",
        }),
        attendWidget("blw_r_attend", {
          x: 44,
          y: 16,
          width: 24,
          height: 22,
          label: "Can you come?",
          yes: "Yes, save me a scone",
          no: "Sending love instead",
          labelColor: WILDFLOWER.ink,
          button: {
            background: WILDFLOWER.accent,
            textColor: WILDFLOWER.onAccent,
            borderColor: WILDFLOWER.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("blw_r_guess", "single_choice", {
          x: 72,
          y: 16,
          width: 24,
          height: 36,
          label: "Your arrival prediction",
          options: [
            { id: "early", label: "Early arrival" },
            { id: "on-time", label: "Right on time" },
            { id: "late", label: "Fashionably late" },
            { id: "secret", label: "Keeping it a secret" },
          ],
          labelColor: WILDFLOWER.ink,
          option: {
            background: WILDFLOWER.bg,
            textColor: WILDFLOWER.ink,
            borderColor: "#DCD2C2",
            borderWidth: 1,
            radius: 999,
          },
        }),
        shortTextWidget("blw_r_wish", {
          x: 44,
          y: 60,
          width: 52,
          height: 14,
          label: "A wish for the little one",
          placeholder: "Write it on the wishing tree…",
          labelColor: WILDFLOWER.ink,
          field: {
            background: WILDFLOWER.bg,
            textColor: WILDFLOWER.ink,
            borderColor: "#DCD2C2",
            borderWidth: 1,
            radius: 999,
          },
        }),
      ],
      { texture: "cotton", textureOpacity: 26, textureTint: "#F3EBDC", textureBlend: "multiply" },
    ),
  ],
};

/* ── Corporate ────────────────────────────────────────────────────────── */

/** Near-black with a mint signal colour - a product launch evening. */
const LAUNCH: Palette = {
  bg: "#0C1614",
  ink: "#FFFFFF",
  muted: "#8FA69C",
  accent: "#5EE0A8",
  onAccent: "#08201A",
  surface: "#132320",
};

const corporateProductLaunch: InvitationTemplate = {
  id: "corporate-product-launch",
  categoryId: "corporate",
  title: "Product Launch",
  description: "Signal-green on near-black with a timed agenda and venue map",
  eventTitle: "Gather 2.0 launch evening",
  venue: {
    name: "Innovation Hub",
    address: "Level 4, 200 Collins St, Melbourne VIC 3000",
  },
  rsvpPrompt: {
    prompt: "Confirm your seat",
    note: "Please RSVP by 1 November",
  },
  pages: [
    page("Cover", "cover", LAUNCH.bg, [
      image("cpl_c_photo", IMG.conference, 0, 0, 100, 62, { frame: "square" }),
      scrim("cpl_c_scrim", 30, 34, "12,22,20", 1),
      shape("cpl_c_bar", "rectangle", 8, 66, 12, 0.7, LAUNCH.accent),
      text("cpl_c_eyebrow", "YOU'RE INVITED", 8, 69, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 4,
        fontWeight: "bold",
        color: LAUNCH.accent,
        textAlign: "left",
      }),
      text("cpl_c_title", "Gather 2.0\nLaunch Evening", 8, 74, 84, {
        fontFamily: "urbanist",
        fontSize: 30,
        fontWeight: "bold",
        lineHeight: 1.12,
        color: LAUNCH.ink,
        textAlign: "left",
      }),
      text("cpl_c_when", "WED 18 NOV  ·  6:30 PM  ·  MELBOURNE", 8, 91, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2,
        fontWeight: "medium",
        color: LAUNCH.muted,
        textAlign: "left",
      }),
    ]),
    page("Agenda", "details", LAUNCH.surface, [
      text("cpl_a_eyebrow", "EVENING AGENDA", 8, 9, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.6,
        fontWeight: "bold",
        color: LAUNCH.accent,
        textAlign: "left",
      }),
      guestName("cpl_a_guest", 8, 13, 84, {
        fontFamily: "urbanist",
        fontSize: 24,
        fontWeight: "bold",
        color: LAUNCH.ink,
        textAlign: "left",
      }),
      text("cpl_a_lead", "your seat is reserved", 8, 20.5, 84, {
        fontFamily: "urbanist",
        fontSize: 10,
        letterSpacing: 1.4,
        color: LAUNCH.muted,
        textAlign: "left",
      }),
      divider("cpl_a_rule1", 8, 27, 84, "#274038"),
      text("cpl_a_t1", "6:30", 8, 29.5, 18, {
        fontFamily: "urbanist",
        fontSize: 12,
        fontWeight: "bold",
        color: LAUNCH.accent,
        textAlign: "left",
      }),
      text("cpl_a_l1", "Doors, drinks & demos", 28, 29.5, 64, {
        fontFamily: "urbanist",
        fontSize: 12,
        color: LAUNCH.ink,
        textAlign: "left",
      }),
      divider("cpl_a_rule2", 8, 37, 84, "#274038"),
      text("cpl_a_t2", "7:00", 8, 39.5, 18, {
        fontFamily: "urbanist",
        fontSize: 12,
        fontWeight: "bold",
        color: LAUNCH.accent,
        textAlign: "left",
      }),
      text("cpl_a_l2", "Welcome keynote", 28, 39.5, 64, {
        fontFamily: "urbanist",
        fontSize: 12,
        color: LAUNCH.ink,
        textAlign: "left",
      }),
      divider("cpl_a_rule3", 8, 47, 84, "#274038"),
      text("cpl_a_t3", "7:30", 8, 49.5, 18, {
        fontFamily: "urbanist",
        fontSize: 12,
        fontWeight: "bold",
        color: LAUNCH.accent,
        textAlign: "left",
      }),
      text("cpl_a_l3", "The product, live", 28, 49.5, 64, {
        fontFamily: "urbanist",
        fontSize: 12,
        color: LAUNCH.ink,
        textAlign: "left",
      }),
      divider("cpl_a_rule4", 8, 57, 84, "#274038"),
      text("cpl_a_t4", "8:15", 8, 59.5, 18, {
        fontFamily: "urbanist",
        fontSize: 12,
        fontWeight: "bold",
        color: LAUNCH.accent,
        textAlign: "left",
      }),
      text("cpl_a_l4", "Networking & late bar", 28, 59.5, 64, {
        fontFamily: "urbanist",
        fontSize: 12,
        color: LAUNCH.ink,
        textAlign: "left",
      }),
      divider("cpl_a_rule5", 8, 67, 84, "#274038"),
      image("cpl_a_photo", IMG.team, 8, 72, 84, 20, { frame: "rounded" }),
    ]),
    page("Venue", "location", LAUNCH.bg, [
      text("cpl_v_eyebrow", "THE VENUE", 8, 9, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.6,
        fontWeight: "bold",
        color: LAUNCH.accent,
        textAlign: "left",
      }),
      text("cpl_v_venue", "Innovation Hub", 8, 13.5, 84, {
        fontFamily: "urbanist",
        fontSize: 26,
        fontWeight: "bold",
        color: LAUNCH.ink,
        textAlign: "left",
      }),
      text("cpl_v_addr", "Level 4, 200 Collins Street\nMelbourne VIC 3000", 8, 21, 84, {
        fontFamily: "urbanist",
        fontSize: 10,
        lineHeight: 1.6,
        color: LAUNCH.muted,
        textAlign: "left",
      }),
      mapWidget("cpl_v_map", {
        x: 8,
        y: 32,
        width: 84,
        height: 45,
        query: "200 Collins Street Melbourne",
        radius: 8,
        label: "Open in Google Maps",
        button: {
          background: LAUNCH.accent,
          textColor: LAUNCH.onAccent,
          borderColor: LAUNCH.accent,
          radius: 8,
        },
      }),
      divider("cpl_v_rule", 8, 81, 84, "#274038"),
      ...detailRow("cpl_v_id", "icon_sparkles", "Photo ID required at reception", {
        x: 8,
        y: 84,
        width: 76,
        aspect: PORTRAIT,
        iconColor: LAUNCH.accent,
        textColor: LAUNCH.muted,
        size: 3.4,
        fontSize: 9.5,
      }),
      ...detailRow("cpl_v_train", "icon_location", "Two minutes from Parliament Station", {
        x: 8,
        y: 89.5,
        width: 76,
        aspect: PORTRAIT,
        iconColor: LAUNCH.accent,
        textColor: LAUNCH.muted,
        size: 3.4,
        fontSize: 9.5,
      }),
    ]),
    page("RSVP", "rsvp", LAUNCH.surface, [
      shape("cpl_r_bar", "rectangle", 0, 0, 100, 1.2, LAUNCH.accent),
      text("cpl_r_eyebrow", "REGISTRATION", 8, 10, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.6,
        fontWeight: "bold",
        color: LAUNCH.accent,
        textAlign: "left",
      }),
      text("cpl_r_title", "Confirm\nyour seat", 8, 14.5, 84, {
        fontFamily: "urbanist",
        fontSize: 30,
        fontWeight: "bold",
        lineHeight: 1.12,
        color: LAUNCH.ink,
        textAlign: "left",
      }),
      text("cpl_r_note", "Seats are limited - please reply by 1 November", 8, 30, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        color: LAUNCH.muted,
        textAlign: "left",
      }),
      attendWidget("cpl_r_attend", {
        x: 8,
        y: 35,
        width: 84,
        height: 14,
        label: "",
        yes: "I'll attend",
        no: "Unable to attend",
        labelColor: LAUNCH.ink,
        button: {
          background: LAUNCH.accent,
          textColor: LAUNCH.onAccent,
          borderColor: LAUNCH.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 8,
        },
      }),
      choiceWidget("cpl_r_role", "single_choice", {
        x: 8,
        y: 51,
        width: 84,
        height: 29,
        label: "You're joining as",
        options: [
          { id: "press", label: "Press" },
          { id: "partner", label: "Partner" },
          { id: "customer", label: "Customer" },
          { id: "team", label: "Team" },
        ],
        labelColor: LAUNCH.ink,
        option: {
          background: LAUNCH.bg,
          textColor: LAUNCH.ink,
          borderColor: "#274038",
          borderWidth: 1,
          radius: 8,
        },
        required: true,
      }),
      shortTextWidget("cpl_r_diet", {
        x: 8,
        y: 82,
        width: 84,
        height: 12,
        label: "Dietary requirements",
        placeholder: "Anything the caterer should know?",
        labelColor: LAUNCH.ink,
        field: {
          background: LAUNCH.bg,
          textColor: LAUNCH.ink,
          borderColor: "#274038",
          borderWidth: 1,
          radius: 8,
        },
      }),
    ]),
  ],
};

/** Deep forest green and warm cream - an understated annual dinner. */
const TEAM: Palette = {
  bg: "#F6F3EC",
  ink: "#17281F",
  muted: "#6C7A6F",
  accent: "#2F5C43",
  onAccent: "#F6F3EC",
  surface: "#FFFFFF",
};

const corporateTeamDinner: InvitationTemplate = {
  id: "corporate-team-dinner",
  categoryId: "corporate",
  title: "Team Dinner",
  description: "Forest green and cream for an understated annual dinner",
  eventTitle: "The annual team dinner",
  venue: { name: "Ember Restaurant", address: "Flinders Lane, Melbourne VIC" },
  rsvpPrompt: {
    prompt: "Will you join us?",
    note: "Please RSVP by 1 November",
  },
  pages: [
    page(
      "Cover",
      "cover",
      TEAM.bg,
      [
        shape("ctd_c_panel", "rectangle", 0, 0, 100, 46, TEAM.accent),
        image("ctd_c_photo", IMG.dinner, 0, 0, 100, 46, {
          frame: "square",
          scale: 1,
        }),
        scrim("ctd_c_scrim", 22, 24, "23,40,31", 0.9),
        text("ctd_c_eyebrow", "THE ANNUAL DINNER", 8, 52, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 4,
          fontWeight: "bold",
          color: TEAM.accent,
        }),
        text("ctd_c_title", "Together\nat the table", 8, 57, 84, {
          fontFamily: "instrument-serif",
          fontSize: 40,
          lineHeight: 1.08,
          color: TEAM.ink,
        }),
        divider("ctd_c_rule", 40, 78, 20, TEAM.accent),
        text("ctd_c_when", "FRIDAY 21 NOVEMBER  ·  7 PM", 8, 81, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 2.4,
          fontWeight: "bold",
          color: TEAM.ink,
        }),
        text("ctd_c_where", "EMBER RESTAURANT  ·  FLINDERS LANE", 8, 86, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 2.2,
          fontWeight: "medium",
          color: TEAM.muted,
        }),
      ],
      { texture: "linen", textureOpacity: 24, textureBlend: "multiply" },
    ),
    page("Evening", "details", TEAM.accent, [
      guestName("ctd_e_guest", 8, 10, 84, {
        fontFamily: "instrument-serif",
        fontSize: 30,
        color: "#F6F3EC",
      }),
      text("ctd_e_lead", "a seat has been saved for you", 8, 18.5, 84, {
        fontFamily: "urbanist",
        fontSize: 10.5,
        letterSpacing: 1.2,
        color: "#A9C0AF",
      }),
      shape("ctd_e_card", "rounded_square", 10, 26, 80, 32, "#1B3529", {
        borderColor: "#4C7A60",
        borderWidth: 1,
      }),
      ...detailRow("ctd_e_date", "icon_calendar", "Friday, 21 November", {
        x: 17,
        y: 30.5,
        width: 66,
        aspect: PORTRAIT,
        iconColor: "#8CD3AA",
        textColor: "#FFFFFF",
        size: 3.8,
        fontSize: 11,
      }),
      ...detailRow("ctd_e_time", "icon_clock", "Drinks 7 pm, seated 7:30", {
        x: 17,
        y: 37,
        width: 66,
        aspect: PORTRAIT,
        iconColor: "#8CD3AA",
        textColor: "#FFFFFF",
        size: 3.8,
        fontSize: 11,
      }),
      ...detailRow("ctd_e_menu", "icon_wine", "Three courses & open bar", {
        x: 17,
        y: 43.5,
        width: 66,
        aspect: PORTRAIT,
        iconColor: "#8CD3AA",
        textColor: "#FFFFFF",
        size: 3.8,
        fontSize: 11,
      }),
      ...detailRow("ctd_e_dress", "icon_ribbon", "Smart casual", {
        x: 17,
        y: 50,
        width: 66,
        aspect: PORTRAIT,
        iconColor: "#8CD3AA",
        textColor: "#FFFFFF",
        size: 3.8,
        fontSize: 11,
      }),
      image("ctd_e_photo", IMG.tablescape, 10, 62, 80, 26, { frame: "rounded" }),
      text("ctd_e_note", "awards & a toast to the year", 8, 91, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 1.6,
        color: "#A9C0AF",
      }),
    ]),
    page(
      "Venue",
      "location",
      TEAM.bg,
      [
        text("ctd_v_eyebrow", "THE RESTAURANT", 8, 9, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.6,
          fontWeight: "bold",
          color: TEAM.accent,
        }),
        text("ctd_v_venue", "Ember Restaurant", 8, 13.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 30,
          color: TEAM.ink,
        }),
        text("ctd_v_addr", "Flinders Lane · Melbourne VIC 3000", 8, 22.5, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: TEAM.muted,
        }),
        mapWidget("ctd_v_map", {
          x: 8,
          y: 29,
          width: 84,
          height: 47,
          query: "Flinders Lane Melbourne",
          radius: 12,
          label: "Open in Google Maps",
          button: {
            background: TEAM.accent,
            textColor: TEAM.onAccent,
            borderColor: TEAM.accent,
            radius: 999,
          },
        }),
        divider("ctd_v_rule", 8, 80, 84, "#D5D0C3"),
        ...detailRow("ctd_v_taxi", "icon_location", "Taxi rank on Flinders Street", {
          x: 10,
          y: 83.5,
          width: 74,
          aspect: PORTRAIT,
          iconColor: TEAM.accent,
          textColor: TEAM.muted,
          size: 3.4,
          fontSize: 9.5,
        }),
        ...detailRow("ctd_v_time", "icon_clock", "Kitchen closes at 10:30 pm", {
          x: 10,
          y: 89,
          width: 74,
          aspect: PORTRAIT,
          iconColor: TEAM.accent,
          textColor: TEAM.muted,
          size: 3.4,
          fontSize: 9.5,
        }),
      ],
      { texture: "linen", textureOpacity: 24, textureBlend: "multiply" },
    ),
    page(
      "RSVP",
      "rsvp",
      TEAM.bg,
      [
        text("ctd_r_eyebrow", "TEAM DINNER", 8, 10, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.6,
          fontWeight: "bold",
          color: TEAM.accent,
        }),
        text("ctd_r_title", "Will you join us?", 8, 14.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 32,
          color: TEAM.ink,
        }),
        text("ctd_r_note", "Numbers to the venue by 1 November", 8, 24, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: TEAM.muted,
        }),
        attendWidget("ctd_r_attend", {
          x: 12,
          y: 29,
          width: 76,
          height: 14,
          label: "",
          yes: "Yes, count me in",
          no: "I can't make it",
          labelColor: TEAM.ink,
          button: {
            background: TEAM.accent,
            textColor: TEAM.onAccent,
            borderColor: TEAM.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("ctd_r_meal", "single_choice", {
          x: 12,
          y: 45,
          width: 76,
          height: 29,
          label: "Main course preference",
          options: [
            { id: "beef", label: "Dry-aged beef" },
            { id: "fish", label: "Market fish" },
            { id: "veg", label: "Vegetarian" },
            { id: "vegan", label: "Vegan" },
          ],
          labelColor: TEAM.ink,
          option: {
            background: TEAM.surface,
            textColor: TEAM.ink,
            borderColor: "#D5D0C3",
            borderWidth: 1,
            radius: 999,
          },
          required: true,
        }),
        shortTextWidget("ctd_r_diet", {
          x: 12,
          y: 77,
          width: 76,
          height: 12,
          label: "Allergies or dietary needs",
          placeholder: "Let the kitchen know…",
          labelColor: TEAM.ink,
          field: {
            background: TEAM.surface,
            textColor: TEAM.ink,
            borderColor: "#D5D0C3",
            borderWidth: 1,
            radius: 999,
          },
        }),
      ],
      { texture: "linen", textureOpacity: 24, textureBlend: "multiply" },
    ),
  ],
};

/** Paper white, ink and a single electric blue - conference systems design. */
const SUMMIT: Palette = {
  bg: "#F1F3F5",
  ink: "#101418",
  muted: "#61707C",
  accent: "#1F5AE0",
  onAccent: "#FFFFFF",
  surface: "#FFFFFF",
};

const corporateConference: InvitationTemplate = {
  id: "corporate-conference",
  categoryId: "corporate",
  title: "Conference Summit",
  description: "Grid-built summit invite with a two-day schedule and delegate RSVP",
  eventTitle: "Designing Moments summit",
  venue: {
    name: "Melbourne Convention Centre",
    address: "1 Convention Centre Pl, South Wharf VIC",
  },
  rsvpPrompt: {
    prompt: "Join us at the summit?",
    note: "Register by 1 October",
  },
  pages: [
    page(
      "Cover",
      "cover",
      SUMMIT.bg,
      [
        shape("cc_c_block", "rectangle", 0, 0, 100, 8, SUMMIT.accent),
        text("cc_c_eyebrow", "SUMMIT 2027", 8, 15, 84, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 5,
          fontWeight: "bold",
          color: SUMMIT.accent,
          textAlign: "left",
        }),
        text("cc_c_title", "Designing\nMoments", 8, 21, 84, {
          fontFamily: "urbanist",
          fontSize: 44,
          fontWeight: "bold",
          lineHeight: 1.02,
          color: SUMMIT.ink,
          textAlign: "left",
        }),
        image("cc_c_photo", IMG.speaker, 8, 42, 84, 30, { frame: "square" }),
        divider("cc_c_rule", 8, 76, 84, "#C9D2DA"),
        text("cc_c_l1", "TWO DAYS", 8, 79, 28, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 1.8,
          fontWeight: "bold",
          color: SUMMIT.ink,
          textAlign: "left",
        }),
        text("cc_c_l2", "12 KEYNOTES", 36, 79, 28, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 1.8,
          fontWeight: "bold",
          color: SUMMIT.ink,
          textAlign: "left",
        }),
        text("cc_c_l3", "6 WORKSHOPS", 64, 79, 30, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 1.8,
          fontWeight: "bold",
          color: SUMMIT.ink,
          textAlign: "left",
        }),
        divider("cc_c_rule2", 8, 84, 84, "#C9D2DA"),
        text("cc_c_when", "14-15 OCTOBER  ·  SOUTH WHARF, MELBOURNE", 8, 87.5, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 1.2,
          lineHeight: 1.5,
          color: SUMMIT.muted,
          textAlign: "left",
        }),
      ],
      { pattern: "grid" },
    ),
    page("Schedule", "details", SUMMIT.surface, [
      text("cc_s_eyebrow", "DAY ONE", 8, 9, 40, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.6,
        fontWeight: "bold",
        color: SUMMIT.accent,
        textAlign: "left",
      }),
      guestName("cc_s_guest", 8, 13, 84, {
        fontFamily: "urbanist",
        fontSize: 24,
        fontWeight: "bold",
        color: SUMMIT.ink,
        textAlign: "left",
      }),
      text("cc_s_lead", "delegate pass · all sessions included", 8, 20.5, 84, {
        fontFamily: "urbanist",
        fontSize: 10,
        color: SUMMIT.muted,
        textAlign: "left",
      }),
      shape("cc_s_card", "rounded_square", 8, 27, 84, 42, SUMMIT.bg),
      text("cc_s_t1", "09:00", 13, 31, 20, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: SUMMIT.accent,
        textAlign: "left",
      }),
      text("cc_s_l1", "Registration & coffee", 32, 31, 56, {
        fontFamily: "urbanist",
        fontSize: 11,
        color: SUMMIT.ink,
        textAlign: "left",
      }),
      text("cc_s_t2", "10:00", 13, 39, 20, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: SUMMIT.accent,
        textAlign: "left",
      }),
      text("cc_s_l2", "Opening keynote", 32, 39, 56, {
        fontFamily: "urbanist",
        fontSize: 11,
        color: SUMMIT.ink,
        textAlign: "left",
      }),
      text("cc_s_t3", "13:00", 13, 47, 20, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: SUMMIT.accent,
        textAlign: "left",
      }),
      text("cc_s_l3", "Breakout sessions", 32, 47, 56, {
        fontFamily: "urbanist",
        fontSize: 11,
        color: SUMMIT.ink,
        textAlign: "left",
      }),
      text("cc_s_t4", "16:30", 13, 55, 20, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: SUMMIT.accent,
        textAlign: "left",
      }),
      text("cc_s_l4", "Closing panel", 32, 55, 56, {
        fontFamily: "urbanist",
        fontSize: 11,
        color: SUMMIT.ink,
        textAlign: "left",
      }),
      text("cc_s_t5", "18:00", 13, 63, 20, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: SUMMIT.accent,
        textAlign: "left",
      }),
      text("cc_s_l5", "Networking dinner", 32, 63, 56, {
        fontFamily: "urbanist",
        fontSize: 11,
        color: SUMMIT.ink,
        textAlign: "left",
      }),
      image("cc_s_photo", IMG.workshop, 8, 73, 84, 19, { frame: "rounded" }),
    ]),
    page(
      "Venue",
      "location",
      SUMMIT.bg,
      [
        shape("cc_v_block", "rectangle", 0, 0, 100, 8, SUMMIT.accent),
        text("cc_v_eyebrow", "GETTING THERE", 8, 13, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.6,
          fontWeight: "bold",
          color: SUMMIT.accent,
          textAlign: "left",
        }),
        text("cc_v_venue", "Melbourne\nConvention Centre", 8, 17.5, 84, {
          fontFamily: "urbanist",
          fontSize: 24,
          fontWeight: "bold",
          lineHeight: 1.1,
          color: SUMMIT.ink,
          textAlign: "left",
        }),
        text("cc_v_addr", "1 Convention Centre Place · South Wharf VIC", 8, 28, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: SUMMIT.muted,
          textAlign: "left",
        }),
        mapWidget("cc_v_map", {
          x: 8,
          y: 34,
          width: 84,
          height: 44,
          query: "Melbourne Convention and Exhibition Centre",
          radius: 8,
          label: "Open in Google Maps",
          button: {
            background: SUMMIT.ink,
            textColor: "#FFFFFF",
            borderColor: SUMMIT.ink,
            radius: 8,
          },
        }),
        divider("cc_v_rule", 8, 82, 84, "#C9D2DA"),
        ...detailRow("cc_v_tram", "icon_location", "Tram 96 or 109 to Casino East", {
          x: 8,
          y: 85,
          width: 76,
          aspect: PORTRAIT,
          iconColor: SUMMIT.accent,
          textColor: SUMMIT.muted,
          size: 3.4,
          fontSize: 9.5,
        }),
        ...detailRow("cc_v_park", "icon_sparkles", "Discounted parking with your pass", {
          x: 8,
          y: 90.5,
          width: 76,
          aspect: PORTRAIT,
          iconColor: SUMMIT.accent,
          textColor: SUMMIT.muted,
          size: 3.4,
          fontSize: 9.5,
        }),
      ],
      { pattern: "grid" },
    ),
    page("RSVP", "rsvp", SUMMIT.surface, [
      shape("cc_r_block", "rectangle", 0, 0, 100, 8, SUMMIT.accent),
      text("cc_r_eyebrow", "DELEGATE REGISTRATION", 8, 13, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3,
        fontWeight: "bold",
        color: SUMMIT.accent,
        textAlign: "left",
      }),
      text("cc_r_title", "Join us at\nthe summit?", 8, 17.5, 84, {
        fontFamily: "urbanist",
        fontSize: 26,
        fontWeight: "bold",
        lineHeight: 1.12,
        color: SUMMIT.ink,
        textAlign: "left",
      }),
      text("cc_r_note", "Register by 1 October - passes are transferable", 8, 30, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        color: SUMMIT.muted,
        textAlign: "left",
      }),
      // Attendance drives the Going / Not going counts in the event hub, so
      // every RSVP page leads with a yes / no question.
      attendWidget("cc_r_attend", {
        x: 8,
        y: 35,
        width: 84,
        height: 13,
        label: "",
        yes: "Register my pass",
        no: "Unable to attend",
        labelColor: SUMMIT.ink,
        button: {
          background: SUMMIT.accent,
          textColor: SUMMIT.onAccent,
          borderColor: SUMMIT.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 8,
        },
      }),
      choiceWidget("cc_r_days", "multi_choice", {
        x: 8,
        y: 51,
        width: 84,
        height: 24,
        label: "Which days will you join?",
        options: [
          { id: "day1", label: "Day 1 - Keynotes" },
          { id: "day2", label: "Day 2 - Workshops" },
          { id: "dinner", label: "Networking dinner" },
        ],
        labelColor: SUMMIT.ink,
        option: {
          background: SUMMIT.bg,
          textColor: SUMMIT.ink,
          borderColor: "#C9D2DA",
          borderWidth: 1,
          radius: 8,
        },
        required: true,
      }),
      shortTextWidget("cc_r_company", {
        x: 8,
        y: 78,
        width: 84,
        height: 12,
        label: "Company / organisation",
        placeholder: "Where you're joining from",
        labelColor: SUMMIT.ink,
        field: {
          background: SUMMIT.bg,
          textColor: SUMMIT.ink,
          borderColor: "#C9D2DA",
          borderWidth: 1,
          radius: 8,
        },
      }),
    ]),
  ],
};

/** Black, signal pink and a hard grid - a one-day industry forum. */
const FORUM: Palette = {
  bg: "#0B0B0C",
  ink: "#FFFFFF",
  muted: "#9A9AA0",
  accent: "#FF60AA",
  onAccent: "#2A0518",
  surface: "#F2F2F3",
};

const corporateFutureForum: InvitationTemplate = {
  id: "corporate-future-forum-landscape",
  categoryId: "corporate",
  title: "Future Forum",
  description: "High-contrast conference identity with a four-track programme",
  eventTitle: "Future Forum 27",
  shape: "landscape",
  venue: {
    name: "Northbank Exchange",
    address: "1 Harbour Esplanade, Docklands VIC",
  },
  rsvpPrompt: {
    prompt: "Build your forum day",
    note: "Registration closes 1 September",
  },
  pages: [
    page("Cover", "cover", FORUM.bg, [
      shape("cff_c_panel", "rounded_square", 3, 6, 40, 88, FORUM.accent),
      shape("cff_c_dot", "circle", 31, 10, 8, 14.2, FORUM.bg),
      text("cff_c_eyebrow", "GATHER PRESENTS", 7, 15, 30, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.2,
        fontWeight: "bold",
        color: FORUM.onAccent,
        textAlign: "left",
      }),
      text("cff_c_title", "FUTURE\nFORUM 27", 7, 34, 34, {
        fontFamily: "urbanist",
        fontSize: 34,
        fontWeight: "bold",
        lineHeight: 1.06,
        color: "#FFFFFF",
        textAlign: "left",
      }),
      text("cff_c_tags", "IDEAS · PEOPLE · MOMENTUM", 7, 74, 34, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 2,
        fontWeight: "bold",
        color: FORUM.onAccent,
        textAlign: "left",
      }),
      text("cff_c_when", "14 SEPTEMBER · MELBOURNE", 7, 81, 34, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 2,
        fontWeight: "bold",
        color: FORUM.onAccent,
        textAlign: "left",
      }),
      image("cff_c_photo", IMG.conference, 46, 6, 51, 88, { frame: "rounded" }),
    ]),
    page("Programme", "details", FORUM.surface, [
      text("cff_p_eyebrow", "THE PROGRAMME", 5, 11, 34, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.2,
        fontWeight: "bold",
        color: "#B0136A",
        textAlign: "left",
      }),
      text("cff_p_title", "One day.\nFour tracks.", 5, 20, 34, {
        fontFamily: "urbanist",
        fontSize: 30,
        fontWeight: "bold",
        lineHeight: 1.08,
        color: "#0B0B0C",
        textAlign: "left",
      }),
      guestName("cff_p_guest", 5, 58, 34, {
        fontFamily: "urbanist",
        fontSize: 15,
        fontWeight: "bold",
        letterSpacing: 1,
        color: "#0B0B0C",
        textAlign: "left",
      }),
      text("cff_p_pass", "DELEGATE PASS · ALL TRACKS", 5, 70, 34, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 2,
        fontWeight: "bold",
        color: "#6D6D74",
        textAlign: "left",
      }),
      divider("cff_p_v1", 42, 12, 26, "#0B0B0C"),
      text("cff_p_t1", "09:00", 42, 16, 24, {
        fontFamily: "urbanist",
        fontSize: 10,
        fontWeight: "bold",
        color: "#B0136A",
        textAlign: "left",
      }),
      text("cff_p_l1", "OPENING SIGNAL", 42, 24, 26, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        letterSpacing: 0.6,
        color: "#0B0B0C",
        textAlign: "left",
      }),
      divider("cff_p_v2", 42, 46, 26, "#C9C9CE"),
      text("cff_p_t2", "10:30", 42, 50, 24, {
        fontFamily: "urbanist",
        fontSize: 10,
        fontWeight: "bold",
        color: "#B0136A",
        textAlign: "left",
      }),
      text("cff_p_l2", "DESIGNING TRUST", 42, 58, 26, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        letterSpacing: 0.6,
        color: "#0B0B0C",
        textAlign: "left",
      }),
      divider("cff_p_v3", 71, 12, 26, "#0B0B0C"),
      text("cff_p_t3", "13:00", 71, 16, 24, {
        fontFamily: "urbanist",
        fontSize: 10,
        fontWeight: "bold",
        color: "#B0136A",
        textAlign: "left",
      }),
      text("cff_p_l3", "THE HUMAN SYSTEM", 71, 24, 26, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        letterSpacing: 0.6,
        color: "#0B0B0C",
        textAlign: "left",
      }),
      divider("cff_p_v4", 71, 46, 26, "#C9C9CE"),
      text("cff_p_t4", "15:00", 71, 50, 24, {
        fontFamily: "urbanist",
        fontSize: 10,
        fontWeight: "bold",
        color: "#B0136A",
        textAlign: "left",
      }),
      text("cff_p_l4", "BUILDING WHAT'S NEXT", 71, 58, 26, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        letterSpacing: 0.6,
        color: "#0B0B0C",
        textAlign: "left",
      }),
      image("cff_p_photo", IMG.workshop, 42, 72, 55, 22, { frame: "rounded" }),
    ]),
    page("Venue", "location", FORUM.bg, [
      shape("cff_v_bar", "rectangle", 0, 0, 100, 2, FORUM.accent),
      text("cff_v_eyebrow", "THE VENUE", 5, 14, 34, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.2,
        fontWeight: "bold",
        color: FORUM.accent,
        textAlign: "left",
      }),
      text("cff_v_venue", "Northbank\nExchange", 5, 23, 40, {
        fontFamily: "urbanist",
        fontSize: 30,
        fontWeight: "bold",
        lineHeight: 1.08,
        color: "#FFFFFF",
        textAlign: "left",
      }),
      text("cff_v_addr", "1 Harbour Esplanade\nDocklands VIC 3008", 5, 54, 36, {
        fontFamily: "urbanist",
        fontSize: 10.5,
        lineHeight: 1.6,
        color: FORUM.muted,
        textAlign: "left",
      }),
      ...detailRow("cff_v_note", "icon_sparkles", "Doors 08:30 · badge on arrival", {
        x: 5,
        y: 78,
        width: 38,
        aspect: LANDSCAPE,
        iconColor: FORUM.accent,
        textColor: FORUM.muted,
        size: 2.2,
        gap: 1.4,
        fontSize: 9.5,
      }),
      mapWidget("cff_v_map", {
        x: 49,
        y: 10,
        width: 46,
        height: 80,
        query: "1 Harbour Esplanade Docklands Victoria",
        radius: 8,
        label: "Open in Google Maps",
        button: {
          background: FORUM.accent,
          textColor: FORUM.onAccent,
          borderColor: FORUM.accent,
          radius: 8,
        },
      }),
    ]),
    page("RSVP", "rsvp", FORUM.bg, [
      shape("cff_r_panel", "rectangle", 0, 0, 38, 100, FORUM.accent),
      text("cff_r_eyebrow", "DELEGATE REGISTRATION", 5, 16, 30, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 2.4,
        fontWeight: "bold",
        color: FORUM.onAccent,
        textAlign: "left",
      }),
      text("cff_r_title", "Build your\nforum day", 5, 26, 32, {
        fontFamily: "urbanist",
        fontSize: 28,
        fontWeight: "bold",
        lineHeight: 1.08,
        color: "#FFFFFF",
        textAlign: "left",
      }),
      text("cff_r_note", "Registration closes 1 September", 5, 78, 30, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 1.2,
        fontWeight: "bold",
        color: FORUM.onAccent,
        textAlign: "left",
      }),
      attendWidget("cff_r_attend", {
        x: 43,
        y: 14,
        width: 24,
        height: 22,
        label: "Your place",
        yes: "Reserve my place",
        no: "Not this year",
        labelColor: "#FFFFFF",
        button: {
          background: FORUM.accent,
          textColor: FORUM.onAccent,
          borderColor: FORUM.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 6,
        },
      }),
      choiceWidget("cff_r_tracks", "multi_choice", {
        x: 71,
        y: 14,
        width: 25,
        height: 36,
        label: "Choose your tracks",
        options: [
          { id: "design", label: "Designing trust" },
          { id: "people", label: "Human systems" },
          { id: "future", label: "What's next" },
          { id: "studio", label: "Prototype studio" },
        ],
        labelColor: "#FFFFFF",
        option: {
          background: "#1A1A1C",
          textColor: "#FFFFFF",
          borderColor: "#33333A",
          borderWidth: 1,
          radius: 6,
        },
      }),
      shortTextWidget("cff_r_company", {
        x: 43,
        y: 58,
        width: 53,
        height: 14,
        label: "Company / organisation",
        placeholder: "Where you're joining from",
        labelColor: "#FFFFFF",
        field: {
          background: "#1A1A1C",
          textColor: "#FFFFFF",
          borderColor: "#33333A",
          borderWidth: 1,
          radius: 6,
        },
      }),
      shortTextWidget("cff_r_access", {
        x: 43,
        y: 76,
        width: 53,
        height: 14,
        label: "Access or dietary requirements",
        placeholder: "Anything we should arrange?",
        labelColor: "#FFFFFF",
        field: {
          background: "#1A1A1C",
          textColor: "#FFFFFF",
          borderColor: "#33333A",
          borderWidth: 1,
          radius: 6,
        },
      }),
    ]),
  ],
};

/* ── Dinner & gathering ───────────────────────────────────────────────── */

/** Candlelight, warm paper and a hand-written menu. */
const SUPPER: Palette = {
  bg: "#F7F1E8",
  ink: "#2A2118",
  muted: "#857766",
  accent: "#A2643C",
  onAccent: "#FDF8F1",
  surface: "#FFFDF9",
};

const dinnerIntimateSupper: InvitationTemplate = {
  id: "dinner-intimate-supper",
  categoryId: "dinner",
  title: "Intimate Supper",
  description: "Candlelit paper, a written menu, and a small table for eight",
  eventTitle: "Dinner at ours",
  venue: { name: "48 Olive Street", address: "Apartment 3B, Carlton VIC" },
  rsvpPrompt: {
    prompt: "Can we set a place for you?",
    note: "Please RSVP by Thursday",
  },
  pages: [
    page(
      "Cover",
      "cover",
      SUPPER.bg,
      [
        image("dis_c_photo", IMG.dinner, 10, 6, 80, 34, {
          frame: "arch",
          effects: lift(5, 14, 70),
        }),
        text("dis_c_eyebrow", "DINNER FOR EIGHT", 8, 46, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 4.4,
          fontWeight: "bold",
          color: SUPPER.accent,
        }),
        text("dis_c_title", "An evening\nat ours", 8, 51, 84, {
          fontFamily: "instrument-serif",
          fontSize: 42,
          lineHeight: 1.06,
          color: SUPPER.ink,
        }),
        text("dis_c_body", "six courses · conversation · candlelight", 8, 71, 84, {
          fontFamily: "forum",
          fontSize: 12,
          color: SUPPER.muted,
        }),
        divider("dis_c_rule", 40, 78, 20, "#D5BFA4"),
        text("dis_c_when", "SATURDAY  ·  7:30 PM", 8, 81, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 2.8,
          fontWeight: "bold",
          color: SUPPER.ink,
        }),
        text("dis_c_where", "48 OLIVE STREET, APT 3B", 8, 86, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 2.4,
          color: SUPPER.muted,
        }),
      ],
      {
        texture: "handmade",
        textureOpacity: 40,
        textureTint: "#EFE0CB",
        textureBlend: "multiply",
        border: { style: "solid", color: "#DFCDB4", width: 5 },
      },
    ),
    page(
      "The menu",
      "details",
      SUPPER.ink,
      [
        guestName("dis_m_guest", 8, 9, 84, {
          fontFamily: "great-vibes",
          fontSize: 28,
          color: "#E0B287",
        }),
        text("dis_m_lead", "there's a place for you at the table", 8, 17, 84, {
          fontFamily: "forum",
          fontSize: 11.5,
          color: "#B5A695",
        }),
        divider("dis_m_rule1", 40, 24, 20, "#5A4A38", "diamond"),
        text("dis_m_title", "On the table", 8, 28, 84, {
          fontFamily: "instrument-serif",
          fontSize: 26,
          color: "#FFFFFF",
        }),
        text(
          "dis_m_menu",
          "Oysters & buttered rye\nSlow-cooked leek, hazelnut\nWood-roasted duck, quince\nWashed-rind cheese\nBurnt honey tart\nDigestif by the fire",
          8,
          38,
          84,
          {
            fontFamily: "forum",
            fontSize: 12.5,
            lineHeight: 2,
            color: "#F0E5D6",
          },
        ),
        divider("dis_m_rule2", 40, 76, 20, "#5A4A38", "diamond"),
        ...detailRow("dis_m_time", "icon_clock", "Arrive 7:30, we sit at 8", {
          x: 22,
          y: 81,
          width: 62,
          aspect: PORTRAIT,
          iconColor: "#E0B287",
          textColor: "#F0E5D6",
          size: 3.6,
          fontSize: 10.5,
        }),
        ...detailRow("dis_m_wine", "icon_wine", "Bring a bottle you love", {
          x: 22,
          y: 87,
          width: 62,
          aspect: PORTRAIT,
          iconColor: "#E0B287",
          textColor: "#F0E5D6",
          size: 3.6,
          fontSize: 10.5,
        }),
      ],
    ),
    page(
      "Venue",
      "location",
      SUPPER.bg,
      [
        text("dis_v_eyebrow", "COME TO OURS", 8, 10, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.6,
          fontWeight: "bold",
          color: SUPPER.accent,
        }),
        text("dis_v_venue", "48 Olive Street", 8, 14.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 30,
          color: SUPPER.ink,
        }),
        text("dis_v_addr", "Apartment 3B · Carlton VIC 3053", 8, 23.5, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: SUPPER.muted,
        }),
        mapWidget("dis_v_map", {
          x: 8,
          y: 30,
          width: 84,
          height: 46,
          query: "Carlton Melbourne Victoria",
          radius: 14,
          label: "Open in Google Maps",
          button: {
            background: SUPPER.accent,
            textColor: SUPPER.onAccent,
            borderColor: SUPPER.accent,
            radius: 999,
          },
        }),
        divider("dis_v_rule", 34, 80, 32, "#D5BFA4", "diamond"),
        text(
          "dis_v_note",
          "Buzz 3B and come straight up · street parking\nafter 7 pm · the cat is friendly, the stairs are steep",
          8,
          84,
          84,
          {
            fontFamily: "forum",
            fontSize: 10.5,
            lineHeight: 1.6,
            color: SUPPER.muted,
          },
        ),
      ],
      {
        texture: "handmade",
        textureOpacity: 40,
        textureTint: "#EFE0CB",
        textureBlend: "multiply",
      },
    ),
    page(
      "RSVP",
      "rsvp",
      SUPPER.bg,
      [
        text("dis_r_eyebrow", "SUPPER", 8, 10, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 5,
          fontWeight: "bold",
          color: SUPPER.accent,
        }),
        text("dis_r_title", "Can we set\na place for you?", 8, 14.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 28,
          lineHeight: 1.12,
          color: SUPPER.ink,
        }),
        text("dis_r_note", "Eight seats only - please reply by Thursday", 8, 28, 84, {
          fontFamily: "forum",
          fontSize: 11,
          color: SUPPER.muted,
        }),
        attendWidget("dis_r_attend", {
          x: 12,
          y: 33,
          width: 76,
          height: 14,
          label: "",
          yes: "Yes, I'll come",
          no: "I can't this time",
          labelColor: SUPPER.ink,
          button: {
            background: SUPPER.accent,
            textColor: SUPPER.onAccent,
            borderColor: SUPPER.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("dis_r_allergies", "multi_choice", {
          x: 12,
          y: 49,
          width: 76,
          height: 41,
          label: "Anything the kitchen should know?",
          options: [
            { id: "shellfish", label: "Shellfish" },
            { id: "nuts", label: "Nuts" },
            { id: "sesame", label: "Sesame" },
            { id: "dairy", label: "Dairy" },
            { id: "gluten", label: "Gluten" },
            { id: "none", label: "Nothing at all" },
          ],
          labelColor: SUPPER.ink,
          option: {
            background: SUPPER.surface,
            textColor: SUPPER.ink,
            borderColor: "#E0D0B8",
            borderWidth: 1,
            radius: 999,
          },
        }),
      ],
      {
        texture: "handmade",
        textureOpacity: 40,
        textureTint: "#EFE0CB",
        textureBlend: "multiply",
      },
    ),
  ],
};

/** Sun-bleached greens for a long lunch on the lawn. */
const GARDEN: Palette = {
  bg: "#F1F5EC",
  ink: "#243528",
  muted: "#6E8069",
  accent: "#436B45",
  onAccent: "#F4F8EF",
  surface: "#FFFFFF",
};

const dinnerGardenParty: InvitationTemplate = {
  id: "dinner-garden-party",
  categoryId: "dinner",
  title: "Garden Party",
  description: "Lawn greens and long-table dining with a find-us map",
  eventTitle: "Garden gathering",
  venue: { name: "Riverview Gardens", address: "12 River Bend Road, Kew VIC" },
  rsvpPrompt: {
    prompt: "Joining us on the lawn?",
    note: "RSVP by Friday",
  },
  pages: [
    page(
      "Cover",
      "cover",
      GARDEN.bg,
      [
        image("dgp_c_photo", IMG.gardenTable, 0, 0, 100, 56, { frame: "square" }),
        scrim("dgp_c_scrim", 34, 22, "36,53,40", 0.75),
        image("dgp_c_sprig", ART.spray, 66, 55, 40, 17, {
          color: "#7E9576",
        }),
        text("dgp_c_eyebrow", "A LONG LUNCH ON THE LAWN", 8, 62, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: GARDEN.accent,
        }),
        text("dgp_c_title", "Garden\nGathering", 8, 66.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 40,
          lineHeight: 1.06,
          color: GARDEN.ink,
        }),
        divider("dgp_c_rule", 40, 84, 20, GARDEN.accent),
        text("dgp_c_when", "SUNDAY  ·  FROM 5 PM", 8, 87, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 2.6,
          fontWeight: "bold",
          color: GARDEN.ink,
        }),
      ],
      { texture: "cotton", textureOpacity: 24, textureBlend: "multiply" },
    ),
    page(
      "Invitation",
      "details",
      GARDEN.surface,
      [
        shape("dgp_i_top", "rectangle", 0, 0, 100, 10, GARDEN.accent),
        guestName("dgp_i_guest", 8, 14, 84, {
          fontFamily: "great-vibes",
          fontSize: 28,
          color: GARDEN.accent,
        }),
        text("dgp_i_lead", "drinks on the lawn, dinner under the lights", 8, 23, 84, {
          fontFamily: "forum",
          fontSize: 11.5,
          color: GARDEN.muted,
        }),
        shape("dgp_i_card", "rounded_square", 10, 30, 80, 32, GARDEN.bg),
        ...detailRow("dgp_i_1", "icon_clock", "5:00  Lawn games & spritz", {
          x: 17,
          y: 34.5,
          width: 66,
          aspect: PORTRAIT,
          iconColor: GARDEN.accent,
          textColor: GARDEN.ink,
          size: 3.8,
          fontSize: 11,
        }),
        ...detailRow("dgp_i_2", "icon_wine", "7:00  Long-table dinner", {
          x: 17,
          y: 41,
          width: 66,
          aspect: PORTRAIT,
          iconColor: GARDEN.accent,
          textColor: GARDEN.ink,
          size: 3.8,
          fontSize: 11,
        }),
        ...detailRow("dgp_i_3", "icon_music", "9:00  Records on the deck", {
          x: 17,
          y: 47.5,
          width: 66,
          aspect: PORTRAIT,
          iconColor: GARDEN.accent,
          textColor: GARDEN.ink,
          size: 3.8,
          fontSize: 11,
        }),
        ...detailRow("dgp_i_4", "icon_sparkles", "Bring a light layer", {
          x: 17,
          y: 54,
          width: 66,
          aspect: PORTRAIT,
          iconColor: GARDEN.accent,
          textColor: GARDEN.ink,
          size: 3.8,
          fontSize: 11,
        }),
        image("dgp_i_photo", IMG.tablescape, 10, 66, 80, 24, { frame: "rounded" }),
        image("dgp_i_sprig", ART.bell, -4, 84, 30, 14, {
          color: "#7E9576",
        }),
      ],
      { texture: "cotton", textureOpacity: 20, textureBlend: "multiply" },
    ),
    page(
      "Venue",
      "location",
      GARDEN.bg,
      [
        image("dgp_v_sprig", ART.spray, 66, 1, 36, 16, { color: "#7E9576" }),
        text("dgp_v_eyebrow", "FIND THE GATE", 8, 11, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: GARDEN.accent,
        }),
        text("dgp_v_venue", "Riverview Gardens", 8, 15.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 28,
          color: GARDEN.ink,
        }),
        text("dgp_v_addr", "12 River Bend Road · Kew VIC 3101", 8, 24, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: GARDEN.muted,
        }),
        mapWidget("dgp_v_map", {
          x: 8,
          y: 30,
          width: 84,
          height: 46,
          query: "Kew Melbourne Victoria",
          radius: 18,
          label: "Open in Google Maps",
          button: {
            background: GARDEN.accent,
            textColor: GARDEN.onAccent,
            borderColor: GARDEN.accent,
            radius: 999,
          },
        }),
        divider("dgp_v_rule", 8, 80, 84, "#CBD8C4"),
        ...detailRow("dgp_v_gate", "icon_location", "Enter by the blue side gate", {
          x: 10,
          y: 83.5,
          width: 74,
          aspect: PORTRAIT,
          iconColor: GARDEN.accent,
          textColor: GARDEN.muted,
          size: 3.4,
          fontSize: 9.5,
        }),
        ...detailRow("dgp_v_shoes", "icon_sparkles", "Grass underfoot - flat shoes help", {
          x: 10,
          y: 89,
          width: 74,
          aspect: PORTRAIT,
          iconColor: GARDEN.accent,
          textColor: GARDEN.muted,
          size: 3.4,
          fontSize: 9.5,
        }),
      ],
      { texture: "cotton", textureOpacity: 24, textureBlend: "multiply" },
    ),
    page(
      "RSVP",
      "rsvp",
      GARDEN.bg,
      [
        image("dgp_r_sprig", ART.sprigLeaf, -6, 0, 34, 15, { color: "#7E9576" }),
        text("dgp_r_eyebrow", "GARDEN GATHERING", 8, 17, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: GARDEN.accent,
        }),
        text("dgp_r_title", "Joining us\non the lawn?", 8, 21.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 30,
          lineHeight: 1.12,
          color: GARDEN.ink,
        }),
        text("dgp_r_note", "Let us know by Friday so we can set the table", 8, 37, 84, {
          fontFamily: "forum",
          fontSize: 11,
          lineHeight: 1.5,
          color: GARDEN.muted,
        }),
        attendWidget("dgp_r_attend", {
          x: 12,
          y: 43,
          width: 76,
          height: 14,
          label: "",
          yes: "Yes - see you there",
          no: "Can't make it",
          labelColor: GARDEN.ink,
          button: {
            background: GARDEN.accent,
            textColor: GARDEN.onAccent,
            borderColor: GARDEN.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        shortTextWidget("dgp_r_bring", {
          x: 12,
          y: 59,
          width: 76,
          height: 12,
          label: "Bringing anything to share?",
          placeholder: "Dessert, blooms, a playlist…",
          labelColor: GARDEN.ink,
          field: {
            background: GARDEN.surface,
            textColor: GARDEN.ink,
            borderColor: "#CBD8C4",
            borderWidth: 1,
            radius: 999,
          },
        }),
        shortTextWidget("dgp_r_plus", {
          x: 12,
          y: 73,
          width: 76,
          height: 12,
          label: "Who are you bringing?",
          placeholder: "Names of your party",
          labelColor: GARDEN.ink,
          field: {
            background: GARDEN.surface,
            textColor: GARDEN.ink,
            borderColor: "#CBD8C4",
            borderWidth: 1,
            radius: 999,
          },
        }),
      ],
      { texture: "cotton", textureOpacity: 24, textureBlend: "multiply" },
    ),
  ],
};

/** Ink, oxblood and brass - a late bar with a short drinks list. */
const COCKTAIL: Palette = {
  bg: "#171310",
  ink: "#FFFFFF",
  muted: "#A9998C",
  accent: "#D98E4A",
  onAccent: "#1A120A",
  surface: "#241C17",
};

const dinnerCocktailHour: InvitationTemplate = {
  id: "dinner-cocktail-hour",
  categoryId: "dinner",
  title: "Cocktail Hour",
  description: "Low-light bar invite in ink and brass with a short drinks list",
  eventTitle: "Cocktail hour",
  venue: { name: "The Velvet Room", address: "Basement, 12 Meyers Pl, Melbourne" },
  rsvpPrompt: {
    prompt: "Sip with us?",
    note: "RSVP soon - the room is small",
  },
  pages: [
    page("Cover", "cover", COCKTAIL.bg, [
      image("dch_c_photo", IMG.cocktails, 0, 0, 100, 64, { frame: "square" }),
      scrim("dch_c_scrim", 34, 30, "23,19,16", 1),
      shape("dch_c_rule", "rectangle", 8, 68, 10, 0.6, COCKTAIL.accent),
      text("dch_c_eyebrow", "COCKTAIL HOUR", 8, 71, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 4.4,
        fontWeight: "bold",
        color: COCKTAIL.accent,
        textAlign: "left",
      }),
      text("dch_c_title", "Sip & Stay", 8, 76, 84, {
        fontFamily: "instrument-serif",
        fontSize: 44,
        color: COCKTAIL.ink,
        textAlign: "left",
      }),
      text("dch_c_when", "THURSDAY  ·  6-9 PM  ·  THE VELVET ROOM", 8, 91, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2,
        fontWeight: "medium",
        color: COCKTAIL.muted,
        textAlign: "left",
      }),
    ]),
    page("The list", "details", COCKTAIL.surface, [
      guestName("dch_h_guest", 8, 9, 84, {
        fontFamily: "great-vibes",
        fontSize: 28,
        color: COCKTAIL.accent,
      }),
      text("dch_h_lead", "your name is on the door", 8, 17.5, 84, {
        fontFamily: "urbanist",
        fontSize: 10,
        letterSpacing: 1.6,
        color: COCKTAIL.muted,
      }),
      divider("dch_h_rule1", 8, 25, 84, "#3D322A"),
      text("dch_h_title", "On the bar", 8, 28, 84, {
        fontFamily: "instrument-serif",
        fontSize: 26,
        color: COCKTAIL.ink,
        textAlign: "left",
      }),
      ...detailRow("dch_h_1", "icon_cocktail", "Signature spritz", {
        x: 8,
        y: 38,
        width: 76,
        aspect: PORTRAIT,
        iconColor: COCKTAIL.accent,
        textColor: COCKTAIL.ink,
        size: 3.8,
        fontSize: 12,
      }),
      ...detailRow("dch_h_2", "icon_wine", "House negroni, stirred down", {
        x: 8,
        y: 45,
        width: 76,
        aspect: PORTRAIT,
        iconColor: COCKTAIL.accent,
        textColor: COCKTAIL.ink,
        size: 3.8,
        fontSize: 12,
      }),
      ...detailRow("dch_h_3", "icon_sparkles", "Zero-proof highball", {
        x: 8,
        y: 52,
        width: 76,
        aspect: PORTRAIT,
        iconColor: COCKTAIL.accent,
        textColor: COCKTAIL.ink,
        size: 3.8,
        fontSize: 12,
      }),
      ...detailRow("dch_h_4", "icon_cake", "Canapés circulating all night", {
        x: 8,
        y: 59,
        width: 76,
        aspect: PORTRAIT,
        iconColor: COCKTAIL.accent,
        textColor: COCKTAIL.ink,
        size: 3.8,
        fontSize: 12,
      }),
      divider("dch_h_rule2", 8, 68, 84, "#3D322A"),
      image("dch_h_photo", IMG.barRoom, 8, 72, 84, 20, {
        frame: "rounded",
      }),
    ]),
    page("Venue", "location", COCKTAIL.bg, [
      text("dch_v_eyebrow", "DOWN THE STAIRS", 8, 10, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.6,
        fontWeight: "bold",
        color: COCKTAIL.accent,
        textAlign: "left",
      }),
      text("dch_v_venue", "The Velvet Room", 8, 14.5, 84, {
        fontFamily: "instrument-serif",
        fontSize: 30,
        color: COCKTAIL.ink,
        textAlign: "left",
      }),
      text("dch_v_addr", "Basement, 12 Meyers Place\nMelbourne VIC 3000", 8, 23, 84, {
        fontFamily: "urbanist",
        fontSize: 10,
        lineHeight: 1.6,
        color: COCKTAIL.muted,
        textAlign: "left",
      }),
      mapWidget("dch_v_map", {
        x: 8,
        y: 34,
        width: 84,
        height: 44,
        query: "Meyers Place Melbourne",
        radius: 14,
        label: "Open in Google Maps",
        button: {
          background: COCKTAIL.accent,
          textColor: COCKTAIL.onAccent,
          borderColor: COCKTAIL.accent,
          radius: 999,
        },
      }),
      divider("dch_v_rule", 8, 82, 84, "#3D322A"),
      ...detailRow("dch_v_door", "icon_location", "Unmarked black door beside the lane", {
        x: 8,
        y: 85,
        width: 76,
        aspect: PORTRAIT,
        iconColor: COCKTAIL.accent,
        textColor: COCKTAIL.muted,
        size: 3.4,
        fontSize: 9.5,
      }),
      ...detailRow("dch_v_id", "icon_sparkles", "ID at the door · over 18s", {
        x: 8,
        y: 90.5,
        width: 76,
        aspect: PORTRAIT,
        iconColor: COCKTAIL.accent,
        textColor: COCKTAIL.muted,
        size: 3.4,
        fontSize: 9.5,
      }),
    ]),
    page("RSVP", "rsvp", COCKTAIL.surface, [
      shape("dch_r_rule", "rectangle", 0, 0, 100, 0.8, COCKTAIL.accent),
      text("dch_r_eyebrow", "COCKTAILS", 8, 10, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 4.4,
        fontWeight: "bold",
        color: COCKTAIL.accent,
        textAlign: "left",
      }),
      text("dch_r_title", "Sip with us?", 8, 14.5, 84, {
        fontFamily: "instrument-serif",
        fontSize: 34,
        color: COCKTAIL.ink,
        textAlign: "left",
      }),
      text("dch_r_note", "The room holds thirty - reply soon", 8, 25, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        color: COCKTAIL.muted,
        textAlign: "left",
      }),
      attendWidget("dch_r_attend", {
        x: 8,
        y: 30,
        width: 84,
        height: 14,
        label: "",
        yes: "I'm in",
        no: "Not this time",
        labelColor: COCKTAIL.ink,
        button: {
          background: COCKTAIL.accent,
          textColor: COCKTAIL.onAccent,
          borderColor: COCKTAIL.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 999,
        },
      }),
      choiceWidget("dch_r_drink", "single_choice", {
        x: 8,
        y: 46,
        width: 84,
        height: 29,
        label: "First round is on us - pick one",
        options: [
          { id: "spritz", label: "Signature spritz" },
          { id: "negroni", label: "House negroni" },
          { id: "zero", label: "Zero-proof" },
          { id: "surprise", label: "Surprise me" },
        ],
        labelColor: COCKTAIL.ink,
        option: {
          background: COCKTAIL.bg,
          textColor: COCKTAIL.ink,
          borderColor: "#3D322A",
          borderWidth: 1,
          radius: 999,
        },
        required: true,
      }),
      shortTextWidget("dch_r_plus", {
        x: 8,
        y: 78,
        width: 84,
        height: 12,
        label: "Bringing someone?",
        placeholder: "Their name for the door list",
        labelColor: COCKTAIL.ink,
        field: {
          background: COCKTAIL.bg,
          textColor: COCKTAIL.ink,
          borderColor: "#3D322A",
          borderWidth: 1,
          radius: 999,
        },
      }),
    ]),
  ],
};

/** Sun-washed terracotta and olive for a long table under lemon trees. */
const MED: Palette = {
  bg: "#F4EBD9",
  ink: "#3B4735",
  muted: "#7C6A54",
  accent: "#B35A34",
  onAccent: "#FDF6EA",
  surface: "#FBF6EC",
};

const dinnerMediterraneanTable: InvitationTemplate = {
  id: "dinner-mediterranean-table-landscape",
  categoryId: "dinner",
  title: "Mediterranean Table",
  description: "Terracotta and olive supper laid out along a wide table",
  eventTitle: "A long table supper",
  shape: "landscape",
  venue: { name: "The Courtyard", address: "18 Olive Grove, Fitzroy VIC" },
  rsvpPrompt: {
    prompt: "Shall we set a place for you?",
    note: "Reply by 14 January",
  },
  pages: [
    page(
      "Cover",
      "cover",
      MED.bg,
      [
        image("dmt_c_photo", IMG.gardenTable, 0, 0, 56, 100, { frame: "square" }),
        shape("dmt_c_sun", "circle", 84, 8, 11, 19.6, MED.accent),
        text("dmt_c_eyebrow", "A LONG TABLE SUPPER", 62, 20, 34, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3,
          fontWeight: "bold",
          color: MED.accent,
          textAlign: "left",
        }),
        text("dmt_c_title", "Under the\nlemon trees", 61, 30, 38, {
          fontFamily: "instrument-serif",
          fontSize: 34,
          lineHeight: 1.08,
          color: MED.ink,
          textAlign: "left",
        }),
        divider("dmt_c_rule", 62, 66, 14, "#C08B5F"),
        text("dmt_c_when", "SUNDAY 24 JANUARY  ·  5 PM", 62, 71, 36, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 1.8,
          fontWeight: "bold",
          color: MED.ink,
          textAlign: "left",
        }),
        text("dmt_c_where", "THE COURTYARD · FITZROY", 62, 79, 36, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 1.8,
          fontWeight: "medium",
          color: MED.muted,
          textAlign: "left",
        }),
      ],
      { texture: "linen", textureOpacity: 28, textureTint: "#EFE0C6", textureBlend: "multiply" },
    ),
    page(
      "The menu",
      "details",
      MED.surface,
      [
        shape("dmt_d_arch", "semicircle", 4, 6, 12, 40, "#DCE2CE"),
        text("dmt_d_eyebrow", "PASS THE PLATES", 5, 14, 34, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3,
          fontWeight: "bold",
          color: MED.accent,
          textAlign: "left",
        }),
        text("dmt_d_title", "Five plates,\nshared slowly", 5, 23, 40, {
          fontFamily: "instrument-serif",
          fontSize: 30,
          lineHeight: 1.1,
          color: MED.ink,
          textAlign: "left",
        }),
        text(
          "dmt_d_menu",
          "Marinated olives · warm flatbread\nBurrata · tomato · basil\nWood-roasted fish · lemon\nCharred greens · almond\nSummer fruit · mascarpone",
          5,
          53,
          40,
          {
            fontFamily: "forum",
            fontSize: 11.5,
            lineHeight: 1.9,
            color: MED.muted,
            textAlign: "left",
          },
        ),
        image("dmt_d_photo", IMG.medPlate, 52, 0, 48, 100, { frame: "square" }),
        image("dmt_d_sprig", ART.oliveSprig, 38, 72, 11, 26, { rotation: 18 }),
      ],
      { texture: "linen", textureOpacity: 24, textureTint: "#EFE0C6", textureBlend: "multiply" },
    ),
    page(
      "Venue",
      "location",
      MED.bg,
      [
        text("dmt_v_eyebrow", "THE COURTYARD", 5, 15, 34, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3,
          fontWeight: "bold",
          color: MED.accent,
          textAlign: "left",
        }),
        text("dmt_v_venue", "18 Olive Grove", 5, 24, 42, {
          fontFamily: "instrument-serif",
          fontSize: 32,
          lineHeight: 1.1,
          color: MED.ink,
          textAlign: "left",
        }),
        text("dmt_v_addr", "Fitzroy, Victoria 3065", 5, 42, 38, {
          fontFamily: "urbanist",
          fontSize: 10.5,
          color: MED.muted,
          textAlign: "left",
        }),
        divider("dmt_v_rule", 5, 55, 12, "#C08B5F"),
        text(
          "dmt_v_note",
          "Through the blue gate at the side ·\nwe eat outside, bring a layer for later",
          5,
          61,
          40,
          {
            fontFamily: "forum",
            fontSize: 10.5,
            lineHeight: 1.7,
            color: MED.muted,
            textAlign: "left",
          },
        ),
        mapWidget("dmt_v_map", {
          x: 49,
          y: 9,
          width: 46,
          height: 82,
          query: "Olive Grove Fitzroy Victoria",
          radius: 14,
          label: "Open in Google Maps",
          button: {
            background: MED.accent,
            textColor: MED.onAccent,
            borderColor: MED.accent,
            radius: 999,
          },
        }),
      ],
      { texture: "linen", textureOpacity: 28, textureTint: "#EFE0C6", textureBlend: "multiply" },
    ),
    page(
      "RSVP",
      "rsvp",
      MED.surface,
      [
        shape("dmt_r_sun", "circle", -6, 62, 20, 35.6, "#EBD9BC"),
        text("dmt_r_eyebrow", "A SEAT AT THE TABLE", 5, 14, 34, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3,
          fontWeight: "bold",
          color: MED.accent,
          textAlign: "left",
        }),
        text("dmt_r_title", "Shall we set\na place for you?", 5, 23, 36, {
          fontFamily: "instrument-serif",
          fontSize: 27,
          lineHeight: 1.14,
          color: MED.ink,
          textAlign: "left",
        }),
        guestName("dmt_r_guest", 5, 52, 32, {
          fontFamily: "great-vibes",
          fontSize: 24,
          color: MED.accent,
          textAlign: "left",
        }),
        text("dmt_r_note", "Reply by 14 January", 5, 63, 34, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: MED.muted,
          textAlign: "left",
        }),
        attendWidget("dmt_r_attend", {
          x: 43,
          y: 16,
          width: 24,
          height: 22,
          label: "Your reply",
          yes: "Set my place",
          no: "Another time",
          labelColor: MED.ink,
          button: {
            background: MED.accent,
            textColor: MED.onAccent,
            borderColor: MED.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("dmt_r_menu", "single_choice", {
          x: 71,
          y: 16,
          width: 25,
          height: 24,
          label: "Main plate",
          options: [
            { id: "fish", label: "Wood-roasted fish" },
            { id: "vegetable", label: "Charred garden greens" },
          ],
          labelColor: MED.ink,
          option: {
            background: MED.bg,
            textColor: MED.ink,
            borderColor: "#DFCBA8",
            borderWidth: 1,
            radius: 999,
          },
          required: true,
        }),
        shortTextWidget("dmt_r_bottle", {
          x: 43,
          y: 58,
          width: 53,
          height: 14,
          label: "Bringing a bottle? Tell us what.",
          placeholder: "Something you love drinking",
          labelColor: MED.ink,
          field: {
            background: MED.bg,
            textColor: MED.ink,
            borderColor: "#DFCBA8",
            borderWidth: 1,
            radius: 999,
          },
        }),
      ],
      { texture: "linen", textureOpacity: 24, textureTint: "#EFE0C6", textureBlend: "multiply" },
    ),
  ],
};

/* ── Graduation ───────────────────────────────────────────────────────── */

/** Academic navy, burgundy and gold - the palette of the artwork set. */
const ACADEMIC: Palette = {
  bg: "#F5F1E6",
  ink: "#1B2749",
  muted: "#6E7595",
  accent: "#8E2436",
  onAccent: "#FDF8EE",
  surface: "#FFFDF7",
};
const ACADEMIC_GOLD = "#B8912F";

/**
 * Layout: formal certificate. Symmetric, rule-framed cover; a two-column
 * ledger for the order of proceedings rather than an icon card.
 */
const graduationCapAndGown: InvitationTemplate = {
  id: "graduation-cap-and-gown",
  categoryId: "graduation",
  title: "Cap & Gown",
  description: "Ceremony invitation in academic navy, burgundy, and gold leaf",
  eventTitle: "Priya's graduation ceremony",
  venue: {
    name: "Wilson Hall, University of Melbourne",
    address: "Parkville VIC 3010",
  },
  rsvpPrompt: {
    prompt: "Will you be in the crowd?",
    note: "Guest tickets are limited - reply by 1 December",
  },
  pages: [
    page(
      "Cover",
      "cover",
      ACADEMIC.bg,
      [
        shape("gcg_c_frame", "rectangle", 5, 3, 90, 94, ACADEMIC.bg, {
          borderColor: ACADEMIC_GOLD,
          borderWidth: 1,
        }),
        text("gcg_c_eyebrow", "THE RAMAN FAMILY INVITE YOU TO THE", 9, 9.5, 82, {
          fontFamily: "urbanist",
          fontSize: 8,
          letterSpacing: 2.6,
          fontWeight: "bold",
          color: ACADEMIC.muted,
        }),
        text("gcg_c_occasion", "GRADUATION OF", 9, 13.5, 82, {
          fontFamily: "urbanist",
          fontSize: 8,
          letterSpacing: 2.6,
          fontWeight: "bold",
          color: ACADEMIC.muted,
        }),
        text("gcg_c_name", "Priya Raman", 7, 17.5, 86, {
          fontFamily: "cinzel-decorative",
          fontSize: 23,
          letterSpacing: 1.2,
          fontWeight: "bold",
          lineHeight: 1.2,
          color: ACADEMIC.ink,
        }),
        image("gcg_c_photo", IMG.gradPortraitWoman, 24, 26, 52, 34, {
          frame: "arch",
          effects: lift(6, 16, 66),
        }),
        divider("gcg_c_rule", 34, 64, 32, ACADEMIC_GOLD, "diamond"),
        text("gcg_c_degree", "BACHELOR OF ARCHITECTURE", 8, 68, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.4,
          fontWeight: "bold",
          color: ACADEMIC.accent,
        }),
        text("gcg_c_school", "WITH FIRST CLASS HONOURS", 8, 72.5, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 2.2,
          color: ACADEMIC.muted,
        }),
        text("gcg_c_when", "SATURDAY, 13 DECEMBER 2027", 8, 81, 84, {
          fontFamily: "cinzel-decorative",
          fontSize: 11,
          letterSpacing: 1.2,
          fontWeight: "bold",
          color: ACADEMIC.ink,
        }),
        text("gcg_c_time", "TWO O'CLOCK IN THE AFTERNOON", 8, 85.5, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 2.2,
          color: ACADEMIC.muted,
        }),
        image("gcg_c_seal", ART.gradFuturePatch, 41, 86.5, 18, 10),
      ],
      {
        texture: "linen",
        textureOpacity: 32,
        textureTint: "#EFE6D2",
        textureBlend: "multiply",
      },
    ),
    // Order of proceedings, set as a ruled ledger - no icon card here. The
    // hall photo bleeds off the bottom edge instead of floating in the middle,
    // so the page still reads as a designed page at thumbnail size.
    page(
      "Order of the day",
      "details",
      ACADEMIC.bg,
      [
        image("gcg_i_photo", IMG.gradGreatHall, 0, 70, 100, 30, {
          frame: "square",
        }),
        scrim("gcg_i_scrim", 70, 30, "27,39,73", 0.92),
        guestName("gcg_i_guest", 8, 7, 84, {
          fontFamily: "great-vibes",
          fontSize: 27,
          color: ACADEMIC.accent,
        }),
        text("gcg_i_lead", "your seat is reserved in the family block", 8, 15, 84, {
          fontFamily: "forum",
          fontSize: 11,
          color: ACADEMIC.muted,
        }),
        shape("gcg_i_band", "rectangle", 8, 21, 84, 5.4, ACADEMIC.ink),
        text("gcg_i_title", "ORDER OF THE DAY", 8, 22.6, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: "#E8D9AE",
        }),
        divider("gcg_i_r0", 8, 29.0, 84, "#D8CBAC"),
        text("gcg_i_t1", "1:30", 8, 31.5, 20, {
          fontFamily: "cinzel-decorative",
          fontSize: 11,
          fontWeight: "bold",
          color: ACADEMIC.accent,
          textAlign: "left",
        }),
        text("gcg_i_l1", "Guests seated", 30, 31.5, 62, {
          fontFamily: "forum",
          fontSize: 12,
          color: ACADEMIC.ink,
          textAlign: "left",
        }),
        divider("gcg_i_r1", 8, 37.5, 84, "#D8CBAC"),
        text("gcg_i_t2", "2:00", 8, 40.0, 20, {
          fontFamily: "cinzel-decorative",
          fontSize: 11,
          fontWeight: "bold",
          color: ACADEMIC.accent,
          textAlign: "left",
        }),
        text("gcg_i_l2", "Academic procession", 30, 40.0, 62, {
          fontFamily: "forum",
          fontSize: 12,
          color: ACADEMIC.ink,
          textAlign: "left",
        }),
        divider("gcg_i_r2", 8, 46.0, 84, "#D8CBAC"),
        text("gcg_i_t3", "2:40", 8, 48.5, 20, {
          fontFamily: "cinzel-decorative",
          fontSize: 11,
          fontWeight: "bold",
          color: ACADEMIC.accent,
          textAlign: "left",
        }),
        text("gcg_i_l3", "Conferral of degrees", 30, 48.5, 62, {
          fontFamily: "forum",
          fontSize: 12,
          color: ACADEMIC.ink,
          textAlign: "left",
        }),
        divider("gcg_i_r3", 8, 54.5, 84, "#D8CBAC"),
        text("gcg_i_t4", "4:00", 8, 57.0, 20, {
          fontFamily: "cinzel-decorative",
          fontSize: 11,
          fontWeight: "bold",
          color: ACADEMIC.accent,
          textAlign: "left",
        }),
        text("gcg_i_l4", "High tea on the south lawn", 30, 57.0, 62, {
          fontFamily: "forum",
          fontSize: 12,
          color: ACADEMIC.ink,
          textAlign: "left",
        }),
        divider("gcg_i_r4", 8, 63.0, 84, "#D8CBAC"),
        text("gcg_i_note", "Doors close ten minutes before the procession", 8, 90, 84, {
          fontFamily: "forum",
          fontSize: 10,
          color: "#F1E7CF",
        }),
      ],
      {
        texture: "linen",
        textureOpacity: 32,
        textureTint: "#EFE6D2",
        textureBlend: "multiply",
      },
    ),
    page(
      "Venue",
      "location",
      ACADEMIC.bg,
      [
        image("gcg_v_photo", IMG.gradCampus, 0, 0, 100, 26, { frame: "square" }),
        scrim("gcg_v_scrim", 12, 14, "27,39,73", 0.86),
        text("gcg_v_eyebrow", "THE CEREMONY", 8, 18, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: "#E8D9AE",
        }),
        text("gcg_v_venue", "Wilson Hall", 8, 30, 84, {
          fontFamily: "cinzel-decorative",
          fontSize: 24,
          letterSpacing: 1.4,
          fontWeight: "bold",
          color: ACADEMIC.ink,
        }),
        text("gcg_v_addr", "University of Melbourne · Parkville VIC 3010", 8, 38, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: ACADEMIC.muted,
        }),
        mapWidget("gcg_v_map", {
          x: 8,
          y: 44,
          width: 84,
          height: 38,
          query: "Wilson Hall University of Melbourne Parkville",
          radius: 6,
          label: "Open in Google Maps",
          button: {
            background: ACADEMIC.ink,
            textColor: ACADEMIC.onAccent,
            borderColor: ACADEMIC.ink,
            radius: 6,
          },
        }),
        divider("gcg_v_rule", 34, 85, 32, ACADEMIC_GOLD, "diamond"),
        ...detailRow("gcg_v_tram", "icon_location", "Tram 19 stops at Melbourne Uni", {
          x: 10,
          y: 89,
          width: 74,
          aspect: PORTRAIT,
          iconColor: ACADEMIC.accent,
          textColor: ACADEMIC.muted,
          size: 3.4,
          fontSize: 9.5,
        }),
      ],
      {
        texture: "linen",
        textureOpacity: 32,
        textureTint: "#EFE6D2",
        textureBlend: "multiply",
      },
    ),
    page(
      "RSVP",
      "rsvp",
      ACADEMIC.bg,
      [
        image("gcg_r_art", ART.gradBouquet, 62, 1, 38, 21),
        text("gcg_r_eyebrow", "KINDLY REPLY", 8, 22, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: ACADEMIC.accent,
        }),
        text("gcg_r_title", "Will you be\nin the crowd?", 8, 26, 84, {
          fontFamily: "cinzel-decorative",
          fontSize: 20,
          letterSpacing: 0.8,
          fontWeight: "bold",
          lineHeight: 1.3,
          color: ACADEMIC.ink,
        }),
        text("gcg_r_note", "Guest tickets are limited - please reply by 1 December", 8, 39, 84, {
          fontFamily: "forum",
          fontSize: 10.5,
          lineHeight: 1.4,
          color: ACADEMIC.muted,
        }),
        attendWidget("gcg_r_attend", {
          x: 14,
          y: 45,
          width: 72,
          height: 14,
          label: "",
          yes: "I'll be cheering",
          no: "Celebrating from afar",
          labelColor: ACADEMIC.ink,
          button: {
            background: ACADEMIC.accent,
            textColor: ACADEMIC.onAccent,
            borderColor: ACADEMIC.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 6,
          },
        }),
        choiceWidget("gcg_r_part", "multi_choice", {
          x: 14,
          y: 61,
          width: 72,
          height: 24,
          label: "Which parts will you join?",
          options: [
            { id: "ceremony", label: "The ceremony" },
            { id: "tea", label: "High tea after" },
            { id: "dinner", label: "Family dinner" },
          ],
          labelColor: ACADEMIC.ink,
          option: {
            background: ACADEMIC.surface,
            textColor: ACADEMIC.ink,
            borderColor: "#E2D6B8",
            borderWidth: 1,
            radius: 6,
          },
        }),
        text("gcg_r_ps", "Photos on the lawn straight after - don't disappear!", 8, 88, 84, {
          fontFamily: "forum",
          fontSize: 10,
          color: ACADEMIC.muted,
        }),
      ],
      {
        texture: "linen",
        textureOpacity: 32,
        textureTint: "#EFE6D2",
        textureBlend: "multiply",
      },
    ),
  ],
};

/** Square, poster-loud, built around a giant year. */
const CLASS_OF: Palette = {
  bg: "#12193A",
  ink: "#FFFFFF",
  muted: "#9AA4CC",
  accent: "#F2C14E",
  onAccent: "#12193A",
  surface: "#1C2551",
};

/**
 * Layout: type-led poster, then a torn ticket stub. Deliberately the opposite
 * of Cap & Gown - no frames, no ornament, one enormous numeral.
 */
const graduationClassOf: InvitationTemplate = {
  id: "graduation-class-of",
  categoryId: "graduation",
  title: "Class Of",
  description: "Square poster invite with a giant year and a ticket-stub detail page",
  eventTitle: "Jess's graduation party",
  shape: "square",
  venue: {
    name: "The Boatbuilders Yard",
    address: "23 South Wharf Prom, South Wharf VIC",
  },
  rsvpPrompt: {
    prompt: "Coming to the class-of party?",
    note: "Reply by 5 December",
  },
  pages: [
    page(
      "Cover",
      "cover",
      CLASS_OF.bg,
      [
        text("gco_c_eyebrow", "SHE MADE IT - CLASS OF", 8, 11, 84, {
          fontFamily: "urbanist",
          fontSize: 12,
          letterSpacing: 5,
          fontWeight: "bold",
          color: CLASS_OF.accent,
        }),
        text("gco_c_year", "2027", 4, 17, 92, {
          fontFamily: "urbanist",
          fontSize: 150,
          fontWeight: "bold",
          lineHeight: 1,
          color: CLASS_OF.ink,
        }),
        image("gco_c_photo", IMG.gradCapToss, 0, 46, 100, 34, {
          frame: "square",
        }),
        scrim("gco_c_scrim", 62, 18, "18,25,58", 0.95),
        text("gco_c_name", "Jess Moreau", 8, 80, 84, {
          fontFamily: "great-vibes",
          fontSize: 46,
          color: CLASS_OF.accent,
        }),
        text("gco_c_when", "SATURDAY 13 DECEMBER  ·  7 PM  ·  SOUTH WHARF", 8, 93, 84, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 2.4,
          fontWeight: "bold",
          color: CLASS_OF.muted,
        }),
      ],
      { pattern: "dots" },
    ),
    // A ticket stub: perforation down the middle, admit-one on the right.
    page("Your ticket", "details", CLASS_OF.surface, [
      text("gco_i_eyebrow", "ADMIT ONE - PLUS ONE", 8, 8, 84, {
        fontFamily: "urbanist",
        fontSize: 11,
        letterSpacing: 4,
        fontWeight: "bold",
        color: CLASS_OF.accent,
      }),
      shape("gco_i_ticket", "rounded_square", 6, 15, 88, 52, CLASS_OF.bg, {
        effects: lift(8, 18, 58),
      }),
      shape("gco_i_perf", "rectangle", 66, 18, 0.35, 46, "#3A4478"),
      guestName("gco_i_guest", 11, 20, 52, {
        fontFamily: "urbanist",
        fontSize: 26,
        fontWeight: "bold",
        color: CLASS_OF.ink,
        textAlign: "left",
      }),
      text("gco_i_holder", "TICKET HOLDER", 11, 27.5, 52, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2.6,
        fontWeight: "bold",
        color: CLASS_OF.muted,
        textAlign: "left",
      }),
      text("gco_i_k1", "DATE", 11, 34, 26, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2,
        fontWeight: "bold",
        color: CLASS_OF.muted,
        textAlign: "left",
      }),
      text("gco_i_v1", "Sat 13 Dec", 11, 38, 26, {
        fontFamily: "urbanist",
        fontSize: 14,
        fontWeight: "bold",
        color: CLASS_OF.ink,
        textAlign: "left",
      }),
      text("gco_i_k2", "DOORS", 40, 34, 24, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2,
        fontWeight: "bold",
        color: CLASS_OF.muted,
        textAlign: "left",
      }),
      text("gco_i_v2", "7:00 pm", 40, 38, 24, {
        fontFamily: "urbanist",
        fontSize: 14,
        fontWeight: "bold",
        color: CLASS_OF.ink,
        textAlign: "left",
      }),
      text("gco_i_k3", "VENUE", 11, 46, 52, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2,
        fontWeight: "bold",
        color: CLASS_OF.muted,
        textAlign: "left",
      }),
      text("gco_i_v3", "The Boatbuilders Yard, South Wharf", 11, 50, 52, {
        fontFamily: "urbanist",
        fontSize: 13,
        color: CLASS_OF.ink,
        textAlign: "left",
      }),
      text("gco_i_k4", "DRESS", 11, 57, 52, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2,
        fontWeight: "bold",
        color: CLASS_OF.muted,
        textAlign: "left",
      }),
      text("gco_i_v4", "Bring your cap for the photo wall", 11, 61, 52, {
        fontFamily: "urbanist",
        fontSize: 13,
        color: CLASS_OF.ink,
        textAlign: "left",
      }),
      image("gco_i_stub", ART.gradMortarboard, 70, 26, 22, 22),
      text("gco_i_stubtext", "NO. 2027", 69, 52, 24, {
        fontFamily: "urbanist",
        fontSize: 12,
        letterSpacing: 2.4,
        fontWeight: "bold",
        color: CLASS_OF.accent,
      }),
      image("gco_i_photo", IMG.gradToast, 6, 72, 88, 24, { frame: "rounded" }),
    ]),
    page("Venue", "location", CLASS_OF.bg, [
      shape("gco_v_bar", "rectangle", 0, 0, 100, 2, CLASS_OF.accent),
      text("gco_v_eyebrow", "MEET US HERE", 8, 8, 84, {
        fontFamily: "urbanist",
        fontSize: 11,
        letterSpacing: 4,
        fontWeight: "bold",
        color: CLASS_OF.accent,
      }),
      text("gco_v_venue", "The Boatbuilders Yard", 8, 13, 84, {
        fontFamily: "urbanist",
        fontSize: 32,
        fontWeight: "bold",
        color: CLASS_OF.ink,
      }),
      text("gco_v_addr", "23 South Wharf Promenade · South Wharf VIC", 8, 21, 84, {
        fontFamily: "urbanist",
        fontSize: 12,
        color: CLASS_OF.muted,
      }),
      mapWidget("gco_v_map", {
        x: 8,
        y: 28,
        width: 84,
        height: 52,
        query: "The Boatbuilders Yard South Wharf Melbourne",
        radius: 16,
        label: "Get me there",
        button: {
          background: CLASS_OF.accent,
          textColor: CLASS_OF.onAccent,
          borderColor: CLASS_OF.accent,
          radius: 999,
        },
      }),
      ...detailRow("gco_v_note", "icon_sparkles", "Riverside deck - heaters on if it turns", {
        x: 8,
        y: 86,
        width: 84,
        aspect: SQUARE,
        iconColor: CLASS_OF.accent,
        textColor: CLASS_OF.muted,
        size: 3.4,
        gap: 2,
        fontSize: 12,
      }),
    ]),
    page(
      "RSVP",
      "rsvp",
      CLASS_OF.bg,
      [
        text("gco_r_eyebrow", "GUEST LIST", 8, 9, 84, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 4.4,
          fontWeight: "bold",
          color: CLASS_OF.accent,
        }),
        text("gco_r_title", "Coming to the\nclass-of party?", 8, 14, 84, {
          fontFamily: "urbanist",
          fontSize: 36,
          fontWeight: "bold",
          lineHeight: 1.12,
          color: CLASS_OF.ink,
        }),
        text("gco_r_note", "Reply by 5 December so we can lock in numbers", 8, 30, 84, {
          fontFamily: "urbanist",
          fontSize: 12,
          color: CLASS_OF.muted,
        }),
        attendWidget("gco_r_attend", {
          x: 10,
          y: 35,
          width: 80,
          height: 13,
          label: "",
          yes: "Wouldn't miss it",
          no: "Can't make it",
          labelColor: CLASS_OF.ink,
          button: {
            background: CLASS_OF.accent,
            textColor: CLASS_OF.onAccent,
            borderColor: CLASS_OF.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("gco_r_when", "single_choice", {
          x: 10,
          y: 51,
          width: 80,
          height: 24,
          label: "Which bit are you coming to?",
          options: [
            { id: "both", label: "Ceremony and the party" },
            { id: "party", label: "Just the party" },
            { id: "ceremony", label: "Just the ceremony" },
          ],
          labelColor: CLASS_OF.ink,
          option: {
            background: CLASS_OF.surface,
            textColor: CLASS_OF.ink,
            borderColor: "#2E3A73",
            borderWidth: 1,
            radius: 999,
          },
        }),
        shortTextWidget("gco_r_note2", {
          x: 10,
          y: 79,
          width: 80,
          height: 12,
          label: "Leave Jess a note for the slideshow",
          placeholder: "One line she'll read on the night…",
          labelColor: CLASS_OF.ink,
          field: {
            background: CLASS_OF.surface,
            textColor: CLASS_OF.ink,
            borderColor: "#2E3A73",
            borderWidth: 1,
            radius: 999,
          },
        }),
      ],
      { pattern: "dots" },
    ),
  ],
};

/** Wide editorial spread - the graduate on one side, the story on the other. */
const NEXT_CHAPTER: Palette = {
  bg: "#EFEAE0",
  ink: "#22283C",
  muted: "#6B7186",
  accent: "#9B3B4A",
  onAccent: "#FBF6EE",
  surface: "#FBF8F2",
};

/**
 * Layout: magazine spread. Full-bleed left column, a four-tile object grid for
 * the story page, and a three-column RSVP band.
 */
const graduationNextChapter: InvitationTemplate = {
  id: "graduation-next-chapter-landscape",
  categoryId: "graduation",
  title: "Next Chapter",
  description: "Wide editorial spread for a graduate stepping into what's next",
  eventTitle: "Daniel's graduation drinks",
  shape: "landscape",
  venue: {
    name: "Rooftop at Higher Ground",
    address: "650 Little Bourke St, Melbourne",
  },
  rsvpPrompt: {
    prompt: "Celebrate the next chapter?",
    note: "Reply by 20 November",
  },
  pages: [
    page(
      "Cover",
      "cover",
      NEXT_CHAPTER.bg,
      [
        shape("gnc_c_panel", "rectangle", 50, 0, 50, 100, NEXT_CHAPTER.surface),
        image("gnc_c_art", ART.gradCapToss, 5, 6, 42, 88),
        text("gnc_c_eyebrow", "THE NEXT CHAPTER BEGINS", 55, 18, 40, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.2,
          fontWeight: "bold",
          color: NEXT_CHAPTER.accent,
          textAlign: "left",
        }),
        text("gnc_c_name", "Daniel\nhas graduated", 55, 28, 42, {
          fontFamily: "instrument-serif",
          fontSize: 40,
          lineHeight: 1.04,
          color: NEXT_CHAPTER.ink,
          textAlign: "left",
        }),
        divider("gnc_c_rule", 55, 66, 14, NEXT_CHAPTER.accent),
        text("gnc_c_when", "FRIDAY 5 DECEMBER  ·  6 PM", 55, 72, 42, {
          fontFamily: "urbanist",
          fontSize: 10.5,
          letterSpacing: 2,
          fontWeight: "bold",
          color: NEXT_CHAPTER.ink,
          textAlign: "left",
        }),
        text("gnc_c_where", "ROOFTOP AT HIGHER GROUND · MELBOURNE", 55, 80, 42, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 1.8,
          fontWeight: "medium",
          color: NEXT_CHAPTER.muted,
          textAlign: "left",
        }),
      ],
      { texture: "cotton", textureOpacity: 26, textureTint: "#F1E9DA", textureBlend: "multiply" },
    ),
    page(
      "The story",
      "details",
      NEXT_CHAPTER.surface,
      [
        text("gnc_d_eyebrow", "FIVE YEARS, IN SHORT", 5, 12, 36, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3,
          fontWeight: "bold",
          color: NEXT_CHAPTER.accent,
          textAlign: "left",
        }),
        text("gnc_d_title", "Late nights,\nlong lectures,\none diploma.", 5, 21, 40, {
          fontFamily: "instrument-serif",
          fontSize: 28,
          lineHeight: 1.14,
          color: NEXT_CHAPTER.ink,
          textAlign: "left",
        }),
        ...detailRow("gnc_d_1", "icon_calendar", "Friday 5 December · 6 pm", {
          x: 5,
          y: 66,
          width: 38,
          aspect: LANDSCAPE,
          iconColor: NEXT_CHAPTER.accent,
          textColor: NEXT_CHAPTER.ink,
          size: 2.3,
          gap: 1.4,
          fontSize: 10.5,
        }),
        ...detailRow("gnc_d_2", "icon_location", "Rooftop at Higher Ground", {
          x: 5,
          y: 75,
          width: 38,
          aspect: LANDSCAPE,
          iconColor: NEXT_CHAPTER.accent,
          textColor: NEXT_CHAPTER.ink,
          size: 2.3,
          gap: 1.4,
          fontSize: 10.5,
        }),
        ...detailRow("gnc_d_3", "icon_cocktail", "Drinks, dumplings, one speech", {
          x: 5,
          y: 84,
          width: 38,
          aspect: LANDSCAPE,
          iconColor: NEXT_CHAPTER.accent,
          textColor: NEXT_CHAPTER.ink,
          size: 2.3,
          gap: 1.4,
          fontSize: 10.5,
        }),
        image("gnc_d_art", ART.gradFutureCity, 47, 4, 26, 46),
        image("gnc_d_art2", ART.gradSuitcase, 74, 4, 24, 42),
        image("gnc_d_art3", ART.gradStudyStack, 47, 50, 26, 46),
        image("gnc_d_art4", ART.gradKeepsake, 74, 50, 24, 42),
      ],
      { texture: "cotton", textureOpacity: 22, textureTint: "#F1E9DA", textureBlend: "multiply" },
    ),
    page(
      "Venue",
      "location",
      NEXT_CHAPTER.bg,
      [
        text("gnc_v_eyebrow", "UP ON THE ROOFTOP", 5, 15, 36, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3,
          fontWeight: "bold",
          color: NEXT_CHAPTER.accent,
          textAlign: "left",
        }),
        text("gnc_v_venue", "Higher Ground", 5, 24, 42, {
          fontFamily: "instrument-serif",
          fontSize: 32,
          lineHeight: 1.08,
          color: NEXT_CHAPTER.ink,
          textAlign: "left",
        }),
        text("gnc_v_addr", "650 Little Bourke Street\nMelbourne VIC 3000", 5, 42, 38, {
          fontFamily: "urbanist",
          fontSize: 10.5,
          lineHeight: 1.6,
          color: NEXT_CHAPTER.muted,
          textAlign: "left",
        }),
        divider("gnc_v_rule", 5, 62, 12, NEXT_CHAPTER.accent),
        text("gnc_v_note", "Lift to level three, then follow the noise", 5, 68, 40, {
          fontFamily: "forum",
          fontSize: 10.5,
          color: NEXT_CHAPTER.muted,
          textAlign: "left",
        }),
        mapWidget("gnc_v_map", {
          x: 49,
          y: 9,
          width: 46,
          height: 82,
          query: "Higher Ground 650 Little Bourke Street Melbourne",
          radius: 14,
          label: "Open in Google Maps",
          button: {
            background: NEXT_CHAPTER.accent,
            textColor: NEXT_CHAPTER.onAccent,
            borderColor: NEXT_CHAPTER.accent,
            radius: 999,
          },
        }),
      ],
      { texture: "cotton", textureOpacity: 26, textureTint: "#F1E9DA", textureBlend: "multiply" },
    ),
    page(
      "RSVP",
      "rsvp",
      NEXT_CHAPTER.surface,
      [
        image("gnc_r_art", ART.gradBouquet, 0, 58, 18, 38),
        text("gnc_r_eyebrow", "SAVE ME A SEAT", 5, 14, 36, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3,
          fontWeight: "bold",
          color: NEXT_CHAPTER.accent,
          textAlign: "left",
        }),
        text("gnc_r_title", "Celebrate the\nnext chapter?", 5, 23, 36, {
          fontFamily: "instrument-serif",
          fontSize: 28,
          lineHeight: 1.12,
          color: NEXT_CHAPTER.ink,
          textAlign: "left",
        }),
        guestName("gnc_r_guest", 20, 62, 24, {
          fontFamily: "great-vibes",
          fontSize: 24,
          color: NEXT_CHAPTER.accent,
          textAlign: "left",
        }),
        text("gnc_r_note", "Reply by 20 November", 20, 74, 24, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: NEXT_CHAPTER.muted,
          textAlign: "left",
        }),
        attendWidget("gnc_r_attend", {
          x: 44,
          y: 16,
          width: 24,
          height: 22,
          label: "Your reply",
          yes: "I'll raise a glass",
          no: "Toasting from afar",
          labelColor: NEXT_CHAPTER.ink,
          button: {
            background: NEXT_CHAPTER.accent,
            textColor: NEXT_CHAPTER.onAccent,
            borderColor: NEXT_CHAPTER.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("gnc_r_drink", "single_choice", {
          x: 72,
          y: 16,
          width: 24,
          height: 30,
          label: "First toast",
          options: [
            { id: "bubbles", label: "Something with bubbles" },
            { id: "beer", label: "Cold beer" },
            { id: "zero", label: "Zero-proof" },
          ],
          labelColor: NEXT_CHAPTER.ink,
          option: {
            background: NEXT_CHAPTER.bg,
            textColor: NEXT_CHAPTER.ink,
            borderColor: "#DCD2C2",
            borderWidth: 1,
            radius: 999,
          },
        }),
        shortTextWidget("gnc_r_advice", {
          x: 44,
          y: 58,
          width: 52,
          height: 14,
          label: "One piece of advice for the graduate",
          placeholder: "Keep it short, keep it honest…",
          labelColor: NEXT_CHAPTER.ink,
          field: {
            background: NEXT_CHAPTER.bg,
            textColor: NEXT_CHAPTER.ink,
            borderColor: "#DCD2C2",
            borderWidth: 1,
            radius: 999,
          },
        }),
      ],
      { texture: "cotton", textureOpacity: 22, textureTint: "#F1E9DA", textureBlend: "multiply" },
    ),
  ],
};

/** Áo dài graduation - a Vietnamese family celebration on a 5×7in card. */
const AO_DAI: Palette = {
  bg: "#FBF3E9",
  ink: "#5A1220",
  muted: "#8C6A58",
  accent: "#B0142B",
  onAccent: "#FFF6EC",
  surface: "#FFFCF6",
};

/**
 * Layout: bilingual keepsake card. A centre rule runs the full height of the
 * invitation page with Vietnamese on the left and English on the right.
 */
const graduationAoDai: InvitationTemplate = {
  id: "graduation-ao-dai",
  categoryId: "graduation",
  title: "Áo Dài Honours",
  description:
    "A 5×7in bilingual keepsake card for an áo dài graduation and family banquet",
  eventTitle: "Linh's graduation banquet",
  shape: "custom",
  customSize: { width: 5, height: 7, unit: "in" },
  venue: {
    name: "Golden Lotus Restaurant",
    address: "112 Victoria St, Richmond VIC",
  },
  rsvpPrompt: {
    prompt: "Will you join the banquet?",
    note: "Please reply by 30 November",
  },
  pages: [
    page(
      "Cover",
      "cover",
      AO_DAI.bg,
      [
        shape("gad_c_frame", "rectangle", 5, 3.5, 90, 93, AO_DAI.bg, {
          borderColor: "#D9A441",
          borderWidth: 2,
        }),
        text("gad_c_eyebrow", "CHÚC MỪNG TỐT NGHIỆP", 8, 9, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3,
          fontWeight: "bold",
          color: AO_DAI.accent,
        }),
        image("gad_c_art", ART.gradAoDaiWoman, 22, 15, 56, 52),
        text("gad_c_name", "Linh Nguyễn", 8, 68, 84, {
          fontFamily: "great-vibes",
          fontSize: 42,
          color: AO_DAI.ink,
        }),
        divider("gad_c_rule", 36, 81, 28, "#D9A441", "diamond"),
        text("gad_c_degree", "BACHELOR OF COMMERCE  ·  2027", 8, 84.5, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.2,
          fontWeight: "bold",
          color: AO_DAI.muted,
        }),
        text("gad_c_when", "SUNDAY 14 DECEMBER  ·  6 PM", 8, 90, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.2,
          fontWeight: "bold",
          color: AO_DAI.ink,
        }),
      ],
      {
        texture: "handmade",
        textureOpacity: 34,
        textureTint: "#F4E3CC",
        textureBlend: "multiply",
      },
    ),
    // Bilingual: a full-height centre rule splits Vietnamese from English.
    page(
      "Invitation",
      "details",
      AO_DAI.bg,
      [
        guestName("gad_i_guest", 8, 7, 84, {
          fontFamily: "great-vibes",
          fontSize: 28,
          color: AO_DAI.accent,
        }),
        divider("gad_i_top", 20, 16, 60, "#D9A441", "diamond"),
        shape("gad_i_spine", "rectangle", 49.7, 21, 0.5, 56, "#E3C89A"),
        text("gad_i_vhead", "TRÂN TRỌNG KÍNH MỜI", 7, 22, 38, {
          fontFamily: "urbanist",
          fontSize: 8,
          letterSpacing: 2,
          fontWeight: "bold",
          color: AO_DAI.accent,
        }),
        text(
          "gad_i_vbody",
          "Gia đình chúng tôi\ntrân trọng kính mời\nquý vị đến dự tiệc\nmừng lễ tốt nghiệp\ncủa con gái chúng tôi",
          7,
          28,
          38,
          {
            fontFamily: "forum",
            fontSize: 11,
            lineHeight: 1.75,
            color: AO_DAI.ink,
          },
        ),
        text("gad_i_ehead", "WITH GREAT PRIDE", 55, 22, 38, {
          fontFamily: "urbanist",
          fontSize: 8,
          letterSpacing: 2,
          fontWeight: "bold",
          color: AO_DAI.accent,
        }),
        text(
          "gad_i_ebody",
          "Our family would be\nhonoured by your\ncompany at a banquet\ncelebrating our\ndaughter's graduation",
          55,
          28,
          38,
          {
            fontFamily: "forum",
            fontSize: 11,
            lineHeight: 1.75,
            color: AO_DAI.ink,
          },
        ),
        text("gad_i_when", "CHỦ NHẬT · SUNDAY", 8, 58, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 2.4,
          fontWeight: "bold",
          color: AO_DAI.muted,
        }),
        text("gad_i_date", "14 . 12 . 2027", 8, 62, 84, {
          fontFamily: "cinzel-decorative",
          fontSize: 20,
          letterSpacing: 2,
          fontWeight: "bold",
          color: AO_DAI.ink,
        }),
        text("gad_i_time", "6 GIỜ TỐI · SIX IN THE EVENING", 8, 69, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 2.2,
          color: AO_DAI.muted,
        }),
        divider("gad_i_bottom", 20, 78, 60, "#D9A441", "diamond"),
        image("gad_i_art", IMG.gradCapGownWoman, 8, 82, 38, 15, {
          frame: "rounded",
        }),
        image("gad_i_art2", ART.gradCake, 56, 81, 36, 17),
      ],
      {
        texture: "handmade",
        textureOpacity: 34,
        textureTint: "#F4E3CC",
        textureBlend: "multiply",
      },
    ),
    page(
      "Venue",
      "location",
      AO_DAI.bg,
      [
        text("gad_v_eyebrow", "NHÀ HÀNG · THE BANQUET", 8, 9, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.6,
          fontWeight: "bold",
          color: AO_DAI.accent,
        }),
        text("gad_v_venue", "Golden Lotus", 8, 13, 84, {
          fontFamily: "instrument-serif",
          fontSize: 28,
          color: AO_DAI.ink,
        }),
        text("gad_v_addr", "112 Victoria Street · Richmond VIC 3121", 8, 21, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: AO_DAI.muted,
        }),
        mapWidget("gad_v_map", {
          x: 8,
          y: 27,
          width: 84,
          height: 48,
          query: "Victoria Street Richmond Victoria",
          radius: 12,
          label: "Open in Google Maps",
          button: {
            background: AO_DAI.accent,
            textColor: AO_DAI.onAccent,
            borderColor: AO_DAI.accent,
            radius: 999,
          },
        }),
        divider("gad_v_rule", 36, 79, 28, "#D9A441", "diamond"),
        text(
          "gad_v_note",
          "Parking behind the restaurant · xin đến sớm mười phút\nplease arrive ten minutes early for family photos",
          8,
          83,
          84,
          {
            fontFamily: "forum",
            fontSize: 10,
            lineHeight: 1.6,
            color: AO_DAI.muted,
          },
        ),
      ],
      {
        texture: "handmade",
        textureOpacity: 34,
        textureTint: "#F4E3CC",
        textureBlend: "multiply",
      },
    ),
    page(
      "RSVP",
      "rsvp",
      AO_DAI.bg,
      [
        text("gad_r_eyebrow", "XIN VUI LÒNG HỒI ÂM", 8, 9, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 2.8,
          fontWeight: "bold",
          color: AO_DAI.accent,
        }),
        text("gad_r_title", "Will you join\nthe banquet?", 8, 13.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 26,
          lineHeight: 1.14,
          color: AO_DAI.ink,
        }),
        text("gad_r_note", "Please reply by 30 November", 8, 27, 84, {
          fontFamily: "forum",
          fontSize: 10.5,
          color: AO_DAI.muted,
        }),
        attendWidget("gad_r_attend", {
          x: 14,
          y: 32,
          width: 72,
          height: 14,
          label: "",
          yes: "Yes, with joy",
          no: "Sending our congratulations",
          labelColor: AO_DAI.ink,
          button: {
            background: AO_DAI.accent,
            textColor: AO_DAI.onAccent,
            borderColor: AO_DAI.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        shortTextWidget("gad_r_seats", {
          x: 14,
          y: 48,
          width: 72,
          height: 12,
          label: "How many seats at your table?",
          placeholder: "e.g. 4",
          labelColor: AO_DAI.ink,
          field: {
            background: AO_DAI.surface,
            textColor: AO_DAI.ink,
            borderColor: "#EBD7B4",
            borderWidth: 1,
            radius: 999,
          },
        }),
        choiceWidget("gad_r_diet", "multi_choice", {
          x: 14,
          y: 62,
          width: 72,
          height: 24,
          label: "Any dietary needs?",
          options: [
            { id: "veg", label: "Vegetarian" },
            { id: "seafood", label: "No seafood" },
            { id: "none", label: "Nothing at all" },
          ],
          labelColor: AO_DAI.ink,
          option: {
            background: AO_DAI.surface,
            textColor: AO_DAI.ink,
            borderColor: "#EBD7B4",
            borderWidth: 1,
            radius: 999,
          },
        }),
        image("gad_r_art", ART.gradMortarboard, 66, 84, 32, 16),
      ],
      {
        texture: "handmade",
        textureOpacity: 34,
        textureTint: "#F4E3CC",
        textureBlend: "multiply",
      },
    ),
  ],
};

/* ── Other events ─────────────────────────────────────────────────────── */

/** Housewarming - terracotta, clay, and a hand-drawn front door. */
const NEW_KEYS: Palette = {
  bg: "#F6EFE6",
  ink: "#3A2A20",
  muted: "#8A7462",
  accent: "#B5603A",
  onAccent: "#FFF7EF",
  surface: "#FFFCF7",
};

/**
 * Layout: postcard. An arched door on the cover, then a genuine postcard back
 * - stamp, postmark, divider rule and address lines - for the details.
 */
const otherNewKeys: InvitationTemplate = {
  id: "other-new-keys",
  categoryId: "other",
  title: "New Keys",
  description: "Housewarming postcard in warm clay with an arched front door",
  eventTitle: "Our housewarming",
  venue: { name: "14 Rosebank Avenue", address: "Northcote VIC 3070" },
  rsvpPrompt: {
    prompt: "Coming to warm the house?",
    note: "Let us know by Friday",
  },
  pages: [
    page(
      "Cover",
      "cover",
      NEW_KEYS.bg,
      [
        // A front door: arch photograph, terracotta surround, number plate.
        shape("onk_c_surround", "rectangle", 20, 14, 60, 48, NEW_KEYS.accent),
        image("onk_c_door", IMG.homeKeys, 24, 17, 52, 42, {
          frame: "arch",
          effects: lift(8, 18, 60),
        }),
        shape("onk_c_step", "rectangle", 14, 62, 72, 3.5, "#DFCDB4"),
        shape("onk_c_plate", "rounded_square", 40, 7, 20, 9, NEW_KEYS.accent, {
          effects: lift(5, 10, 62),
        }),
        text("onk_c_number", "14", 40, 8.5, 20, {
          fontFamily: "instrument-serif",
          fontSize: 24,
          lineHeight: 1.1,
          color: NEW_KEYS.onAccent,
        }),
        text("onk_c_eyebrow", "WE'VE MOVED IN", 8, 68, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.6,
          fontWeight: "bold",
          color: NEW_KEYS.accent,
        }),
        text("onk_c_title", "Housewarming", 8, 72.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 36,
          color: NEW_KEYS.ink,
        }),
        text("onk_c_hosts", "Tom & Ruby", 8, 82, 84, {
          fontFamily: "great-vibes",
          fontSize: 26,
          color: NEW_KEYS.accent,
        }),
        divider("onk_c_rule", 40, 90, 20, "#D8BFA0"),
        text("onk_c_when", "SATURDAY 8 MARCH  ·  FROM 4 PM", 8, 92.5, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.2,
          fontWeight: "bold",
          color: NEW_KEYS.muted,
        }),
      ],
      { texture: "cotton", textureOpacity: 28, textureTint: "#F2E6D4", textureBlend: "multiply" },
    ),
    // Postcard back: message on the left, stamp and address lines on the right.
    page(
      "The invitation",
      "details",
      NEW_KEYS.surface,
      [
        shape("onk_i_edge", "rectangle", 4, 3, 92, 94, NEW_KEYS.surface, {
          borderColor: "#E2D2BC",
          borderWidth: 1,
        }),
        shape("onk_i_spine", "rectangle", 49.6, 10, 0.4, 62, "#E2D2BC"),
        shape("onk_i_stamp", "rectangle", 74, 9, 18, 12, "#F1E2CE", {
          borderColor: NEW_KEYS.accent,
          borderWidth: 1,
        }),
        shape("onk_i_stampart", "icon_gift", 79, 11.5, 8, 4.5, NEW_KEYS.accent),
        shape("onk_i_mark1", "circle", 53, 9, 18, 10.1, "#F1E2CE"),
        text("onk_i_mark", "NORTHCOTE\n08 · 03", 52, 11.5, 20, {
          fontFamily: "urbanist",
          fontSize: 6.5,
          letterSpacing: 1,
          lineHeight: 1.4,
          fontWeight: "bold",
          color: NEW_KEYS.muted,
        }),
        guestName("onk_i_guest", 9, 11, 38, {
          fontFamily: "great-vibes",
          fontSize: 24,
          color: NEW_KEYS.accent,
          textAlign: "left",
        }),
        text(
          "onk_i_message",
          "The boxes are (mostly) unpacked, the pizza oven works, and the garden is finally ours. Come and break it in with us.",
          9,
          19,
          39,
          {
            fontFamily: "forum",
            fontSize: 10,
            lineHeight: 1.7,
            color: NEW_KEYS.ink,
            textAlign: "left",
          },
        ),
        text("onk_i_sign", "Tom & Ruby", 9, 47, 39, {
          fontFamily: "great-vibes",
          fontSize: 22,
          color: NEW_KEYS.ink,
          textAlign: "left",
        }),
        divider("onk_i_l1", 54, 30.5, 40, "#E2D2BC"),
        text("onk_i_a1", "Saturday 8 March, from 4 pm", 54, 25, 40, {
          fontFamily: "urbanist",
          fontSize: 10.5,
          color: NEW_KEYS.ink,
          textAlign: "left",
        }),
        divider("onk_i_l2", 54, 39.5, 40, "#E2D2BC"),
        text("onk_i_a2", "14 Rosebank Ave, Northcote", 54, 34, 40, {
          fontFamily: "urbanist",
          fontSize: 10.5,
          color: NEW_KEYS.ink,
          textAlign: "left",
        }),
        divider("onk_i_l3", 54, 48.5, 40, "#E2D2BC"),
        text("onk_i_a3", "Pizza oven on, bar in the yard", 54, 43, 40, {
          fontFamily: "urbanist",
          fontSize: 10.5,
          color: NEW_KEYS.ink,
          textAlign: "left",
        }),
        divider("onk_i_l4", 54, 57.5, 40, "#E2D2BC"),
        text("onk_i_a4", "No gifts - a plant, if you must", 54, 52, 40, {
          fontFamily: "urbanist",
          fontSize: 10.5,
          color: NEW_KEYS.ink,
          textAlign: "left",
        }),
        image("onk_i_photo", IMG.livingRoomFire, 9, 62, 82, 30, {
          frame: "rounded",
        }),
      ],
      { texture: "cotton", textureOpacity: 20, textureTint: "#F2E6D4", textureBlend: "multiply" },
    ),
    page(
      "Venue",
      "location",
      NEW_KEYS.bg,
      [
        text("onk_v_eyebrow", "THE NEW ADDRESS", 8, 10, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: NEW_KEYS.accent,
        }),
        text("onk_v_venue", "14 Rosebank Ave", 8, 14.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 29,
          color: NEW_KEYS.ink,
        }),
        text("onk_v_addr", "Northcote VIC 3070", 8, 23, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: NEW_KEYS.muted,
        }),
        mapWidget("onk_v_map", {
          x: 8,
          y: 29,
          width: 84,
          height: 47,
          query: "Rosebank Avenue Northcote Victoria",
          radius: 16,
          label: "Open in Google Maps",
          button: {
            background: NEW_KEYS.accent,
            textColor: NEW_KEYS.onAccent,
            borderColor: NEW_KEYS.accent,
            radius: 999,
          },
        }),
        divider("onk_v_rule", 8, 80, 84, "#E0CDB4"),
        ...detailRow("onk_v_park", "icon_location", "Park on Rosebank or Separation St", {
          x: 10,
          y: 83.5,
          width: 74,
          aspect: PORTRAIT,
          iconColor: NEW_KEYS.accent,
          textColor: NEW_KEYS.muted,
          size: 3.4,
          fontSize: 9.5,
        }),
        ...detailRow("onk_v_door", "icon_bell", "Side gate is open - come round the back", {
          x: 10,
          y: 89,
          width: 74,
          aspect: PORTRAIT,
          iconColor: NEW_KEYS.accent,
          textColor: NEW_KEYS.muted,
          size: 3.4,
          fontSize: 9.5,
        }),
      ],
      { texture: "cotton", textureOpacity: 28, textureTint: "#F2E6D4", textureBlend: "multiply" },
    ),
    page(
      "RSVP",
      "rsvp",
      NEW_KEYS.bg,
      [
        text("onk_r_eyebrow", "LET US KNOW", 8, 12, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: NEW_KEYS.accent,
        }),
        text("onk_r_title", "Coming to\nwarm the house?", 8, 16.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 28,
          lineHeight: 1.14,
          color: NEW_KEYS.ink,
        }),
        text("onk_r_note", "A rough headcount helps with the dough", 8, 32, 84, {
          fontFamily: "forum",
          fontSize: 10.5,
          color: NEW_KEYS.muted,
        }),
        attendWidget("onk_r_attend", {
          x: 14,
          y: 37,
          width: 72,
          height: 14,
          label: "",
          yes: "We'll be there",
          no: "Can't this time",
          labelColor: NEW_KEYS.ink,
          button: {
            background: NEW_KEYS.accent,
            textColor: NEW_KEYS.onAccent,
            borderColor: NEW_KEYS.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        shortTextWidget("onk_r_count", {
          x: 14,
          y: 53,
          width: 72,
          height: 12,
          label: "How many of you?",
          placeholder: "e.g. 2 adults, 1 small human",
          labelColor: NEW_KEYS.ink,
          field: {
            background: NEW_KEYS.surface,
            textColor: NEW_KEYS.ink,
            borderColor: "#E0CDB4",
            borderWidth: 1,
            radius: 999,
          },
        }),
        shortTextWidget("onk_r_topping", {
          x: 14,
          y: 67,
          width: 72,
          height: 12,
          label: "Pizza topping you'd fight for",
          placeholder: "Go on…",
          labelColor: NEW_KEYS.ink,
          field: {
            background: NEW_KEYS.surface,
            textColor: NEW_KEYS.ink,
            borderColor: "#E0CDB4",
            borderWidth: 1,
            radius: 999,
          },
        }),
        shape("onk_r_mat", "rounded_square", 30, 84, 40, 8, NEW_KEYS.accent),
        text("onk_r_welcome", "WELCOME", 30, 86.5, 40, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 4,
          fontWeight: "bold",
          color: NEW_KEYS.onAccent,
        }),
      ],
      { texture: "cotton", textureOpacity: 28, textureTint: "#F2E6D4", textureBlend: "multiply" },
    ),
  ],
};

/** Christmas - deep spruce, candlelight and a gold star. */
const EVERGREEN: Palette = {
  bg: "#0F2A22",
  ink: "#FFFFFF",
  muted: "#9DBBAE",
  accent: "#D8A93F",
  onAccent: "#14261F",
  surface: "#173A2F",
};

/**
 * Layout: hand-set menu card. Full-bleed photograph cover, then courses with
 * dot leaders - no icon rows anywhere in the suite.
 */
const otherEvergreen: InvitationTemplate = {
  id: "other-evergreen",
  categoryId: "other",
  title: "Evergreen",
  description: "Christmas dinner in spruce and gold, set as a hand-written menu",
  eventTitle: "Christmas at ours",
  venue: { name: "The Long Room", address: "9 Elm Court, Hawthorn VIC" },
  rsvpPrompt: {
    prompt: "Joining us for Christmas?",
    note: "Reply by 10 December",
  },
  pages: [
    page("Cover", "cover", EVERGREEN.bg, [
      image("oev_c_photo", IMG.christmasTree, 0, 0, 100, 100, {
        frame: "square",
      }),
      scrim("oev_c_scrim", 34, 66, "10,32,26", 0.96),
      shape("oev_c_star", "star_8", 44, 44, 12, 6.8, EVERGREEN.accent),
      text("oev_c_eyebrow", "COME AS YOU ARE", 8, 56, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 4,
        fontWeight: "bold",
        color: EVERGREEN.accent,
      }),
      text("oev_c_title", "Christmas\nat ours", 8, 60.5, 84, {
        fontFamily: "instrument-serif",
        fontSize: 42,
        lineHeight: 1.06,
        color: EVERGREEN.ink,
      }),
      text("oev_c_hosts", "the Whitmores", 8, 80, 84, {
        fontFamily: "great-vibes",
        fontSize: 26,
        color: EVERGREEN.accent,
      }),
      divider("oev_c_rule", 40, 89, 20, EVERGREEN.accent),
      text("oev_c_when", "SATURDAY 20 DECEMBER  ·  6 PM", 8, 91.5, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2.2,
        fontWeight: "bold",
        color: "#CFE0D6",
      }),
    ]),
    // A menu card: courses with dot leaders, not an icon list.
    page("The menu", "details", EVERGREEN.surface, [
      guestName("oev_i_guest", 8, 8, 84, {
        fontFamily: "great-vibes",
        fontSize: 30,
        color: EVERGREEN.accent,
      }),
      text("oev_i_lead", "there's a chair with your name on it", 8, 17, 84, {
        fontFamily: "forum",
        fontSize: 11,
        color: EVERGREEN.muted,
      }),
      divider("oev_i_rule", 40, 23, 20, "#2E5C4C", "diamond"),
      text("oev_i_head", "AT THE TABLE", 8, 28, 84, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: EVERGREEN.accent,
      }),
      text("oev_i_c1", "Oysters & brown butter", 8, 34, 84, {
        fontFamily: "forum",
        fontSize: 13,
        color: EVERGREEN.ink,
      }),
      text("oev_i_c2", "Roast turkey, all the trimmings", 8, 40, 84, {
        fontFamily: "forum",
        fontSize: 13,
        color: EVERGREEN.ink,
      }),
      text("oev_i_c3", "Glazed ham & burnt honey carrots", 8, 46, 84, {
        fontFamily: "forum",
        fontSize: 13,
        color: EVERGREEN.ink,
      }),
      text("oev_i_c4", "Pudding, brandy cream", 8, 52, 84, {
        fontFamily: "forum",
        fontSize: 13,
        color: EVERGREEN.ink,
      }),
      text("oev_i_c5", "Cheese & port by the fire", 8, 58, 84, {
        fontFamily: "forum",
        fontSize: 13,
        color: EVERGREEN.ink,
      }),
      divider("oev_i_rule2", 40, 65, 20, "#2E5C4C", "diamond"),
      text("oev_i_time", "DRINKS 6 PM  ·  CARVING AT 7:30", 8, 69, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2.2,
        fontWeight: "bold",
        color: EVERGREEN.accent,
      }),
      text("oev_i_santa", "Secret Santa - $30 limit, bring it wrapped", 8, 74, 84, {
        fontFamily: "forum",
        fontSize: 10.5,
        color: EVERGREEN.muted,
      }),
      image("oev_i_photo", IMG.christmasTable, 10, 80, 80, 17, {
        frame: "rounded",
      }),
    ]),
    page("Venue", "location", EVERGREEN.bg, [
      text("oev_v_eyebrow", "FIND THE WARM ROOM", 8, 10, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.2,
        fontWeight: "bold",
        color: EVERGREEN.accent,
      }),
      text("oev_v_venue", "The Long Room", 8, 14.5, 84, {
        fontFamily: "instrument-serif",
        fontSize: 29,
        color: EVERGREEN.ink,
      }),
      text("oev_v_addr", "9 Elm Court · Hawthorn VIC 3122", 8, 23, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        color: EVERGREEN.muted,
      }),
      mapWidget("oev_v_map", {
        x: 8,
        y: 29,
        width: 84,
        height: 47,
        query: "Hawthorn Victoria Australia",
        radius: 14,
        label: "Open in Google Maps",
        button: {
          background: EVERGREEN.accent,
          textColor: EVERGREEN.onAccent,
          borderColor: EVERGREEN.accent,
          radius: 999,
        },
      }),
      divider("oev_v_rule", 8, 80, 84, "#2E5C4C"),
      ...detailRow("oev_v_park", "icon_location", "Street parking, no permits after 6", {
        x: 10,
        y: 83.5,
        width: 74,
        aspect: PORTRAIT,
        iconColor: EVERGREEN.accent,
        textColor: EVERGREEN.muted,
        size: 3.4,
        fontSize: 9.5,
      }),
      ...detailRow("oev_v_bring", "icon_wine", "Bring a bottle if the spirit moves you", {
        x: 10,
        y: 89,
        width: 74,
        aspect: PORTRAIT,
        iconColor: EVERGREEN.accent,
        textColor: EVERGREEN.muted,
        size: 3.4,
        fontSize: 9.5,
      }),
    ]),
    page("RSVP", "rsvp", EVERGREEN.bg, [
      shape("oev_r_star", "star_8", 44, 5, 12, 6.8, EVERGREEN.accent),
      text("oev_r_eyebrow", "RSVP BY 10 DECEMBER", 8, 15, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3,
        fontWeight: "bold",
        color: EVERGREEN.accent,
      }),
      text("oev_r_title", "Joining us\nfor Christmas?", 8, 19.5, 84, {
        fontFamily: "instrument-serif",
        fontSize: 28,
        lineHeight: 1.14,
        color: EVERGREEN.ink,
      }),
      attendWidget("oev_r_attend", {
        x: 14,
        y: 36,
        width: 72,
        height: 14,
        label: "",
        yes: "Yes - save me a cracker",
        no: "Away this year",
        labelColor: EVERGREEN.ink,
        button: {
          background: EVERGREEN.accent,
          textColor: EVERGREEN.onAccent,
          borderColor: EVERGREEN.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 999,
        },
      }),
      choiceWidget("oev_r_plate", "single_choice", {
        x: 14,
        y: 52,
        width: 72,
        height: 24,
        label: "Main plate",
        options: [
          { id: "turkey", label: "Roast turkey" },
          { id: "ham", label: "Glazed ham" },
          { id: "veg", label: "Vegetarian wellington" },
        ],
        labelColor: EVERGREEN.ink,
        option: {
          background: EVERGREEN.surface,
          textColor: EVERGREEN.ink,
          borderColor: "#2E5C4C",
          borderWidth: 1,
          radius: 999,
        },
        required: true,
      }),
      shortTextWidget("oev_r_santa", {
        x: 14,
        y: 79,
        width: 72,
        height: 12,
        label: "In for Secret Santa?",
        placeholder: "Yes / no - and a hint if yes",
        labelColor: EVERGREEN.ink,
        field: {
          background: EVERGREEN.surface,
          textColor: EVERGREEN.ink,
          borderColor: "#2E5C4C",
          borderWidth: 1,
          radius: 999,
        },
      }),
    ]),
  ],
};

/** New Year - midnight square with a champagne-gold countdown. */
const COUNTDOWN: Palette = {
  bg: "#0B0D1A",
  ink: "#FFFFFF",
  muted: "#9096B8",
  accent: "#E8C36B",
  onAccent: "#14172A",
  surface: "#161A2E",
};

/**
 * Layout: a clock face drawn from primitives, then a vertical countdown rail
 * with hour nodes down the left edge.
 */
const otherCountdown: InvitationTemplate = {
  id: "other-countdown",
  categoryId: "other",
  title: "Countdown",
  description: "Square New Year's Eve invite built around a midnight clock face",
  eventTitle: "New Year's Eve countdown",
  shape: "square",
  venue: { name: "Level 8, The Terrace", address: "180 Flinders St, Melbourne" },
  rsvpPrompt: {
    prompt: "See you at midnight?",
    note: "Reply by 20 December",
  },
  pages: [
    page("Cover", "cover", COUNTDOWN.bg, [
      image("ocd_c_photo", IMG.nyeFireworks, 0, 0, 100, 100, {
        frame: "square",
      }),
      scrim("ocd_c_scrim", 0, 100, "8,10,22", 0.86),
      shape(
        "ocd_c_ring",
        "circle",
        21,
        21,
        58,
        58,
        "linear-gradient(180deg, rgba(11,13,26,0.52) 0%, rgba(11,13,26,0.74) 100%)",
        { borderColor: COUNTDOWN.accent, borderWidth: 2 },
      ),
      shape("ocd_c_tick12", "rectangle", 49.6, 23.5, 0.8, 4, COUNTDOWN.accent),
      shape("ocd_c_tick3", "rectangle", 73.5, 49.6, 4, 0.8, COUNTDOWN.accent),
      shape("ocd_c_tick6", "rectangle", 49.6, 72.5, 0.8, 4, COUNTDOWN.accent),
      shape("ocd_c_tick9", "rectangle", 22.5, 49.6, 4, 0.8, COUNTDOWN.accent),
      shape("ocd_c_hand1", "rectangle", 49.4, 31, 1.2, 19, COUNTDOWN.ink),
      shape("ocd_c_hand2", "rectangle", 49.4, 35, 1.2, 15, COUNTDOWN.ink, {
        rotation: 28,
      }),
      shape("ocd_c_pin", "circle", 47.8, 47.8, 4.4, 4.4, COUNTDOWN.accent),
      text("ocd_c_eyebrow", "NEW YEAR'S EVE", 8, 9, 84, {
        fontFamily: "urbanist",
        fontSize: 12,
        letterSpacing: 6,
        fontWeight: "bold",
        color: COUNTDOWN.accent,
      }),
      text("ocd_c_title", "Countdown", 8, 60, 84, {
        fontFamily: "great-vibes",
        fontSize: 64,
        color: COUNTDOWN.ink,
      }),
      text("ocd_c_year", "HELLO 2028", 8, 80, 84, {
        fontFamily: "urbanist",
        fontSize: 14,
        letterSpacing: 8,
        fontWeight: "bold",
        color: COUNTDOWN.accent,
      }),
      text("ocd_c_when", "31 DECEMBER  ·  9 PM TILL LATE", 8, 89, 84, {
        fontFamily: "urbanist",
        fontSize: 11,
        letterSpacing: 2.6,
        fontWeight: "bold",
        color: "#C6CCE6",
      }),
    ]),
    // A vertical rail: the night counted down hour by hour.
    page("The night", "details", COUNTDOWN.surface, [
      guestName("ocd_i_guest", 8, 9, 84, {
        fontFamily: "great-vibes",
        fontSize: 42,
        color: COUNTDOWN.accent,
      }),
      text("ocd_i_lead", "one more year survived - let's see it out properly", 8, 21, 84, {
        fontFamily: "forum",
        fontSize: 14,
        color: COUNTDOWN.muted,
      }),
      shape("ocd_i_rail", "rectangle", 17.6, 32, 0.5, 50, "#2A3050"),
      shape("ocd_i_n1", "circle", 15.5, 32, 4.6, 4.6, COUNTDOWN.accent),
      text("ocd_i_t1", "9 PM", 24, 32, 30, {
        fontFamily: "urbanist",
        fontSize: 15,
        fontWeight: "bold",
        color: COUNTDOWN.ink,
        textAlign: "left",
      }),
      text("ocd_i_l1", "Doors, first pour, the good playlist", 24, 36.5, 66, {
        fontFamily: "urbanist",
        fontSize: 12,
        color: COUNTDOWN.muted,
        textAlign: "left",
      }),
      shape("ocd_i_n2", "circle", 15.5, 47, 4.6, 4.6, COUNTDOWN.accent),
      text("ocd_i_t2", "11 PM", 24, 47, 30, {
        fontFamily: "urbanist",
        fontSize: 15,
        fontWeight: "bold",
        color: COUNTDOWN.ink,
        textAlign: "left",
      }),
      text("ocd_i_l2", "Supper, sparklers, one bad speech", 24, 51.5, 66, {
        fontFamily: "urbanist",
        fontSize: 12,
        color: COUNTDOWN.muted,
        textAlign: "left",
      }),
      shape("ocd_i_n3", "circle", 15.5, 62, 4.6, 4.6, COUNTDOWN.accent),
      text("ocd_i_t3", "MIDNIGHT", 24, 62, 40, {
        fontFamily: "urbanist",
        fontSize: 15,
        fontWeight: "bold",
        color: COUNTDOWN.accent,
        textAlign: "left",
      }),
      text("ocd_i_l3", "Fireworks over the river, then dancing", 24, 66.5, 66, {
        fontFamily: "urbanist",
        fontSize: 12,
        color: COUNTDOWN.muted,
        textAlign: "left",
      }),
      shape("ocd_i_n4", "circle", 15.5, 77, 4.6, 4.6, COUNTDOWN.accent),
      text("ocd_i_t4", "LATE", 24, 77, 30, {
        fontFamily: "urbanist",
        fontSize: 15,
        fontWeight: "bold",
        color: COUNTDOWN.ink,
        textAlign: "left",
      }),
      text("ocd_i_l4", "Black tie, or black jeans - your call", 24, 81.5, 66, {
        fontFamily: "urbanist",
        fontSize: 12,
        color: COUNTDOWN.muted,
        textAlign: "left",
      }),
      image("ocd_i_photo", IMG.champagneSparkler, 8, 86, 84, 11, {
        frame: "rounded",
      }),
    ]),
    page("Venue", "location", COUNTDOWN.bg, [
      text("ocd_v_eyebrow", "EIGHT FLOORS UP", 8, 8, 84, {
        fontFamily: "urbanist",
        fontSize: 11,
        letterSpacing: 4,
        fontWeight: "bold",
        color: COUNTDOWN.accent,
      }),
      text("ocd_v_venue", "The Terrace", 8, 13, 84, {
        fontFamily: "instrument-serif",
        fontSize: 38,
        color: COUNTDOWN.ink,
      }),
      text("ocd_v_addr", "Level 8, 180 Flinders Street · Melbourne", 8, 22, 84, {
        fontFamily: "urbanist",
        fontSize: 12,
        color: COUNTDOWN.muted,
      }),
      mapWidget("ocd_v_map", {
        x: 8,
        y: 29,
        width: 84,
        height: 52,
        query: "180 Flinders Street Melbourne",
        radius: 14,
        label: "Open in Google Maps",
        button: {
          background: COUNTDOWN.accent,
          textColor: COUNTDOWN.onAccent,
          borderColor: COUNTDOWN.accent,
          radius: 999,
        },
      }),
      ...detailRow("ocd_v_note", "icon_sparkles", "Best fireworks view from the north deck", {
        x: 8,
        y: 87,
        width: 84,
        aspect: SQUARE,
        iconColor: COUNTDOWN.accent,
        textColor: COUNTDOWN.muted,
        size: 3.4,
        gap: 2,
        fontSize: 12,
      }),
    ]),
    page("RSVP", "rsvp", COUNTDOWN.bg, [
      text("ocd_r_eyebrow", "GUEST LIST", 8, 9, 84, {
        fontFamily: "urbanist",
        fontSize: 11,
        letterSpacing: 4.4,
        fontWeight: "bold",
        color: COUNTDOWN.accent,
      }),
      text("ocd_r_title", "See you\nat midnight?", 8, 14, 84, {
        fontFamily: "great-vibes",
        fontSize: 56,
        lineHeight: 1.04,
        color: COUNTDOWN.ink,
      }),
      text("ocd_r_note", "Reply by 20 December - the lift list closes then", 8, 38, 84, {
        fontFamily: "urbanist",
        fontSize: 12,
        color: COUNTDOWN.muted,
      }),
      attendWidget("ocd_r_attend", {
        x: 10,
        y: 44,
        width: 80,
        height: 13,
        label: "",
        yes: "Counting down with you",
        no: "Quiet one this year",
        labelColor: COUNTDOWN.ink,
        button: {
          background: COUNTDOWN.accent,
          textColor: COUNTDOWN.onAccent,
          borderColor: COUNTDOWN.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 999,
        },
      }),
      shortTextWidget("ocd_r_song", {
        x: 10,
        y: 60,
        width: 80,
        height: 11,
        label: "The song that has to play at 12:01",
        placeholder: "Artist - title",
        labelColor: COUNTDOWN.ink,
        field: {
          background: COUNTDOWN.surface,
          textColor: COUNTDOWN.ink,
          borderColor: "#2A3050",
          borderWidth: 1,
          radius: 999,
        },
      }),
      shortTextWidget("ocd_r_resolution", {
        x: 10,
        y: 73,
        width: 80,
        height: 11,
        label: "One resolution you'll break by February",
        placeholder: "We won't tell…",
        labelColor: COUNTDOWN.ink,
        field: {
          background: COUNTDOWN.surface,
          textColor: COUNTDOWN.ink,
          borderColor: "#2A3050",
          borderWidth: 1,
          radius: 999,
        },
      }),
      text("ocd_r_sign", "HELLO 2028", 8, 88, 84, {
        fontFamily: "urbanist",
        fontSize: 13,
        letterSpacing: 7,
        fontWeight: "bold",
        color: COUNTDOWN.accent,
      }),
    ]),
  ],
};

/** Easter - duck-egg blue and daffodil on a wide spring canvas. */
const SPRING: Palette = {
  bg: "#F2F6EF",
  ink: "#33473C",
  muted: "#71856F",
  accent: "#D99B3C",
  onAccent: "#FFFBF2",
  surface: "#FFFFFF",
};

/**
 * Layout: scrapbook. Overlapping photo cards pinned at angles rather than the
 * text-left / photo-right split used by Mediterranean Table.
 */
const otherSpringTable: InvitationTemplate = {
  id: "other-spring-table",
  categoryId: "other",
  title: "Spring Table",
  description: "Easter lunch as a pinned scrapbook of eggs, tulips and long tables",
  eventTitle: "Easter Sunday lunch",
  shape: "landscape",
  venue: { name: "The Orchard House", address: "88 Bell Road, Red Hill VIC" },
  rsvpPrompt: {
    prompt: "Coming for Easter lunch?",
    note: "Reply by Palm Sunday",
  },
  pages: [
    page(
      "Cover",
      "cover",
      SPRING.bg,
      [
        // Three cards pinned at angles - scrapbook, not a column split.
        image("ost_c_p1", IMG.easterNest, 4, 8, 30, 62, {
          frame: "square",
          rotation: -6,
          effects: lift(8, 16, 60),
        }),
        image("ost_c_p2", IMG.easterTulips, 30, 24, 30, 66, {
          frame: "square",
          rotation: 4,
          effects: lift(8, 16, 60),
        }),
        shape("ost_c_egg1", "circle", 60, 6, 7, 12.4, "#A9CBDD"),
        shape("ost_c_egg2", "circle", 67, 3, 5.5, 9.8, "#F0D274"),
        text("ost_c_eyebrow", "EASTER SUNDAY LUNCH", 62, 24, 34, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.2,
          fontWeight: "bold",
          color: SPRING.accent,
          textAlign: "left",
        }),
        text("ost_c_title", "Long table,\nlong afternoon", 62, 33, 36, {
          fontFamily: "instrument-serif",
          fontSize: 32,
          lineHeight: 1.08,
          color: SPRING.ink,
          textAlign: "left",
        }),
        text("ost_c_hosts", "with the Bellinis", 62, 62, 34, {
          fontFamily: "great-vibes",
          fontSize: 26,
          color: SPRING.accent,
          textAlign: "left",
        }),
        divider("ost_c_rule", 62, 76, 12, SPRING.accent),
        text("ost_c_when", "SUNDAY 4 APRIL  ·  FROM NOON", 62, 81, 36, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 2,
          fontWeight: "bold",
          color: SPRING.ink,
          textAlign: "left",
        }),
      ],
      { texture: "cotton", textureOpacity: 22, textureBlend: "multiply" },
    ),
    // A run sheet across three columns - nothing like the menu list opposite.
    page(
      "The day",
      "details",
      SPRING.surface,
      [
        text("ost_d_eyebrow", "HOW THE DAY GOES", 6, 11, 40, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3,
          fontWeight: "bold",
          color: SPRING.accent,
          textAlign: "left",
        }),
        text("ost_d_title", "Hunt, eat, then nap.", 6, 19, 60, {
          fontFamily: "instrument-serif",
          fontSize: 34,
          color: SPRING.ink,
          textAlign: "left",
        }),
        divider("ost_d_rule", 6, 36, 88, "#D8E2D4"),
        shape("ost_d_n1", "circle", 6, 42, 5.5, 9.8, "#A9CBDD"),
        text("ost_d_t1", "11:30", 6, 55, 26, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 1.6,
          fontWeight: "bold",
          color: SPRING.accent,
          textAlign: "left",
        }),
        text("ost_d_l1", "Egg hunt in the orchard\nfor everyone under ten", 6, 62, 26, {
          fontFamily: "forum",
          fontSize: 11.5,
          lineHeight: 1.6,
          color: SPRING.ink,
          textAlign: "left",
        }),
        shape("ost_d_n2", "circle", 37, 42, 5.5, 9.8, "#F0D274"),
        text("ost_d_t2", "12:30", 37, 55, 26, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 1.6,
          fontWeight: "bold",
          color: SPRING.accent,
          textAlign: "left",
        }),
        text("ost_d_l2", "Lunch on the long table\nunder the fig tree", 37, 62, 26, {
          fontFamily: "forum",
          fontSize: 11.5,
          lineHeight: 1.6,
          color: SPRING.ink,
          textAlign: "left",
        }),
        shape("ost_d_n3", "circle", 68, 42, 5.5, 9.8, "#E6A8A0"),
        text("ost_d_t3", "3:00", 68, 55, 26, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 1.6,
          fontWeight: "bold",
          color: SPRING.accent,
          textAlign: "left",
        }),
        text("ost_d_l3", "Hot cross buns, coffee\nand a very slow finish", 68, 62, 26, {
          fontFamily: "forum",
          fontSize: 11.5,
          lineHeight: 1.6,
          color: SPRING.ink,
          textAlign: "left",
        }),
        divider("ost_d_rule2", 6, 84, 88, "#D8E2D4"),
        text("ost_d_note", "Gumboots for the orchard · rugs and blankets provided", 6, 88, 88, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: SPRING.muted,
          textAlign: "left",
        }),
      ],
      { texture: "cotton", textureOpacity: 18, textureBlend: "multiply" },
    ),
    page(
      "Venue",
      "location",
      SPRING.bg,
      [
        text("ost_v_eyebrow", "OUT ON THE PENINSULA", 5, 17, 36, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3,
          fontWeight: "bold",
          color: SPRING.accent,
          textAlign: "left",
        }),
        text("ost_v_venue", "The Orchard\nHouse", 5, 26, 40, {
          fontFamily: "instrument-serif",
          fontSize: 28,
          lineHeight: 1.12,
          color: SPRING.ink,
          textAlign: "left",
        }),
        text("ost_v_addr", "88 Bell Road, Red Hill VIC 3937", 5, 50, 40, {
          fontFamily: "urbanist",
          fontSize: 10,
          color: SPRING.muted,
          textAlign: "left",
        }),
        text("ost_v_note", "Ninety minutes from town · park along the fence line", 5, 59, 42, {
          fontFamily: "urbanist",
          fontSize: 9,
          color: SPRING.muted,
          textAlign: "left",
        }),
        image("ost_v_photo", IMG.springRanunculus, 2, 70, 20, 28, {
          frame: "circle",
        }),
        mapWidget("ost_v_map", {
          x: 49,
          y: 9,
          width: 46,
          height: 82,
          query: "Red Hill Victoria Australia",
          radius: 16,
          label: "Open in Google Maps",
          button: {
            background: SPRING.accent,
            textColor: SPRING.onAccent,
            borderColor: SPRING.accent,
            radius: 999,
          },
        }),
      ],
      { texture: "cotton", textureOpacity: 22, textureBlend: "multiply" },
    ),
    page(
      "RSVP",
      "rsvp",
      SPRING.surface,
      [
        shape("ost_r_egg1", "circle", 2, 66, 9, 16, "#A9CBDD"),
        shape("ost_r_egg2", "circle", 10, 76, 7, 12.4, "#F0D274"),
        text("ost_r_eyebrow", "A SPRING REPLY", 5, 14, 36, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3,
          fontWeight: "bold",
          color: SPRING.accent,
          textAlign: "left",
        }),
        text("ost_r_title", "Coming for\nEaster lunch?", 5, 23, 36, {
          fontFamily: "instrument-serif",
          fontSize: 28,
          lineHeight: 1.12,
          color: SPRING.ink,
          textAlign: "left",
        }),
        guestName("ost_r_guest", 5, 44, 34, {
          fontFamily: "great-vibes",
          fontSize: 24,
          color: SPRING.accent,
          textAlign: "left",
        }),
        text("ost_r_note", "Reply by Palm Sunday", 5, 56, 34, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: SPRING.muted,
          textAlign: "left",
        }),
        attendWidget("ost_r_attend", {
          x: 44,
          y: 16,
          width: 24,
          height: 22,
          label: "Your reply",
          yes: "We'll be there",
          no: "Away this Easter",
          labelColor: SPRING.ink,
          button: {
            background: SPRING.accent,
            textColor: SPRING.onAccent,
            borderColor: SPRING.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        shortTextWidget("ost_r_kids", {
          x: 72,
          y: 16,
          width: 24,
          height: 22,
          label: "How many egg hunters?",
          placeholder: "Ages help us hide them",
          labelColor: SPRING.ink,
          field: {
            background: SPRING.bg,
            textColor: SPRING.ink,
            borderColor: "#CFDCCB",
            borderWidth: 1,
            radius: 999,
          },
        }),
        shortTextWidget("ost_r_bring", {
          x: 44,
          y: 58,
          width: 52,
          height: 14,
          label: "Bringing a dish to share?",
          placeholder: "Salad, dessert, hot cross buns…",
          labelColor: SPRING.ink,
          field: {
            background: SPRING.bg,
            textColor: SPRING.ink,
            borderColor: "#CFDCCB",
            borderWidth: 1,
            radius: 999,
          },
        }),
      ],
      { texture: "cotton", textureOpacity: 18, textureBlend: "multiply" },
    ),
  ],
};

/** Promotion / new job - newsprint, ink and one electric blue. */
const BIG_NEWS: Palette = {
  bg: "#FFFFFF",
  ink: "#0E1116",
  muted: "#5F6B78",
  accent: "#1F5AE0",
  onAccent: "#FFFFFF",
  surface: "#F2F5FA",
};

/**
 * Layout: newspaper front page. Masthead, double rule, headline, byline and a
 * two-column story - no icon rows, no centred stack.
 */
const otherBigNews: InvitationTemplate = {
  id: "other-big-news",
  categoryId: "other",
  title: "Big News",
  description: "Promotion drinks set as a newspaper front page with a two-column story",
  eventTitle: "Amara's promotion drinks",
  venue: { name: "Bar Margaux", address: "111 Lonsdale St, Melbourne" },
  rsvpPrompt: {
    prompt: "Drinks to celebrate?",
    note: "Reply by Wednesday",
  },
  pages: [
    page("Cover", "cover", BIG_NEWS.bg, [
      text("obn_c_masthead", "THE DAILY BULLETIN", 6, 7, 88, {
        fontFamily: "bodoni-moda",
        fontSize: 20,
        letterSpacing: 1.4,
        fontWeight: "bold",
        color: BIG_NEWS.ink,
      }),
      divider("obn_c_r1", 6, 13.5, 88, BIG_NEWS.ink, "thick"),
      text("obn_c_dateline", "MELBOURNE  ·  FRIDAY 14 MARCH  ·  LATE EDITION", 6, 15, 88, {
        fontFamily: "urbanist",
        fontSize: 7.5,
        letterSpacing: 1.8,
        fontWeight: "bold",
        color: BIG_NEWS.muted,
      }),
      divider("obn_c_r2", 6, 19, 88, "#C9D2DA"),
      text("obn_c_headline", "SHE GOT\nTHE JOB", 6, 22, 88, {
        fontFamily: "bodoni-moda",
        fontSize: 46,
        fontWeight: "bold",
        lineHeight: 1.02,
        color: BIG_NEWS.ink,
      }),
      text("obn_c_sub", "Amara Okonkwo named Head of Design at Northbank Studio", 6, 41, 88, {
        fontFamily: "bodoni-moda",
        fontSize: 13,
        italic: true,
        lineHeight: 1.4,
        color: BIG_NEWS.muted,
      }),
      divider("obn_c_r3", 6, 49, 88, "#C9D2DA"),
      image("obn_c_photo", IMG.studioWoman, 6, 52, 88, 30, { frame: "square" }),
      text("obn_c_caption", "Okonkwo, pictured at the studio on Thursday.", 6, 83.5, 88, {
        fontFamily: "urbanist",
        fontSize: 8,
        italic: true,
        color: BIG_NEWS.muted,
      }),
      shape("obn_c_band", "rectangle", 6, 88, 88, 8, BIG_NEWS.accent),
      text("obn_c_cta", "DRINKS · FRIDAY 6 PM · BAR MARGAUX", 6, 90.5, 88, {
        fontFamily: "urbanist",
        fontSize: 10,
        letterSpacing: 2.2,
        fontWeight: "bold",
        color: BIG_NEWS.onAccent,
      }),
    ]),
    // Two-column story, justified - a front page continued inside.
    page("The story", "details", BIG_NEWS.bg, [
      text("obn_i_kicker", "CONTINUED FROM PAGE ONE", 6, 8, 88, {
        fontFamily: "urbanist",
        fontSize: 7.5,
        letterSpacing: 2.2,
        fontWeight: "bold",
        color: BIG_NEWS.accent,
      }),
      divider("obn_i_r1", 6, 12, 88, BIG_NEWS.ink),
      guestName("obn_i_guest", 6, 15, 88, {
        fontFamily: "bodoni-moda",
        fontSize: 24,
        fontWeight: "bold",
        color: BIG_NEWS.ink,
        textAlign: "left",
      }),
      text("obn_i_lead", "you heard it here first", 6, 22, 88, {
        fontFamily: "bodoni-moda",
        fontSize: 12,
        italic: true,
        color: BIG_NEWS.muted,
        textAlign: "left",
      }),
      shape("obn_i_col", "rectangle", 49.8, 28, 0.4, 38, "#C9D2DA"),
      text(
        "obn_i_c1",
        "Nine years, four studios and a great many late nights later, Amara takes the corner desk by the window she has been eyeing since her first week.",
        6,
        28,
        41,
        {
          fontFamily: "urbanist",
          fontSize: 9.5,
          lineHeight: 1.7,
          color: BIG_NEWS.ink,
          textAlign: "left",
        },
      ),
      text(
        "obn_i_c2",
        "There will be no speeches, no slides and absolutely no standups. There will be a tab, a booth, and every person who made the nine years worth it.",
        53,
        28,
        41,
        {
          fontFamily: "urbanist",
          fontSize: 9.5,
          lineHeight: 1.7,
          color: BIG_NEWS.ink,
          textAlign: "left",
        },
      ),
      divider("obn_i_r2", 6, 70, 88, "#C9D2DA"),
      text("obn_i_k1", "WHEN", 6, 73, 26, {
        fontFamily: "urbanist",
        fontSize: 8,
        letterSpacing: 2,
        fontWeight: "bold",
        color: BIG_NEWS.muted,
        textAlign: "left",
      }),
      text("obn_i_v1", "Friday 14 March, 6 pm", 6, 77, 44, {
        fontFamily: "urbanist",
        fontSize: 11.5,
        fontWeight: "bold",
        color: BIG_NEWS.ink,
        textAlign: "left",
      }),
      text("obn_i_k2", "WHERE", 53, 73, 26, {
        fontFamily: "urbanist",
        fontSize: 8,
        letterSpacing: 2,
        fontWeight: "bold",
        color: BIG_NEWS.muted,
        textAlign: "left",
      }),
      text("obn_i_v2", "Bar Margaux, Lonsdale St", 53, 77, 42, {
        fontFamily: "urbanist",
        fontSize: 11.5,
        fontWeight: "bold",
        color: BIG_NEWS.ink,
        textAlign: "left",
      }),
      divider("obn_i_r3", 6, 83, 88, "#C9D2DA"),
      image("obn_i_photo", IMG.officeHighFive, 6, 86, 88, 12, {
        frame: "square",
      }),
    ]),
    page("Venue", "location", BIG_NEWS.bg, [
      shape("obn_v_band", "rectangle", 0, 0, 100, 6, BIG_NEWS.accent),
      text("obn_v_eyebrow", "THE BAR", 8, 11, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.6,
        fontWeight: "bold",
        color: BIG_NEWS.accent,
        textAlign: "left",
      }),
      text("obn_v_venue", "Bar Margaux", 8, 15.5, 84, {
        fontFamily: "bodoni-moda",
        fontSize: 30,
        fontWeight: "bold",
        color: BIG_NEWS.ink,
        textAlign: "left",
      }),
      text("obn_v_addr", "111 Lonsdale Street · Melbourne VIC 3000", 8, 24, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        color: BIG_NEWS.muted,
        textAlign: "left",
      }),
      mapWidget("obn_v_map", {
        x: 8,
        y: 30,
        width: 84,
        height: 46,
        query: "Bar Margaux Lonsdale Street Melbourne",
        radius: 2,
        label: "Open in Google Maps",
        button: {
          background: BIG_NEWS.ink,
          textColor: BIG_NEWS.onAccent,
          borderColor: BIG_NEWS.ink,
          radius: 2,
        },
      }),
      divider("obn_v_rule", 8, 80, 84, "#C9D2DA"),
      ...detailRow("obn_v_door", "icon_location", "Downstairs, past the red curtain", {
        x: 8,
        y: 83.5,
        width: 76,
        aspect: PORTRAIT,
        iconColor: BIG_NEWS.accent,
        textColor: BIG_NEWS.muted,
        size: 3.4,
        fontSize: 9.5,
      }),
      ...detailRow("obn_v_tab", "icon_sparkles", "Tab open until 8, then you're on your own", {
        x: 8,
        y: 89,
        width: 76,
        aspect: PORTRAIT,
        iconColor: BIG_NEWS.accent,
        textColor: BIG_NEWS.muted,
        size: 3.4,
        fontSize: 9.5,
      }),
    ]),
    page("RSVP", "rsvp", BIG_NEWS.surface, [
      text("obn_r_eyebrow", "REPLY TO THE EDITOR", 8, 11, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3,
        fontWeight: "bold",
        color: BIG_NEWS.accent,
        textAlign: "left",
      }),
      text("obn_r_title", "Drinks to\ncelebrate?", 8, 15.5, 84, {
        fontFamily: "bodoni-moda",
        fontSize: 34,
        fontWeight: "bold",
        lineHeight: 1.1,
        color: BIG_NEWS.ink,
        textAlign: "left",
      }),
      text("obn_r_note", "Reply by Wednesday so we can size the booth", 8, 32, 84, {
        fontFamily: "urbanist",
        fontSize: 10,
        color: BIG_NEWS.muted,
        textAlign: "left",
      }),
      attendWidget("obn_r_attend", {
        x: 8,
        y: 37,
        width: 84,
        height: 14,
        label: "",
        yes: "I'll be there",
        no: "Celebrating remotely",
        labelColor: BIG_NEWS.ink,
        button: {
          background: BIG_NEWS.accent,
          textColor: BIG_NEWS.onAccent,
          borderColor: BIG_NEWS.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 2,
        },
      }),
      choiceWidget("obn_r_arrive", "single_choice", {
        x: 8,
        y: 53,
        width: 84,
        height: 24,
        label: "When are you getting there?",
        options: [
          { id: "six", label: "On the dot at 6" },
          { id: "seven", label: "After I've cleared my inbox" },
          { id: "late", label: "Late, as always" },
        ],
        labelColor: BIG_NEWS.ink,
        option: {
          background: BIG_NEWS.bg,
          textColor: BIG_NEWS.ink,
          borderColor: "#D4DBE6",
          borderWidth: 1,
          radius: 2,
        },
      }),
      shortTextWidget("obn_r_toast", {
        x: 8,
        y: 80,
        width: 84,
        height: 12,
        label: "A one-line toast for the new boss",
        placeholder: "Make it count…",
        labelColor: BIG_NEWS.ink,
        field: {
          background: BIG_NEWS.bg,
          textColor: BIG_NEWS.ink,
          borderColor: "#D4DBE6",
          borderWidth: 1,
          radius: 2,
        },
      }),
    ]),
  ],
};

/** Farewell - dusk blues and a boarding pass. */
const VOYAGE: Palette = {
  bg: "#EDF1F6",
  ink: "#1F2C3D",
  muted: "#69788C",
  accent: "#2E6F8E",
  onAccent: "#F4F9FC",
  surface: "#FFFFFF",
};

/**
 * Layout: boarding pass. Route strip on the cover, a full pass with stub and
 * field grid for the details - the most literal structure in the set.
 */
const otherBonVoyage: InvitationTemplate = {
  id: "other-bon-voyage",
  categoryId: "other",
  title: "Bon Voyage",
  description: "Farewell drinks issued as a boarding pass with a tear-off stub",
  eventTitle: "Elena's farewell drinks",
  venue: {
    name: "The Rooftop, Naval House",
    address: "5 Beach St, Port Melbourne VIC",
  },
  rsvpPrompt: { prompt: "One last round?", note: "Reply by 2 May" },
  pages: [
    page(
      "Cover",
      "cover",
      VOYAGE.bg,
      [
        image("obv_c_photo", IMG.airportWindow, 0, 0, 100, 52, {
          frame: "square",
        }),
        scrim("obv_c_scrim", 26, 26, "31,44,61", 0.9),
        text("obv_c_eyebrow", "A SEND-OFF FOR", 8, 40, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.6,
          fontWeight: "bold",
          color: "#BBD3E2",
        }),
        text("obv_c_name", "Elena", 8, 44.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 44,
          color: "#FFFFFF",
        }),
        // Route strip: origin, dotted path, destination.
        text("obv_c_from", "MEL", 10, 60, 24, {
          fontFamily: "urbanist",
          fontSize: 26,
          letterSpacing: 2,
          fontWeight: "bold",
          color: VOYAGE.ink,
        }),
        text("obv_c_fromcity", "MELBOURNE", 10, 67.5, 24, {
          fontFamily: "urbanist",
          fontSize: 8,
          letterSpacing: 1.6,
          color: VOYAGE.muted,
        }),
        shape("obv_c_d1", "circle", 38, 62.5, 2.2, 1.2, "#A9BFD2"),
        shape("obv_c_d2", "circle", 43, 62.5, 2.2, 1.2, "#A9BFD2"),
        shape("obv_c_plane", "triangle", 47, 60.5, 6, 3.4, VOYAGE.accent, {
          rotation: 90,
        }),
        shape("obv_c_d3", "circle", 54, 62.5, 2.2, 1.2, "#A9BFD2"),
        shape("obv_c_d4", "circle", 59, 62.5, 2.2, 1.2, "#A9BFD2"),
        text("obv_c_to", "LIS", 66, 60, 24, {
          fontFamily: "urbanist",
          fontSize: 26,
          letterSpacing: 2,
          fontWeight: "bold",
          color: VOYAGE.ink,
        }),
        text("obv_c_tocity", "LISBON", 66, 67.5, 24, {
          fontFamily: "urbanist",
          fontSize: 8,
          letterSpacing: 1.6,
          color: VOYAGE.muted,
        }),
        divider("obv_c_rule", 8, 76, 84, "#C6D5E2"),
        text("obv_c_when", "FRIDAY 9 MAY  ·  FROM 6 PM", 8, 79.5, 84, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 2.2,
          fontWeight: "bold",
          color: VOYAGE.ink,
        }),
        text("obv_c_where", "THE ROOFTOP · NAVAL HOUSE · PORT MELBOURNE", 8, 85, 84, {
          fontFamily: "urbanist",
          fontSize: 8,
          letterSpacing: 1.8,
          color: VOYAGE.muted,
        }),
        image("obv_c_plane2", IMG.planeGoldenHour, 8, 89, 84, 9, {
          frame: "rounded",
        }),
      ],
      { texture: "cotton", textureOpacity: 20, textureBlend: "multiply" },
    ),
    // The pass itself: field grid on the left, tear-off stub on the right.
    page("Boarding pass", "details", VOYAGE.bg, [
      text("obv_i_eyebrow", "BOARDING PASS", 8, 7, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 4,
        fontWeight: "bold",
        color: VOYAGE.accent,
      }),
      shape("obv_i_pass", "rounded_square", 6, 13, 88, 56, VOYAGE.surface, {
        effects: lift(8, 18, 62),
      }),
      shape("obv_i_perf", "rectangle", 68, 16, 0.35, 50, "#C6D5E2"),
      shape("obv_i_notch1", "circle", 66.6, 13.6, 3, 1.7, VOYAGE.bg),
      shape("obv_i_notch2", "circle", 66.6, 65.4, 3, 1.7, VOYAGE.bg),
      text("obv_i_k0", "PASSENGER", 10, 17, 30, {
        fontFamily: "urbanist",
        fontSize: 7.5,
        letterSpacing: 1.8,
        fontWeight: "bold",
        color: VOYAGE.muted,
        textAlign: "left",
      }),
      guestName("obv_i_guest", 10, 20, 54, {
        fontFamily: "urbanist",
        fontSize: 20,
        fontWeight: "bold",
        color: VOYAGE.ink,
        textAlign: "left",
      }),
      text("obv_i_k1", "DATE", 10, 28, 26, {
        fontFamily: "urbanist",
        fontSize: 7.5,
        letterSpacing: 1.8,
        fontWeight: "bold",
        color: VOYAGE.muted,
        textAlign: "left",
      }),
      text("obv_i_v1", "FRI 9 MAY", 10, 31.5, 26, {
        fontFamily: "urbanist",
        fontSize: 13,
        fontWeight: "bold",
        color: VOYAGE.ink,
        textAlign: "left",
      }),
      text("obv_i_k2", "BOARDING", 38, 28, 26, {
        fontFamily: "urbanist",
        fontSize: 7.5,
        letterSpacing: 1.8,
        fontWeight: "bold",
        color: VOYAGE.muted,
        textAlign: "left",
      }),
      text("obv_i_v2", "6:00 PM", 38, 31.5, 26, {
        fontFamily: "urbanist",
        fontSize: 13,
        fontWeight: "bold",
        color: VOYAGE.ink,
        textAlign: "left",
      }),
      text("obv_i_k3", "GATE", 10, 39, 26, {
        fontFamily: "urbanist",
        fontSize: 7.5,
        letterSpacing: 1.8,
        fontWeight: "bold",
        color: VOYAGE.muted,
        textAlign: "left",
      }),
      text("obv_i_v3", "ROOFTOP", 10, 42.5, 26, {
        fontFamily: "urbanist",
        fontSize: 13,
        fontWeight: "bold",
        color: VOYAGE.ink,
        textAlign: "left",
      }),
      text("obv_i_k4", "SEAT", 38, 39, 26, {
        fontFamily: "urbanist",
        fontSize: 7.5,
        letterSpacing: 1.8,
        fontWeight: "bold",
        color: VOYAGE.muted,
        textAlign: "left",
      }),
      text("obv_i_v4", "BESIDE HER", 38, 42.5, 26, {
        fontFamily: "urbanist",
        fontSize: 13,
        fontWeight: "bold",
        color: VOYAGE.ink,
        textAlign: "left",
      }),
      text("obv_i_k5", "BAGGAGE", 10, 50, 54, {
        fontFamily: "urbanist",
        fontSize: 7.5,
        letterSpacing: 1.8,
        fontWeight: "bold",
        color: VOYAGE.muted,
        textAlign: "left",
      }),
      text("obv_i_v5", "One photo for the wall", 10, 53.5, 54, {
        fontFamily: "urbanist",
        fontSize: 12,
        color: VOYAGE.ink,
        textAlign: "left",
      }),
      text("obv_i_k6", "NOTE", 10, 59.5, 54, {
        fontFamily: "urbanist",
        fontSize: 7.5,
        letterSpacing: 1.8,
        fontWeight: "bold",
        color: VOYAGE.muted,
        textAlign: "left",
      }),
      text("obv_i_v6", "No crying before ten o'clock", 10, 63, 54, {
        fontFamily: "urbanist",
        fontSize: 12,
        color: VOYAGE.ink,
        textAlign: "left",
      }),
      text("obv_i_stub", "MEL → LIS", 69, 22, 24, {
        fontFamily: "urbanist",
        fontSize: 11,
        letterSpacing: 0.8,
        fontWeight: "bold",
        color: VOYAGE.ink,
      }),
      shape("obv_i_stubplane", "triangle", 76, 29, 10, 5.6, VOYAGE.accent, {
        rotation: 90,
      }),
      text("obv_i_stubdate", "09 MAY\n6:00 PM", 69, 40, 24, {
        fontFamily: "urbanist",
        fontSize: 10,
        lineHeight: 1.6,
        fontWeight: "bold",
        color: VOYAGE.muted,
      }),
      text("obv_i_stubno", "NO. 001", 69, 58, 24, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2,
        fontWeight: "bold",
        color: VOYAGE.accent,
      }),
      image("obv_i_photo", IMG.farewellHug, 6, 73, 88, 24, { frame: "rounded" }),
    ]),
    page(
      "Venue",
      "location",
      VOYAGE.bg,
      [
        text("obv_v_eyebrow", "LAST DRINKS HERE", 8, 10, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: VOYAGE.accent,
        }),
        text("obv_v_venue", "Naval House", 8, 14.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 30,
          color: VOYAGE.ink,
        }),
        text("obv_v_addr", "5 Beach Street · Port Melbourne VIC 3207", 8, 23, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          color: VOYAGE.muted,
        }),
        mapWidget("obv_v_map", {
          x: 8,
          y: 29,
          width: 84,
          height: 47,
          query: "Beach Street Port Melbourne Victoria",
          radius: 14,
          label: "Open in Google Maps",
          button: {
            background: VOYAGE.accent,
            textColor: VOYAGE.onAccent,
            borderColor: VOYAGE.accent,
            radius: 999,
          },
        }),
        divider("obv_v_rule", 8, 80, 84, "#CBD7E3"),
        ...detailRow("obv_v_tram", "icon_location", "Tram 109 to Beacon Cove", {
          x: 10,
          y: 83.5,
          width: 74,
          aspect: PORTRAIT,
          iconColor: VOYAGE.accent,
          textColor: VOYAGE.muted,
          size: 3.4,
          fontSize: 9.5,
        }),
        ...detailRow("obv_v_sunset", "icon_sparkles", "Sunset over the bay at 5:40", {
          x: 10,
          y: 89,
          width: 74,
          aspect: PORTRAIT,
          iconColor: VOYAGE.accent,
          textColor: VOYAGE.muted,
          size: 3.4,
          fontSize: 9.5,
        }),
      ],
      { texture: "cotton", textureOpacity: 20, textureBlend: "multiply" },
    ),
    page(
      "RSVP",
      "rsvp",
      VOYAGE.bg,
      [
        text("obv_r_eyebrow", "BEFORE SHE GOES", 8, 12, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: VOYAGE.accent,
        }),
        text("obv_r_title", "One last round?", 8, 16.5, 84, {
          fontFamily: "instrument-serif",
          fontSize: 30,
          color: VOYAGE.ink,
        }),
        text("obv_r_note", "Reply by 2 May - she flies on the 16th", 8, 26, 84, {
          fontFamily: "forum",
          fontSize: 10.5,
          color: VOYAGE.muted,
        }),
        attendWidget("obv_r_attend", {
          x: 14,
          y: 31,
          width: 72,
          height: 14,
          label: "",
          yes: "I'll be there to wave her off",
          no: "Sending love from here",
          labelColor: VOYAGE.ink,
          button: {
            background: VOYAGE.accent,
            textColor: VOYAGE.onAccent,
            borderColor: VOYAGE.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        shortTextWidget("obv_r_memory", {
          x: 14,
          y: 47,
          width: 72,
          height: 12,
          label: "A memory for the wall",
          placeholder: "The one we always retell…",
          labelColor: VOYAGE.ink,
          field: {
            background: VOYAGE.surface,
            textColor: VOYAGE.ink,
            borderColor: "#CBD7E3",
            borderWidth: 1,
            radius: 999,
          },
        }),
        shortTextWidget("obv_r_visit", {
          x: 14,
          y: 61,
          width: 72,
          height: 12,
          label: "When are you visiting Lisbon?",
          placeholder: "She's holding you to this",
          labelColor: VOYAGE.ink,
          field: {
            background: VOYAGE.surface,
            textColor: VOYAGE.ink,
            borderColor: "#CBD7E3",
            borderWidth: 1,
            radius: 999,
          },
        }),
        shape("obv_r_d1", "circle", 20, 82, 2.6, 1.5, "#C4D5E4"),
        shape("obv_r_d2", "circle", 32, 80, 2.6, 1.5, "#C4D5E4"),
        shape("obv_r_d3", "circle", 44, 78, 2.6, 1.5, "#C4D5E4"),
        shape("obv_r_d4", "circle", 56, 76, 2.6, 1.5, "#C4D5E4"),
        shape("obv_r_plane", "triangle", 66, 71, 11, 6.2, VOYAGE.accent, {
          rotation: 135,
        }),
      ],
      { texture: "cotton", textureOpacity: 20, textureBlend: "multiply" },
    ),
  ],
};

/* ── Wedding · anniversary, engagement, hens ──────────────────────────── */

/** Ruby and old gold - an engraved keepsake card. */
const RUBY: Palette = {
  bg: "#F8F2EC",
  ink: "#3B121F",
  muted: "#8A6A6F",
  accent: "#9B1B3C",
  onAccent: "#FCF4EE",
  surface: "#FFFFFF",
};
const RUBY_GOLD = "#B4894F";

/**
 * Layout: engraved anniversary card. Double gold rule, one enormous numeral,
 * then a then-and-now photo diptych rather than a details card.
 */
const weddingRubyYears: InvitationTemplate = {
  id: "wedding-ruby-years",
  categoryId: "wedding",
  title: "Ruby Years",
  description: "Square engraved anniversary card with a then-and-now diptych",
  eventTitle: "Marisol & Rafael's 40th anniversary",
  shape: "square",
  venue: {
    name: "The Ortega house",
    address: "14 Beaconsfield Parade, Albert Park VIC",
  },
  rsvpPrompt: {
    prompt: "Will you raise a glass with us?",
    note: "Please reply by 20 January",
  },
  pages: [
    page(
      "Cover",
      "cover",
      RUBY.bg,
      [
        shape("wry_c_frame", "rectangle", 4.5, 4.5, 91, 91, RUBY.bg, {
          borderColor: RUBY_GOLD,
          borderWidth: 1,
        }),
        shape("wry_c_frame2", "rectangle", 6.5, 6.5, 87, 87, RUBY.bg, {
          borderColor: "#E3CFB2",
          borderWidth: 1,
        }),
        text("wry_c_eyebrow", "MARISOL & RAFAEL ORTEGA", 10, 12, 80, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 4.2,
          fontWeight: "bold",
          color: RUBY_GOLD,
        }),
        divider("wry_c_rule", 36, 17.5, 28, RUBY_GOLD, "diamond"),
        text("wry_c_number", "40", 10, 21, 80, {
          fontFamily: "bodoni-moda",
          fontSize: 116,
          lineHeight: 1,
          color: RUBY.accent,
        }),
        text("wry_c_years", "YEARS TOGETHER", 10, 44, 80, {
          fontFamily: "urbanist",
          fontSize: 11,
          letterSpacing: 5.6,
          fontWeight: "bold",
          color: RUBY.ink,
        }),
        image("wry_c_photo", IMG.annivSunset, 32, 50, 36, 36, {
          frame: "circle",
          effects: lift(5, 16, 68),
        }),
        text("wry_c_when", "SATURDAY 14 FEBRUARY 2027", 10, 86.5, 80, {
          fontFamily: "bodoni-moda",
          fontSize: 12,
          letterSpacing: 2.6,
          color: RUBY.ink,
        }),
        text("wry_c_where", "SIX IN THE EVENING · ALBERT PARK", 10, 90.5, 80, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.6,
          color: RUBY.muted,
        }),
      ],
      {
        texture: "cotton",
        textureOpacity: 30,
        textureTint: "#F0E2D2",
        textureBlend: "multiply",
      },
    ),
    // Forty years told as two photographs side by side - no icon rows.
    page(
      "Then & now",
      "details",
      RUBY.bg,
      [
        image("wry_i_lockets", ART.lockets, 42, 4, 16, 12),
        guestName("wry_i_guest", 8, 16.5, 84, {
          fontFamily: "great-vibes",
          fontSize: 21,
          color: RUBY.accent,
        }),
        text("wry_i_eyebrow", "FORTY YEARS IN TWO PICTURES", 8, 24.8, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 3.6,
          fontWeight: "bold",
          color: RUBY_GOLD,
        }),
        image("wry_i_then", IMG.annivCouple, 8, 28.5, 40, 33, {
          frame: "rounded",
        }),
        image("wry_i_now", IMG.annivHandsField, 52, 28.5, 40, 33, {
          frame: "rounded",
        }),
        text("wry_i_then_cap", "1987 · THE REGISTRY OFFICE", 8, 63.5, 40, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 1.8,
          fontWeight: "bold",
          color: RUBY.muted,
        }),
        text("wry_i_now_cap", "2027 · STILL WALKING", 52, 63.5, 40, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 1.8,
          fontWeight: "bold",
          color: RUBY.muted,
        }),
        divider("wry_i_rule", 36, 68, 28, RUBY_GOLD, "diamond"),
        text("wry_i_script", "Still each other's favourite", 8, 71.5, 84, {
          fontFamily: "great-vibes",
          fontSize: 32,
          color: RUBY.accent,
        }),
        text(
          "wry_i_body",
          "Four decades, three children and one very patient dog later, we are cooking for everyone who got us here. Six o'clock, long table, back garden.",
          12,
          80,
          76,
          {
            fontFamily: "forum",
            fontSize: 12,
            lineHeight: 1.55,
            color: RUBY.ink,
          },
        ),
        text("wry_i_note", "NO GIFTS - BRING A STORY", 8, 90, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.2,
          fontWeight: "bold",
          color: RUBY_GOLD,
        }),
      ],
      {
        texture: "cotton",
        textureOpacity: 30,
        textureTint: "#F0E2D2",
        textureBlend: "multiply",
      },
    ),
    page(
      "The house",
      "location",
      RUBY.bg,
      [
        shape("wry_v_frame", "rectangle", 4.5, 4.5, 91, 91, RUBY.bg, {
          borderColor: RUBY_GOLD,
          borderWidth: 1,
        }),
        text("wry_v_eyebrow", "WHERE IT ALL HAPPENS", 10, 11, 80, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 3.6,
          fontWeight: "bold",
          color: RUBY_GOLD,
        }),
        text("wry_v_venue", "The Ortega house", 10, 16, 80, {
          fontFamily: "bodoni-moda",
          fontSize: 30,
          lineHeight: 1.15,
          color: RUBY.ink,
        }),
        text("wry_v_addr", "14 Beaconsfield Parade · Albert Park VIC", 10, 25, 80, {
          fontFamily: "urbanist",
          fontSize: 10.5,
          color: RUBY.muted,
        }),
        mapWidget("wry_v_map", {
          x: 10,
          y: 31,
          width: 80,
          height: 48,
          query: "14 Beaconsfield Parade Albert Park Melbourne",
          radius: 10,
          label: "Open the map",
          button: {
            background: RUBY.accent,
            textColor: RUBY.onAccent,
            borderColor: RUBY.accent,
            radius: 4,
          },
        }),
        divider("wry_v_rule", 36, 83, 28, RUBY_GOLD, "diamond"),
        text("wry_v_note", "Street parking on Kerferd Road · the 96 tram stops two doors down", 12, 87, 76, {
          fontFamily: "forum",
          fontSize: 11.5,
          lineHeight: 1.5,
          color: RUBY.muted,
        }),
      ],
      {
        texture: "cotton",
        textureOpacity: 30,
        textureTint: "#F0E2D2",
        textureBlend: "multiply",
      },
    ),
    page(
      "RSVP",
      "rsvp",
      RUBY.bg,
      [
        text("wry_r_eyebrow", "R.S.V.P.", 8, 8, 84, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 6,
          fontWeight: "bold",
          color: RUBY_GOLD,
        }),
        text("wry_r_title", "Will you raise\na glass with us?", 8, 13, 84, {
          fontFamily: "bodoni-moda",
          fontSize: 30,
          lineHeight: 1.2,
          color: RUBY.ink,
        }),
        text("wry_r_note", "Please reply by 20 January - the lamb takes planning", 8, 28, 84, {
          fontFamily: "forum",
          fontSize: 12,
          color: RUBY.muted,
        }),
        attendWidget("wry_r_attend", {
          x: 10,
          y: 33,
          width: 80,
          height: 13,
          label: "",
          yes: "We'll be there",
          no: "With love, from afar",
          labelColor: RUBY.ink,
          button: {
            background: RUBY.accent,
            textColor: RUBY.onAccent,
            borderColor: RUBY.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 4,
          },
        }),
        choiceWidget("wry_r_menu", "single_choice", {
          x: 10,
          y: 49,
          width: 80,
          height: 23,
          label: "Choose your main",
          options: [
            { id: "lamb", label: "Slow-roasted lamb" },
            { id: "fish", label: "Sea bass with fennel" },
            { id: "garden", label: "Garden plate" },
          ],
          labelColor: RUBY.ink,
          option: {
            background: RUBY.surface,
            textColor: RUBY.ink,
            borderColor: "#DFC7CC",
            borderWidth: 1,
            radius: 4,
          },
        }),
        shortTextWidget("wry_r_memory", {
          x: 10,
          y: 76,
          width: 80,
          height: 12,
          label: "A memory of them for the toast",
          placeholder: "One line Rafael will pretend not to cry at…",
          labelColor: RUBY.ink,
          field: {
            background: RUBY.surface,
            textColor: RUBY.ink,
            borderColor: "#DFC7CC",
            borderWidth: 1,
            radius: 4,
          },
        }),
        image("wry_r_flutes", ART.champagneFlutes, 44, 89, 12, 9),
      ],
      {
        texture: "cotton",
        textureOpacity: 30,
        textureTint: "#F0E2D2",
        textureBlend: "multiply",
      },
    ),
  ],
};

/** Oat paper, terracotta ink and gold - a wax-sealed announcement. */
const OATSEAL: Palette = {
  bg: "#F4F1EA",
  ink: "#26221E",
  muted: "#857C71",
  accent: "#A8563F",
  onAccent: "#FBF6EF",
  surface: "#FFFFFF",
};
const SEAL_GOLD = "#C09A5E";

/**
 * Layout: announcement card sealed with wax, then a details page set inside a
 * gold ring floating over the photograph - no rectangles anywhere.
 */
const weddingSayYes: InvitationTemplate = {
  id: "wedding-say-yes",
  categoryId: "wedding",
  title: "Say Yes",
  description: "Square engagement announcement with a wax seal and a ring-set details page",
  eventTitle: "Anouk & Mateo's engagement party",
  shape: "square",
  venue: {
    name: "The Glasshouse",
    address: "48 Gertrude Street, Fitzroy VIC",
  },
  rsvpPrompt: {
    prompt: "Will you celebrate with us?",
    note: "Let us know by 20 May",
  },
  pages: [
    page(
      "Cover",
      "cover",
      OATSEAL.bg,
      [
        image("wsy_c_ringbox", ART.ringBox, 32, 7, 36, 27),
        text("wsy_c_names", "ANOUK & MATEO", 10, 37, 80, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 5.2,
          fontWeight: "bold",
          color: OATSEAL.muted,
        }),
        text("wsy_c_headline", "she said yes", 6, 41, 88, {
          fontFamily: "great-vibes",
          fontSize: 58,
          lineHeight: 1.15,
          color: OATSEAL.accent,
        }),
        divider("wsy_c_rule", 38, 57.5, 24, SEAL_GOLD, "dots"),
        text("wsy_c_when", "SATURDAY 12 JUNE 2027 · FIVE O'CLOCK", 8, 61, 84, {
          fontFamily: "urbanist",
          fontSize: 10.5,
          letterSpacing: 2.8,
          fontWeight: "bold",
          color: OATSEAL.ink,
        }),
        text("wsy_c_where", "THE GLASSHOUSE · FITZROY", 8, 65.5, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.6,
          color: OATSEAL.muted,
        }),
        shape("wsy_c_seal", "circle", 41, 73, 18, 18, OATSEAL.accent, {
          effects: lift(4, 10, 70),
        }),
        text("wsy_c_seal_text", "A & M", 41, 79.4, 18, {
          fontFamily: "cinzel-decorative",
          fontSize: 14,
          fontWeight: "bold",
          color: OATSEAL.onAccent,
        }),
        text("wsy_c_footer", "an engagement party - bring nothing but yourselves", 10, 93.5, 80, {
          fontFamily: "forum",
          fontSize: 11,
          color: OATSEAL.muted,
        }),
      ],
      {
        texture: "handmade",
        textureOpacity: 34,
        textureTint: "#E9DDC9",
        textureBlend: "multiply",
      },
    ),
    // The details sit inside a gold ring laid over the photograph.
    page(
      "The evening",
      "details",
      OATSEAL.bg,
      [
        image("wsy_i_photo", IMG.engageRingHands, 0, 0, 100, 100, {
          frame: "square",
        }),
        shape("wsy_i_ring", "circle", 9, 9, 82, 82, SEAL_GOLD),
        shape("wsy_i_disc", "circle", 11.5, 11.5, 77, 77, OATSEAL.bg),
        guestName("wsy_i_guest", 20, 19, 60, {
          fontFamily: "great-vibes",
          fontSize: 26,
          color: OATSEAL.accent,
        }),
        text("wsy_i_eyebrow", "YOU'RE INVITED TO THE PARTY", 20, 29, 60, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.2,
          fontWeight: "bold",
          color: OATSEAL.accent,
        }),
        text("wsy_i_date", "Saturday 12 June", 16, 33.5, 68, {
          fontFamily: "bodoni-moda",
          fontSize: 26,
          lineHeight: 1.2,
          color: OATSEAL.ink,
        }),
        divider("wsy_i_rule", 38, 43.5, 24, SEAL_GOLD, "diamond"),
        text("wsy_i_time", "FIVE IN THE AFTERNOON", 20, 47, 60, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 3,
          fontWeight: "bold",
          color: OATSEAL.muted,
        }),
        text("wsy_i_venue", "THE GLASSHOUSE · FITZROY", 20, 51.5, 60, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 3,
          color: OATSEAL.muted,
        }),
        text("wsy_i_dress", "Dress: garden formal", 20, 57.5, 60, {
          fontFamily: "forum",
          fontSize: 14,
          color: OATSEAL.ink,
        }),
        text("wsy_i_line", "Fizz on the terrace, then dinner under the vines.", 22, 63.5, 56, {
          fontFamily: "forum",
          fontSize: 11.5,
          lineHeight: 1.5,
          color: OATSEAL.muted,
        }),
        image("wsy_i_ring_art", ART.solitaire, 44, 73, 12, 12),
      ],
    ),
    page(
      "Finding us",
      "location",
      OATSEAL.bg,
      [
        text("wsy_v_eyebrow", "FINDING US", 8, 8, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 4.2,
          fontWeight: "bold",
          color: OATSEAL.accent,
        }),
        text("wsy_v_venue", "The Glasshouse", 8, 12.5, 84, {
          fontFamily: "bodoni-moda",
          fontSize: 30,
          lineHeight: 1.15,
          color: OATSEAL.ink,
        }),
        text("wsy_v_addr", "48 Gertrude Street · Fitzroy VIC 3065", 8, 21, 84, {
          fontFamily: "urbanist",
          fontSize: 10.5,
          color: OATSEAL.muted,
        }),
        // The map sits in a white mount, like a photograph in an album.
        shape("wsy_v_mount", "rectangle", 6, 27, 88, 55, OATSEAL.surface, {
          effects: lift(6, 18, 74),
        }),
        mapWidget("wsy_v_map", {
          x: 10,
          y: 30.5,
          width: 80,
          height: 48,
          query: "Gertrude Street Fitzroy Melbourne",
          radius: 6,
          label: "Open in Google Maps",
          button: {
            background: OATSEAL.accent,
            textColor: OATSEAL.onAccent,
            borderColor: OATSEAL.accent,
            radius: 999,
          },
        }),
        ...detailRow("wsy_v_park", "icon_location", "Enter through the courtyard gate on Napier Street", {
          x: 8,
          y: 86,
          width: 84,
          aspect: SQUARE,
          iconColor: OATSEAL.accent,
          textColor: OATSEAL.muted,
          size: 3.2,
          gap: 2,
          fontSize: 11,
        }),
      ],
      {
        texture: "handmade",
        textureOpacity: 34,
        textureTint: "#E9DDC9",
        textureBlend: "multiply",
      },
    ),
    page(
      "RSVP",
      "rsvp",
      OATSEAL.bg,
      [
        image("wsy_r_couple", ART.proposalCouple, 40, 5, 20, 16, {
          color: OATSEAL.accent,
        }),
        text("wsy_r_eyebrow", "RSVP BY 20 MAY", 8, 23, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 4.2,
          fontWeight: "bold",
          color: SEAL_GOLD,
        }),
        text("wsy_r_title", "Will you celebrate\nwith us?", 8, 27, 84, {
          fontFamily: "bodoni-moda",
          fontSize: 28,
          lineHeight: 1.22,
          color: OATSEAL.ink,
        }),
        attendWidget("wsy_r_attend", {
          x: 10,
          y: 42,
          width: 80,
          height: 13,
          label: "",
          yes: "Yes - pour me one",
          no: "Can't make it",
          labelColor: OATSEAL.ink,
          button: {
            background: OATSEAL.accent,
            textColor: OATSEAL.onAccent,
            borderColor: OATSEAL.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("wsy_r_drink", "single_choice", {
          x: 10,
          y: 58,
          width: 80,
          height: 23,
          label: "What are we pouring you?",
          options: [
            { id: "fizz", label: "Champagne, obviously" },
            { id: "negroni", label: "A negroni" },
            { id: "soft", label: "Something soft" },
          ],
          labelColor: OATSEAL.ink,
          option: {
            background: OATSEAL.surface,
            textColor: OATSEAL.ink,
            borderColor: "#DDD2C2",
            borderWidth: 1,
            radius: 999,
          },
        }),
        shortTextWidget("wsy_r_guess", {
          x: 10,
          y: 85,
          width: 80,
          height: 12,
          label: "How do you reckon he asked?",
          placeholder: "Best guess wins a drink…",
          labelColor: OATSEAL.ink,
          field: {
            background: OATSEAL.surface,
            textColor: OATSEAL.ink,
            borderColor: "#DDD2C2",
            borderWidth: 1,
            radius: 999,
          },
        }),
      ],
      {
        texture: "handmade",
        textureOpacity: 34,
        textureTint: "#E9DDC9",
        textureBlend: "multiply",
      },
    ),
  ],
};

/** Dusty rose, sage and cream - a garden hens invitation. */
const PEONY: Palette = {
  bg: "#FBF0EE",
  ink: "#3E2A2E",
  muted: "#8E6F72",
  accent: "#C9737F",
  onAccent: "#FFF6F4",
  surface: "#FFFFFF",
};
const PEONY_SAGE = "#8F9E86";

/**
 * Layout: arch-window cover, then a 2×2 quadrant board that alternates photo
 * tiles and colour tiles - no stacked rows anywhere in the suite.
 */
const weddingHensPeonies: InvitationTemplate = {
  id: "wedding-hens-peonies",
  categoryId: "wedding",
  title: "Hens & Peonies",
  description: "Square bridal shower invite with an arch window and a quadrant board",
  eventTitle: "Freya's hens day",
  shape: "square",
  venue: {
    name: "Garden of the Pearl",
    address: "212 Drummond Street, Carlton VIC",
  },
  rsvpPrompt: {
    prompt: "Coming to Freya's hens?",
    note: "Reply by 24 April",
  },
  pages: [
    page(
      "Cover",
      "cover",
      PEONY.bg,
      [
        shape("whp_c_frame", "rectangle", 4, 4, 92, 92, PEONY.bg, {
          borderColor: "#E9C3C4",
          borderWidth: 1,
        }),
        image("whp_c_arch", IMG.hensGarden, 18, 9, 64, 62, {
          frame: "arch",
          effects: lift(6, 18, 70),
        }),
        image("whp_c_bouquet", ART.blushBouquet, 1, 2, 26, 22, {
          rotation: -12,
        }),
        image("whp_c_corsage", ART.roseCorsage, 68, 52, 27, 23, {
          rotation: 12,
        }),
        text("whp_c_eyebrow", "A HEN'S DAY FOR", 8, 74, 84, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 4.6,
          fontWeight: "bold",
          color: PEONY.accent,
        }),
        text("whp_c_name", "Freya", 8, 78, 84, {
          fontFamily: "great-vibes",
          fontSize: 52,
          lineHeight: 1.1,
          color: PEONY.ink,
        }),
        text("whp_c_when", "SATURDAY 8 MAY · ELEVEN O'CLOCK", 8, 91.5, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 2.8,
          fontWeight: "bold",
          color: PEONY.muted,
        }),
      ],
    ),
    // Four tiles, checkerboard: photo, colour, colour, photo.
    page(
      "The plan",
      "details",
      PEONY.bg,
      [
        text("whp_i_eyebrow", "THE PLAN", 8, 6.5, 84, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 5,
          fontWeight: "bold",
          color: PEONY.accent,
        }),
        guestName("whp_i_guest", 8, 11, 84, {
          fontFamily: "great-vibes",
          fontSize: 23,
          color: PEONY.ink,
        }),
        image("whp_i_picnic", IMG.hensPicnic, 8, 20, 40, 34, {
          frame: "rounded",
        }),
        shape("whp_i_when_tile", "rounded_square", 52, 20, 40, 34, PEONY.accent),
        text("whp_i_when_time", "11 AM", 52, 24, 40, {
          fontFamily: "bodoni-moda",
          fontSize: 30,
          lineHeight: 1.1,
          color: PEONY.onAccent,
        }),
        text("whp_i_when_date", "SATURDAY 8 MAY", 52, 32.5, 40, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.4,
          fontWeight: "bold",
          color: PEONY.onAccent,
        }),
        divider("whp_i_when_rule", 66, 37, 12, "#F0C3C6"),
        text("whp_i_when_venue", "GARDEN OF THE PEARL\nCARLTON", 54, 39.5, 36, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 1.8,
          lineHeight: 1.5,
          color: "#FBE0E1",
        }),
        shape("whp_i_wear_tile", "rounded_square", 8, 58, 40, 34, PEONY.surface),
        text("whp_i_wear_label", "WEAR", 8, 62, 40, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: PEONY_SAGE,
        }),
        text("whp_i_wear_body", "Florals\n& flats", 8, 67, 40, {
          fontFamily: "great-vibes",
          fontSize: 28,
          lineHeight: 1.15,
          color: PEONY.ink,
        }),
        text("whp_i_wear_note", "we're standing on grass all day", 10, 84, 36, {
          fontFamily: "forum",
          fontSize: 10,
          lineHeight: 1.4,
          color: PEONY.muted,
        }),
        image("whp_i_cake", IMG.hensCake, 52, 58, 40, 34, {
          frame: "rounded",
        }),
      ],
    ),
    page(
      "The garden",
      "location",
      PEONY.bg,
      [
        image("whp_v_spray", ART.tableSpray, 30, 4, 40, 16),
        text("whp_v_eyebrow", "WHERE", 8, 21, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 4.6,
          fontWeight: "bold",
          color: PEONY.accent,
        }),
        text("whp_v_venue", "Garden of the Pearl", 8, 25, 84, {
          fontFamily: "bodoni-moda",
          fontSize: 28,
          lineHeight: 1.15,
          color: PEONY.ink,
        }),
        text("whp_v_addr", "212 Drummond Street · Carlton VIC 3053", 8, 33, 84, {
          fontFamily: "urbanist",
          fontSize: 10.5,
          color: PEONY.muted,
        }),
        mapWidget("whp_v_map", {
          x: 10,
          y: 39,
          width: 80,
          height: 43,
          query: "Drummond Street Carlton Melbourne",
          radius: 22,
          label: "Take me to the garden",
          button: {
            background: PEONY_SAGE,
            textColor: "#FFFFFF",
            borderColor: PEONY_SAGE,
            radius: 999,
          },
        }),
        ...detailRow("whp_v_park", "icon_location", "Park on Drummond Street - the gate is beside the fig tree", {
          x: 8,
          y: 86,
          width: 84,
          aspect: SQUARE,
          iconColor: PEONY.accent,
          textColor: PEONY.muted,
          size: 3.2,
          gap: 2,
          fontSize: 11,
        }),
      ],
    ),
    page(
      "RSVP",
      "rsvp",
      PEONY.bg,
      [
        image("whp_r_cake", ART.blushCake, 38, 4, 24, 14),
        text("whp_r_eyebrow", "REPLY BY 24 APRIL", 8, 20, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 4,
          fontWeight: "bold",
          color: PEONY.accent,
        }),
        text("whp_r_title", "Coming to\nFreya's hens?", 8, 24, 84, {
          fontFamily: "bodoni-moda",
          fontSize: 28,
          lineHeight: 1.22,
          color: PEONY.ink,
        }),
        attendWidget("whp_r_attend", {
          x: 10,
          y: 40,
          width: 80,
          height: 13,
          label: "",
          yes: "Count me in",
          no: "Can't make it",
          labelColor: PEONY.ink,
          button: {
            background: PEONY.accent,
            textColor: PEONY.onAccent,
            borderColor: PEONY.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("whp_r_games", "multi_choice", {
          x: 10,
          y: 55,
          width: 80,
          height: 24,
          label: "Which bits are you up for?",
          options: [
            { id: "cocktails", label: "Cocktail masterclass" },
            { id: "crowns", label: "Flower crowns" },
            { id: "quiz", label: "How well do you know Freya?" },
          ],
          labelColor: PEONY.ink,
          option: {
            background: PEONY.surface,
            textColor: PEONY.ink,
            borderColor: "#EBC9CB",
            borderWidth: 1,
            radius: 999,
          },
        }),
        shortTextWidget("whp_r_advice", {
          x: 10,
          y: 82,
          width: 80,
          height: 12,
          label: "One line of advice for the bride",
          placeholder: "We're reading these out over lunch…",
          labelColor: PEONY.ink,
          field: {
            background: PEONY.surface,
            textColor: PEONY.ink,
            borderColor: "#EBC9CB",
            borderWidth: 1,
            radius: 999,
          },
        }),
      ],
    ),
  ],
};

/* ── Birthday · square club flyers ────────────────────────────────────── */

/** Midnight, hot pink and acid lime - a club flyer palette. */
const NEON: Palette = {
  bg: "#0B0A14",
  ink: "#F5F1FF",
  muted: "#A79EC8",
  accent: "#FF3D9A",
  onAccent: "#FFFFFF",
  surface: "#171331",
};
const NEON_LIME = "#C6FF4F";

/**
 * Layout: club flyer. Full-bleed cover with one huge numeral, then a festival
 * line-up rather than a details card.
 */
const birthdayDiscoBall: InvitationTemplate = {
  id: "birthday-disco-ball",
  categoryId: "birthday",
  title: "Disco Ball",
  description: "Square club flyer with a festival line-up and neon RSVP",
  eventTitle: "Zoë's 22nd",
  shape: "square",
  venue: {
    name: "Revolver Upstairs",
    address: "229 Chapel Street, Prahran VIC",
  },
  rsvpPrompt: {
    prompt: "Are you in?",
    note: "Numbers to the door by 28 August",
  },
  pages: [
    page("Cover", "cover", NEON.bg, [
      image("bdb_c_photo", IMG.discoNeon, 0, 0, 100, 100, { frame: "square" }),
      scrim("bdb_c_scrim", 26, 74, "11,10,20", 0.96),
      shape(
        "bdb_c_bar",
        "rectangle",
        0,
        0,
        100,
        1.4,
        "linear-gradient(90deg, #FF3D9A 0%, #C6FF4F 100%)",
      ),
      text("bdb_c_eyebrow", "ZOË ADEYEMI TURNS", 8, 47, 84, {
        fontFamily: "urbanist",
        fontSize: 12,
        letterSpacing: 6,
        fontWeight: "bold",
        color: NEON_LIME,
      }),
      text("bdb_c_number", "22", 6, 51, 88, {
        fontFamily: "urbanist",
        fontSize: 120,
        fontWeight: "bold",
        lineHeight: 1,
        color: NEON.ink,
      }),
      shape(
        "bdb_c_rule",
        "rectangle",
        8,
        75,
        84,
        0.5,
        "linear-gradient(90deg, #FF3D9A 0%, #C6FF4F 100%)",
      ),
      text("bdb_c_when", "SATURDAY 4 SEPTEMBER · 9 PM TILL LATE", 8, 78, 84, {
        fontFamily: "urbanist",
        fontSize: 10.5,
        letterSpacing: 2.8,
        fontWeight: "bold",
        color: NEON.ink,
      }),
      text("bdb_c_where", "REVOLVER UPSTAIRS · PRAHRAN", 8, 82.5, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2.8,
        color: NEON.muted,
      }),
      shape("bdb_c_pill", "rounded_square", 29, 88, 42, 6.6, NEON.accent),
      text("bdb_c_pill_text", "DRESS CODE: SHINY", 29, 89.6, 42, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 3,
        fontWeight: "bold",
        color: NEON.onAccent,
      }),
    ]),
    // Running order as a festival line-up: act, then time underneath.
    page(
      "Line-up",
      "details",
      NEON.bg,
      [
        guestName("bdb_i_guest", 8, 5, 84, {
          fontFamily: "great-vibes",
          fontSize: 30,
          color: NEON.accent,
        }),
        text("bdb_i_eyebrow", "THE LINE-UP", 8, 14, 84, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 6.4,
          fontWeight: "bold",
          color: NEON_LIME,
        }),
        text("bdb_i_a1", "DOORS & FIRST DANCE", 6, 19.5, 88, {
          fontFamily: "urbanist",
          fontSize: 27,
          fontWeight: "bold",
          lineHeight: 1.1,
          color: NEON.ink,
        }),
        text("bdb_i_t1", "9:00 PM", 6, 26.5, 88, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 3.4,
          color: NEON.muted,
        }),
        text("bdb_i_a2", "CAKE & CHAOS", 6, 33, 88, {
          fontFamily: "urbanist",
          fontSize: 27,
          fontWeight: "bold",
          lineHeight: 1.1,
          color: NEON.ink,
        }),
        text("bdb_i_t2", "10:30 PM", 6, 40, 88, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 3.4,
          color: NEON.muted,
        }),
        text("bdb_i_a3", "THE PLAYLIST TAKEOVER", 6, 46.5, 88, {
          fontFamily: "urbanist",
          fontSize: 27,
          fontWeight: "bold",
          lineHeight: 1.1,
          color: NEON.ink,
        }),
        text("bdb_i_t3", "11:45 PM", 6, 53.5, 88, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 3.4,
          color: NEON.muted,
        }),
        divider("bdb_i_rule", 34, 60.5, 32, NEON_LIME, "dots"),
        text("bdb_i_footer", "BRING YOUR WORST DANCE MOVE", 8, 63.5, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: NEON.accent,
        }),
        image("bdb_i_photo", IMG.colourCrowd, 0, 70, 100, 30, {
          frame: "square",
        }),
      ],
      { pattern: "dots" },
    ),
    page("Door", "location", NEON.bg, [
      text("bdb_v_eyebrow", "THE DOOR", 8, 8, 84, {
        fontFamily: "urbanist",
        fontSize: 10,
        letterSpacing: 6.4,
        fontWeight: "bold",
        color: NEON_LIME,
      }),
      text("bdb_v_venue", "REVOLVER\nUPSTAIRS", 8, 13, 84, {
        fontFamily: "urbanist",
        fontSize: 34,
        fontWeight: "bold",
        lineHeight: 1.05,
        color: NEON.ink,
      }),
      text("bdb_v_addr", "229 Chapel Street · Prahran VIC 3181", 8, 28, 84, {
        fontFamily: "urbanist",
        fontSize: 11,
        color: NEON.muted,
      }),
      shape("bdb_v_mount", "rounded_square", 7, 34, 86, 48, NEON.surface),
      mapWidget("bdb_v_map", {
        x: 10,
        y: 37,
        width: 80,
        height: 42,
        query: "Revolver Upstairs Chapel Street Prahran",
        radius: 14,
        label: "Get me there",
        button: {
          background: NEON.accent,
          textColor: NEON.onAccent,
          borderColor: NEON.accent,
          radius: 999,
        },
      }),
      ...detailRow("bdb_v_note", "icon_sparkles", "Say Zoë's name at the door - you're on the list", {
        x: 8,
        y: 86,
        width: 84,
        aspect: SQUARE,
        iconColor: NEON_LIME,
        textColor: NEON.muted,
        size: 3.2,
        gap: 2,
        fontSize: 11,
      }),
    ]),
    page(
      "RSVP",
      "rsvp",
      NEON.bg,
      [
        image("bdb_r_sparkler", IMG.sparklerGlass, 70, 5, 24, 24, {
          frame: "circle",
        }),
        text("bdb_r_eyebrow", "GUEST LIST CLOSES 28 AUG", 8, 8, 58, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: NEON_LIME,
          textAlign: "left",
        }),
        text("bdb_r_title", "ARE YOU\nIN?", 8, 13, 58, {
          fontFamily: "urbanist",
          fontSize: 40,
          fontWeight: "bold",
          lineHeight: 1.05,
          color: NEON.ink,
          textAlign: "left",
        }),
        attendWidget("bdb_r_attend", {
          x: 8,
          y: 34,
          width: 84,
          height: 13,
          label: "",
          yes: "I'm in",
          no: "Can't make it",
          labelColor: NEON.ink,
          button: {
            background: NEON.accent,
            textColor: NEON.onAccent,
            borderColor: NEON.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("bdb_r_home", "single_choice", {
          x: 8,
          y: 50,
          width: 84,
          height: 23,
          label: "How are you getting home?",
          options: [
            { id: "uber", label: "Splitting an Uber" },
            { id: "stay", label: "Crashing at Zoë's" },
            { id: "own", label: "Making my own way" },
          ],
          labelColor: NEON.ink,
          option: {
            background: NEON.surface,
            textColor: NEON.ink,
            borderColor: "#3B3168",
            borderWidth: 1,
            radius: 999,
          },
        }),
        shortTextWidget("bdb_r_song", {
          x: 8,
          y: 78,
          width: 84,
          height: 12,
          label: "One song you need played",
          placeholder: "It goes straight in the queue…",
          labelColor: NEON.ink,
          field: {
            background: NEON.surface,
            textColor: NEON.ink,
            borderColor: "#3B3168",
            borderWidth: 1,
            radius: 999,
          },
        }),
      ],
      { pattern: "dots" },
    ),
  ],
};

/** Warm cream, tangerine and electric blue - a Y2K poster palette. */
const Y2K: Palette = {
  bg: "#FFEFE4",
  ink: "#1A1327",
  muted: "#6E6480",
  accent: "#E8462C",
  onAccent: "#FFF6EF",
  surface: "#FFFFFF",
};
const Y2K_BLUE = "#3E3BE8";
const Y2K_SUN = "#FFC93C";

/**
 * Layout: photo poster with a card taped over it, then a photobooth strip
 * running down the left of the details page.
 */
const birthdayMainCharacter: InvitationTemplate = {
  id: "birthday-main-character",
  categoryId: "birthday",
  title: "Main Character",
  description: "Square Y2K poster with a photobooth strip run sheet",
  eventTitle: "Kai's 18th",
  shape: "square",
  venue: {
    name: "The rooftop at 24 Smith Street",
    address: "24 Smith Street, Collingwood VIC",
  },
  rsvpPrompt: {
    prompt: "Are you coming or what?",
    note: "Let Kai know by 14 March",
  },
  pages: [
    page("Cover", "cover", Y2K.bg, [
      image("bmc_c_photo", IMG.fringeParty, 0, 0, 100, 100, { frame: "square" }),
      image("bmc_c_sticker", ART.happyBirthdayInk, 3, 3, 34, 20, {
        rotation: -8,
      }),
      shape(
        "bmc_c_panel",
        "rounded_square",
        6,
        42,
        88,
        52,
        "linear-gradient(180deg, rgba(255,239,228,0.94) 0%, rgba(255,239,228,0.99) 100%)",
      ),
      text("bmc_c_name", "KAI NAKAMURA", 8, 46, 84, {
        fontFamily: "urbanist",
        fontSize: 11,
        letterSpacing: 5.2,
        fontWeight: "bold",
        color: Y2K.accent,
      }),
      text("bmc_c_headline", "IT'S KAI'S\n18TH", 8, 50, 84, {
        fontFamily: "urbanist",
        fontSize: 42,
        fontWeight: "bold",
        lineHeight: 1.05,
        color: Y2K.ink,
      }),
      divider("bmc_c_rule", 34, 68, 32, Y2K_BLUE, "dotted"),
      text("bmc_c_when", "FRIDAY 21 MARCH · 7 PM", 8, 71, 84, {
        fontFamily: "urbanist",
        fontSize: 10.5,
        letterSpacing: 2.8,
        fontWeight: "bold",
        color: Y2K.ink,
      }),
      text("bmc_c_where", "THE ROOFTOP AT 24 SMITH ST", 8, 75.5, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2.6,
        color: Y2K.muted,
      }),
      shape("bmc_c_dot1", "circle", 42, 81, 4, 4, Y2K.accent),
      shape("bmc_c_dot2", "circle", 48, 81, 4, 4, Y2K_SUN),
      shape("bmc_c_dot3", "circle", 54, 81, 4, 4, Y2K_BLUE),
      text("bmc_c_dress", "dress code: whatever makes you feel expensive", 16, 87, 68, {
        fontFamily: "forum",
        fontSize: 11.5,
        lineHeight: 1.4,
        color: Y2K.muted,
      }),
    ]),
    // Photobooth strip down the left, run sheet down the right.
    page("Run sheet", "details", Y2K.bg, [
      shape("bmc_i_strip", "rectangle", 8, 10, 26, 82, Y2K.ink),
      image("bmc_i_p1", IMG.balloonWoman, 10, 12, 22, 24, { frame: "square" }),
      image("bmc_i_p2", IMG.neonCake, 10, 38, 22, 24, { frame: "square" }),
      image("bmc_i_p3", IMG.sparklerGlass, 10, 64, 22, 24, { frame: "square" }),
      guestName("bmc_i_guest", 38, 9, 54, {
        fontFamily: "great-vibes",
        fontSize: 28,
        color: Y2K.accent,
        textAlign: "left",
      }),
      text("bmc_i_eyebrow", "HOW THE NIGHT GOES", 38, 18, 54, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: Y2K_BLUE,
        textAlign: "left",
      }),
      text("bmc_i_t1", "7:00", 38, 24, 13, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: Y2K.accent,
        textAlign: "left",
      }),
      text("bmc_i_l1", "Rooftop opens", 52, 24, 40, {
        fontFamily: "forum",
        fontSize: 13,
        color: Y2K.ink,
        textAlign: "left",
      }),
      text("bmc_i_t2", "8:30", 38, 32, 13, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: Y2K.accent,
        textAlign: "left",
      }),
      text("bmc_i_l2", "Pizza lands", 52, 32, 40, {
        fontFamily: "forum",
        fontSize: 13,
        color: Y2K.ink,
        textAlign: "left",
      }),
      text("bmc_i_t3", "9:30", 38, 40, 13, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: Y2K.accent,
        textAlign: "left",
      }),
      text("bmc_i_l3", "Cake, then karaoke", 52, 40, 40, {
        fontFamily: "forum",
        fontSize: 13,
        color: Y2K.ink,
        textAlign: "left",
      }),
      text("bmc_i_t4", "11:30", 38, 48, 13, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: Y2K.accent,
        textAlign: "left",
      }),
      text("bmc_i_l4", "Last song", 52, 48, 40, {
        fontFamily: "forum",
        fontSize: 13,
        color: Y2K.ink,
        textAlign: "left",
      }),
      divider("bmc_i_rule", 38, 57, 54, Y2K_BLUE, "dotted"),
      text("bmc_i_bring", "BRING", 38, 61, 54, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: Y2K_BLUE,
        textAlign: "left",
      }),
      text("bmc_i_bring_body", "A playlist request and an appetite. That's it.", 38, 65.5, 52, {
        fontFamily: "forum",
        fontSize: 12,
        lineHeight: 1.45,
        color: Y2K.muted,
        textAlign: "left",
      }),
      shape("bmc_i_tile", "rounded_square", 38, 76, 54, 16, Y2K.accent),
      text("bmc_i_tile_text", "NO GIFTS -\nJUST COME LOUD", 38, 79.5, 54, {
        fontFamily: "urbanist",
        fontSize: 12,
        letterSpacing: 2,
        fontWeight: "bold",
        lineHeight: 1.35,
        color: Y2K.onAccent,
      }),
    ]),
    page("Getting there", "location", Y2K.bg, [
      text("bmc_v_eyebrow", "GET YOURSELF HERE", 8, 8, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 4.4,
        fontWeight: "bold",
        color: Y2K.accent,
      }),
      text("bmc_v_venue", "THE ROOFTOP\nAT 24 SMITH ST", 8, 12.5, 84, {
        fontFamily: "urbanist",
        fontSize: 30,
        fontWeight: "bold",
        lineHeight: 1.08,
        color: Y2K.ink,
      }),
      text("bmc_v_addr", "24 Smith Street · Collingwood VIC 3066", 8, 27, 84, {
        fontFamily: "urbanist",
        fontSize: 11,
        color: Y2K.muted,
      }),
      shape("bmc_v_mount", "rounded_square", 7, 33, 86, 49, Y2K_BLUE),
      mapWidget("bmc_v_map", {
        x: 10,
        y: 36,
        width: 80,
        height: 43,
        query: "24 Smith Street Collingwood Melbourne",
        radius: 12,
        label: "Open the map",
        button: {
          background: Y2K_SUN,
          textColor: Y2K.ink,
          borderColor: Y2K_SUN,
          radius: 999,
        },
      }),
      ...detailRow("bmc_v_note", "icon_location", "Buzzer 3, then all the way up - the lift is slow, sorry", {
        x: 8,
        y: 86,
        width: 84,
        aspect: SQUARE,
        iconColor: Y2K.accent,
        textColor: Y2K.muted,
        size: 3.2,
        gap: 2,
        fontSize: 11,
      }),
    ]),
    page("RSVP", "rsvp", Y2K.bg, [
      shape("bmc_r_band", "rectangle", 0, 0, 100, 5, Y2K.accent),
      text("bmc_r_eyebrow", "REPLY BY 14 MARCH", 8, 10, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 4,
        fontWeight: "bold",
        color: Y2K_BLUE,
      }),
      text("bmc_r_title", "ARE YOU COMING\nOR WHAT?", 8, 14.5, 84, {
        fontFamily: "urbanist",
        fontSize: 32,
        fontWeight: "bold",
        lineHeight: 1.1,
        color: Y2K.ink,
      }),
      attendWidget("bmc_r_attend", {
        x: 10,
        y: 32,
        width: 80,
        height: 13,
        label: "",
        yes: "Obviously",
        no: "Can't make it",
        labelColor: Y2K.ink,
        button: {
          background: Y2K.accent,
          textColor: Y2K.onAccent,
          borderColor: Y2K.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 999,
        },
      }),
      choiceWidget("bmc_r_drink", "single_choice", {
        x: 10,
        y: 48,
        width: 80,
        height: 23,
        label: "What should we have waiting for you?",
        options: [
          { id: "fizzy", label: "Something fizzy" },
          { id: "mocktail", label: "A mocktail" },
          { id: "water", label: "Just water, thanks" },
        ],
        labelColor: Y2K.ink,
        option: {
          background: Y2K.surface,
          textColor: Y2K.ink,
          borderColor: "#E3D5C7",
          borderWidth: 1,
          radius: 999,
        },
      }),
      shortTextWidget("bmc_r_song", {
        x: 10,
        y: 75,
        width: 80,
        height: 12,
        label: "Add one song to the playlist",
        placeholder: "Kai is building the queue tonight…",
        labelColor: Y2K.ink,
        field: {
          background: Y2K.surface,
          textColor: Y2K.ink,
          borderColor: "#E3D5C7",
          borderWidth: 1,
          radius: 999,
        },
      }),
      image("bmc_r_cupcake", ART.cupcakeCoral, 42, 88, 16, 11),
    ]),
  ],
};

/* ── Baby & shower · for the parents ──────────────────────────────────── */

/** Garden sage and warm clay - a shower thrown for the parents, not the bump. */
const CLAY: Palette = {
  bg: "#F2F4EC",
  ink: "#2E3A2E",
  muted: "#79856F",
  accent: "#B4805A",
  onAccent: "#FBF8F2",
  surface: "#FFFFFF",
};

/**
 * Layout: arch-window cover, then the details written as an actual letter on a
 * card - prose and a signature instead of icon rows.
 */
const babyPartyOfThree: InvitationTemplate = {
  id: "baby-party-of-three",
  categoryId: "baby",
  title: "Party of Three",
  description: "Square baby shower for the parents-to-be, with a handwritten letter page",
  eventTitle: "Noor & Idris's baby shower",
  shape: "square",
  venue: {
    name: "The Rahman garden",
    address: "9 Bastings Street, Northcote VIC",
  },
  rsvpPrompt: {
    prompt: "Coming to celebrate Noor & Idris?",
    note: "Please reply by 5 September",
  },
  pages: [
    page(
      "Cover",
      "cover",
      CLAY.bg,
      [
        image("bpt_c_photo", IMG.parentsField, 24, 7, 52, 52, {
          frame: "arch",
          effects: lift(6, 18, 70),
        }),
        text("bpt_c_eyebrow", "A SHOWER FOR THE PARENTS-TO-BE", 8, 62, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 3.6,
          fontWeight: "bold",
          color: CLAY.accent,
        }),
        text("bpt_c_names", "Noor & Idris", 8, 66, 84, {
          fontFamily: "great-vibes",
          fontSize: 48,
          lineHeight: 1.15,
          color: CLAY.ink,
        }),
        divider("bpt_c_rule", 38, 79, 24, CLAY.accent, "diamond"),
        text("bpt_c_when", "SUNDAY 19 SEPTEMBER · TWO O'CLOCK", 8, 82.5, 84, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 2.8,
          fontWeight: "bold",
          color: CLAY.ink,
        }),
        text("bpt_c_where", "THE RAHMAN GARDEN · NORTHCOTE", 8, 87, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.6,
          color: CLAY.muted,
        }),
        image("bpt_c_elephant", ART.partyElephant, 44, 90, 12, 9),
      ],
      {
        texture: "linen",
        textureOpacity: 28,
        textureTint: "#E4E8D8",
        textureBlend: "multiply",
      },
    ),
    // The details, written as a letter from the parents rather than listed.
    page("A note from us", "details", CLAY.bg, [
      shape("bpt_i_card", "rectangle", 6, 5, 88, 90, CLAY.surface, {
        effects: lift(6, 20, 76),
      }),
      text("bpt_i_eyebrow", "A NOTE FROM NOOR & IDRIS", 12, 10, 76, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: CLAY.accent,
      }),
      guestName("bpt_i_guest", 12, 14, 76, {
        fontFamily: "great-vibes",
        fontSize: 26,
        color: CLAY.ink,
        textAlign: "left",
      }),
      text(
        "bpt_i_body",
        "We have spent nine months being asked how the baby is. On the nineteenth we would love one afternoon of being asked how we are.\n\nCome for cake in the garden, admire a pram neither of us can fold, and tell us something true about becoming a parent.",
        12,
        23,
        76,
        {
          fontFamily: "forum",
          fontSize: 13,
          lineHeight: 1.7,
          color: CLAY.ink,
          textAlign: "left",
        },
      ),
      text("bpt_i_signoff", "See you at two,", 12, 51, 76, {
        fontFamily: "forum",
        fontSize: 12,
        color: CLAY.muted,
        textAlign: "left",
      }),
      text("bpt_i_sign", "Noor & Idris", 12, 55, 76, {
        fontFamily: "great-vibes",
        fontSize: 30,
        color: CLAY.accent,
        textAlign: "left",
      }),
      image("bpt_i_photo", IMG.parentsGreen, 68, 54, 20, 20, {
        frame: "circle",
        effects: lift(4, 12, 74),
      }),
      divider("bpt_i_rule", 12, 78, 76, "#DCE0D0", "dashed"),
      text("bpt_i_l1", "WHEN", 11, 81, 26, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 2.6,
        fontWeight: "bold",
        color: CLAY.accent,
      }),
      text("bpt_i_v1", "2 pm, Sunday\n19 September", 11, 85, 26, {
        fontFamily: "forum",
        fontSize: 11,
        lineHeight: 1.45,
        color: CLAY.ink,
      }),
      text("bpt_i_l2", "WEAR", 37, 81, 26, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 2.6,
        fontWeight: "bold",
        color: CLAY.accent,
      }),
      text("bpt_i_v2", "Something soft\nand garden-proof", 37, 85, 26, {
        fontFamily: "forum",
        fontSize: 11,
        lineHeight: 1.45,
        color: CLAY.ink,
      }),
      text("bpt_i_l3", "BRING", 63, 81, 26, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 2.6,
        fontWeight: "bold",
        color: CLAY.accent,
      }),
      text("bpt_i_v3", "A book for the\nshelf, not a bow", 63, 85, 26, {
        fontFamily: "forum",
        fontSize: 11,
        lineHeight: 1.45,
        color: CLAY.ink,
      }),

    ]),
    // Map first, words underneath - the reverse of the usual venue page.
    page(
      "The garden",
      "location",
      CLAY.bg,
      [
        mapWidget("bpt_v_map", {
          x: 6,
          y: 6,
          width: 88,
          height: 50,
          query: "Bastings Street Northcote Melbourne",
          radius: 18,
          label: "Open in Google Maps",
          button: {
            background: CLAY.accent,
            textColor: CLAY.onAccent,
            borderColor: CLAY.accent,
            radius: 999,
          },
        }),
        text("bpt_v_eyebrow", "COME TO THE BACK GATE", 8, 60, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 3.6,
          fontWeight: "bold",
          color: CLAY.accent,
        }),
        text("bpt_v_venue", "The Rahman garden", 8, 64.5, 84, {
          fontFamily: "bodoni-moda",
          fontSize: 28,
          lineHeight: 1.15,
          color: CLAY.ink,
        }),
        text("bpt_v_addr", "9 Bastings Street · Northcote VIC 3070", 8, 73, 84, {
          fontFamily: "urbanist",
          fontSize: 10.5,
          color: CLAY.muted,
        }),
        divider("bpt_v_rule", 38, 78.5, 24, CLAY.accent, "diamond"),
        text("bpt_v_note", "The 86 tram stops on High Street, two minutes away. If it rains we move under the fig.", 12, 82, 76, {
          fontFamily: "forum",
          fontSize: 12,
          lineHeight: 1.55,
          color: CLAY.muted,
        }),
      ],
      {
        texture: "linen",
        textureOpacity: 28,
        textureTint: "#E4E8D8",
        textureBlend: "multiply",
      },
    ),
    page(
      "RSVP",
      "rsvp",
      CLAY.bg,
      [
        image("bpt_r_table", IMG.showerTable, 0, 0, 100, 20, {
          frame: "square",
        }),
        scrim("bpt_r_scrim", 8, 12, "46,58,46", 0.82),
        text("bpt_r_eyebrow", "RSVP BY 5 SEPTEMBER", 8, 14, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 3.6,
          fontWeight: "bold",
          color: "#E9EDDD",
        }),
        text("bpt_r_title", "Coming to celebrate\nNoor & Idris?", 8, 24, 84, {
          fontFamily: "bodoni-moda",
          fontSize: 26,
          lineHeight: 1.22,
          color: CLAY.ink,
        }),
        attendWidget("bpt_r_attend", {
          x: 10,
          y: 38,
          width: 80,
          height: 13,
          label: "",
          yes: "We'll be there",
          no: "Sending love instead",
          labelColor: CLAY.ink,
          button: {
            background: CLAY.accent,
            textColor: CLAY.onAccent,
            borderColor: CLAY.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("bpt_r_bring", "multi_choice", {
          x: 10,
          y: 54,
          width: 80,
          height: 24,
          label: "Bringing anything to the table?",
          options: [
            { id: "plate", label: "A plate to share" },
            { id: "flowers", label: "Something from the garden" },
            { id: "self", label: "Just myself, happily" },
          ],
          labelColor: CLAY.ink,
          option: {
            background: CLAY.surface,
            textColor: CLAY.ink,
            borderColor: "#D8DECC",
            borderWidth: 1,
            radius: 999,
          },
        }),
        shortTextWidget("bpt_r_advice", {
          x: 10,
          y: 81,
          width: 80,
          height: 12,
          label: "One piece of advice for two brand-new parents",
          placeholder: "They'll read every single one…",
          labelColor: CLAY.ink,
          field: {
            background: CLAY.surface,
            textColor: CLAY.ink,
            borderColor: "#D8DECC",
            borderWidth: 1,
            radius: 999,
          },
        }),
      ],
      {
        texture: "linen",
        textureOpacity: 28,
        textureTint: "#E4E8D8",
        textureBlend: "multiply",
      },
    ),
  ],
};

/* ── Corporate · offsite, year's end, hello & goodbye ─────────────────── */

/** Forest green and ochre - two days out of the office. */
const PINE: Palette = {
  bg: "#F3F5F1",
  ink: "#12261F",
  muted: "#5E7365",
  accent: "#D97B29",
  onAccent: "#FFF8F0",
  surface: "#FFFFFF",
};
const PINE_LIGHT = "#9DB3A5";

/**
 * Layout: landscape split cover - photograph on one half, solid colour on the
 * other - then a two-day agenda in facing columns.
 */
const corporateOffsite: InvitationTemplate = {
  id: "corporate-offsite-landscape",
  categoryId: "corporate",
  title: "Offsite",
  description: "Landscape team offsite with a split cover and a two-day agenda",
  eventTitle: "Northlane team offsite",
  shape: "landscape",
  venue: {
    name: "Wombat Hill House",
    address: "Lansell Street, Daylesford VIC",
  },
  rsvpPrompt: {
    prompt: "Are you on the bus?",
    note: "Confirm with People Ops by 3 October",
  },
  pages: [
    page("Cover", "cover", PINE.ink, [
      image("cof_c_photo", IMG.teamOutdoors, 0, 0, 50, 100, { frame: "square" }),
      shape("cof_c_panel", "rectangle", 50, 0, 50, 100, PINE.ink),
      text("cof_c_eyebrow", "NORTHLANE · TEAM OFFSITE", 56, 15, 40, {
        fontFamily: "urbanist",
        fontSize: 10,
        letterSpacing: 4,
        fontWeight: "bold",
        color: PINE.accent,
        textAlign: "left",
      }),
      text("cof_c_headline", "TWO DAYS\nOUT OF THE\nOFFICE", 56, 23, 42, {
        fontFamily: "urbanist",
        fontSize: 36,
        fontWeight: "bold",
        lineHeight: 1.06,
        color: PINE.onAccent,
        textAlign: "left",
      }),
      shape("cof_c_rule", "rectangle", 56, 58, 14, 0.7, PINE.accent),
      text("cof_c_when", "23-24 OCTOBER 2027", 56, 62, 40, {
        fontFamily: "urbanist",
        fontSize: 12,
        letterSpacing: 3,
        fontWeight: "bold",
        color: PINE.onAccent,
        textAlign: "left",
      }),
      text("cof_c_where", "WOMBAT HILL HOUSE · DAYLESFORD", 56, 69, 40, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 2.8,
        color: PINE_LIGHT,
        textAlign: "left",
      }),
      text("cof_c_note", "Buses leave the office at 7:30 am sharp. Yes, sharp.", 56, 84, 40, {
        fontFamily: "forum",
        fontSize: 11,
        lineHeight: 1.5,
        color: PINE_LIGHT,
        textAlign: "left",
      }),
    ]),
    // Two facing day columns - nothing stacked down the middle.
    page("The plan", "details", PINE.bg, [
      guestName("cof_i_guest", 6, 6, 50, {
        fontFamily: "great-vibes",
        fontSize: 24,
        color: PINE.accent,
        textAlign: "left",
      }),
      text("cof_i_d1", "DAY ONE - FRIDAY", 6, 17, 42, {
        fontFamily: "urbanist",
        fontSize: 10,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: PINE.ink,
        textAlign: "left",
      }),
      divider("cof_i_r1", 6, 22, 42, "#C9D3C6"),
      text("cof_i_t11", "8:30", 6, 25, 10, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: PINE.accent,
        textAlign: "left",
      }),
      text("cof_i_l11", "Bus, coffee, silence", 18, 25, 30, {
        fontFamily: "forum",
        fontSize: 12.5,
        color: PINE.ink,
        textAlign: "left",
      }),
      text("cof_i_t12", "11:00", 6, 33, 10, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: PINE.accent,
        textAlign: "left",
      }),
      text("cof_i_l12", "Where we're going next", 18, 33, 30, {
        fontFamily: "forum",
        fontSize: 12.5,
        color: PINE.ink,
        textAlign: "left",
      }),
      text("cof_i_t13", "2:00", 6, 41, 10, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: PINE.accent,
        textAlign: "left",
      }),
      text("cof_i_l13", "Forest walk, mixed teams", 18, 41, 30, {
        fontFamily: "forum",
        fontSize: 12.5,
        color: PINE.ink,
        textAlign: "left",
      }),
      text("cof_i_t14", "7:00", 6, 49, 10, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: PINE.accent,
        textAlign: "left",
      }),
      text("cof_i_l14", "Long table dinner", 18, 49, 30, {
        fontFamily: "forum",
        fontSize: 12.5,
        color: PINE.ink,
        textAlign: "left",
      }),
      text("cof_i_d2", "DAY TWO - SATURDAY", 53, 17, 42, {
        fontFamily: "urbanist",
        fontSize: 10,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: PINE.ink,
        textAlign: "left",
      }),
      divider("cof_i_r2", 53, 22, 42, "#C9D3C6"),
      text("cof_i_t21", "9:00", 53, 25, 10, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: PINE.accent,
        textAlign: "left",
      }),
      text("cof_i_l21", "Breakfast in the glasshouse", 65, 25, 31, {
        fontFamily: "forum",
        fontSize: 12.5,
        color: PINE.ink,
        textAlign: "left",
      }),
      text("cof_i_t22", "10:30", 53, 33, 10, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: PINE.accent,
        textAlign: "left",
      }),
      text("cof_i_l22", "Build something useless", 65, 33, 31, {
        fontFamily: "forum",
        fontSize: 12.5,
        color: PINE.ink,
        textAlign: "left",
      }),
      text("cof_i_t23", "1:00", 53, 41, 10, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: PINE.accent,
        textAlign: "left",
      }),
      text("cof_i_l23", "Lunch, then free time", 65, 41, 31, {
        fontFamily: "forum",
        fontSize: 12.5,
        color: PINE.ink,
        textAlign: "left",
      }),
      text("cof_i_t24", "4:00", 53, 49, 10, {
        fontFamily: "urbanist",
        fontSize: 11,
        fontWeight: "bold",
        color: PINE.accent,
        textAlign: "left",
      }),
      text("cof_i_l24", "Bus home", 65, 49, 31, {
        fontFamily: "forum",
        fontSize: 12.5,
        color: PINE.ink,
        textAlign: "left",
      }),
      image("cof_i_photo", IMG.teamHands, 6, 60, 42, 24, { frame: "rounded" }),
      text("cof_i_bring", "WHAT TO PACK", 53, 60, 42, {
        fontFamily: "urbanist",
        fontSize: 10,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: PINE.accent,
        textAlign: "left",
      }),
      text("cof_i_bring_body", "Walking shoes, a warm layer, one thing you'd change about how we work - and zero laptops.", 53, 66, 42, {
        fontFamily: "forum",
        fontSize: 12,
        lineHeight: 1.55,
        color: PINE.muted,
        textAlign: "left",
      }),
      shape("cof_i_band", "rectangle", 0, 88, 100, 12, PINE.ink),
      text("cof_i_band_text", "ROOMS ARE TWIN SHARE · TELL US NOW IF THAT'S A PROBLEM", 6, 92, 88, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 3,
        fontWeight: "bold",
        color: PINE_LIGHT,
      }),
    ]),
    page("Where", "location", PINE.bg, [
      text("cof_v_eyebrow", "WHERE WE'RE GOING", 6, 12, 42, {
        fontFamily: "urbanist",
        fontSize: 10,
        letterSpacing: 3.6,
        fontWeight: "bold",
        color: PINE.accent,
        textAlign: "left",
      }),
      text("cof_v_venue", "Wombat Hill\nHouse", 6, 19, 42, {
        fontFamily: "urbanist",
        fontSize: 30,
        fontWeight: "bold",
        lineHeight: 1.1,
        color: PINE.ink,
        textAlign: "left",
      }),
      text("cof_v_addr", "Lansell Street · Daylesford VIC 3460", 6, 40, 42, {
        fontFamily: "urbanist",
        fontSize: 11,
        color: PINE.muted,
        textAlign: "left",
      }),
      divider("cof_v_rule", 6, 47, 24, PINE.accent),
      text("cof_v_note", "Ninety minutes north-west. If you're driving yourself, the car park is behind the botanic gardens.", 6, 52, 40, {
        fontFamily: "forum",
        fontSize: 12,
        lineHeight: 1.55,
        color: PINE.muted,
        textAlign: "left",
      }),
      image("cof_v_photo", IMG.teamHike, 6, 72, 40, 20, { frame: "rounded" }),
      mapWidget("cof_v_map", {
        x: 52,
        y: 10,
        width: 42,
        height: 80,
        query: "Wombat Hill House Daylesford Victoria",
        radius: 14,
        label: "Open the map",
        button: {
          background: PINE.ink,
          textColor: PINE.onAccent,
          borderColor: PINE.ink,
          radius: 8,
        },
      }),
    ]),
    page("RSVP", "rsvp", PINE.bg, [
      shape("cof_r_panel", "rectangle", 0, 0, 46, 100, PINE.ink),
      text("cof_r_eyebrow", "CONFIRM BY 3 OCTOBER", 6, 20, 34, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: PINE.accent,
        textAlign: "left",
      }),
      text("cof_r_title", "ARE YOU\nON THE\nBUS?", 6, 28, 36, {
        fontFamily: "urbanist",
        fontSize: 34,
        fontWeight: "bold",
        lineHeight: 1.06,
        color: PINE.onAccent,
        textAlign: "left",
      }),
      text("cof_r_note", "People Ops needs numbers for rooms and the caterer.", 6, 72, 34, {
        fontFamily: "forum",
        fontSize: 11.5,
        lineHeight: 1.5,
        color: PINE_LIGHT,
        textAlign: "left",
      }),
      attendWidget("cof_r_attend", {
        x: 52,
        y: 8,
        width: 42,
        height: 16,
        label: "",
        yes: "I'm coming",
        no: "I can't make it",
        labelColor: PINE.ink,
        button: {
          background: PINE.accent,
          textColor: PINE.onAccent,
          borderColor: PINE.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 8,
        },
      }),
      choiceWidget("cof_r_food", "multi_choice", {
        x: 52,
        y: 27,
        width: 42,
        height: 37,
        label: "Anything the kitchen should know?",
        options: [
          { id: "veg", label: "Vegetarian" },
          { id: "vegan", label: "Vegan" },
          { id: "gf", label: "Gluten free" },
          { id: "none", label: "I eat everything" },
        ],
        labelColor: PINE.ink,
        option: {
          background: PINE.surface,
          textColor: PINE.ink,
          borderColor: "#C9D3C6",
          borderWidth: 1,
          radius: 8,
        },
      }),
      shortTextWidget("cof_r_pickup", {
        x: 52,
        y: 68,
        width: 42,
        height: 14,
        label: "Where are you catching the bus?",
        placeholder: "Office, or somewhere on the way…",
        labelColor: PINE.ink,
        field: {
          background: PINE.surface,
          textColor: PINE.ink,
          borderColor: "#C9D3C6",
          borderWidth: 1,
          radius: 8,
        },
      }),
    ]),
  ],
};

/** Midnight and old gold - a black-tie company party. */
const GALA: Palette = {
  bg: "#0E1220",
  ink: "#F3EDE0",
  muted: "#9A9AB0",
  accent: "#C9A227",
  onAccent: "#0E1220",
  surface: "#181D31",
};
/**
 * Layout: gala card. Gold rule over a bokeh photograph, then the year told as
 * a grid of four numbers instead of an agenda.
 */
const corporateYearsEnd: InvitationTemplate = {
  id: "corporate-years-end",
  categoryId: "corporate",
  title: "Year's End",
  description: "Black-tie end-of-year party with a year-in-numbers page",
  eventTitle: "Halcyon's end-of-year party",
  shape: "portrait",
  venue: {
    name: "The Alto Ballroom",
    address: "3 Southgate Avenue, Southbank VIC",
  },
  rsvpPrompt: {
    prompt: "Joining us for the last night of the year?",
    note: "Numbers to People Ops by 28 November",
  },
  pages: [
    page("Cover", "cover", GALA.bg, [
      image("cye_c_photo", IMG.goldBokeh, 0, 0, 100, 100, { frame: "square" }),
      scrim("cye_c_scrim", 24, 76, "14,18,32", 0.95),
      shape("cye_c_frame_t", "rectangle", 5, 4, 90, 0.3, GALA.accent),
      shape("cye_c_frame_b", "rectangle", 5, 95.7, 90, 0.3, GALA.accent),
      shape("cye_c_frame_l", "rectangle", 5, 4, 0.5, 92, GALA.accent),
      shape("cye_c_frame_r", "rectangle", 94.5, 4, 0.5, 92, GALA.accent),
      text("cye_c_eyebrow", "HALCYON STUDIO PRESENTS", 9, 47, 82, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 4,
        fontWeight: "bold",
        color: GALA.accent,
      }),
      text("cye_c_headline", "YEAR'S\nEND", 8, 52, 84, {
        fontFamily: "cinzel-decorative",
        fontSize: 38,
        fontWeight: "bold",
        lineHeight: 1.14,
        color: GALA.ink,
      }),
      divider("cye_c_rule", 36, 71, 28, GALA.accent, "diamond"),
      text("cye_c_when", "FRIDAY 12 DECEMBER · 7 PM", 8, 74.5, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 2.6,
        fontWeight: "bold",
        color: GALA.ink,
      }),
      text("cye_c_where", "THE ALTO BALLROOM · SOUTHBANK", 8, 78.5, 84, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 2.6,
        color: GALA.muted,
      }),
      text("cye_c_dress", "black tie, loosely observed", 8, 88, 84, {
        fontFamily: "forum",
        fontSize: 12,
        color: GALA.muted,
      }),
    ]),
    // The year as four numbers, then the practical lines underneath.
    page("The year", "details", GALA.bg, [
      guestName("cye_i_guest", 8, 5, 84, {
        fontFamily: "great-vibes",
        fontSize: 26,
        color: GALA.accent,
      }),
      text("cye_i_eyebrow", "OUR YEAR, BRIEFLY", 8, 13, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 4,
        fontWeight: "bold",
        color: GALA.muted,
      }),
      text("cye_i_n1", "12", 8, 19, 38, {
        fontFamily: "bodoni-moda",
        fontSize: 44,
        lineHeight: 1,
        color: GALA.accent,
      }),
      text("cye_i_c1", "THINGS SHIPPED", 8, 29, 38, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 2.2,
        fontWeight: "bold",
        color: GALA.ink,
      }),
      text("cye_i_n2", "48", 54, 19, 38, {
        fontFamily: "bodoni-moda",
        fontSize: 44,
        lineHeight: 1,
        color: GALA.accent,
      }),
      text("cye_i_c2", "NEW FACES", 54, 29, 38, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 2.2,
        fontWeight: "bold",
        color: GALA.ink,
      }),
      divider("cye_i_rule1", 8, 35, 84, "#2A2F45"),
      text("cye_i_n3", "6", 8, 39, 38, {
        fontFamily: "bodoni-moda",
        fontSize: 44,
        lineHeight: 1,
        color: GALA.accent,
      }),
      text("cye_i_c3", "COUNTRIES", 8, 49, 38, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 2.2,
        fontWeight: "bold",
        color: GALA.ink,
      }),
      text("cye_i_n4", "1", 54, 39, 38, {
        fontFamily: "bodoni-moda",
        fontSize: 44,
        lineHeight: 1,
        color: GALA.accent,
      }),
      text("cye_i_c4", "VERY LONG YEAR", 54, 49, 38, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 2.2,
        fontWeight: "bold",
        color: GALA.ink,
      }),
      divider("cye_i_rule2", 8, 55, 84, "#2A2F45"),
      text("cye_i_line1", "FRIDAY 12 DECEMBER · 7 PM", 8, 59, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 2.6,
        fontWeight: "bold",
        color: GALA.ink,
      }),
      text("cye_i_line2", "Dinner at eight · awards nobody asked for at nine", 8, 63.5, 84, {
        fontFamily: "forum",
        fontSize: 11.5,
        lineHeight: 1.5,
        color: GALA.muted,
      }),
      image("cye_i_photo", IMG.eoyCelebration, 0, 74, 100, 26, {
        frame: "square",
      }),
      scrim("cye_i_scrim", 74, 26, "14,18,32", 0.7),
    ]),
    page("The ballroom", "location", GALA.bg, [
      shape("cye_v_frame", "rectangle", 5, 4, 90, 92, GALA.bg, {
        borderColor: GALA.accent,
        borderWidth: 1,
      }),
      text("cye_v_eyebrow", "THE BALLROOM", 9, 10, 82, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 4,
        fontWeight: "bold",
        color: GALA.accent,
      }),
      text("cye_v_venue", "The Alto", 9, 14.5, 82, {
        fontFamily: "cinzel-decorative",
        fontSize: 26,
        fontWeight: "bold",
        lineHeight: 1.15,
        color: GALA.ink,
      }),
      text("cye_v_addr", "3 Southgate Avenue · Southbank VIC 3006", 9, 22, 82, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        color: GALA.muted,
      }),
      mapWidget("cye_v_map", {
        x: 9,
        y: 28,
        width: 82,
        height: 50,
        query: "Southgate Avenue Southbank Melbourne",
        radius: 6,
        label: "Open in Google Maps",
        button: {
          background: GALA.accent,
          textColor: GALA.onAccent,
          borderColor: GALA.accent,
          radius: 4,
        },
      }),
      divider("cye_v_rule", 36, 82, 28, GALA.accent, "diamond"),
      text("cye_v_note", "Level 3, through the atrium. Cloakroom on your left, cars home on the company.", 11, 85.5, 78, {
        fontFamily: "forum",
        fontSize: 11,
        lineHeight: 1.5,
        color: GALA.muted,
      }),
    ]),
    page("RSVP", "rsvp", GALA.bg, [
      text("cye_r_eyebrow", "REPLY BY 28 NOVEMBER", 8, 8, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.6,
        fontWeight: "bold",
        color: GALA.accent,
      }),
      text("cye_r_title", "Joining us for the last night of the year?", 8, 12.5, 84, {
        fontFamily: "cinzel-decorative",
        fontSize: 18,
        fontWeight: "bold",
        lineHeight: 1.3,
        color: GALA.ink,
      }),
      attendWidget("cye_r_attend", {
        x: 10,
        y: 27,
        width: 80,
        height: 13,
        label: "",
        yes: "I'll be there",
        no: "I can't make it",
        labelColor: GALA.ink,
        button: {
          background: GALA.accent,
          textColor: GALA.onAccent,
          borderColor: GALA.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 4,
        },
      }),
      choiceWidget("cye_r_main", "single_choice", {
        x: 10,
        y: 43,
        width: 80,
        height: 23,
        label: "Choose your main",
        options: [
          { id: "beef", label: "Braised beef cheek" },
          { id: "fish", label: "Ocean trout" },
          { id: "veg", label: "Wild mushroom" },
        ],
        labelColor: GALA.ink,
        option: {
          background: GALA.surface,
          textColor: GALA.ink,
          borderColor: "#2A2F45",
          borderWidth: 1,
          radius: 4,
        },
      }),
      shortTextWidget("cye_r_plus", {
        x: 10,
        y: 70,
        width: 80,
        height: 12,
        label: "Bringing someone? Name for their place card",
        placeholder: "One guest each, and we'd love to meet them…",
        labelColor: GALA.ink,
        field: {
          background: GALA.surface,
          textColor: GALA.ink,
          borderColor: "#2A2F45",
          borderWidth: 1,
          radius: 4,
        },
      }),
      divider("cye_r_rule", 36, 87, 28, GALA.accent, "diamond"),
    ]),
  ],
};

/** Two-tone office palette - blue for the arrival, coral for the departure. */
const DOORWAY: Palette = {
  bg: "#F5F5F0",
  ink: "#141414",
  muted: "#6D6D66",
  accent: "#2F6FED",
  onAccent: "#FFFFFF",
  surface: "#FFFFFF",
};
const DOORWAY_CORAL = "#E4643C";

/**
 * Layout: the cover is split down the middle - one half hello, one half
 * goodbye - and the details page is a thread of speech bubbles.
 */
const corporateHelloGoodbye: InvitationTemplate = {
  id: "corporate-hello-goodbye",
  categoryId: "corporate",
  title: "Hello & Goodbye",
  description: "Square split-screen invite for a joint welcome and farewell",
  eventTitle: "Welcome Yasmin, farewell Marcus",
  shape: "square",
  venue: {
    name: "The Studio Kitchen",
    address: "Level 3, 180 Wellington Parade, East Melbourne VIC",
  },
  rsvpPrompt: {
    prompt: "Coming to both halves?",
    note: "Reply by 11 November",
  },
  pages: [
    page("Cover", "cover", DOORWAY.bg, [
      shape("chg_c_left", "rectangle", 0, 0, 50, 70, DOORWAY.accent),
      shape("chg_c_right", "rectangle", 50, 0, 50, 70, DOORWAY_CORAL),
      image("chg_c_p1", IMG.welcomeOfficeChat, 6, 7, 38, 28, {
        frame: "rounded",
      }),
      image("chg_c_p2", IMG.farewellHug, 56, 7, 38, 28, {
        frame: "rounded",
      }),
      text("chg_c_hello", "HELLO", 2, 39, 46, {
        fontFamily: "urbanist",
        fontSize: 38,
        fontWeight: "bold",
        lineHeight: 1.05,
        color: DOORWAY.onAccent,
      }),
      text("chg_c_bye", "GOODBYE", 52, 40, 46, {
        fontFamily: "urbanist",
        fontSize: 30,
        fontWeight: "bold",
        lineHeight: 1.05,
        color: DOORWAY.onAccent,
      }),
      text("chg_c_n1", "YASMIN HADDAD", 2, 52, 46, {
        fontFamily: "urbanist",
        fontSize: 10,
        letterSpacing: 3,
        fontWeight: "bold",
        color: "#D5E3FF",
      }),
      text("chg_c_n2", "MARCUS BELL", 52, 52, 46, {
        fontFamily: "urbanist",
        fontSize: 10,
        letterSpacing: 3,
        fontWeight: "bold",
        color: "#FFE0D5",
      }),
      text("chg_c_r1", "joins design on Monday", 2, 58, 46, {
        fontFamily: "forum",
        fontSize: 12.5,
        color: DOORWAY.onAccent,
      }),
      text("chg_c_r2", "leaves for Lisbon on Friday", 52, 58, 46, {
        fontFamily: "forum",
        fontSize: 12.5,
        color: DOORWAY.onAccent,
      }),
      shape("chg_c_band", "rectangle", 0, 70, 100, 30, DOORWAY.ink),
      text("chg_c_band_title", "ONE PARTY, TWO REASONS", 6, 78, 88, {
        fontFamily: "urbanist",
        fontSize: 20,
        letterSpacing: 1.6,
        fontWeight: "bold",
        color: DOORWAY.onAccent,
      }),
      text("chg_c_band_when", "THURSDAY 14 NOVEMBER · 5:30 PM · THE STUDIO KITCHEN", 6, 88, 88, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 2.4,
        color: "#B9B9B2",
      }),
    ]),
    // The brief, as a thread of messages rather than a details card.
    page("The thread", "details", DOORWAY.bg, [
      guestName("chg_i_guest", 8, 5, 84, {
        fontFamily: "great-vibes",
        fontSize: 26,
        color: DOORWAY.ink,
        textAlign: "left",
      }),
      text("chg_i_eyebrow", "WHAT'S ACTUALLY HAPPENING", 8, 13, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: DOORWAY.muted,
        textAlign: "left",
      }),
      shape("chg_i_b1", "rounded_square", 8, 18, 66, 20, DOORWAY.accent),
      text("chg_i_b1_text", "Yasmin starts on Monday. She has already fixed three things nobody asked her to fix.", 12, 22, 58, {
        fontFamily: "forum",
        fontSize: 12.5,
        lineHeight: 1.5,
        color: DOORWAY.onAccent,
        textAlign: "left",
      }),
      shape("chg_i_b2", "rounded_square", 26, 41, 66, 20, DOORWAY.surface),
      text("chg_i_b2_text", "Marcus is off to Lisbon after nine years. He is taking the good chair with him.", 30, 45, 58, {
        fontFamily: "forum",
        fontSize: 12.5,
        lineHeight: 1.5,
        color: DOORWAY.ink,
        textAlign: "left",
      }),
      shape("chg_i_b3", "rounded_square", 8, 64, 66, 18, DOORWAY_CORAL),
      text("chg_i_b3_text", "5:30 drinks · 6:30 two very short speeches · 8:00 someone finds the aux cable.", 12, 68, 58, {
        fontFamily: "forum",
        fontSize: 12.5,
        lineHeight: 1.5,
        color: DOORWAY.onAccent,
        textAlign: "left",
      }),
      divider("chg_i_rule", 8, 86, 84, "#DCDCD4"),
      text("chg_i_footer", "NO SPEECHES FROM YOU, WE PROMISE", 8, 89, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 3.2,
        fontWeight: "bold",
        color: DOORWAY.muted,
      }),
    ]),
    page("The kitchen", "location", DOORWAY.bg, [
      shape("chg_v_panel", "rectangle", 0, 0, 100, 38, DOORWAY.accent),
      text("chg_v_eyebrow", "WE'RE UPSTAIRS", 8, 8, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 3.6,
        fontWeight: "bold",
        color: "#D5E3FF",
      }),
      text("chg_v_venue", "THE STUDIO KITCHEN", 8, 13, 84, {
        fontFamily: "urbanist",
        fontSize: 26,
        fontWeight: "bold",
        lineHeight: 1.1,
        color: DOORWAY.onAccent,
      }),
      text("chg_v_addr", "Level 3 · 180 Wellington Parade · East Melbourne", 8, 29, 84, {
        fontFamily: "urbanist",
        fontSize: 10,
        color: "#D5E3FF",
      }),
      mapWidget("chg_v_map", {
        x: 6,
        y: 44,
        width: 88,
        height: 42,
        query: "180 Wellington Parade East Melbourne",
        radius: 12,
        label: "Open in Google Maps",
        button: {
          background: DOORWAY.ink,
          textColor: DOORWAY.onAccent,
          borderColor: DOORWAY.ink,
          radius: 8,
        },
      }),
      ...detailRow("chg_v_note", "icon_location", "Take the lift to three - the kitchen is past the print room", {
        x: 8,
        y: 90,
        width: 84,
        aspect: SQUARE,
        iconColor: DOORWAY_CORAL,
        textColor: DOORWAY.muted,
        size: 3.2,
        gap: 2,
        fontSize: 11,
      }),
    ]),
    page("RSVP", "rsvp", DOORWAY.bg, [
      shape("chg_r_left", "rectangle", 0, 0, 6, 100, DOORWAY.accent),
      shape("chg_r_right", "rectangle", 94, 0, 6, 100, DOORWAY_CORAL),
      text("chg_r_eyebrow", "REPLY BY 11 NOVEMBER", 10, 9, 80, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 3.6,
        fontWeight: "bold",
        color: DOORWAY.muted,
      }),
      text("chg_r_title", "COMING TO\nBOTH HALVES?", 10, 13.5, 80, {
        fontFamily: "urbanist",
        fontSize: 30,
        fontWeight: "bold",
        lineHeight: 1.12,
        color: DOORWAY.ink,
      }),
      attendWidget("chg_r_attend", {
        x: 12,
        y: 31,
        width: 76,
        height: 13,
        label: "",
        yes: "I'll be there",
        no: "Can't make it",
        labelColor: DOORWAY.ink,
        button: {
          background: DOORWAY.accent,
          textColor: DOORWAY.onAccent,
          borderColor: DOORWAY.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 8,
        },
      }),
      choiceWidget("chg_r_dinner", "single_choice", {
        x: 12,
        y: 47,
        width: 76,
        height: 23,
        label: "Staying for dinner after?",
        options: [
          { id: "yes", label: "Yes - book me in" },
          { id: "drinks", label: "Just the drinks" },
          { id: "maybe", label: "I'll decide on the night" },
        ],
        labelColor: DOORWAY.ink,
        option: {
          background: DOORWAY.surface,
          textColor: DOORWAY.ink,
          borderColor: "#DCDCD4",
          borderWidth: 1,
          radius: 8,
        },
      }),
      shortTextWidget("chg_r_card", {
        x: 12,
        y: 74,
        width: 76,
        height: 12,
        label: "A line for Marcus's leaving card",
        placeholder: "We're printing these, so keep it kind…",
        labelColor: DOORWAY.ink,
        field: {
          background: DOORWAY.surface,
          textColor: DOORWAY.ink,
          borderColor: "#DCDCD4",
          borderWidth: 1,
          radius: 8,
        },
      }),
    ]),
  ],
};

/* ── Dinner & gathering · the family reunion ──────────────────────────── */

/** Hearth colours - chestnut, olive and old paper. */
const HEARTH: Palette = {
  bg: "#FAF5EC",
  ink: "#33261C",
  muted: "#87715F",
  accent: "#8C5A3B",
  onAccent: "#FDF7EE",
  surface: "#FFFFFF",
};
const HEARTH_OLIVE = "#5C6B4A";

/**
 * Layout: reunion poster over one wide photograph, then a potluck sign-up
 * board in three columns - the details page is a list people write on.
 */
const dinnerLongTable: InvitationTemplate = {
  id: "dinner-long-table",
  categoryId: "dinner",
  title: "Long Table",
  description: "Square family reunion invite with a three-column potluck board",
  eventTitle: "The Okafor family reunion",
  shape: "square",
  venue: {
    name: "Mount Coot-tha picnic ground",
    address: "Sir Samuel Griffith Drive, Mount Coot-tha QLD",
  },
  rsvpPrompt: {
    prompt: "How many of you are coming?",
    note: "Head count by 2 November",
  },
  pages: [
    page(
      "Cover",
      "cover",
      HEARTH.bg,
      [
        image("dlt_c_photo", IMG.reunionTableOverhead, 0, 0, 100, 54, {
          frame: "square",
        }),
        text("dlt_c_eyebrow", "FOUR GENERATIONS, ONE TABLE", 8, 58, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 3.6,
          fontWeight: "bold",
          color: HEARTH.accent,
        }),
        text("dlt_c_name", "The Okafors", 8, 62, 84, {
          fontFamily: "bodoni-moda",
          fontSize: 42,
          lineHeight: 1.15,
          color: HEARTH.ink,
        }),
        text("dlt_c_est", "EST. 1961", 8, 74, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 5,
          fontWeight: "bold",
          color: HEARTH_OLIVE,
        }),
        divider("dlt_c_rule", 38, 79, 24, HEARTH.accent, "diamond"),
        text("dlt_c_when", "SUNDAY 16 NOVEMBER · FROM NOON", 8, 82.5, 84, {
          fontFamily: "urbanist",
          fontSize: 10,
          letterSpacing: 2.8,
          fontWeight: "bold",
          color: HEARTH.ink,
        }),
        text("dlt_c_where", "MOUNT COOT-THA PICNIC GROUND · BRISBANE", 8, 87, 84, {
          fontFamily: "urbanist",
          fontSize: 8.5,
          letterSpacing: 2.4,
          color: HEARTH.muted,
        }),
        text("dlt_c_note", "bring a chair, a plate and an appetite", 8, 92, 84, {
          fontFamily: "forum",
          fontSize: 11.5,
          color: HEARTH.muted,
        }),
      ],
      {
        texture: "linen",
        textureOpacity: 30,
        textureTint: "#EDE2CE",
        textureBlend: "multiply",
      },
    ),
    // The potluck board - who is bringing what, in three columns.
    page(
      "Potluck board",
      "details",
      HEARTH.bg,
      [
        text("dlt_i_eyebrow", "THE POTLUCK BOARD", 8, 7, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 4.2,
          fontWeight: "bold",
          color: HEARTH.accent,
        }),
        guestName("dlt_i_guest", 8, 11, 84, {
          fontFamily: "great-vibes",
          fontSize: 26,
          color: HEARTH.ink,
        }),
        text("dlt_i_h1", "STARTERS", 8, 21, 26, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.6,
          fontWeight: "bold",
          color: HEARTH_OLIVE,
        }),
        divider("dlt_i_r1", 8, 25.5, 26, "#DCCFB8"),
        text("dlt_i_c1", "Ngozi - puff puff\nChidi - pepper soup\nGrace - a salad\nSam - bread rolls", 8, 28, 26, {
          fontFamily: "forum",
          fontSize: 10.5,
          lineHeight: 1.85,
          color: HEARTH.ink,
        }),
        text("dlt_i_h2", "MAINS", 37, 21, 26, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.6,
          fontWeight: "bold",
          color: HEARTH_OLIVE,
        }),
        divider("dlt_i_r2", 37, 25.5, 26, "#DCCFB8"),
        text("dlt_i_c2", "Uzo - jollof rice\nDad - the grill\nEmeka - suya\nAunty Bee - moi moi", 37, 28, 26, {
          fontFamily: "forum",
          fontSize: 10.5,
          lineHeight: 1.85,
          color: HEARTH.ink,
        }),
        text("dlt_i_h3", "PUDDINGS", 66, 21, 26, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 2.6,
          fontWeight: "bold",
          color: HEARTH_OLIVE,
        }),
        divider("dlt_i_r3", 66, 25.5, 26, "#DCCFB8"),
        text("dlt_i_c3", "Ada - chin chin\nMum - the cake\nTemi - ice cream\nYou - ?", 66, 28, 26, {
          fontFamily: "forum",
          fontSize: 10.5,
          lineHeight: 1.85,
          color: HEARTH.ink,
        }),
        divider("dlt_i_r4", 8, 56, 84, HEARTH.accent, "diamond"),
        text("dlt_i_free", "STILL UNCLAIMED", 8, 60, 84, {
          fontFamily: "urbanist",
          fontSize: 9,
          letterSpacing: 3.4,
          fontWeight: "bold",
          color: HEARTH.accent,
        }),
        text("dlt_i_free_body", "Drinks · ice · the big esky · someone brave enough to bring the speaker", 14, 64.5, 72, {
          fontFamily: "forum",
          fontSize: 12,
          lineHeight: 1.5,
          color: HEARTH.muted,
        }),
        shape("dlt_i_band", "rounded_square", 8, 76, 84, 17, HEARTH_OLIVE),
        text("dlt_i_band_text", "Claim yours on the reply page - first in, best dressed. Aunty Ngozi is keeping score.", 13, 80.5, 74, {
          fontFamily: "forum",
          fontSize: 12,
          lineHeight: 1.5,
          color: HEARTH.onAccent,
        }),
      ],
      {
        texture: "linen",
        textureOpacity: 30,
        textureTint: "#EDE2CE",
        textureBlend: "multiply",
      },
    ),
    // Asymmetric: a tall photograph down the right, everything else on the left.
    page("The ground", "location", HEARTH.bg, [
      image("dlt_v_photo", IMG.reunionLaugh, 70, 0, 30, 100, { frame: "square" }),
      text("dlt_v_eyebrow", "WHERE WE SET UP", 6, 10, 58, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 3.6,
        fontWeight: "bold",
        color: HEARTH.accent,
        textAlign: "left",
      }),
      text("dlt_v_venue", "Mount Coot-tha\npicnic ground", 6, 15, 58, {
        fontFamily: "bodoni-moda",
        fontSize: 25,
        lineHeight: 1.2,
        color: HEARTH.ink,
        textAlign: "left",
      }),
      text("dlt_v_addr", "Sir Samuel Griffith Drive · Mount Coot-tha QLD", 6, 30, 58, {
        fontFamily: "urbanist",
        fontSize: 10,
        color: HEARTH.muted,
        textAlign: "left",
      }),
      mapWidget("dlt_v_map", {
        x: 6,
        y: 38,
        width: 58,
        height: 46,
        query: "Mount Coot-tha picnic ground Brisbane",
        radius: 14,
        label: "Open the map",
        button: {
          background: HEARTH_OLIVE,
          textColor: HEARTH.onAccent,
          borderColor: HEARTH_OLIVE,
          radius: 999,
        },
      }),
      ...detailRow("dlt_v_note", "icon_location", "Shelter four, past the second car park - look for the flags", {
        x: 6,
        y: 88,
        width: 58,
        aspect: SQUARE,
        iconColor: HEARTH.accent,
        textColor: HEARTH.muted,
        size: 3.4,
        gap: 2,
        fontSize: 10.5,
      }),
    ]),
    page(
      "RSVP",
      "rsvp",
      HEARTH.bg,
      [
        text("dlt_r_eyebrow", "HEAD COUNT BY 2 NOVEMBER", 8, 9, 84, {
          fontFamily: "urbanist",
          fontSize: 9.5,
          letterSpacing: 3.6,
          fontWeight: "bold",
          color: HEARTH.accent,
        }),
        text("dlt_r_title", "How many of you\nare we feeding?", 8, 13.5, 84, {
          fontFamily: "bodoni-moda",
          fontSize: 27,
          lineHeight: 1.22,
          color: HEARTH.ink,
        }),
        attendWidget("dlt_r_attend", {
          x: 10,
          y: 30,
          width: 80,
          height: 13,
          label: "",
          yes: "We're coming",
          no: "Not this year",
          labelColor: HEARTH.ink,
          button: {
            background: HEARTH.accent,
            textColor: HEARTH.onAccent,
            borderColor: HEARTH.accent,
            borderWidth: 0,
            borderStyle: "none",
            radius: 999,
          },
        }),
        choiceWidget("dlt_r_count", "single_choice", {
          x: 10,
          y: 46,
          width: 80,
          height: 23,
          label: "How many seats should we save?",
          options: [
            { id: "one", label: "Just me" },
            { id: "two", label: "Two of us" },
            { id: "more", label: "Three or more" },
          ],
          labelColor: HEARTH.ink,
          option: {
            background: HEARTH.surface,
            textColor: HEARTH.ink,
            borderColor: "#DCCFB8",
            borderWidth: 1,
            radius: 999,
          },
        }),
        shortTextWidget("dlt_r_dish", {
          x: 10,
          y: 73,
          width: 80,
          height: 12,
          label: "What are you putting on the board?",
          placeholder: "Claim it before your cousin does…",
          labelColor: HEARTH.ink,
          field: {
            background: HEARTH.surface,
            textColor: HEARTH.ink,
            borderColor: "#DCCFB8",
            borderWidth: 1,
            radius: 999,
          },
        }),
        divider("dlt_r_rule", 38, 89, 24, HEARTH.accent, "diamond"),
      ],
      {
        texture: "linen",
        textureOpacity: 30,
        textureTint: "#EDE2CE",
        textureBlend: "multiply",
      },
    ),
  ],
};

/* ── Other events · race day ──────────────────────────────────────────── */

/** Start-line palette - paper white, slate and race red. */
const RACE: Palette = {
  bg: "#FFFFFF",
  ink: "#0F172A",
  muted: "#64748B",
  accent: "#E11D48",
  onAccent: "#FFFFFF",
  surface: "#F1F5F9",
};

/**
 * Layout: the cover is a race bib, the details page is the course drawn as a
 * horizontal rail. Sent by the organisers to confirm a runner's place.
 */
const otherRaceDay: InvitationTemplate = {
  id: "other-race-day",
  categoryId: "other",
  title: "Race Day",
  description: "Square marathon confirmation built as a race bib and course rail",
  eventTitle: "Harbour City Marathon - race day",
  shape: "square",
  venue: {
    name: "Harbour City Marathon start line",
    address: "Hickson Road, The Rocks NSW",
  },
  rsvpPrompt: {
    prompt: "Confirm your start",
    note: "Confirm or withdraw by 10 April",
  },
  pages: [
    page("Cover", "cover", RACE.bg, [
      shape("ord_c_band", "rectangle", 0, 0, 100, 13, RACE.ink),
      text("ord_c_event", "HARBOUR CITY MARATHON", 6, 3.5, 88, {
        fontFamily: "urbanist",
        fontSize: 13,
        letterSpacing: 4,
        fontWeight: "bold",
        color: RACE.onAccent,
      }),
      text("ord_c_date", "SUNDAY 3 MAY 2027 · 7:00 AM", 6, 8.6, 88, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 2.6,
        color: "#94A3B8",
      }),
      // The bib itself.
      shape("ord_c_bib", "rounded_square", 10, 17, 80, 50, RACE.surface),
      shape("ord_c_hole1", "circle", 14, 20, 3.4, 3.4, RACE.bg),
      shape("ord_c_hole2", "circle", 82.6, 20, 3.4, 3.4, RACE.bg),
      shape("ord_c_hole3", "circle", 14, 60.6, 3.4, 3.4, RACE.bg),
      shape("ord_c_hole4", "circle", 82.6, 60.6, 3.4, 3.4, RACE.bg),
      text("ord_c_bib_label", "OFFICIAL ENTRY", 14, 21, 72, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 3.4,
        fontWeight: "bold",
        color: RACE.accent,
      }),
      text("ord_c_number", "10427", 12, 25.5, 76, {
        fontFamily: "urbanist",
        fontSize: 76,
        fontWeight: "bold",
        lineHeight: 1,
        color: RACE.ink,
      }),
      divider("ord_c_bib_rule", 20, 43.5, 60, "#CBD5E1"),
      guestName("ord_c_guest", 14, 46, 72, {
        fontFamily: "urbanist",
        fontSize: 19,
        fontWeight: "bold",
        color: RACE.ink,
      }),
      text("ord_c_dist", "42.195 KM · WAVE B · GREEN START", 14, 57, 72, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3,
        fontWeight: "bold",
        color: RACE.muted,
      }),
      text("ord_c_confirm", "YOU'RE IN.", 6, 71, 88, {
        fontFamily: "urbanist",
        fontSize: 32,
        fontWeight: "bold",
        lineHeight: 1.1,
        color: RACE.accent,
      }),
      text("ord_c_sub", "Your place is confirmed. Everything you need is inside.", 12, 80.5, 76, {
        fontFamily: "forum",
        fontSize: 12,
        lineHeight: 1.5,
        color: RACE.muted,
      }),
      image("ord_c_photo", IMG.raceRunners, 0, 88, 100, 12, { frame: "square" }),
    ]),
    // The course drawn as one horizontal rail with marker nodes.
    page("The course", "details", RACE.bg, [
      text("ord_i_eyebrow", "THE COURSE", 6, 7, 88, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 4.4,
        fontWeight: "bold",
        color: RACE.accent,
      }),
      text("ord_i_title", "HARBOUR TO HARBOUR,\n42.195 KM", 6, 11.5, 88, {
        fontFamily: "urbanist",
        fontSize: 24,
        fontWeight: "bold",
        lineHeight: 1.15,
        color: RACE.ink,
      }),
      text("ord_i_n1_label", "START", 2, 26, 16, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 1.8,
        fontWeight: "bold",
        color: RACE.ink,
      }),
      text("ord_i_n2_label", "10 KM", 21, 26, 16, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 1.8,
        fontWeight: "bold",
        color: RACE.ink,
      }),
      text("ord_i_n3_label", "HALFWAY", 40, 26, 16, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 1.8,
        fontWeight: "bold",
        color: RACE.ink,
      }),
      text("ord_i_n4_label", "30 KM", 59, 26, 16, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 1.8,
        fontWeight: "bold",
        color: RACE.ink,
      }),
      text("ord_i_n5_label", "FINISH", 78, 26, 16, {
        fontFamily: "urbanist",
        fontSize: 8.5,
        letterSpacing: 1.8,
        fontWeight: "bold",
        color: RACE.accent,
      }),
      shape("ord_i_rail", "rectangle", 8, 33.5, 84, 0.7, "#CBD5E1"),
      shape("ord_i_n1", "circle", 7, 31, 6, 6, RACE.ink),
      shape("ord_i_n2", "circle", 26, 31, 6, 6, RACE.ink),
      shape("ord_i_n3", "circle", 45, 31, 6, 6, RACE.ink),
      shape("ord_i_n4", "circle", 64, 31, 6, 6, RACE.ink),
      shape("ord_i_n5", "circle", 83, 31, 6, 6, RACE.accent),
      text("ord_i_n1_sub", "The Rocks", 2, 39, 16, {
        fontFamily: "forum",
        fontSize: 10,
        color: RACE.muted,
      }),
      text("ord_i_n2_sub", "Water + gels", 21, 39, 16, {
        fontFamily: "forum",
        fontSize: 10,
        color: RACE.muted,
      }),
      text("ord_i_n3_sub", "The bridge", 40, 39, 16, {
        fontFamily: "forum",
        fontSize: 10,
        color: RACE.muted,
      }),
      text("ord_i_n4_sub", "Water", 59, 39, 16, {
        fontFamily: "forum",
        fontSize: 10,
        color: RACE.muted,
      }),
      text("ord_i_n5_sub", "Opera House", 78, 39, 16, {
        fontFamily: "forum",
        fontSize: 10,
        color: RACE.muted,
      }),
      divider("ord_i_rule", 8, 47, 84, "#E2E8F0"),
      text("ord_i_h1", "IN YOUR PACK", 8, 51, 40, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3,
        fontWeight: "bold",
        color: RACE.accent,
        textAlign: "left",
      }),
      text("ord_i_b1", "Bib and safety pins\nTiming chip (already fitted)\nBaggage tag\nOne very optimistic gel", 8, 56, 40, {
        fontFamily: "forum",
        fontSize: 11,
        lineHeight: 1.75,
        color: RACE.ink,
        textAlign: "left",
      }),
      text("ord_i_h2", "ON THE DAY", 54, 51, 40, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3,
        fontWeight: "bold",
        color: RACE.accent,
        textAlign: "left",
      }),
      text("ord_i_b2", "5:30 bag drop opens\n6:30 wave B assembles\n7:00 gun\n1:00 course closes", 54, 56, 40, {
        fontFamily: "forum",
        fontSize: 11,
        lineHeight: 1.75,
        color: RACE.ink,
        textAlign: "left",
      }),
      image("ord_i_photo", IMG.raceStartLine, 8, 78, 84, 16, {
        frame: "rounded",
      }),
    ]),
    page("Start line", "location", RACE.bg, [
      shape("ord_v_band", "rectangle", 0, 0, 100, 30, RACE.accent),
      text("ord_v_eyebrow", "START LINE", 8, 7, 84, {
        fontFamily: "urbanist",
        fontSize: 9.5,
        letterSpacing: 4.4,
        fontWeight: "bold",
        color: "#FFD7DF",
      }),
      text("ord_v_venue", "HICKSON ROAD,\nTHE ROCKS", 8, 12, 84, {
        fontFamily: "urbanist",
        fontSize: 24,
        fontWeight: "bold",
        lineHeight: 1.12,
        color: RACE.onAccent,
      }),
      text("ord_v_addr", "Assemble in your wave pen by 6:30 am", 8, 33, 84, {
        fontFamily: "urbanist",
        fontSize: 10.5,
        color: RACE.muted,
      }),
      mapWidget("ord_v_map", {
        x: 8,
        y: 39,
        width: 84,
        height: 46,
        query: "Hickson Road The Rocks Sydney",
        radius: 10,
        label: "Open the start line",
        button: {
          background: RACE.ink,
          textColor: RACE.onAccent,
          borderColor: RACE.ink,
          radius: 8,
        },
      }),
      ...detailRow("ord_v_note", "icon_clock", "Circular Quay station is a six-minute walk - roads close from 5 am", {
        x: 8,
        y: 88,
        width: 84,
        aspect: SQUARE,
        iconColor: RACE.accent,
        textColor: RACE.muted,
        size: 3.2,
        gap: 2,
        fontSize: 10.5,
      }),
    ]),
    page("Confirm", "rsvp", RACE.bg, [
      image("ord_r_photo", IMG.raceMedal, 0, 0, 100, 22, { frame: "square" }),
      scrim("ord_r_scrim", 10, 12, "15,23,42", 0.86),
      text("ord_r_eyebrow", "CONFIRM OR WITHDRAW BY 10 APRIL", 8, 16, 84, {
        fontFamily: "urbanist",
        fontSize: 9,
        letterSpacing: 3.2,
        fontWeight: "bold",
        color: "#FFD7DF",
      }),
      text("ord_r_title", "CONFIRM\nYOUR START", 8, 26, 84, {
        fontFamily: "urbanist",
        fontSize: 30,
        fontWeight: "bold",
        lineHeight: 1.12,
        color: RACE.ink,
      }),
      attendWidget("ord_r_attend", {
        x: 10,
        y: 42,
        width: 80,
        height: 13,
        label: "",
        yes: "I'll be on the start line",
        no: "I need to withdraw",
        labelColor: RACE.ink,
        button: {
          background: RACE.accent,
          textColor: RACE.onAccent,
          borderColor: RACE.accent,
          borderWidth: 0,
          borderStyle: "none",
          radius: 8,
        },
      }),
      choiceWidget("ord_r_wave", "single_choice", {
        x: 10,
        y: 57,
        width: 80,
        height: 23,
        label: "Which wave should we put you in?",
        options: [
          { id: "a", label: "Wave A - under 3:30" },
          { id: "b", label: "Wave B - 3:30 to 4:30" },
          { id: "c", label: "Wave C - over 4:30" },
        ],
        labelColor: RACE.ink,
        option: {
          background: RACE.surface,
          textColor: RACE.ink,
          borderColor: "#CBD5E1",
          borderWidth: 1,
          radius: 8,
        },
      }),
      shortTextWidget("ord_r_contact", {
        x: 10,
        y: 84,
        width: 80,
        height: 12,
        label: "Emergency contact on race day",
        placeholder: "Name and mobile number…",
        labelColor: RACE.ink,
        field: {
          background: RACE.surface,
          textColor: RACE.ink,
          borderColor: "#CBD5E1",
          borderWidth: 1,
          radius: 8,
        },
      }),
    ]),
  ],
};

const weddingVelvetVows: InvitationTemplate = {
  id: "wedding-velvet-vows",
  categoryId: "wedding",
  title: "Velvet Vows",
  description:
    "Burgundy landscape wedding suite with paper texture, venue map, and RSVP",
  shape: "landscape",
  pages: VELVET_VOWS_PAGES,
};

const birthdayAfterFive: InvitationTemplate = {
  id: "birthday-after-five",
  categoryId: "birthday",
  title: "After Five",
  description:
    "Burgundy birthday suite with party photography, venue map, and RSVP",
  shape: "square",
  pages: [
    {
      ...design("Cover", "#840000", [
        text("af_c_name", "Rosie.", 20, 31.307, 60, {
          fontFamily: "caveat",
          fontSize: 90,
          fontWeight: "bold",
          bold: true,
          color: "#FFFFFF",
          lineHeight: 1.15,
        }),
        text(
          "af_c_details",
          "Birthday Party\nMelbourne\nSince 1999",
          20,
          50.367,
          60,
          {
            fontFamily: "urbanist",
            fontSize: 13,
            fontWeight: "bold",
            color: "#FFFFFF",
          },
        ),
      ]),
      backgroundPattern: "none",
      border: null,
    },
    {
      ...design("Invitation", "#840000", [
        {
          ...shape(
            "af_i_corner_triangle",
            "triangle",
            0.863,
            43.523,
            4.169,
            4.169,
            "#840000",
          ),
          rotation: 45,
        },
        {
          ...image(
            "af_i_photo",
            "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA3ODc0fDB8MXxzZWFyY2h8OHx8YmlydGhkYXklMjBwYXJ0eXxlbnwxfHx8fDE3ODUxMzgzMzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
            3.524,
            2.829,
            60.981,
            94.342,
            { frame: "square" },
          ),
          style: style({
            color: "#000000",
            frame: "square",
            imageScale: 1,
            imageOffsetX: 50,
            imageOffsetY: 29.251,
            effects: {
              kind: "none",
              direction: -180,
              offset: 5,
              blur: 10,
              transparency: 30,
            },
          }),
        },
        {
          ...shape(
            "af_i_corner_square",
            "square",
            0,
            45.589,
            7.881,
            8.823,
            "#840000",
          ),
          style: style({
            color: "#840000",
            effects: {
              kind: "drop",
              direction: -180,
              offset: 0,
              blur: 5,
              transparency: 40,
            },
          }),
        },
        text("af_i_title", "You're Invited!", 9.787, 14.681, 48.456, {
          fontFamily: "caveat",
          fontSize: 50,
          fontWeight: "bold",
          bold: true,
          color: "#840000",
          textAlign: "left",
          lineHeight: 1.15,
        }),
        text("af_i_hey", "Hey,", 31.234, 10.823, 5.562, {
          fontFamily: "urbanist",
          fontSize: 13,
          italic: true,
          bold: true,
          color: "#840000",
          textAlign: "left",
        }),
        shape(
          "af_i_calendar",
          "icon_calendar",
          60.303,
          63.368,
          3.233,
          3.233,
          "#840000",
        ),
        text(
          "af_i_date",
          "Saturday,  August 1st 2026",
          65.794,
          63.656,
          26.642,
          {
            fontFamily: "urbanist",
            fontSize: 12,
            fontWeight: "medium",
            color: "#FFFFFF",
            textAlign: "left",
          },
        ),
        shape(
          "af_i_clock",
          "icon_clock",
          60.38,
          68.198,
          3.155,
          3.155,
          "#840000",
        ),
        text(
          "af_i_time",
          "5.00 PM - Midnight",
          65.794,
          68.448,
          26.642,
          {
            fontFamily: "urbanist",
            fontSize: 12,
            fontWeight: "medium",
            color: "#FFFFFF",
            textAlign: "left",
          },
        ),
        shape(
          "af_i_camera",
          "icon_camera",
          60.679,
          73.164,
          2.857,
          2.857,
          "#840000",
        ),
        text(
          "af_i_dress",
          "Dress code:",
          65.794,
          73.264,
          13.472,
          {
            fontFamily: "urbanist",
            fontSize: 12,
            fontWeight: "medium",
            color: "#FFFFFF",
            textAlign: "left",
          },
        ),
        shape(
          "af_i_dress_silver",
          "circle",
          78.872,
          73.323,
          2.538,
          2.538,
          "#E4E4E4",
        ),
        shape(
          "af_i_dress_pink",
          "circle",
          82.358,
          73.323,
          2.538,
          2.538,
          "#EAA2C4",
        ),
        shape(
          "af_i_dress_blue",
          "circle",
          85.874,
          73.323,
          2.538,
          2.538,
          "#8ECFD1",
        ),
      ]),
      backgroundPattern: "stripes",
      border: null,
    },
    {
      ...design("Venue", "#840000", [
        shape(
          "af_v_left_rule",
          "square",
          0,
          33.072,
          21.037,
          3.561,
          "#FFFFFF",
        ),
        text("af_v_title", "Let's meet at", 28.083, 8.857, 43.833, {
          fontFamily: "caveat",
          fontSize: 50,
          fontWeight: "bold",
          bold: true,
          color: "#FFFFFF",
          textAlign: "left",
          lineHeight: 1.15,
        }),
        shape(
          "af_v_right_rule",
          "square",
          78.963,
          33.072,
          21.037,
          3.561,
          "#FFFFFF",
        ),
        {
          ...shape(
            "af_v_card",
            "rounded_square",
            17.803,
            23.8,
            64.393,
            21.687,
            "#840000",
          ),
          style: style({
            color: "#840000",
            effects: {
              kind: "drop",
              direction: 50,
              offset: 10,
              blur: 7,
              transparency: 50,
            },
          }),
        },
        text(
          "af_v_name",
          "The Glasshouse",
          32.258,
          32.006,
          35.484,
          {
            fontFamily: "urbanist",
            fontSize: 25,
            fontWeight: "bold",
            bold: true,
            color: "#FFFFFF",
            textAlign: "left",
          },
        ),
        text(
          "af_v_city",
          "Melbourne CBD",
          40.323,
          39.002,
          19.355,
          {
            fontFamily: "urbanist",
            fontSize: 12,
            fontWeight: "bold",
            bold: true,
            color: "#FFFFFF",
          },
        ),
        shape(
          "af_v_pin",
          "icon_location",
          48.164,
          27.294,
          3.671,
          3.671,
          "#FFFFFF",
        ),
        {
          id: "af_v_map",
          type: "widget",
          x: 9.336,
          y: 50.952,
          width: 81.328,
          height: 39.684,
          rotation: 0,
          locked: false,
          content: "map",
          style: style({
            fontFamily: "urbanist",
            fontSize: 14,
          }),
          widget: {
            kind: "map",
            radius: 18,
            mapsQuery: "The glasshouse, melbourne",
            showButton: true,
            buttonLabel: "Open in Google Maps",
            buttonStyle: {
              radius: 999,
              textColor: "#1F2D22",
              background: "#FFFFFF",
              borderColor: "#FFFFFF",
              borderStyle: "none",
              borderWidth: 0,
            },
          },
        },
      ]),
      backgroundPattern: "stripes",
      border: null,
    },
    {
      ...design("RSVP", "#840000", [
        {
          ...shape(
            "af_r_card",
            "rounded_square",
            17.803,
            54.573,
            64.393,
            26.29,
            "#840000",
          ),
          style: style({
            color: "#840000",
            effects: {
              kind: "drop",
              direction: 50,
              offset: 10,
              blur: 7,
              transparency: 50,
            },
          }),
        },
        {
          id: "af_r_attend",
          type: "widget",
          x: 35.186,
          y: 56.718,
          width: 29.628,
          height: 22,
          rotation: 0,
          locked: false,
          content: "attend",
          style: style({
            fontFamily: "urbanist",
            fontSize: 14,
          }),
          widget: {
            kind: "attend",
            label: "Can you make it?",
            noLabel: "Sorry, I can't",
            required: true,
            yesLabel: "Yes, can't wait ❤️",
            labelStyle: {
              color: "#FFFFFF",
            },
            buttonStyle: {
              radius: 999,
              textColor: "#FFFFFF",
              background: "#FFFFFF",
              borderColor: "#FFFFFF",
              borderStyle: "none",
              borderWidth: 0,
            },
          },
        },
        text(
          "af_r_title",
          "Can't wait to celebrate with you!\n",
          18.337,
          20.169,
          63.326,
          {
            fontFamily: "caveat",
            fontSize: 50,
            fontWeight: "bold",
            bold: true,
            color: "#FFFFFF",
            lineHeight: 0.9,
          },
        ),
        text(
          "af_r_note",
          "Please respond before July 20",
          33.681,
          48.633,
          32.638,
          {
            fontFamily: "urbanist",
            fontSize: 12,
            fontWeight: "bold",
            bold: true,
            color: "#FFFFFF",
          },
        ),
      ]),
      backgroundPattern: "stripes",
      border: null,
    },
  ],
};

/** Catalog - multi-page templates with interactive venue + RSVP pages. */
export const INVITATION_TEMPLATES: InvitationTemplate[] = [
  weddingVelvetVows,
  weddingPhotoSuite,
  weddingArchModern,
  weddingWineryClassic,
  weddingCoastalEditorial,
  weddingRubyYears,
  weddingSayYes,
  weddingHensPeonies,
  birthdayAfterFive,
  birthdayMilestoneSeventy,
  birthdayBigOne,
  birthdayTwentyOneGold,
  birthdayRooftopAfterglow,
  birthdayDiscoBall,
  birthdayMainCharacter,
  graduationCapAndGown,
  graduationClassOf,
  graduationNextChapter,
  graduationAoDai,
  babySoftClouds,
  babyNeutralNursery,
  babyPinkBlueReveal,
  babyLittleWildflower,
  babyPartyOfThree,
  corporateProductLaunch,
  corporateTeamDinner,
  corporateConference,
  corporateFutureForum,
  corporateOffsite,
  corporateYearsEnd,
  corporateHelloGoodbye,
  dinnerIntimateSupper,
  dinnerGardenParty,
  dinnerCocktailHour,
  dinnerMediterraneanTable,
  dinnerLongTable,
  otherNewKeys,
  otherEvergreen,
  otherCountdown,
  otherSpringTable,
  otherBigNews,
  otherBonVoyage,
  otherRaceDay,
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

/** Search catalog templates by title, description, or category name. */
export function searchTemplates(query: string): InvitationTemplate[] {
  const q = query.trim().toLowerCase();
  if (!q) return INVITATION_TEMPLATES;

  return INVITATION_TEMPLATES.filter((template) => {
    const category = TEMPLATE_CATEGORIES.find(
      (c) => c.id === template.categoryId,
    );
    const haystack = [
      template.title,
      template.description,
      template.categoryId,
      category?.title ?? "",
      category?.description ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

function remappedElements(elements: CanvasElement[]): CanvasElement[] {
  const stamp = Math.random().toString(36).slice(2, 7);
  return elements.map((el) => ({
    ...el,
    id: `${el.id}_${stamp}`,
    href: el.href ?? null,
    style: { ...el.style, effects: { ...el.style.effects } },
    widget: el.widget
      ? {
          ...el.widget,
          ...("options" in el.widget && el.widget.options
            ? { options: el.widget.options.map((o) => ({ ...o })) }
            : {}),
        }
      : null,
  }));
}

/** Guest-facing purpose of a template page, honouring an explicit role. */
function templatePageRole(
  templatePage: TemplatePage,
  index: number,
): InvitationPageRole {
  if (index === 0) return "cover";
  if (templatePage.role && templatePage.role !== "cover") {
    return templatePage.role;
  }
  if (templatePage.kind === "location") return "location";
  if (templatePage.kind === "rsvp") return "rsvp";
  return "details";
}

/** Build invitation content from a catalog template (all pages). */
export function contentFromTemplate(
  template: InvitationTemplate,
): InvitationContent {
  const shape = template.shape ?? "portrait";
  const pages: InvitationPage[] = template.pages.map((templatePage, index) => {
    const pageId = `page_${Math.random().toString(36).slice(2, 9)}`;
    let elements: CanvasElement[] = [];
    if (templatePage.kind === "design") {
      elements = remappedElements(templatePage.elements);
    } else if (templatePage.kind === "location") {
      elements = remappedElements(
        elementsFromLocationPage(
          templatePage.location,
          templatePage.backgroundColor,
          shape,
        ),
      );
    } else if (templatePage.kind === "rsvp") {
      elements = remappedElements(
        elementsFromRsvpPage(templatePage.rsvpConfig, shape),
      );
    }

    return {
      id: pageId,
      name: templatePage.name || `Page ${index + 1}`,
      role: templatePageRole(templatePage, index),
      kind: "design" as const,
      elements,
      backgroundColor: templatePage.backgroundColor,
      backgroundPattern: templatePage.backgroundPattern ?? "none",
      backgroundTexture: templatePage.backgroundTexture ?? "none",
      backgroundTextureOpacity: templatePage.backgroundTextureOpacity ?? 22,
      backgroundTextureTint:
        templatePage.backgroundTextureTint ?? "#ffffff",
      backgroundTextureBlend:
        templatePage.backgroundTextureBlend ?? "soft-light",
      border: templatePage.border ? { ...templatePage.border } : null,
      location: null,
      rsvpConfig: null,
    };
  });

  const firstDesign = pages[0];
  const location = template.pages.find((p) => p.kind === "location");
  const rsvp = template.pages.find((p) => p.kind === "rsvp");
  const base = createDefaultContent({
    title: template.eventTitle || template.title,
    shape,
    customSize:
      shape === "custom"
        ? template.customSize ?? DEFAULT_INVITATION_CUSTOM_SIZE
        : undefined,
  });

  return {
    ...base,
    invite: {
      ...base.invite,
      headline: template.eventTitle || template.title,
    },
    details: {
      ...base.details,
      venue:
        template.venue?.name ||
        location?.location?.venue ||
        base.details.venue,
      address:
        template.venue?.address ||
        location?.location?.address ||
        base.details.address,
    },
    rsvp: {
      prompt:
        template.rsvpPrompt?.prompt ||
        rsvp?.rsvpConfig?.title ||
        base.rsvp.prompt,
      note:
        template.rsvpPrompt?.note ||
        rsvp?.rsvpConfig?.note ||
        base.rsvp.note,
    },
    elements: firstDesign.elements,
    pages,
    activePageId: firstDesign.id,
  };
}

/** Cover page for card thumbnails. */
export function templatePreviewPage(
  template: InvitationTemplate,
): Pick<
  InvitationPage,
  | "elements"
  | "backgroundColor"
  | "backgroundPattern"
  | "backgroundTexture"
  | "backgroundTextureOpacity"
  | "backgroundTextureTint"
  | "backgroundTextureBlend"
  | "border"
> {
  const cover =
    template.pages.find((p) => p.kind === "design") ?? template.pages[0];
  return {
    elements: cover?.elements ?? [],
    backgroundColor: cover?.backgroundColor ?? "#fff8f4",
    backgroundPattern: cover?.backgroundPattern ?? "none",
    backgroundTexture: cover?.backgroundTexture ?? "none",
    backgroundTextureOpacity: cover?.backgroundTextureOpacity ?? 22,
    backgroundTextureTint: cover?.backgroundTextureTint ?? "#ffffff",
    backgroundTextureBlend:
      cover?.backgroundTextureBlend ?? "soft-light",
    border: cover?.border ?? null,
  };
}
