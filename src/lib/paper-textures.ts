import type { CSSProperties } from "react";
import type {
  PaperTexture,
  PaperTextureBlend,
} from "@/lib/data/invitation-content";

/** An inline SVG as a background image - no asset request, no flash. */
function svgLayer(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(
    svg.replace(/\s+/g, " ").trim(),
  )}")`;
}

/** Grain sheet: fractal noise flattened to grey, tiled seamlessly. */
function grain({
  frequency,
  octaves = 4,
  opacity = 0.5,
  tile = 200,
  contrast = 1,
}: {
  frequency: number;
  octaves?: number;
  opacity?: number;
  tile?: number;
  contrast?: number;
}): string {
  return svgLayer(`
    <svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'>
      <filter id='g' x='0' y='0' width='100%' height='100%'>
        <feTurbulence type='fractalNoise' baseFrequency='${frequency}'
          numOctaves='${octaves}' stitchTiles='stitch' result='n'/>
        <feColorMatrix type='saturate' values='0'/>
        <feComponentTransfer>
          <feFuncA type='linear' slope='${contrast}' intercept='0'/>
        </feComponentTransfer>
      </filter>
      <rect width='${tile}' height='${tile}' filter='url(%23g)' opacity='${opacity}'/>
    </svg>`);
}

/** Flecks of pulp, as a hard-thresholded noise field. */
function flecks(frequency: number, tile = 220): string {
  return svgLayer(`
    <svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'>
      <filter id='f' x='0' y='0' width='100%' height='100%'>
        <feTurbulence type='turbulence' baseFrequency='${frequency}'
          numOctaves='2' stitchTiles='stitch'/>
        <feColorMatrix type='saturate' values='0'/>
        <feComponentTransfer>
          <feFuncA type='discrete' tableValues='0 0 0 0 0 0 0 0.65 1'/>
        </feComponentTransfer>
      </filter>
      <rect width='${tile}' height='${tile}' filter='url(%23f)' opacity='0.5'/>
    </svg>`);
}

/** Soft pooling wash, the way pigment dries on cotton rag. */
function wash(tile = 460): string {
  return svgLayer(`
    <svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'>
      <filter id='w' x='0' y='0' width='100%' height='100%'>
        <feTurbulence type='fractalNoise' baseFrequency='0.014'
          numOctaves='5' stitchTiles='stitch'/>
        <feColorMatrix type='saturate' values='0'/>
        <feGaussianBlur stdDeviation='1.4'/>
        <feComponentTransfer>
          <feFuncA type='linear' slope='1.5' intercept='-0.15'/>
        </feComponentTransfer>
      </filter>
      <rect width='${tile}' height='${tile}' filter='url(%23w)' opacity='0.72'/>
    </svg>`);
}

/** Laid lines: the fine ribs a mould leaves in handmade sheets. */
const LAID_LINES =
  "repeating-linear-gradient(0deg, rgba(0,0,0,0.09) 0 1px, rgba(0,0,0,0) 1px 4px)";
const CHAIN_LINES =
  "repeating-linear-gradient(90deg, rgba(0,0,0,0.07) 0 1px, rgba(0,0,0,0) 1px 36px)";
const WEAVE_WARP =
  "repeating-linear-gradient(0deg, rgba(0,0,0,0.10) 0 1px, rgba(0,0,0,0) 1px 3px)";
const WEAVE_WEFT =
  "repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0 1px, rgba(0,0,0,0) 1px 3px)";

export const PAPER_TEXTURES: {
  id: PaperTexture;
  label: string;
  /** Bitmap paper scans. */
  src?: string;
  /** Ready-made background-image value, for the drawn papers. */
  image?: string;
  size?: string;
}[] = [
  { id: "none", label: "None" },
  {
    id: "cotton",
    label: "Cotton",
    src: "/images/paper-textures/cotton.webp",
    size: "460px",
  },
  {
    id: "linen",
    label: "Linen",
    src: "/images/paper-textures/linen.webp",
    size: "360px",
  },
  {
    id: "handmade",
    label: "Handmade",
    src: "/images/paper-textures/handmade.webp",
    size: "520px",
  },
  {
    id: "pressed",
    label: "Pressed",
    src: "/images/paper-textures/pressed.webp",
    size: "480px",
  },
  {
    id: "kraft",
    label: "Kraft",
    image: `${grain({ frequency: 0.8, octaves: 5, opacity: 0.6, contrast: 1.2 })}, ${flecks(0.42)}`,
    size: "200px, 220px",
  },
  {
    id: "laid",
    label: "Laid",
    image: `${LAID_LINES}, ${CHAIN_LINES}, ${grain({ frequency: 0.9, opacity: 0.32 })}`,
    size: "auto, auto, 200px",
  },
  {
    id: "canvas",
    label: "Canvas",
    image: `${WEAVE_WARP}, ${WEAVE_WEFT}, ${grain({ frequency: 1.1, opacity: 0.3 })}`,
    size: "auto, auto, 200px",
  },
  {
    id: "watercolour",
    label: "Watercolour",
    image: `${wash()}, ${grain({ frequency: 0.7, opacity: 0.28 })}`,
    size: "460px, 200px",
  },
  {
    id: "speckle",
    label: "Speckle",
    image: `${flecks(0.24, 260)}, ${grain({ frequency: 0.95, opacity: 0.26 })}`,
    size: "260px, 200px",
  },
  {
    id: "vellum",
    label: "Vellum",
    image: `${grain({ frequency: 1.6, octaves: 3, opacity: 0.34 })}`,
    size: "180px",
  },
];

export const PAPER_TEXTURE_BLENDS: {
  id: PaperTextureBlend;
  label: string;
}[] = [
  { id: "soft-light", label: "Natural" },
  { id: "multiply", label: "Ink" },
  { id: "overlay", label: "Contrast" },
];

export function paperTextureLayerStyle({
  texture = "none",
  opacity = 22,
  tint = "#ffffff",
  blend = "soft-light",
}: {
  texture?: PaperTexture;
  opacity?: number;
  tint?: string;
  blend?: PaperTextureBlend;
}): CSSProperties | undefined {
  const option = PAPER_TEXTURES.find((item) => item.id === texture);
  const image = option?.image ?? (option?.src ? `url("${option.src}")` : null);
  if (!image) return undefined;

  return {
    backgroundColor: tint,
    backgroundImage: image,
    backgroundRepeat: "repeat",
    backgroundSize: option?.size,
    backgroundBlendMode: "multiply",
    mixBlendMode: blend,
    opacity: Math.min(1, Math.max(0, opacity / 100)),
  };
}
