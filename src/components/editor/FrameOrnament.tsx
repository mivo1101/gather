"use client";

import type { ReactNode } from "react";
import type { ImageFrame } from "@/lib/data/canvas-elements";
import { isGradient, mixHex, normalizeHex } from "@/lib/color-utils";
import {
  HEART_POINTS,
  decorativeFrameSpec,
  type DecorativeFrameSpec,
} from "./image-frames";

const r2 = (n: number) => Math.round(n * 100) / 100;

/** One closed ellipse, as path data so bands can be cut with even-odd fill. */
function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  return `M${r2(cx - rx)} ${r2(cy)}a${r2(rx)} ${r2(ry)} 0 1 0 ${r2(
    rx * 2,
  )} 0a${r2(rx)} ${r2(ry)} 0 1 0 ${r2(-rx * 2)} 0Z`;
}

/** Rectangle path, optionally rounded, for even-odd bands. */
function rectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 0,
): string {
  if (radius <= 0) {
    return `M${r2(x)} ${r2(y)}H${r2(x + w)}V${r2(y + h)}H${r2(x)}Z`;
  }
  const rd = Math.min(radius, w / 2, h / 2);
  return `M${r2(x + rd)} ${r2(y)}H${r2(x + w - rd)}A${r2(rd)} ${r2(
    rd,
  )} 0 0 1 ${r2(x + w)} ${r2(y + rd)}V${r2(y + h - rd)}A${r2(rd)} ${r2(
    rd,
  )} 0 0 1 ${r2(x + w - rd)} ${r2(y + h)}H${r2(x + rd)}A${r2(rd)} ${r2(
    rd,
  )} 0 0 1 ${r2(x)} ${r2(y + h - rd)}V${r2(y + rd)}A${r2(rd)} ${r2(
    rd,
  )} 0 0 1 ${r2(x + rd)} ${r2(y)}Z`;
}

/** Window arch: straight sides with a half-ellipse cap. */
function archPath(
  left: number,
  right: number,
  top: number,
  bottom: number,
): string {
  const rx = (right - left) / 2;
  const ry = (bottom - top) / 2;
  return `M${r2(left)} ${r2(bottom)}V${r2(top + ry)}A${r2(rx)} ${r2(
    ry,
  )} 0 0 1 ${r2(right)} ${r2(top + ry)}V${r2(bottom)}Z`;
}

function polygonPath(
  points: Array<[number, number]>,
  cx: number,
  cy: number,
  scaleX: number,
  scaleY: number,
): string {
  return `${points
    .map(
      ([x, y], index) =>
        `${index ? "L" : "M"}${r2(cx + (x - 50) * scaleX)} ${r2(
          cy + (y - 50) * scaleY,
        )}`,
    )
    .join("")}Z`;
}

/** Place a motif around an ellipse, each copy turned to face outward. */
function around(
  count: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  render: (index: number) => ReactNode,
  span?: { from: number; to: number },
): ReactNode[] {
  return Array.from({ length: count }, (_, index) => {
    const degrees = span
      ? span.from + ((span.to - span.from) * index) / Math.max(1, count - 1)
      : (360 * index) / count - 90;
    const radians = (degrees * Math.PI) / 180;
    const x = cx + rx * Math.cos(radians);
    const y = cy + ry * Math.sin(radians);
    const facing = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;
    return (
      <g
        key={index}
        transform={`translate(${r2(x)} ${r2(y)}) rotate(${r2(facing)})`}
      >
        {render(index)}
      </g>
    );
  });
}

interface Ink {
  base: string;
  light: string;
  pale: string;
  deep: string;
}

/** Geometry shared by every ornament, derived from the frame's aperture. */
interface Geometry {
  left: number;
  right: number;
  top: number;
  bottom: number;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  bandX: number;
  bandY: number;
  band: number;
}

