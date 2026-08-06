import type { InvitationCanvasShape } from "@/lib/data/invitation-content";

export function cardAspectRatio(
  shape: InvitationCanvasShape,
  customSize?: { width: number; height: number },
): number {
  switch (shape) {
    case "landscape":
      return 16 / 9;
    case "square":
      return 1;
    case "custom":
      return (
        (customSize?.width ?? 4) / Math.max(customSize?.height ?? 5, 0.001)
      );
    case "portrait":
    default:
      return 9 / 16;
  }
}

export function designCanvasSize(aspect: number) {
  const safeAspect = Math.max(aspect, 0.001);

  if (safeAspect < 0.95) {
    const height = 540;
    return { width: height * safeAspect, height };
  }

  if (safeAspect > 1.05) {
    const width = 760;
    return { width, height: width / safeAspect };
  }

  const width = 540;
  return { width, height: width / safeAspect };
}
