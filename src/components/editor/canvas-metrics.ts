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
