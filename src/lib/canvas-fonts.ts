export type CanvasFontFamily =
  | "playfair"
  | "urbanist"
  | "caveat"
  | "windsong"
  | "lovers-quarrel"
  | "great-vibes"
  | "instrument-serif"
  | "bodoni-moda"
  | "italiana"
  | "forum"
  | "cinzel-decorative";

type CanvasFontOption = {
  id: CanvasFontFamily;
  label: string;
  cssFamily: string;
  className: string;
};

export const CANVAS_FONT_GROUPS: {
  label: string;
  fonts: CanvasFontOption[];
}[] = [
  {
    label: "Gather essentials",
    fonts: [
      {
        id: "playfair",
        label: "Playfair Display",
        cssFamily: "var(--font-playfair)",
        className: "font-[family-name:var(--font-playfair)]",
      },
      {
        id: "urbanist",
        label: "Urbanist",
        cssFamily: "var(--font-urbanist)",
        className: "font-sans",
      },
      {
        id: "caveat",
        label: "Caveat",
        cssFamily: "var(--font-cursive)",
        className: "font-[family-name:var(--font-cursive)]",
      },
    ],
  },
  {
    label: "Elegant scripts",
    fonts: [
      {
        id: "windsong",
        label: "WindSong",
        cssFamily: "var(--font-windsong)",
        className: "font-[family-name:var(--font-windsong)]",
      },
      {
        id: "lovers-quarrel",
        label: "Lovers Quarrel",
        cssFamily: "var(--font-lovers-quarrel)",
        className: "font-[family-name:var(--font-lovers-quarrel)]",
      },
      {
        id: "great-vibes",
        label: "Great Vibes",
        cssFamily: "var(--font-great-vibes)",
        className: "font-[family-name:var(--font-great-vibes)]",
      },
    ],
  },
  {
    label: "Editorial & decorative",
    fonts: [
      {
        id: "instrument-serif",
        label: "Instrument Serif",
        cssFamily: "var(--font-instrument-serif)",
        className: "font-[family-name:var(--font-instrument-serif)]",
      },
      {
        id: "bodoni-moda",
        label: "Bodoni Moda",
        cssFamily: "var(--font-bodoni-moda)",
        className: "font-[family-name:var(--font-bodoni-moda)]",
      },
      {
        id: "italiana",
        label: "Italiana",
        cssFamily: "var(--font-italiana)",
        className: "font-[family-name:var(--font-italiana)]",
      },
      {
        id: "forum",
        label: "Forum",
        cssFamily: "var(--font-forum)",
        className: "font-[family-name:var(--font-forum)]",
      },
      {
        id: "cinzel-decorative",
        label: "Cinzel Decorative",
        cssFamily: "var(--font-cinzel-decorative)",
        className: "font-[family-name:var(--font-cinzel-decorative)]",
      },
    ],
  },
];

const CANVAS_FONTS = CANVAS_FONT_GROUPS.flatMap((group) => group.fonts);

export function canvasFontFamilyClass(family: CanvasFontFamily) {
  return (
    CANVAS_FONTS.find((font) => font.id === family)?.className ??
    "font-[family-name:var(--font-playfair)]"
  );
}

export function canvasFontCssFamily(family: CanvasFontFamily) {
  return (
    CANVAS_FONTS.find((font) => font.id === family)?.cssFamily ??
    "var(--font-playfair)"
  );
}
