"use client";

import type { ArtInk, ArtPiece } from "./artwork-paint";

const r1 = (n: number) => Math.round(n * 10) / 10;

/** A stamp's punched edge. */
function perforated(
  x: number,
  y: number,
  w: number,
  h: number,
  teethX: number,
  teethY: number,
): string {
  const stepX = w / teethX;
  const stepY = h / teethY;
  let d = `M${x} ${y}`;
  for (let i = 1; i <= teethX; i++)
    d += `A${r1(stepX / 2)} ${r1(stepX / 2)} 0 0 0 ${r1(x + stepX * i)} ${y}`;
  for (let i = 1; i <= teethY; i++)
    d += `A${r1(stepY / 2)} ${r1(stepY / 2)} 0 0 0 ${r1(x + w)} ${r1(
      y + stepY * i,
    )}`;
  for (let i = 1; i <= teethX; i++)
    d += `A${r1(stepX / 2)} ${r1(stepX / 2)} 0 0 0 ${r1(
      x + w - stepX * i,
    )} ${r1(y + h)}`;
  for (let i = 1; i <= teethY; i++)
    d += `A${r1(stepY / 2)} ${r1(stepY / 2)} 0 0 0 ${x} ${r1(
      y + h - stepY * i,
    )}`;
  return `${d}Z`;
}

function leaf(ink: ArtInk, opacity = 1) {
  return (
    <>
      <path
        d="M0 0C7.4 -2 12 -8.4 11.4 -16.6 3.8 -15.8 -1 -10.4 0 0Z"
        fill="currentColor"
        opacity={opacity}
      />
      <path
        d="M1.2 -2.4C5.6 -5.4 8.6 -9.6 9.6 -14.4"
        stroke={ink.pale}
        strokeWidth="0.8"
        fill="none"
        opacity="0.55"
      />
    </>
  );
}

/**
 * Everyday decorative objects - the things that sit around a physical
 * invitation. Each is lit from the top left and shaded with its own material.
 */
