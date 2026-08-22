"use client";

import { useId } from "react";
import { ArtDefs, artInk } from "./artwork-paint";
import {
  NUMBER_ART_STYLES,
  numberArtStyle,
  type NumberArtStyle,
} from "./artwork-catalog";

const FONTS: Record<NumberArtStyle, { family: string; weight: number }> = {
  balloon: { family: "var(--font-urbanist), system-ui, sans-serif", weight: 900 },
  foil: { family: "var(--font-bodoni-moda), Georgia, serif", weight: 700 },
  botanical: { family: "var(--font-urbanist), system-ui, sans-serif", weight: 600 },
  brush: { family: "var(--font-urbanist), system-ui, sans-serif", weight: 800 },
};

/**
 * Display numerals as artwork rather than type: the glyph is only the shape,
 * and each style paints it as a material - inflated foil, pressed gold, an
 * outline with a sprig growing through it, or a chalky brush stroke.
 */
export function NumberArtGraphic({
  kind,
  color,
  className = "h-full w-full",
}: {
  kind: string;
  color?: string;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const digit = kind.split("_")[3] ?? "1";
  const style = numberArtStyle(kind);
  const ink = artInk(color, style.defaultColor);
  const font = FONTS[style.id];
  const glyph = (
    <text
      x="50"
      y="99"
      textAnchor="middle"
      fontSize="118"
      style={{ fontFamily: font.family, fontWeight: font.weight }}
    >
      {digit}
    </text>
  );

  return (
    <svg
      className={className}
      viewBox="0 0 100 120"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <ArtDefs id={uid} ink={ink} />
      <defs>
        <clipPath id={`${uid}-glyph`}>{glyph}</clipPath>
        <radialGradient id={`${uid}-inflate`} cx="34%" cy="26%" r="82%">
          <stop offset="0%" stopColor={ink.pale} />
          <stop offset="38%" stopColor={ink.light} />
          <stop offset="72%" stopColor={ink.base} />
          <stop offset="100%" stopColor={ink.deep} />
        </radialGradient>
      </defs>

      {style.id === "balloon" && (
        <>
          <g filter={`url(#${uid}-cast)`}>
            <g fill={`url(#${uid}-inflate)`}>{glyph}</g>
          </g>
          <g clipPath={`url(#${uid}-glyph)`}>
            <ellipse
              cx="34"
              cy="34"
              rx="18"
              ry="11"
              fill="#FFFFFF"
              opacity="0.75"
              filter={`url(#${uid}-soft)`}
              transform="rotate(-28 34 34)"
            />
            <ellipse
              cx="70"
              cy="96"
              rx="26"
              ry="14"
              fill={ink.dark}
              opacity="0.3"
              filter={`url(#${uid}-soft)`}
            />
            <ellipse
              cx="66"
              cy="24"
              rx="6"
              ry="3.4"
              fill="#FFFFFF"
              opacity="0.6"
              transform="rotate(-24 66 24)"
            />
          </g>
          <g
            fill="none"
            stroke={ink.deep}
            strokeWidth="1.2"
            opacity="0.35"
          >
            {glyph}
          </g>
        </>
      )}

      {style.id === "foil" && (
        <>
          <g filter={`url(#${uid}-cast)`}>
            <g fill={`url(#${uid}-foil)`}>{glyph}</g>
          </g>
          <g clipPath={`url(#${uid}-glyph)`}>
            <rect
              x="-40"
              y="-10"
              width="34"
              height="150"
              fill={`url(#${uid}-sheen)`}
              transform="rotate(18 50 60) translate(78 0)"
            />
            <rect
              x="0"
              y="0"
              width="100"
              height="120"
              fill={ink.dark}
              opacity="0.12"
              transform="translate(0 82)"
            />
          </g>
          <g fill="none" stroke={ink.dark} strokeWidth="0.9" opacity="0.55">
            {glyph}
          </g>
        </>
      )}

      {style.id === "botanical" && (
        <>
          <g
            fill="none"
            stroke={ink.base}
            strokeWidth="3.4"
            strokeLinejoin="round"
          >
            {glyph}
          </g>
          <g
            fill="none"
            stroke={ink.pale}
            strokeWidth="1.1"
            opacity="0.8"
            transform="translate(-1.4 -1.6)"
          >
            {glyph}
          </g>
          <g color={ink.base}>
            {[
              { x: 74, y: 30, rotate: 34, scale: 1 },
              { x: 84, y: 44, rotate: 78, scale: 0.8 },
              { x: 22, y: 88, rotate: -140, scale: 0.9 },
              { x: 14, y: 74, rotate: -104, scale: 0.72 },
            ].map((sprig, index) => (
              <g
                key={index}
                transform={`translate(${sprig.x} ${sprig.y}) rotate(${sprig.rotate}) scale(${sprig.scale})`}
              >
                <path
                  d="M0 0C8 -2.2 13 -9 12.4 -18 4 -17 -1 -11.4 0 0Z"
                  fill="currentColor"
                />
                <path
                  d="M1.4 -2.6C6 -5.8 9.4 -10.4 10.4 -15.6"
                  stroke={ink.pale}
                  strokeWidth="0.9"
                  fill="none"
                  opacity="0.6"
                />
              </g>
            ))}
            <circle cx="80" cy="22" r="4.6" fill={ink.pale} />
            <circle cx="80" cy="22" r="1.8" fill={ink.base} />
            <circle cx="19" cy="97" r="3.6" fill={ink.pale} />
          </g>
        </>
      )}

      {style.id === "brush" && (
        <g filter={`url(#${uid}-rough)`}>
          <g clipPath={`url(#${uid}-glyph)`}>
            <rect x="0" y="0" width="100" height="120" fill={ink.base} />
            <rect
              x="0"
              y="0"
              width="100"
              height="120"
              fill={ink.deep}
              opacity="0.45"
              filter={`url(#${uid}-chalk)`}
            />
            <rect
              x="0"
              y="0"
              width="100"
              height="120"
              fill="#FFFFFF"
              opacity="0.5"
              filter={`url(#${uid}-chalk)`}
              transform="translate(3 5)"
            />
          </g>
        </g>
      )}
    </svg>
  );
}
