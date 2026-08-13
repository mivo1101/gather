"use client";

import {
  isGradient,
  mixHex,
  normalizeHex,
} from "@/lib/color-utils";

type ColourPalette = {
  primary: string;
  soft: string;
  deep: string;
  gold: string;
  goldSoft: string;
  mint: string;
  sky: string;
  coral: string;
  cream: string;
  ink: string;
  white: string;
};

function colourPalette(color: string): ColourPalette {
  const primary = isGradient(color)
    ? "#FF60AA"
    : normalizeHex(color, "#FF60AA");
  return {
    primary,
    soft: mixHex(primary, "#FFFFFF", 0.42),
    deep: mixHex(primary, "#1A1A1C", 0.28),
    gold: "#D4A84B",
    goldSoft: "#F0D78C",
    mint: "#5BB8A8",
    sky: "#6BAED6",
    coral: "#FF8F7A",
    cream: "#FFF6EE",
    ink: "#2A2A2E",
    white: "#FFFFFF",
  };
}

/** Multi-colour filled icons for the Elements library. */
export function ColouredIconGraphic({
  kind,
  color,
  className = "h-full w-full",
}: {
  kind: string;
  color: string;
  className?: string;
}) {
  const p = colourPalette(color);
  const key = kind.replace(/^icon_colour_/, "");

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {key === "heart" && (
        <path
          fill={p.primary}
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      )}
      {key === "star" && (
        <>
          <path
            fill={p.gold}
            d="M12 2.8 14.4 9.2 21.2 9.6 16 14.2 17.6 21 12 17.4 6.4 21 8 14.2 2.8 9.6 9.6 9.2 12 2.8Z"
          />
          <path
            fill={p.goldSoft}
            d="M12 5.2 13.5 9.4 18 9.7 14.6 12.7 15.6 17.2 12 14.8 8.4 17.2 9.4 12.7 6 9.7 10.5 9.4 12 5.2Z"
            opacity="0.85"
          />
        </>
      )}
      {key === "sparkles" && (
        <>
          <path
            fill={p.primary}
            d="m12 2.2 1.5 4.5L18 8.2l-4.5 1.5L12 14.2l-1.5-4.5L6 8.2l4.5-1.5L12 2.2Z"
          />
          <path
            fill={p.gold}
            d="m18.6 13.2.8 2.3 2.3.8-2.3.8-.8 2.3-.8-2.3-2.3-.8 2.3-.8.8-2.3Z"
          />
          <path
            fill={p.sky}
            d="m5 14 .6 1.8 1.8.6-1.8.6L5 19.4l-.6-1.8-1.8-.6 1.8-.6L5 14Z"
          />
        </>
      )}
      {key === "wine" && (
        <>
          <path
            fill={p.deep}
            d="M7.6 3h8.8v1.4c0 3.6-2.1 6.2-4.4 6.2S7.6 8 7.6 4.4V3Z"
          />
          <path
            fill={p.primary}
            d="M8.2 6.8h7.6c-.3 2.4-1.8 4-3.8 4s-3.5-1.6-3.8-4Z"
          />
          <path
            fill="none"
            stroke={p.ink}
            strokeWidth="1.5"
            strokeLinecap="round"
            d="M12 11.2v8.2M8.6 21h6.8"
          />
        </>
      )}
      {key === "cocktail" && (
        <>
          <path fill={p.mint} d="m6.2 4.2 5.8 8.2 5.8-8.2H6.2Z" />
          <path fill={p.soft} d="m8.2 4.2 3.8 5.4 3.8-5.4H8.2Z" opacity="0.7" />
          <path
            fill="none"
            stroke={p.ink}
            strokeWidth="1.5"
            strokeLinecap="round"
            d="M12 12.4v6.8M8.6 21h6.8M8.4 4.2h7.2"
          />
          <path
            fill="none"
            stroke={p.coral}
            strokeWidth="1.4"
            strokeLinecap="round"
            d="m15.4 6.2 2.6-2.4"
          />
          <circle cx="18.6" cy="3.3" r="1" fill={p.primary} />
        </>
      )}
      {key === "gift" && (
        <>
          <rect x="4" y="10" width="16" height="10.5" rx="1.2" fill={p.primary} />
          <rect x="3.2" y="6.2" width="17.6" height="3.8" rx="1" fill={p.deep} />
          <rect x="11" y="6.2" width="2" height="14.3" fill={p.goldSoft} />
          <path
            fill={p.gold}
            d="M12 6.2c-2.6 0-4.6-.7-4.6-2.1S8.4 2.2 10 2.2c1.8 0 2 2.2 2 4ZM12 6.2c2.6 0 4.6-.7 4.6-2.1S15.6 2.2 14 2.2c-1.8 0-2 2.2-2 4Z"
          />
        </>
      )}
      {key === "cake" && (
        <>
          <rect x="5" y="11" width="14" height="9.5" rx="1.2" fill={p.cream} />
          <path
            fill={p.primary}
            d="M5 14.8c2 1.4 3.4 1.4 4.8 0 1.4 1.4 2.9 1.4 4.4 0 1.4 1.4 2.9 1.4 4.8 0V11H5v3.8Z"
          />
          <path
            fill="none"
            stroke={p.ink}
            strokeWidth="1.4"
            strokeLinecap="round"
            d="M8 11V8.2M12 11V8.2M16 11V8.2"
          />
          <path fill={p.gold} d="M8 6.2c1-1 1-2.1 0-3.2-1 1.1-1 2.2 0 3.2Z" />
          <path fill={p.coral} d="M12 6.2c1-1 1-2.1 0-3.2-1 1.1-1 2.2 0 3.2Z" />
          <path fill={p.sky} d="M16 6.2c1-1 1-2.1 0-3.2-1 1.1-1 2.2 0 3.2Z" />
        </>
      )}
      {key === "rings" && (
        <>
          <circle
            cx="9"
            cy="13.2"
            r="5.4"
            fill="none"
            stroke={p.gold}
            strokeWidth="2"
          />
          <circle
            cx="15"
            cy="13.2"
            r="5.4"
            fill="none"
            stroke={p.goldSoft}
            strokeWidth="2"
          />
          <path
            fill={p.primary}
            d="m6.6 6.4 2.4-2.8 2.4 2.8-2.4 1.9-2.4-1.9Z"
          />
        </>
      )}
      {key === "envelope" && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2.2" fill={p.cream} />
          <path fill={p.primary} d="M3 7.2 12 14l9-6.8V7L12 12.6 3 7v.2Z" />
          <path
            fill="none"
            stroke={p.deep}
            strokeWidth="1.3"
            d="M3 7.2 12 14l9-6.8"
          />
        </>
      )}
    </svg>
  );
}

export const COLOURED_ICON_DEFAULT = "#FF60AA";