export const OBJECT_ARTWORK: Record<string, ArtPiece> = {
  art_bow: {
    viewBox: "0 0 120 96",
    render: (id, ink) => (
      <>
        <g filter={`url(#${id}-cast)`}>
          <path
            d="M54 44 30 92l24-16 3-32Z"
            fill={`url(#${id}-silk)`}
            opacity="0.95"
          />
          <path
            d="M66 44 90 92 66 76l-3-32Z"
            fill={`url(#${id}-silk)`}
            opacity="0.95"
          />
          <path d="M58 40C42 18 8 16 8 38s34 20 50 6Z" fill={`url(#${id}-silk)`} />
          <path d="M62 40c16-22 50-24 50-2s-34 20-50 6Z" fill={`url(#${id}-silk)`} />
          <ellipse cx="60" cy="42" rx="10" ry="8.6" fill={`url(#${id}-silk)`} />
        </g>
        <path
          d="M50 32C36 22 16 24 14 34"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          opacity="0.4"
        />
        <path
          d="M70 32c14-10 34-8 36 2"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          opacity="0.4"
        />
        <path
          d="M54 46c-2 6-2 14-2 20M66 46c2 6 2 14 2 20"
          stroke={ink.deep}
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />
        <ellipse
          cx="56"
          cy="38"
          rx="4.6"
          ry="3"
          fill="#FFFFFF"
          opacity="0.35"
          transform="rotate(-20 56 38)"
        />
      </>
    ),
  },

  art_ribbon: {
    viewBox: "0 0 56 120",
    render: (id, ink) => (
      <>
        <g filter={`url(#${id}-cast)`}>
          <path
            d="M13 5h30c2 16-3 24-4 36-1 11 4 18 4 30 0 15-1 30-2 44l-13-15-13 15c-1-14-2-29-2-44 0-12 5-19 4-30-1-12-6-20-4-36Z"
            fill={`url(#${id}-silk)`}
          />
        </g>
        <path
          d="M21 8c1 14 4 22 3 33s-3 18-3 30 0 22 1 32"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          opacity="0.4"
        />
        <path
          d="M35 8c-1 14-4 22-3 33s3 18 3 30-1 22-2 32"
          fill="none"
          stroke={ink.deep}
          strokeWidth="1.2"
          opacity="0.35"
        />
      </>
    ),
  },

  art_candle: {
    viewBox: "0 0 56 120",
    render: (id, ink) => (
      <>
        <ellipse cx="28" cy="26" rx="17" ry="22" fill={`url(#${id}-glow)`} />
        <g filter={`url(#${id}-cast)`}>
          <path
            d="M16 40h24c1.4 0 2 .8 2 2v72c0 2-1 3-3 3H17c-2 0-3-1-3-3V42c0-1.2.6-2 2-2Z"
            fill={`url(#${id}-paper)`}
          />
        </g>
        <path
          d="M16 40h24c1.4 0 2 .8 2 2 0 2.4-4.6 4-14 4s-14-1.6-14-4c0-1.2.6-2 2-2Z"
          fill="#FFFFFF"
          opacity="0.75"
        />
        <path
          d="M38 46c2 6 1 12-1 16s-1 8 1 10"
          fill="none"
          stroke={ink.paperEdge}
          strokeWidth="1.6"
          opacity="0.6"
        />
        <rect
          x="19"
          y="48"
          width="4"
          height="60"
          rx="2"
          fill="#FFFFFF"
          opacity="0.5"
        />
        <path d="M28 40v-8" stroke={ink.ink} strokeWidth="1.6" />
        <path
          d="M28 8c7 7 9 12 9 16.4C37 30 33 34 28 34s-9-4-9-9.6C19 20 21 15 28 8Z"
          fill="#FFC24A"
        />
        <path
          d="M28 15c3.4 4 4.6 6.6 4.6 9.2 0 3-2 5-4.6 5s-4.6-2-4.6-5c0-2.6 1.2-5.2 4.6-9.2Z"
          fill="#FFF0B8"
        />
      </>
    ),
  },

  art_pen: {
    viewBox: "0 0 120 120",
    render: (id, ink) => (
      <g transform="rotate(-38 60 60)" filter={`url(#${id}-cast)`}>
        <rect x="8" y="54" width="52" height="12" rx="6" fill={`url(#${id}-liner)`} />
        <rect x="44" y="53" width="30" height="14" rx="5" fill={`url(#${id}-liner)`} />
        <rect x="70" y="53.5" width="6" height="13" rx="2" fill={`url(#${id}-metal)`} />
        <rect x="47" y="55" width="3.4" height="10" rx="1.6" fill={`url(#${id}-metal)`} />
        <path
          d="M76 55.4c6 .6 10 2.2 12 4.6-2 2.4-6 4-12 4.6Z"
          fill={`url(#${id}-metal)`}
        />
        <path
          d="M88 56.4c8 .7 15 1.9 18 3.6-3 1.7-10 2.9-18 3.6-1.6-1.8-1.6-5.4 0-7.2Z"
          fill={`url(#${id}-metal)`}
          stroke={ink.dark}
          strokeWidth="0.5"
        />
        <path d="M92 60h13" stroke={ink.dark} strokeWidth="0.9" opacity="0.75" />
        <circle cx="93" cy="60" r="1.7" fill={ink.dark} opacity="0.6" />
        <rect x="12" y="56.5" width="44" height="2.6" rx="1.3" fill="#FFFFFF" opacity="0.32" />
        <rect x="52" y="46" width="3.6" height="9" rx="1.8" fill={`url(#${id}-metal)`} />
        <rect x="52" y="46" width="3.6" height="16" rx="1.8" fill={`url(#${id}-metal)`} />
      </g>
    ),
  },

  art_ink_quill: {
    viewBox: "0 0 110 110",
    render: (id, ink) => (
      <>
        <g filter={`url(#${id}-cast)`}>
          <path
            d="M28 62h40c2 0 3 1.4 3 3.2l-3 32c-.3 3-2.4 5-5 5H33c-2.6 0-4.7-2-5-5l-3-32c0-1.8 1-3.2 3-3.2Z"
            fill={`url(#${id}-glass)`}
            stroke={ink.paperEdge}
            strokeWidth="0.8"
          />
        </g>
        <path
          d="M28.6 76h38.8l-2 21.4c-.3 3-2.4 5-5 5H35.6c-2.6 0-4.7-2-5-5Z"
          fill={`url(#${id}-liner)`}
          opacity="0.92"
        />
        <rect
          x="24"
          y="56"
          width="48"
          height="8"
          rx="3"
          fill={`url(#${id}-glass)`}
          stroke={ink.paperEdge}
          strokeWidth="0.8"
        />
        <rect x="33" y="80" width="5" height="16" rx="2.5" fill="#FFFFFF" opacity="0.3" />
        <g transform="rotate(16 66 44)">
          <path
            d="M78 2c6 16 4 34-4 50-5 10-11 17-17 21-3-6-4-14-2-24 3-18 11-35 23-47Z"
            fill={`url(#${id}-paper)`}
            stroke={ink.paperEdge}
            strokeWidth="0.7"
          />
          <path
            d="M78 3C68 17 61 34 57 52c-2 9-2 15-1 21"
            fill="none"
            stroke={ink.paperEdge}
            strokeWidth="1.1"
          />
          {Array.from({ length: 11 }, (_, index) => {
            const t = index / 10;
            const x = 78 - t * 22;
            const y = 4 + t * 68;
            const spread = 15 - Math.abs(t - 0.45) * 16;
            return (
              <path
                key={index}
                d={`M${Math.round(x)} ${Math.round(y)}l${Math.round(
                  spread,
                )} ${Math.round(spread * 0.5)}`}
                stroke={ink.paperEdge}
                strokeWidth="0.6"
                opacity="0.7"
              />
            );
          })}
          <path
            d="M56 73c-2 6-4 10-8 14"
            stroke={ink.ink}
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </>
    ),
  },

  art_coupe: {
    viewBox: "0 0 80 120",
    render: (id, ink) => (
      <>
        <g filter={`url(#${id}-cast)`}>
          <path
            d="M10 20h60c0 26-13 40-30 40S10 46 10 20Z"
            fill={`url(#${id}-glass)`}
            stroke={ink.paperEdge}
            strokeWidth="0.9"
          />
        </g>
        <path
          d="M13 24h54c-1 12-6 20-13 24-8-6-20-6-28 0-7-4-12-12-13-24Z"
          fill={`url(#${id}-liner)`}
          opacity="0.55"
        />
        <ellipse cx="40" cy="20" rx="30" ry="4.6" fill="#FFFFFF" opacity="0.55" />
        <path
          d="M20 26c1 12 5 20 11 25"
          stroke="#FFFFFF"
          strokeWidth="2"
          fill="none"
          opacity="0.55"
        />
        <rect x="37" y="58" width="6" height="42" rx="3" fill={`url(#${id}-glass)`} />
        <ellipse
          cx="40"
          cy="104"
          rx="22"
          ry="6"
          fill={`url(#${id}-glass)`}
          stroke={ink.paperEdge}
          strokeWidth="0.8"
        />
        {[
          [30, 12, 2.2],
          [44, 8, 1.6],
          [38, 4, 1.2],
          [52, 14, 1.8],
        ].map(([cx, cy, r], index) => (
          <circle
            key={index}
            cx={cx}
            cy={cy}
            r={r}
            fill="#FFFFFF"
            opacity="0.75"
          />
        ))}
      </>
    ),
  },

  art_sprig: {
    viewBox: "0 0 90 120",
    render: (id, ink) => (
      <g color={ink.base}>
        <path
          d="M45 116C40 84 42 50 60 14"
          fill="none"
          stroke={ink.deep}
          strokeWidth="1.6"
        />
        {Array.from({ length: 7 }, (_, index) => {
          const t = (index + 0.5) / 7;
          const x = 45 + t * 15 - Math.sin(t * 3) * 2;
          const y = 116 - t * 102;
          const flip = index % 2 ? 1 : -1;
          return (
            <g
              key={index}
              transform={`translate(${r1(x)} ${r1(y)}) rotate(${r1(
                flip * (46 - t * 18),
              )}) scale(${r1(1.1 - t * 0.25)})`}
            >
              {leaf(ink, index % 2 ? 0.88 : 1)}
            </g>
          );
        })}
        {[
          [34, 46, 1],
          [58, 28, 0.85],
          [40, 74, 0.75],
        ].map(([cx, cy, scale], index) => (
          <g
            key={index}
            transform={`translate(${cx} ${cy}) scale(${scale})`}
          >
            {Array.from({ length: 5 }, (_, petal) => (
              <ellipse
                key={petal}
                cx="0"
                cy="-6.4"
                rx="4"
                ry="6.4"
                fill={ink.pale}
                stroke={ink.light}
                strokeWidth="0.5"
                transform={`rotate(${petal * 72})`}
              />
            ))}
            <circle cx="0" cy="0" r="2.6" fill={ink.light} />
          </g>
        ))}
      </g>
    ),
  },

  art_key: {
    viewBox: "0 0 120 56",
    render: (id, ink) => (
      <g filter={`url(#${id}-cast)`}>
        <circle
          cx="26"
          cy="28"
          r="15"
          fill="none"
          stroke={`url(#${id}-metal)`}
          strokeWidth="6.5"
        />
        <path
          d="M26 3.6 31 9.4 26 15.2 21 9.4Z"
          fill={`url(#${id}-metal)`}
        />
        <circle
          cx="26"
          cy="28"
          r="8"
          fill="none"
          stroke={ink.dark}
          strokeWidth="0.9"
          opacity="0.3"
        />
        <rect x="41" y="24.5" width="68" height="7" rx="3.5" fill={`url(#${id}-metal)`} />
        <rect x="44" y="20" width="4.6" height="16" rx="2" fill={`url(#${id}-metal)`} />
        <path
          d="M92 31.5h7v13h-7ZM103 31.5h6v9h-6Z"
          fill={`url(#${id}-metal)`}
        />
        <rect x="46" y="26" width="58" height="1.8" rx="0.9" fill="#FFFFFF" opacity="0.5" />
      </g>
    ),
  },

  art_tag: {
    viewBox: "0 0 80 120",
    render: (id, ink) => (
      <>
        <path
          d="M40 22C28 16 20 10 24 4"
          fill="none"
          stroke={ink.base}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M40 22c12-6 20-12 16-18"
          fill="none"
          stroke={ink.base}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.8"
        />
        <g filter={`url(#${id}-cast)`}>
          <path
            d="M40 16 70 34v66a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V34Z"
            fill={`url(#${id}-paper)`}
            stroke={ink.paperEdge}
            strokeWidth="0.8"
          />
        </g>
        <circle
          cx="40"
          cy="30"
          r="4.4"
          fill="#FFFFFF"
          stroke={`url(#${id}-metal)`}
          strokeWidth="2"
        />
        <path
          d="M22 56c8-6 14 4 20 0s10-4 14 2"
          fill="none"
          stroke={ink.base}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M20 72h40M26 82h28"
          stroke={ink.paperEdge}
          strokeWidth="1.2"
          opacity="0.85"
        />
      </>
    ),
  },

  art_pearls: {
    viewBox: "0 0 120 76",
    render: (id, ink) => (
      <>
        <path
          d="M6 16C22 62 98 62 114 16"
          fill="none"
          stroke={ink.paperEdge}
          strokeWidth="1"
          opacity="0.6"
        />
        {Array.from({ length: 15 }, (_, index) => {
          const t = index / 14;
          const x = 6 + t * 108;
          const y = 16 + Math.sin(Math.PI * t) * 44;
          return (
            <g key={index} transform={`translate(${r1(x)} ${r1(y)})`}>
              <circle r="7.4" fill={`url(#${id}-wax)`} />
              <circle cx="-2.4" cy="-2.6" r="2.4" fill="#FFFFFF" opacity="0.65" />
            </g>
          );
        })}
      </>
    ),
  },

  art_stamp: {
    viewBox: "0 0 90 106",
    render: (id, ink) => (
      <>
        <g filter={`url(#${id}-cast)`}>
          <path d={perforated(5, 5, 80, 96, 11, 13)} fill={`url(#${id}-paper)`} />
        </g>
        <rect
          x="14"
          y="14"
          width="62"
          height="78"
          fill={`url(#${id}-liner)`}
          opacity="0.16"
          stroke={ink.base}
          strokeWidth="0.9"
        />
        <path
          d="M20 74c8-16 14-16 20-6s12 8 16-4"
          fill="none"
          stroke={ink.base}
          strokeWidth="1.6"
          opacity="0.8"
        />
        <circle cx="34" cy="36" r="9" fill="none" stroke={ink.base} strokeWidth="1.6" />
        <path
          d="M52 30h16M52 38h12"
          stroke={ink.base}
          strokeWidth="1.4"
          opacity="0.8"
        />
        <path
          d="M20 84h50"
          stroke={ink.base}
          strokeWidth="1.2"
          opacity="0.5"
        />
      </>
    ),
  },

  art_confetti: {
    viewBox: "0 0 120 100",
    render: (id, ink) => {
      const bits = [
        [12, 20, -22, 1],
        [34, 8, 40, 0.8],
        [58, 24, 12, 1.1],
        [82, 10, -35, 0.9],
        [104, 28, 24, 1],
        [20, 52, 55, 0.85],
        [46, 44, -18, 1.15],
        [70, 58, 32, 0.9],
        [96, 48, -48, 1],
        [16, 82, 18, 0.95],
        [40, 76, -40, 0.8],
        [64, 88, 26, 1.05],
        [90, 78, -12, 0.9],
        [110, 66, 44, 0.8],
      ] as const;
      const inks = [ink.base, ink.light, ink.pale, ink.deep];
      return (
        <>
          {bits.map(([x, y, rotate, scale], index) => (
            <g
              key={index}
              transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}
            >
              {index % 3 === 0 ? (
                <circle r="3.6" fill={inks[index % inks.length]} />
              ) : index % 3 === 1 ? (
                <rect
                  x="-4.6"
                  y="-2"
                  width="9.2"
                  height="4"
                  rx="1.4"
                  fill={inks[index % inks.length]}
                />
              ) : (
                <path
                  d="M-6 2c3-6 9-6 12 0-3 3-9 3-12 0Z"
                  fill={inks[index % inks.length]}
                />
              )}
            </g>
          ))}
        </>
      );
    },
  },
};
