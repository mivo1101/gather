import type { ImageFrame } from "@/lib/data/canvas-elements";

export const EMPTY_IMAGE_FRAME_SRC = "__gather_empty_image_frame__";

export type ImageFrameGroup = "basic" | "decorative";

export const IMAGE_FRAME_OPTIONS: Array<{
  id: ImageFrame;
  label: string;
  group: ImageFrameGroup;
}> = [
  { id: "none", label: "Original", group: "basic" },
  { id: "square", label: "Square", group: "basic" },
  { id: "rounded", label: "Rounded", group: "basic" },
  { id: "circle", label: "Circle", group: "basic" },
  { id: "arch", label: "Arch", group: "basic" },
  { id: "heart", label: "Heart", group: "basic" },
  { id: "triangle", label: "Triangle", group: "basic" },
  { id: "inverted-triangle", label: "Inverted", group: "basic" },
  { id: "diamond", label: "Diamond", group: "basic" },
  { id: "pentagon", label: "Pentagon", group: "basic" },
  { id: "hexagon", label: "Hexagon", group: "basic" },
  { id: "octagon", label: "Octagon", group: "basic" },
  { id: "star", label: "Star", group: "basic" },
  { id: "badge", label: "Badge", group: "basic" },
  { id: "scallop", label: "Scallop", group: "basic" },
  { id: "lace-oval", label: "Lace oval", group: "decorative" },
  { id: "baroque-oval", label: "Baroque", group: "decorative" },
  { id: "pearl-oval", label: "Pearl oval", group: "decorative" },
  { id: "lace-arch", label: "Lace arch", group: "decorative" },
  { id: "deco-arch", label: "Deco arch", group: "decorative" },
  { id: "scallop-circle", label: "Scallop ring", group: "decorative" },
  { id: "laurel-circle", label: "Laurel", group: "decorative" },
  { id: "rope-circle", label: "Rope", group: "decorative" },
  { id: "filigree-rect", label: "Filigree", group: "decorative" },
  { id: "botanical-rect", label: "Botanical", group: "decorative" },
  { id: "ribbon-rect", label: "Ribbon", group: "decorative" },
  { id: "stamp-rect", label: "Postage", group: "decorative" },
  { id: "polaroid", label: "Photo print", group: "decorative" },
  { id: "deco-diamond", label: "Deco gem", group: "decorative" },
  { id: "lace-heart", label: "Lace heart", group: "decorative" },
];

/** Ornament margin around the photo, in % of the element box. */
interface FrameInset {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DecorativeFrameSpec {
  id: ImageFrame;
  inset: FrameInset;
  /** Clip path for the photo, resolved against the inset aperture box. */
  aperture?: string;
  /** Ornament ink used until the guest picks their own. */
  defaultColor: string;
  /** Keep the element visually square on the card. */
  square?: boolean;
  /** Suggested height / width when the frame is dropped from Elements. */
  aspect: number;
}

const OVAL = "ellipse(50% 50% at 50% 50%)";
const ARCH = "inset(0 round 50% 50% 6% 6%)";
const CIRCLE = "circle(50% at 50% 50%)";

/**
 * A smooth heart traced from the classic parametric curve, in a 0-100 box.
 * The ornament draws the same points, so band and photo edge agree.
 */
export const HEART_POINTS: Array<[number, number]> = Array.from(
  { length: 60 },
  (_, i) => {
    const t = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const x = 16 * Math.sin(t) ** 3;
    const y =
      -(13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t));
    return [
      Math.round((50 + (x / 17) * 50) * 100) / 100,
      Math.round((50 + (y / 17) * 47) * 100) / 100,
    ];
  },
);

const HEART = `polygon(${HEART_POINTS.map(
  ([x, y]) => `${x}% ${y}%`,
).join(", ")})`;

function inset(
  top: number,
  right = top,
  bottom = top,
  left = right,
): FrameInset {
  return { top, right, bottom, left };
}

const DECORATIVE_FRAMES: Record<string, DecorativeFrameSpec> = {
  "lace-oval": {
    id: "lace-oval",
    inset: inset(12, 15),
    aperture: OVAL,
    defaultColor: "#B08A8A",
    aspect: 1.2,
  },
  "baroque-oval": {
    id: "baroque-oval",
    inset: inset(12, 15),
    aperture: OVAL,
    defaultColor: "#C89A3C",
    aspect: 1.22,
  },
  "pearl-oval": {
    id: "pearl-oval",
    inset: inset(9, 11),
    aperture: OVAL,
    defaultColor: "#C2A98A",
    aspect: 1.18,
  },
  "lace-arch": {
    id: "lace-arch",
    inset: inset(10, 13),
    aperture: ARCH,
    defaultColor: "#C08A9A",
    aspect: 1.3,
  },
  "deco-arch": {
    id: "deco-arch",
    inset: inset(9, 12),
    aperture: ARCH,
    defaultColor: "#B08D57",
    aspect: 1.3,
  },
  "scallop-circle": {
    id: "scallop-circle",
    inset: inset(12),
    aperture: CIRCLE,
    defaultColor: "#E79BB6",
    square: true,
    aspect: 1,
  },
  "laurel-circle": {
    id: "laurel-circle",
    inset: inset(13),
    aperture: CIRCLE,
    defaultColor: "#7E8F6B",
    square: true,
    aspect: 1,
  },
  "rope-circle": {
    id: "rope-circle",
    inset: inset(10),
    aperture: CIRCLE,
    defaultColor: "#C9A227",
    square: true,
    aspect: 1,
  },
  "filigree-rect": {
    id: "filigree-rect",
    inset: inset(9, 10),
    defaultColor: "#7A6A55",
    aspect: 1.05,
  },
  "botanical-rect": {
    id: "botanical-rect",
    inset: inset(10, 11),
    defaultColor: "#6E8B5A",
    aspect: 1.05,
  },
  "ribbon-rect": {
    id: "ribbon-rect",
    inset: inset(15, 9, 9, 9),
    aperture: "inset(0 round 2%)",
    defaultColor: "#D9748C",
    aspect: 1.15,
  },
  "stamp-rect": {
    id: "stamp-rect",
    inset: inset(7, 8),
    defaultColor: "#E2D5BC",
    aspect: 1.15,
  },
  polaroid: {
    id: "polaroid",
    inset: inset(7, 7, 20, 7),
    defaultColor: "#FFFFFF",
    aspect: 1.15,
  },
  "deco-diamond": {
    id: "deco-diamond",
    inset: inset(9),
    aperture: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
    defaultColor: "#B08D57",
    square: true,
    aspect: 1,
  },
  "lace-heart": {
    id: "lace-heart",
    inset: inset(8),
    aperture: HEART,
    defaultColor: "#E58FA8",
    square: true,
    aspect: 1,
  },
};