function frameBody(
  spec: DecorativeFrameSpec,
  g: Geometry,
  ink: Ink,
): ReactNode {
  const { base, light, pale, deep } = ink;
  const { left, right, top, bottom, cx, cy, rx, ry, bandX, bandY, band } = g;
  const edge = 0.6;
  const outRx = 50 - edge;
  const outRy = 50 - edge;

  switch (spec.id) {
    case "lace-oval": {
      const ringRx = rx + bandX * 0.42;
      const ringRy = ry + bandY * 0.42;
      const scale = band / 13;
      return (
        <>
          {around(34, cx, cy, ringRx, ringRy, () => (
            <g transform={`scale(${r2(scale)})`}>
              <path
                d="M0 -9C4.4 -5.6 4.4 1.4 0 5C-4.4 1.4 -4.4 -5.6 0 -9Z"
                fill={base}
              />
              <path
                d="M0 -6.4C2 -4.6 2 -1.4 0 0.4C-2 -1.4 -2 -4.6 0 -6.4Z"
                fill={pale}
                opacity="0.55"
              />
            </g>
          ))}
          <path
            d={`${ellipsePath(cx, cy, ringRx, ringRy)}${ellipsePath(
              cx,
              cy,
              rx,
              ry,
            )}`}
            fill={base}
            fillRule="evenodd"
          />
          {around(34, cx, cy, (rx + ringRx) / 2, (ry + ringRy) / 2, () => (
            <circle r={r2(band * 0.11)} fill={pale} opacity="0.75" />
          ))}
          <ellipse
            cx={cx}
            cy={cy}
            rx={r2(rx + 0.7)}
            ry={r2(ry + 0.7)}
            fill="none"
            stroke={deep}
            strokeWidth="0.8"
            opacity="0.35"
          />
          <ellipse
            cx={cx}
            cy={cy}
            rx={r2(ringRx + band * 0.62)}
            ry={r2(ringRy + band * 0.62)}
            fill="none"
            stroke={base}
            strokeWidth="0.7"
            strokeDasharray="1.6 2.6"
            opacity="0.75"
          />
        </>
      );
    }

    case "baroque-oval": {
      const scale = band / 12;
      return (
        <>
          {around(18, cx, cy, rx + bandX * 0.62, ry + bandY * 0.62, (i) => (
            <g transform={`scale(${r2(scale * (i % 2 ? 0.72 : 1))})`}>
              <path
                d="M0 -9.5C5.2 -6.6 6.6 -0.6 3.2 5.4C1.4 2.4 -1.4 2.4 -3.2 5.4C-6.6 -0.6 -5.2 -6.6 0 -9.5Z"
                fill={light}
              />
              <path
                d="M0 -7C2.6 -5 3.4 -1 1.6 2.6C0.6 1 -0.6 1 -1.6 2.6C-3.4 -1 -2.6 -5 0 -7Z"
                fill={pale}
                opacity="0.8"
              />
            </g>
          ))}
          <path
            d={`${ellipsePath(cx, cy, outRx, outRy)}${ellipsePath(
              cx,
              cy,
              rx,
              ry,
            )}`}
            fill={base}
            fillRule="evenodd"
          />
          <path
            d={`${ellipsePath(cx, cy, outRx, outRy)}${ellipsePath(
              cx,
              cy,
              outRx - bandX * 0.24,
              outRy - bandY * 0.24,
            )}`}
            fill={deep}
            fillRule="evenodd"
            opacity="0.55"
          />
          <path
            d={`${ellipsePath(
              cx,
              cy,
              rx + bandX * 0.3,
              ry + bandY * 0.3,
            )}${ellipsePath(cx, cy, rx, ry)}`}
            fill={light}
            fillRule="evenodd"
            opacity="0.9"
          />
          {around(18, cx, cy, rx + bandX * 0.55, ry + bandY * 0.55, (i) => (
            <g transform={`scale(${r2(scale * (i % 2 ? 0.6 : 0.85))})`}>
              <path
                d="M0 -6C3.4 -4 4.6 0 2.4 4C1 2 -1 2 -2.4 4C-4.6 0 -3.4 -4 0 -6Z"
                fill={pale}
                opacity="0.95"
              />
            </g>
          ))}
          <g transform={`translate(${cx} ${r2(top - bandY * 0.5)})`}>
            <path
              d={`M0 ${r2(-bandY * 0.62)}C${r2(bandX * 0.5)} ${r2(
                -bandY * 0.3,
              )} ${r2(bandX * 0.42)} ${r2(bandY * 0.36)} 0 ${r2(
                bandY * 0.58,
              )}C${r2(-bandX * 0.42)} ${r2(bandY * 0.36)} ${r2(
                -bandX * 0.5,
              )} ${r2(-bandY * 0.3)} 0 ${r2(-bandY * 0.62)}Z`}
              fill={light}
            />
          </g>
          <g transform={`translate(${cx} ${r2(bottom + bandY * 0.5)})`}>
            <path
              d={`M0 ${r2(-bandY * 0.58)}C${r2(bandX * 0.42)} ${r2(
                -bandY * 0.36,
              )} ${r2(bandX * 0.5)} ${r2(bandY * 0.3)} 0 ${r2(
                bandY * 0.62,
              )}C${r2(-bandX * 0.5)} ${r2(bandY * 0.3)} ${r2(
                -bandX * 0.42,
              )} ${r2(-bandY * 0.36)} 0 ${r2(-bandY * 0.58)}Z`}
              fill={light}
            />
          </g>
        </>
      );
    }

    case "pearl-oval": {
      const midRx = rx + bandX * 0.5;
      const midRy = ry + bandY * 0.5;
      const pearl = band * 0.4;
      return (
        <>
          <path
            d={`${ellipsePath(cx, cy, midRx, midRy)}${ellipsePath(
              cx,
              cy,
              rx + bandX * 0.12,
              ry + bandY * 0.12,
            )}`}
            fill={base}
            fillRule="evenodd"
            opacity="0.35"
          />
          {around(34, cx, cy, midRx, midRy, (i) => (
            <g>
              <circle r={r2(pearl * (i % 2 ? 0.62 : 1))} fill={base} />
              <circle
                cx={r2(-pearl * 0.24)}
                cy={r2(-pearl * 0.24)}
                r={r2(pearl * (i % 2 ? 0.24 : 0.38))}
                fill={pale}
                opacity="0.85"
              />
            </g>
          ))}
          <ellipse
            cx={cx}
            cy={cy}
            rx={r2(rx + 0.5)}
            ry={r2(ry + 0.5)}
            fill="none"
            stroke={deep}
            strokeWidth="0.7"
            opacity="0.4"
          />
        </>
      );
    }

    case "lace-arch": {
      const scale = band / 12;
      const outer = archPath(edge, 100 - edge, edge, 100 - edge);
      const inner = archPath(left, right, top, bottom);
      const capRx = (right - left) / 2 + bandX * 0.45;
      const capRy = (bottom - top) / 2 + bandY * 0.45;
      const capCy = top + (bottom - top) / 2;
      return (
        <>
          {around(
            15,
            cx,
            capCy,
            capRx + bandX * 0.3,
            capRy + bandY * 0.3,
            () => (
              <g transform={`scale(${r2(scale)})`}>
                <path
                  d="M0 -7.6C3.6 -4.6 3.6 1 0 4C-3.6 1 -3.6 -4.6 0 -7.6Z"
                  fill={base}
                />
              </g>
            ),
            { from: 180, to: 360 },
          )}
          {[left - bandX * 0.42, right + bandX * 0.42].map((x, side) => (
            <g key={side}>
              {Array.from({ length: 5 }, (_, i) => (
                <circle
                  key={i}
                  cx={r2(x)}
                  cy={r2(capCy + 6 + ((bottom - capCy - 6) * i) / 4)}
                  r={r2(band * 0.2)}
                  fill={base}
                />
              ))}
            </g>
          ))}
          <path
            d={`${outer}${inner}`}
            fill={base}
            fillRule="evenodd"
            opacity="0.92"
          />
          <path
            d={archPath(
              left - bandX * 0.34,
              right + bandX * 0.34,
              top - bandY * 0.34,
              bottom + bandY * 0.2,
            )}
            fill="none"
            stroke={pale}
            strokeWidth="0.8"
            strokeDasharray="1.8 2.4"
            opacity="0.9"
          />
          <path
            d={inner}
            fill="none"
            stroke={deep}
            strokeWidth="0.8"
            opacity="0.35"
          />
        </>
      );
    }

    case "deco-arch": {
      const outer = archPath(edge, 100 - edge, edge, 100 - edge);
      const inner = archPath(left, right, top, bottom);
      const capCy = top + (bottom - top) / 2;
      return (
        <>
          <path d={`${outer}${inner}`} fill={base} fillRule="evenodd" />
          <path
            d={archPath(
              left - bandX * 0.32,
              right + bandX * 0.32,
              top - bandY * 0.32,
              bottom,
            )}
            fill="none"
            stroke={pale}
            strokeWidth="0.9"
            opacity="0.85"
          />
          <path
            d={archPath(
              left - bandX * 0.62,
              right + bandX * 0.62,
              top - bandY * 0.62,
              bottom,
            )}
            fill="none"
            stroke={pale}
            strokeWidth="0.5"
            opacity="0.6"
          />
          {around(
            9,
            cx,
            capCy,
            (right - left) / 2 + bandX * 0.5,
            (bottom - top) / 2 + bandY * 0.5,
            () => (
              <rect
                x={r2(-band * 0.09)}
                y={r2(-band * 0.42)}
                width={r2(band * 0.18)}
                height={r2(band * 0.5)}
                fill={pale}
                opacity="0.9"
              />
            ),
            { from: 188, to: 352 },
          )}
          {[0, 1].map((i) => (
            <rect
              key={i}
              x={r2(i ? right - bandX * 0.1 : left - bandX * 0.52)}
              y={r2(bottom - bandY * 0.1)}
              width={r2(bandX * 0.62)}
              height={r2(bandY * 0.5)}
              fill={pale}
              opacity="0.75"
            />
          ))}
        </>
      );
    }

    case "scallop-circle": {
      const ringR = rx + bandX * 0.34;
      const bump = bandX * 0.46;
      return (
        <>
          {around(20, cx, cy, ringR + bump * 0.55, ringR + bump * 0.55, () => (
            <circle r={r2(bump)} fill={base} />
          ))}
          <path
            d={`${ellipsePath(cx, cy, ringR, ringR)}${ellipsePath(
              cx,
              cy,
              rx,
              ry,
            )}`}
            fill={base}
            fillRule="evenodd"
          />
          {around(20, cx, cy, ringR + bump * 0.55, ringR + bump * 0.55, () => (
            <circle r={r2(bump * 0.34)} fill={pale} opacity="0.75" />
          ))}
          <circle
            cx={cx}
            cy={cy}
            r={r2(rx + 0.6)}
            fill="none"
            stroke={pale}
            strokeWidth="0.9"
            opacity="0.8"
          />
        </>
      );
    }

    case "laurel-circle": {
      const leafR = rx + bandX * 0.5;
      const scale = band / 12;
      const leaf = (turn: number) => (
        <g transform={`scale(${r2(scale)}) rotate(${r2(turn * 26)})`}>
          <path
            d="M0 0C4.2 -1.4 6.6 -4.6 6.2 -8.6C2 -8.2 -0.6 -5.4 0 0Z"
            fill={base}
          />
          <path
            d="M0.6 -1.4C3 -2.6 4.4 -4.6 4.6 -7.2"
            stroke={pale}
            strokeWidth="0.5"
            fill="none"
            opacity="0.7"
          />
        </g>
      );
      return (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={r2(rx + bandX * 0.2)}
            fill="none"
            stroke={base}
            strokeWidth={r2(band * 0.16)}
            opacity="0.5"
          />
          {around(9, cx, cy, leafR, leafR, () => leaf(1), {
            from: 100,
            to: 250,
          })}
          {around(9, cx, cy, leafR, leafR, () => leaf(-1), {
            from: 80,
            to: -70,
          })}
          {around(
            9,
            cx,
            cy,
            leafR + band * 0.34,
            leafR + band * 0.34,
            () => leaf(1.35),
            { from: 104, to: 246 },
          )}
          {around(
            9,
            cx,
            cy,
            leafR + band * 0.34,
            leafR + band * 0.34,
            () => leaf(-1.35),
            { from: 76, to: -66 },
          )}
          <g transform={`translate(${cx} ${r2(cy + leafR + band * 0.1)})`}>
            <path
              d={`M${r2(-band * 0.5)} 0C${r2(-band * 0.18)} ${r2(
                -band * 0.34,
              )} ${r2(band * 0.18)} ${r2(-band * 0.34)} ${r2(band * 0.5)} 0`}
              fill="none"
              stroke={base}
              strokeWidth={r2(band * 0.12)}
              strokeLinecap="round"
            />
          </g>
        </>
      );
    }

    case "rope-circle": {
      const midR = rx + bandX * 0.5;
      const dash = (2 * Math.PI * midR) / 26;
      return (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={r2(midR)}
            fill="none"
            stroke={base}
            strokeWidth={r2(bandX * 0.86)}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r2(midR)}
            fill="none"
            stroke={pale}
            strokeWidth={r2(bandX * 0.86)}
            strokeDasharray={`${r2(dash * 0.5)} ${r2(dash * 0.5)}`}
            opacity="0.55"
            transform={`rotate(-6 ${cx} ${cy})`}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r2(midR)}
            fill="none"
            stroke={deep}
            strokeWidth={r2(bandX * 0.86)}
            strokeDasharray={`${r2(dash * 0.16)} ${r2(dash * 0.84)}`}
            opacity="0.35"
            transform={`rotate(4 ${cx} ${cy})`}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r2(rx + 0.4)}
            fill="none"
            stroke={deep}
            strokeWidth="0.6"
            opacity="0.4"
          />
        </>
      );
    }

    case "filigree-rect": {
      const corner = (sx: number, sy: number, x: number, y: number) => (
        <g
          key={`${x}-${y}`}
          transform={`translate(${r2(x)} ${r2(y)}) scale(${sx} ${sy})`}
        >
          <path
            d={`M0 ${r2(bandY * 1.5)}C0 ${r2(bandY * 0.4)} ${r2(
              bandX * 0.4,
            )} 0 ${r2(bandX * 1.6)} 0`}
            fill="none"
            stroke={base}
            strokeWidth="1.1"
          />
          <path
            d={`M${r2(bandX * 0.3)} ${r2(bandY * 1.5)}C${r2(bandX * 0.3)} ${r2(
              bandY * 0.7,
            )} ${r2(bandX * 0.7)} ${r2(bandY * 0.3)} ${r2(bandX * 1.6)} ${r2(
              bandY * 0.3,
            )}`}
            fill="none"
            stroke={base}
            strokeWidth="0.6"
            opacity="0.7"
          />
          <path
            d={`M${r2(bandX * 0.55)} ${r2(bandY * 0.55)}c${r2(
              bandX * 0.7,
            )} ${r2(-bandY * 0.5)} ${r2(bandX * 1.1)} ${r2(
              bandY * 0.25,
            )} ${r2(bandX * 0.35)} ${r2(bandY * 0.72)}c${r2(
              -bandX * 0.3,
            )} ${r2(bandY * 0.18)} ${r2(-bandX * 0.55)} ${r2(
              -bandY * 0.1,
            )} ${r2(-bandX * 0.35)} ${r2(-bandY * 0.72)}Z`}
            fill={base}
            opacity="0.5"
          />
        </g>
      );
      return (
        <>
          <path
            d={rectPath(edge, edge, 100 - edge * 2, 100 - edge * 2)}
            fill="none"
            stroke={base}
            strokeWidth="1.4"
          />
          <path
            d={rectPath(
              edge + bandX * 0.26,
              edge + bandY * 0.26,
              100 - edge * 2 - bandX * 0.52,
              100 - edge * 2 - bandY * 0.52,
            )}
            fill="none"
            stroke={base}
            strokeWidth="0.6"
            opacity="0.7"
          />
          <path
            d={rectPath(left - 1, top - 1, right - left + 2, bottom - top + 2)}
            fill="none"
            stroke={base}
            strokeWidth="1"
          />
          {[
            corner(1, 1, edge + bandX * 0.26, edge + bandY * 0.26),
            corner(-1, 1, 100 - edge - bandX * 0.26, edge + bandY * 0.26),
            corner(1, -1, edge + bandX * 0.26, 100 - edge - bandY * 0.26),
            corner(-1, -1, 100 - edge - bandX * 0.26, 100 - edge - bandY * 0.26),
          ]}
          {[
            [cx, edge + bandY * 0.26, 0],
            [cx, 100 - edge - bandY * 0.26, 180],
            [edge + bandX * 0.26, cy, 270],
            [100 - edge - bandX * 0.26, cy, 90],
          ].map(([x, y, rot], i) => (
            <g
              key={i}
              transform={`translate(${r2(x)} ${r2(y)}) rotate(${rot})`}
            >
              <path
                d={`M0 ${r2(band * 0.34)}L${r2(band * 0.26)} 0L0 ${r2(
                  -band * 0.34,
                )}L${r2(-band * 0.26)} 0Z`}
                fill={base}
              />
              <path
                d={`M0 ${r2(band * 0.18)}L${r2(band * 0.13)} 0L0 ${r2(
                  -band * 0.18,
                )}L${r2(-band * 0.13)} 0Z`}
                fill={pale}
                opacity="0.8"
              />
            </g>
          ))}
        </>
      );
    }

    case "botanical-rect": {
      const sprig = (flip: number) => (
        <g transform={`scale(${flip} ${flip})`}>
          <path
            d={`M${r2(-bandX * 0.2)} 28C${r2(-bandX * 0.2)} 10 6 ${r2(
              -bandY * 0.2,
            )} 30 ${r2(-bandY * 0.2)}`}
            fill="none"
            stroke={base}
            strokeWidth="0.9"
          />
          {Array.from({ length: 7 }, (_, i) => {
            const t = i / 6;
            const x = -bandX * 0.2 + Math.pow(t, 1.6) * 30;
            const y = 28 - Math.pow(t, 0.7) * (28 + bandY * 0.2);
            return (
              <g
                key={i}
                transform={`translate(${r2(x)} ${r2(y)}) rotate(${r2(
                  -70 + t * 70,
                )})`}
              >
                <path
                  d="M0 0C3.4 -0.8 5.4 -3.4 5.2 -6.6C1.8 -6.4 -0.4 -4.2 0 0Z"
                  fill={base}
                  opacity={i % 2 ? 0.72 : 1}
                />
              </g>
            );
          })}
          {Array.from({ length: 5 }, (_, i) => {
            const t = (i + 0.5) / 5;
            const x = -bandX * 0.2 + Math.pow(t, 1.6) * 30;
            const y = 28 - Math.pow(t, 0.7) * (28 + bandY * 0.2);
            return (
              <g
                key={`b${i}`}
                transform={`translate(${r2(x)} ${r2(y)}) rotate(${r2(
                  110 + t * 70,
                )})`}
              >
                <path
                  d="M0 0C2.8 -0.6 4.4 -2.8 4.2 -5.4C1.4 -5.2 -0.4 -3.4 0 0Z"
                  fill={base}
                  opacity="0.62"
                />
              </g>
            );
          })}
        </g>
      );
      return (
        <>
          <path
            d={rectPath(
              left - 1.4,
              top - 1.4,
              right - left + 2.8,
              bottom - top + 2.8,
            )}
            fill="none"
            stroke={base}
            strokeWidth="0.9"
            opacity="0.85"
          />
          <path
            d={rectPath(
              left - 2.8,
              top - 2.8,
              right - left + 5.6,
              bottom - top + 5.6,
            )}
            fill="none"
            stroke={base}
            strokeWidth="0.5"
            opacity="0.45"
          />
          <g transform={`translate(${r2(left - 1)} ${r2(top - 1)})`}>
            {sprig(1)}
          </g>
          <g transform={`translate(${r2(right + 1)} ${r2(bottom + 1)})`}>
            {sprig(-1)}
          </g>
        </>
      );
    }

    case "ribbon-rect": {
      const knot = band * 0.3;
      const loop = band * 0.95;
      return (
        <>
          <path
            d={rectPath(
              left - 1.2,
              top - 1.2,
              right - left + 2.4,
              bottom - top + 2.4,
              1,
            )}
            fill="none"
            stroke={base}
            strokeWidth="0.9"
            opacity="0.75"
          />
          <g transform={`translate(${cx} ${r2(top * 0.55)})`}>
            <path
              d={`M${r2(-knot * 0.3)} ${r2(knot * 0.2)}C${r2(-loop * 0.7)} ${r2(
                loop * 0.95,
              )} ${r2(-loop * 0.85)} ${r2(loop * 1.5)} ${r2(-loop * 0.95)} ${r2(
                loop * 1.9,
              )}L${r2(-loop * 0.35)} ${r2(loop * 1.35)}Z`}
              fill={base}
              opacity="0.9"
            />
            <path
              d={`M${r2(knot * 0.3)} ${r2(knot * 0.2)}C${r2(loop * 0.7)} ${r2(
                loop * 0.95,
              )} ${r2(loop * 0.85)} ${r2(loop * 1.5)} ${r2(loop * 0.95)} ${r2(
                loop * 1.9,
              )}L${r2(loop * 0.35)} ${r2(loop * 1.35)}Z`}
              fill={base}
              opacity="0.9"
            />
            <path
              d={`M0 0C${r2(-loop * 0.5)} ${r2(-loop * 0.95)} ${r2(
                -loop * 1.45,
              )} ${r2(-loop * 0.5)} ${r2(-loop * 1.15)} ${r2(
                loop * 0.05,
              )}C${r2(-loop * 0.95)} ${r2(loop * 0.4)} ${r2(-loop * 0.35)} ${r2(
                loop * 0.3,
              )} 0 0Z`}
              fill={base}
            />
            <path
              d={`M0 0C${r2(loop * 0.5)} ${r2(-loop * 0.95)} ${r2(
                loop * 1.45,
              )} ${r2(-loop * 0.5)} ${r2(loop * 1.15)} ${r2(
                loop * 0.05,
              )}C${r2(loop * 0.95)} ${r2(loop * 0.4)} ${r2(loop * 0.35)} ${r2(
                loop * 0.3,
              )} 0 0Z`}
              fill={base}
            />
            <ellipse rx={r2(knot)} ry={r2(knot * 0.8)} fill={light} />
          </g>
        </>
      );
    }

    case "stamp-rect": {
      const teethX = 16;
      const teethY = 18;
      const stepX = (100 - edge * 2) / teethX;
      const stepY = (100 - edge * 2) / teethY;
      const notch = Math.min(stepX, stepY) / 2;
      let outline = `M${r2(edge)} ${r2(edge)}`;
      for (let i = 0; i < teethX; i++) {
        outline += `A${r2(notch)} ${r2(notch)} 0 0 0 ${r2(
          edge + stepX * (i + 1),
        )} ${r2(edge)}`;
      }
      for (let i = 0; i < teethY; i++) {
        outline += `A${r2(notch)} ${r2(notch)} 0 0 0 ${r2(100 - edge)} ${r2(
          edge + stepY * (i + 1),
        )}`;
      }
      for (let i = 0; i < teethX; i++) {
        outline += `A${r2(notch)} ${r2(notch)} 0 0 0 ${r2(
          100 - edge - stepX * (i + 1),
        )} ${r2(100 - edge)}`;
      }
      for (let i = 0; i < teethY; i++) {
        outline += `A${r2(notch)} ${r2(notch)} 0 0 0 ${r2(edge)} ${r2(
          100 - edge - stepY * (i + 1),
        )}`;
      }
      outline += "Z";
      return (
        <>
          <path
            d={`${outline}${rectPath(left, top, right - left, bottom - top)}`}
            fill={base}
            fillRule="evenodd"
          />
          <path
            d={rectPath(
              left - bandX * 0.28,
              top - bandY * 0.28,
              right - left + bandX * 0.56,
              bottom - top + bandY * 0.56,
            )}
            fill="none"
            stroke={deep}
            strokeWidth="0.6"
            opacity="0.45"
          />
        </>
      );
    }

    case "polaroid": {
      return (
        <>
          <path
            d={`${rectPath(0, 0, 100, 100, 1.2)}${rectPath(
              left,
              top,
              right - left,
              bottom - top,
            )}`}
            fill={base}
            fillRule="evenodd"
          />
          <path
            d={rectPath(0.4, 0.4, 99.2, 99.2, 1.2)}
            fill="none"
            stroke={deep}
            strokeWidth="0.7"
            opacity="0.22"
          />
          <path
            d={rectPath(
              left - 0.5,
              top - 0.5,
              right - left + 1,
              bottom - top + 1,
            )}
            fill="none"
            stroke={deep}
            strokeWidth="0.7"
            opacity="0.3"
          />
        </>
      );
    }

    case "deco-diamond": {
      const diamond = (gap: number) =>
        `M50 ${r2(gap)}L${r2(100 - gap)} 50L50 ${r2(100 - gap)}L${r2(gap)} 50Z`;
      return (
        <>
          <path
            d={`${diamond(edge)}${diamond(spec.inset.top)}`}
            fill={base}
            fillRule="evenodd"
          />
          <path
            d={diamond(spec.inset.top - band * 0.34)}
            fill="none"
            stroke={pale}
            strokeWidth="0.7"
            opacity="0.9"
          />
          {[
            [50, edge, 0],
            [100 - edge, 50, 90],
            [50, 100 - edge, 180],
            [edge, 50, 270],
          ].map(([x, y, rot], i) => (
            <g
              key={i}
              transform={`translate(${r2(x)} ${r2(y)}) rotate(${rot})`}
            >
              {[0, 1, 2].map((n) => (
                <line
                  key={n}
                  x1="0"
                  y1={r2(band * 0.2)}
                  x2={r2((n - 1) * band * 0.55)}
                  y2={r2(band * 1.15)}
                  stroke={pale}
                  strokeWidth="0.6"
                  opacity="0.85"
                />
              ))}
              <circle cy={r2(band * 0.34)} r={r2(band * 0.14)} fill={pale} />
            </g>
          ))}
        </>
      );
    }

    case "lace-heart": {
      // The photo is clipped to the heart inside the inset box, so the band
      // runs from that heart out to the edge of the element.
      const innerScale = 1 - spec.inset.top / 50;
      const outerScale = 0.99;
      const petalScale = (innerScale + outerScale) / 2;
      return (
        <>
          {HEART_POINTS.filter((_, i) => i % 2 === 0).map(([x, y], i) => (
            <circle
              key={i}
              cx={r2(50 + (x - 50) * outerScale)}
              cy={r2(50 + (y - 50) * outerScale)}
              r={r2(band * (i % 2 ? 0.24 : 0.36))}
              fill={base}
            />
          ))}
          <path
            d={`${polygonPath(
              HEART_POINTS,
              50,
              50,
              outerScale,
              outerScale,
            )}${polygonPath(HEART_POINTS, 50, 50, innerScale, innerScale)}`}
            fill={base}
            fillRule="evenodd"
          />
          <path
            d={polygonPath(HEART_POINTS, 50, 50, petalScale, petalScale)}
            fill="none"
            stroke={pale}
            strokeWidth="0.7"
            strokeDasharray="1.6 2.2"
            opacity="0.85"
          />
        </>
      );
    }

    default:
      return null;
  }
}

