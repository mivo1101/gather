"use client";

import { useId } from "react";
import { ArtDefs, artInk, type ArtPiece } from "./artwork-paint";
import { OBJECT_ARTWORK } from "./artwork-objects";
import { NumberArtGraphic } from "./NumberArtGraphic";
import { artworkDefaultColor, isNumberArtKind } from "./artwork-catalog";

const ARTWORK_PIECES: Record<string, ArtPiece> = { ...OBJECT_ARTWORK };

/**
 * Illustrated elements. Unlike the icon set these are drawn objects - paper,
 * wax, silk and glass with their own light - so a card reads as something you
 * could pick up.
 */
export function ArtworkGraphic({
  kind,
  color,
  className = "h-full w-full",
}: {
  kind: string;
  color?: string;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const piece = ARTWORK_PIECES[kind];
  const ink = artInk(color, artworkDefaultColor(kind) ?? "#C08A9A");

  if (isNumberArtKind(kind)) {
    return (
      <NumberArtGraphic kind={kind} color={color} className={className} />
    );
  }
  if (!piece) return null;

  return (
    <svg
      className={className}
      viewBox={piece.viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <ArtDefs id={uid} ink={ink} />
      {piece.render(uid, ink)}
    </svg>
  );
}