export function decorativeFrameSpec(
  frame?: ImageFrame | null,
): DecorativeFrameSpec | null {
  return (frame && DECORATIVE_FRAMES[frame]) || null;
}

export function isDecorativeFrame(frame?: ImageFrame | null): boolean {
  return Boolean(decorativeFrameSpec(frame));
}

/** Ink an ornament draws with when the element has no override. */
export function frameOrnamentColor(
  frame?: ImageFrame | null,
  frameColor?: string | null,
): string {
  return frameColor || decorativeFrameSpec(frame)?.defaultColor || "#B08A8A";
}

export function imageFrameClipPath(
  frame?: ImageFrame | null,
): string | undefined {
  const decorative = decorativeFrameSpec(frame);
  if (decorative) return decorative.aperture;
  switch (frame) {
    case "circle":
      return "circle(closest-side at 50% 50%)";
    case "heart":
      return "polygon(50% 92%, 8% 52%, 8% 30%, 22% 16%, 38% 16%, 50% 30%, 62% 16%, 78% 16%, 92% 30%, 92% 52%)";
    case "rounded":
      return "inset(0 round 16%)";
    case "arch":
      return "inset(0 round 50% 50% 0 0)";
    case "triangle":
      return "polygon(50% 0, 100% 100%, 0 100%)";
    case "inverted-triangle":
      return "polygon(0 0, 100% 0, 50% 100%)";
    case "diamond":
      return "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)";
    case "pentagon":
      return "polygon(50% 0, 100% 38%, 82% 100%, 18% 100%, 0 38%)";
    case "hexagon":
      return "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)";
    case "octagon":
      return "polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%)";
    case "star":
      return "polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 94%, 50% 72%, 21% 94%, 32% 57%, 2% 35%, 39% 35%)";
    case "badge":
      return "polygon(50% 0, 62% 13%, 80% 5%, 87% 22%, 100% 32%, 91% 50%, 100% 68%, 83% 78%, 78% 98%, 58% 89%, 42% 100%, 28% 84%, 7% 87%, 9% 65%, 0 50%, 13% 35%, 5% 16%, 26% 13%)";
    case "scallop":
      return "polygon(50% 0, 60% 7%, 72% 4%, 79% 15%, 91% 17%, 92% 30%, 100% 40%, 94% 50%, 100% 62%, 91% 70%, 89% 83%, 76% 84%, 68% 96%, 56% 91%, 45% 100%, 35% 92%, 22% 96%, 16% 84%, 3% 80%, 7% 67%, 0 57%, 7% 47%, 1% 35%, 12% 27%, 13% 14%, 27% 13%, 37% 3%)";
    case "square":
      return "inset(0)";
    default:
      return undefined;
  }
}

/** CSS inset for the photo aperture of a decorative frame. */
export function imageFrameInset(frame?: ImageFrame | null): string {
  const spec = decorativeFrameSpec(frame);
  if (!spec) return "0";
  const { top, right, bottom, left } = spec.inset;
  return `${top}% ${right}% ${bottom}% ${left}%`;
}

/** Frames whose element bounds should remain visually 1:1. */
export function isSquareImageFrame(frame?: ImageFrame | null): boolean {
  const decorative = decorativeFrameSpec(frame);
  if (decorative) return Boolean(decorative.square);
  return (
    frame === "square" ||
    frame === "circle" ||
    frame === "heart" ||
    frame === "triangle" ||
    frame === "inverted-triangle" ||
    frame === "diamond" ||
    frame === "pentagon" ||
    frame === "hexagon" ||
    frame === "octagon" ||
    frame === "star" ||
    frame === "badge" ||
    frame === "scallop"
  );
}

/**
 * Starting size for a frame dropped from Elements, in card percent. Decorative
 * frames carry their own portrait or square proportion.
 */
export function frameElementSize(
  frame: ImageFrame | undefined,
  cardAspect: number,
): { width: number; height: number } {
  const spec = decorativeFrameSpec(frame);
  const aspect = spec
    ? spec.aspect
    : isSquareImageFrame(frame)
      ? 1
      : frame === "arch"
        ? 1.25
        : 0.72;
  const width = 44;
  return {
    width,
    height: Math.round(width * cardAspect * aspect * 10) / 10,
  };
}