/**
 * The ornamental border of a decorative frame. It is drawn in the element's own
 * box so it stretches with the photo, the way a real picture frame does.
 */
export function FrameOrnament({
  frame,
  color,
  className = "pointer-events-none absolute inset-0 h-full w-full",
}: {
  frame?: ImageFrame | null;
  color?: string | null;
  className?: string;
}) {
  const spec = decorativeFrameSpec(frame);
  if (!spec) return null;

  const base = isGradient(color || "")
    ? spec.defaultColor
    : normalizeHex(color || spec.defaultColor, spec.defaultColor);
  const ink: Ink = {
    base,
    light: mixHex(base, "#FFFFFF", 0.38),
    pale: mixHex(base, "#FFFFFF", 0.72),
    deep: mixHex(base, "#241B14", 0.42),
  };

  const left = spec.inset.left;
  const right = 100 - spec.inset.right;
  const top = spec.inset.top;
  const bottom = 100 - spec.inset.bottom;
  const bandX = (spec.inset.left + spec.inset.right) / 2;
  const bandY = (spec.inset.top + spec.inset.bottom) / 2;

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {frameBody(
        spec,
        {
          left,
          right,
          top,
          bottom,
          cx: (left + right) / 2,
          cy: (top + bottom) / 2,
          rx: (right - left) / 2,
          ry: (bottom - top) / 2,
          bandX,
          bandY,
          band: (bandX + bandY) / 2,
        },
        ink,
      )}
    </svg>
  );
}
