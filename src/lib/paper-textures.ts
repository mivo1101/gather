import type { CSSProperties } from "react";
import type {
  PaperTexture,
  PaperTextureBlend,
} from "@/lib/data/invitation-content";

export const PAPER_TEXTURES: {
  id: PaperTexture;
  label: string;
  src?: string;
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
  if (!option?.src) return undefined;

  return {
    backgroundColor: tint,
    backgroundImage: `url("${option.src}")`,
    backgroundRepeat: "repeat",
    backgroundSize: option.size,
    backgroundBlendMode: "multiply",
    mixBlendMode: blend,
    opacity: Math.min(1, Math.max(0, opacity / 100)),
  };
}
