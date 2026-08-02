import type { ImageFrame } from "@/lib/data/canvas-elements";

export const EMPTY_IMAGE_FRAME_SRC = "__gather_empty_image_frame__";

export const IMAGE_FRAME_OPTIONS: Array<{
  id: ImageFrame;
  label: string;
}> = [
  { id: "none", label: "Original" },
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "circle", label: "Circle" },
  { id: "arch", label: "Arch" },
  { id: "heart", label: "Heart" },
  { id: "triangle", label: "Triangle" },
  { id: "inverted-triangle", label: "Inverted" },
  { id: "diamond", label: "Diamond" },
  { id: "pentagon", label: "Pentagon" },
  { id: "hexagon", label: "Hexagon" },
  { id: "octagon", label: "Octagon" },
  { id: "star", label: "Star" },
  { id: "badge", label: "Badge" },
  { id: "scallop", label: "Scallop" },
];

export function imageFrameClipPath(
  frame?: ImageFrame | null,
): string | undefined {
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

/** Frames whose element bounds should remain visually 1:1. */
export function isSquareImageFrame(frame?: ImageFrame | null): boolean {
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
