/**
 * The artwork catalogue - what pieces exist, how they are proportioned and
 * what ink they start in. Deliberately a plain module: the library data (and
 * anything a server component touches) reads this, while the drawing lives in
 * the "use client" artwork components.
 */

export const NUMBER_ART_STYLES = [
  { id: "balloon", label: "Balloon", defaultColor: "#E8A0B4" },
  { id: "foil", label: "Gold foil", defaultColor: "#C89A3C" },
  { id: "botanical", label: "Botanical", defaultColor: "#5E8C4A" },
  { id: "brush", label: "Brush", defaultColor: "#E4557E" },
] as const;

export type NumberArtStyle = (typeof NUMBER_ART_STYLES)[number]["id"];

export function isNumberArtKind(kind: string): boolean {
  return kind.startsWith("art_number_");
}

export function numberArtStyle(kind: string) {
  const id = kind.split("_")[2];
  return NUMBER_ART_STYLES.find((style) => style.id === id) ?? NUMBER_ART_STYLES[0];
}

/** Height / width each piece wants, and the ink it is drawn in by default. */
const ARTWORK_CATALOG: Record<
  string,
  { aspect: number; defaultColor: string }
> = {
  art_bow: { aspect: 0.8, defaultColor: "#E1889F" },
  art_ribbon: { aspect: 2.14, defaultColor: "#C0879A" },
  art_candle: { aspect: 2.14, defaultColor: "#E4D7BE" },
  art_pen: { aspect: 1, defaultColor: "#2B3A4A" },
  art_ink_quill: { aspect: 1, defaultColor: "#33465C" },
  art_coupe: { aspect: 1.5, defaultColor: "#D8B26A" },
  art_sprig: { aspect: 1.33, defaultColor: "#6E8B5A" },
  art_key: { aspect: 0.47, defaultColor: "#9A8F7C" },
  art_tag: { aspect: 1.5, defaultColor: "#C08A9A" },
  art_pearls: { aspect: 0.63, defaultColor: "#EADFCF" },
  art_stamp: { aspect: 1.18, defaultColor: "#9A5B5B" },
  art_confetti: { aspect: 0.83, defaultColor: "#E4557E" },
};

export function isArtworkKind(kind: string): boolean {
  return isNumberArtKind(kind) || kind in ARTWORK_CATALOG;
}

export function artworkDefaultColor(kind: string): string {
  return isNumberArtKind(kind)
    ? numberArtStyle(kind).defaultColor
    : (ARTWORK_CATALOG[kind]?.defaultColor ?? "#C08A9A");
}

function artworkAspect(kind: string): number {
  return isNumberArtKind(kind) ? 1.2 : (ARTWORK_CATALOG[kind]?.aspect ?? 1);
}

/** An artwork element drops at its own proportions on the card. */
export function artworkElementSize(
  kind: string,
  cardAspect: number,
): { width: number; height: number } {
  const aspect = artworkAspect(kind);
  const width = Math.round((36 / Math.sqrt(aspect)) * 10) / 10;
  return {
    width,
    height: Math.round(Math.min(84, width * cardAspect * aspect) * 10) / 10,
  };
}
