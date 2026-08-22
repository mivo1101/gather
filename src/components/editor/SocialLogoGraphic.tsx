"use client";

import { isGradient, normalizeHex } from "@/lib/color-utils";

const SOCIAL_LOGO_PREFIX = "icon_social_";

export function isSocialLogoKind(kind: string): boolean {
  return kind.startsWith(SOCIAL_LOGO_PREFIX);
}

/**
 * Simplified channel marks. Solid shapes cut their detail out with an even-odd
 * fill instead of painting it white, so a recoloured logo stays readable on any
 * card.
 */
export function SocialLogoGraphic({
  kind,
  color,
  className = "h-full w-full",
}: {
  kind: string;
  color: string;
  className?: string;
}) {
  const ink = isGradient(color) ? "#1F2D22" : normalizeHex(color, "#1F2D22");
  const key = kind.replace(SOCIAL_LOGO_PREFIX, "");
  const line = {
    fill: "none",
    stroke: ink,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {key === "facebook" && (
        <path
          fill={ink}
          d="M13.4 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2v2.2H7.4V13h2.7v8h3.3Z"
        />
      )}
      {key === "instagram" && (
        <>
          <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" {...line} />
          <circle cx="12" cy="12" r="4.1" {...line} />
          <circle cx="17.1" cy="6.9" r="1.25" fill={ink} />
        </>
      )}
      {key === "x" && (
        <path
          fill={ink}
          d="M2.8 3h5.1l4.5 6L17.4 3h3.8l-6.9 8.1L21.6 21h-5.1l-4.9-6.6L6 21H2.2l7.4-8.7L2.8 3Zm2.6 1.6 11.9 15.1h1.6L7 4.6H5.4Z"
        />
      )}
      {key === "tiktok" && (
        <path
          fill={ink}
          d="M14.6 2.6h2.9c.3 2.4 1.9 4 4.2 4.3v3c-1.6 0-3.1-.5-4.3-1.4v6.1c0 3.4-2.7 6.2-6.1 6.2s-6.1-2.8-6.1-6.2 2.7-6.1 6.1-6.1c.4 0 .7 0 1 .1v3.1c-.3-.1-.7-.1-1-.1-1.7 0-3 1.4-3 3s1.3 3 3 3 3.1-1.3 3.1-3V2.6Z"
        />
      )}
      {key === "youtube" && (
        <path
          fill={ink}
          fillRule="evenodd"
          d="M6.2 5.2h11.6a4 4 0 0 1 4 4v5.6a4 4 0 0 1-4 4H6.2a4 4 0 0 1-4-4V9.2a4 4 0 0 1 4-4Zm3.7 3.4 6.2 3.4-6.2 3.4V8.6Z"
        />
      )}
      {key === "whatsapp" && (
        <>
          <path
            {...line}
            d="M20.6 11.8c0 4.6-3.8 8.4-8.6 8.4-1.5 0-2.9-.4-4.1-1.1l-4.5 1.4 1.5-4.3a8.2 8.2 0 0 1-1.1-4.4c0-4.6 3.8-8.4 8.6-8.4s8.2 3.8 8.2 8.4Z"
          />
          <path
            fill={ink}
            d="M9.4 8.8c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .6.5l.6 1.4c.1.2 0 .4-.1.6l-.4.5c-.1.2-.2.3-.1.6.3.5.9 1.3 1.8 1.9.7.4 1.1.4 1.3.3.2-.1.4-.4.6-.6.2-.2.4-.2.6-.1l1.3.7c.3.2.4.3.4.5 0 .5-.5 1.3-1.2 1.5-.6.2-1.5.2-3-.4-2.2-.9-3.7-3.2-3.8-3.4-.1-.2-.9-1.1-.9-2.1 0-1 .5-1.5.6-1.7Z"
          />
        </>
      )}
      {key === "telegram" && (
        <path
          fill={ink}
          fillRule="evenodd"
          d="M21.4 4.2 2.7 11.4c-.9.3-.9 1.6.1 1.9l4.6 1.4 1.8 5.3c.2.7 1.1.9 1.6.3l2.5-2.6 4.6 3.4c.6.4 1.4.1 1.6-.6l3-14.7c.2-.8-.6-1.5-1.4-1.2Zm-11 11.9 8-7.9-9.6 5.9.5 3.6 1.1-1.6Z"
        />
      )}
      {key === "messenger" && (
        <path
          fill={ink}
          fillRule="evenodd"
          d="M12 2.2c-5.6 0-9.9 4.1-9.9 9.6 0 3.1 1.4 5.9 3.6 7.7v3.8l3.4-1.9c.9.3 1.9.4 2.9.4 5.6 0 9.9-4.1 9.9-9.6S17.6 2.2 12 2.2Zm-5.5 12.6 5.2-5.5 2.7 2.8 4.3-2.8-5.2 5.5-2.7-2.8-4.3 2.8Z"
        />
      )}
      {key === "linkedin" && (
        <path
          fill={ink}
          fillRule="evenodd"
          d="M4.6 2.6h14.8a2 2 0 0 1 2 2v14.8a2 2 0 0 1-2 2H4.6a2 2 0 0 1-2-2V4.6a2 2 0 0 1 2-2Zm1.5 7.2h2.7v8.4H6.1V9.8Zm1.4-4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Zm3.1 4h2.6v1.1c.4-.7 1.4-1.3 2.7-1.3 2.2 0 3.5 1.4 3.5 4v4.6h-2.7v-4.1c0-1.2-.5-2-1.6-2s-1.8.7-1.8 2v4.1h-2.7V9.8Z"
        />
      )}
      {key === "pinterest" && (
        <path
          fill={ink}
          d="M12 2.4c-5.4 0-8.4 3.6-8.4 7.3 0 1.7.9 3.9 2.4 4.6.4.2.4 0 .5-.3l.2-.9c.1-.2 0-.3-.1-.5-.6-.7-1-1.9-1-3 0-2.9 2.2-5.8 5.9-5.8 3.2 0 5.5 2.2 5.5 5.3 0 3.5-1.8 6-4 6-1.3 0-2.2-1.1-1.9-2.4.4-1.6 1.1-3.3 1.1-4.4 0-1-.6-1.9-1.7-1.9-1.3 0-2.4 1.4-2.4 3.2 0 1.2.4 2 .4 2l-1.6 6.6c-.3 1.3-.1 3 0 3.2 0 .1.2.2.3 0 .1-.1 1.7-2.1 2.2-4l.8-3c.4.8 1.6 1.4 2.8 1.4 3.7 0 6.3-3.4 6.3-7.9 0-3.4-2.9-6.5-7.3-6.5Z"
        />
      )}
      {key === "snapchat" && (
        <path
          fill={ink}
          d="M12 2.4c3 0 5 2.3 5 5.3 0 .8 0 1.5-.1 2.2.4.2.9.2 1.4 0 .6-.2 1.1.6.5 1.1-.5.5-1.6.7-1.9 1.1-.3.4.6 2.2 2.4 3 .6.3.4 1-.2 1.2-.6.2-1.4.2-1.7.5-.2.3-.1 1-.6 1.1-.5.1-1.5-.3-2.6-.1-1 .2-1.8 1.6-3.2 1.6s-2.2-1.4-3.2-1.6c-1.1-.2-2.1.2-2.6.1-.5-.1-.4-.8-.6-1.1-.3-.3-1.1-.3-1.7-.5-.6-.2-.8-.9-.2-1.2 1.8-.8 2.7-2.6 2.4-3-.3-.4-1.4-.6-1.9-1.1-.6-.5-.1-1.3.5-1.1.5.2 1 .2 1.4 0-.1-.7-.1-1.4-.1-2.2 0-3 2-5.3 5-5.3Z"
        />
      )}
      {key === "threads" && (
        <>
          <path
            {...line}
            d="M15.6 8.6v4.2c0 1.4.7 2.1 1.9 2.1 1.7 0 2.8-1.5 2.8-3.8 0-4.2-3-6.9-7.3-6.9-4.8 0-8 3.5-8 8.3s3.1 8.2 7.9 8.2c1.7 0 3.2-.3 4.4-.9"
          />
          <circle cx="12" cy="12" r="3.7" {...line} />
        </>
      )}
      {key === "zalo" && (
        <path
          fill={ink}
          fillRule="evenodd"
          d="M5.4 2.6h13.2a3 3 0 0 1 3 3v12.8a3 3 0 0 1-3 3H5.4a3 3 0 0 1-3-3V5.6a3 3 0 0 1 3-3ZM7.8 7v2h4.7L7.4 15.4V17h7.9v-2h-5l5-6.4V7H7.8Z"
        />
      )}
      {key === "line" && (
        <path
          fill={ink}
          fillRule="evenodd"
          d="M5.4 2.6h13.2a3 3 0 0 1 3 3v12.8a3 3 0 0 1-3 3H5.4a3 3 0 0 1-3-3V5.6a3 3 0 0 1 3-3ZM12 6.2c-3.7 0-6.7 2.4-6.7 5.4 0 2.7 2.4 4.9 5.6 5.3.2 0 .5.2.6.4l-.2 1.3c-.1.4.3.6.6.4.3-.2 4-2.3 5.4-4 1-1.1 1.4-2.1 1.4-3.4 0-3-3-5.4-6.7-5.4Z"
        />
      )}
      {key === "spotify" && (
        <>
          <circle cx="12" cy="12" r="9.2" {...line} />
          <path
            {...line}
            d="M6.9 9.4c3.2-1 6.9-.8 9.9.9M7.8 12.6c2.6-.8 5.6-.6 8.1.7M8.7 15.6c2.1-.6 4.4-.5 6.4.6"
          />
        </>
      )}
      {key === "globe" && (
        <>
          <circle cx="12" cy="12" r="9" {...line} />
          <path
            {...line}
            d="M3.2 12h17.6M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"
          />
        </>
      )}
      {key === "mail" && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2.5" {...line} />
          <path {...line} d="m4.5 7 7.5 6 7.5-6" />
        </>
      )}
      {key === "phone" && (
        <path
          {...line}
          d="M6.5 3.5h3l1.5 3.7-2 1.4a11 11 0 0 0 5.4 5.4l1.4-2 3.7 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"
        />
      )}
    </svg>
  );
}
