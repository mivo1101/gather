"use client";

import type { ReactNode } from "react";
import { isGradient, mixHex, normalizeHex } from "@/lib/color-utils";

/**
 * Artwork elements are illustrations, not icons: every piece is built from a
 * paper, a material (wax, silk, foil, glass) and light. One accent colour
 * drives the material so a guest can match the invitation, while the paper
 * stays paper.
 */
export interface ArtPiece {
  viewBox: string;
  render: (id: string, ink: ArtInk) => ReactNode;
}

export interface ArtInk {
  /** The accent the piece is made of - wax, silk, liner, ink. */
  base: string;
  light: string;
  pale: string;
  deep: string;
  dark: string;
  /** Card stock, always warm white so paper reads as paper. */
  paper: string;
  paperDeep: string;
  paperEdge: string;
  ink: string;
}

export function artInk(color: string | undefined, fallback: string): ArtInk {
  const base = isGradient(color || "")
    ? fallback
    : normalizeHex(color || fallback, fallback);
  return {
    base,
    light: mixHex(base, "#FFFFFF", 0.34),
    pale: mixHex(base, "#FFFFFF", 0.68),
    deep: mixHex(base, "#2A1A16", 0.3),
    dark: mixHex(base, "#20120F", 0.55),
    paper: "#FDFAF4",
    paperDeep: "#EFE6D6",
    paperEdge: "#D9CDB8",
    ink: "#3A3229",
  };
}

/** Materials every piece can paint with, keyed off one instance id. */
export function ArtDefs({ id, ink }: { id: string; ink: ArtInk }): ReactNode {
  return (
    <defs>
      <linearGradient id={`${id}-paper`} x1="12%" y1="0%" x2="88%" y2="100%">
        <stop offset="0%" stopColor="#FFFEFA" />
        <stop offset="52%" stopColor={ink.paper} />
        <stop offset="100%" stopColor={ink.paperDeep} />
      </linearGradient>
      <linearGradient id={`${id}-paper-back`} x1="0%" y1="0%" x2="60%" y2="100%">
        <stop offset="0%" stopColor={ink.paperDeep} />
        <stop offset="100%" stopColor="#E4D8C4" />
      </linearGradient>
      <linearGradient id={`${id}-liner`} x1="10%" y1="0%" x2="90%" y2="100%">
        <stop offset="0%" stopColor={ink.light} />
        <stop offset="46%" stopColor={ink.base} />
        <stop offset="100%" stopColor={ink.deep} />
      </linearGradient>
      <radialGradient id={`${id}-wax`} cx="34%" cy="28%" r="78%">
        <stop offset="0%" stopColor={ink.light} />
        <stop offset="46%" stopColor={ink.base} />
        <stop offset="100%" stopColor={ink.dark} />
      </radialGradient>
      <linearGradient id={`${id}-silk`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={ink.deep} />
        <stop offset="28%" stopColor={ink.base} />
        <stop offset="52%" stopColor={ink.light} />
        <stop offset="74%" stopColor={ink.base} />
        <stop offset="100%" stopColor={ink.deep} />
      </linearGradient>
      <linearGradient id={`${id}-foil`} x1="0%" y1="0%" x2="100%" y2="90%">
        <stop offset="0%" stopColor={ink.dark} />
        <stop offset="14%" stopColor={ink.deep} />
        <stop offset="30%" stopColor={ink.base} />
        <stop offset="42%" stopColor="#FFF6DC" />
        <stop offset="52%" stopColor={ink.light} />
        <stop offset="66%" stopColor={ink.deep} />
        <stop offset="80%" stopColor={ink.base} />
        <stop offset="92%" stopColor="#FFF6DC" />
        <stop offset="100%" stopColor={ink.dark} />
      </linearGradient>
      <linearGradient id={`${id}-metal`} x1="0%" y1="0%" x2="100%" y2="80%">
        <stop offset="0%" stopColor="#8E8676" />
        <stop offset="24%" stopColor="#D9D2C4" />
        <stop offset="46%" stopColor="#F5F1E8" />
        <stop offset="70%" stopColor="#B4AB99" />
        <stop offset="100%" stopColor="#7C7263" />
      </linearGradient>
      <linearGradient id={`${id}-glass`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
        <stop offset="26%" stopColor="#E9F1F4" stopOpacity="0.5" />
        <stop offset="62%" stopColor="#FFFFFF" stopOpacity="0.28" />
        <stop offset="100%" stopColor="#CBD8DE" stopOpacity="0.6" />
      </linearGradient>
      <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFE9B0" stopOpacity="0.95" />
        <stop offset="55%" stopColor="#FFC94F" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#FFB020" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-sheen`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="46%" stopColor="#FFFFFF" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <filter id={`${id}-cast`} x="-30%" y="-30%" width="160%" height="180%">
        <feDropShadow
          dx="0"
          dy="1.6"
          stdDeviation="1.8"
          floodColor="#2C2118"
          floodOpacity="0.22"
        />
      </filter>
      <filter id={`${id}-soft`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2.2" />
      </filter>
      <filter id={`${id}-rough`} x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.09"
          numOctaves="3"
          result="n"
        />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" />
      </filter>
      <filter id={`${id}-chalk`} x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="1.5" intercept="-0.45" />
        </feComponentTransfer>
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
    </defs>
  );
}
