"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ShapeKind } from "@/lib/data/canvas-elements";
import {
  fillBoxStyle,
  isGradient,
  normalizeHex,
  parseLinearGradient,
} from "@/lib/color-utils";
import { ColouredIconGraphic } from "./ColouredIconGraphic";
import { EmojiGraphic, isEmojiShapeKind } from "./EmojiGraphic";

/** Circular corner radius from the shorter side (stays round when stretched). */
function RoundedSquareShape({
  color,
  className,
  ratio = 0.22,
}: {
  color: string;
  className: string;
  ratio?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(0);
  const box = fillBoxStyle(color);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setRadius(Math.min(width, height) * ratio);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ratio]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...box, borderRadius: radius }}
    />
  );
}

function regularPolygonPoints(
  sides: number,
  cx = 12,
  cy = 12,
  r = 12,
  rotationDeg = -90,
): string {
  const rad = (Math.PI / 180) * rotationDeg;
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = rad + (i * 2 * Math.PI) / sides;
    points.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return points.join(" ");
}

function starPoints(
  points: number,
  cx = 12,
  cy = 12,
  outer = 12,
  inner = 5,
  rotationDeg = -90,
): string {
  const rad = (Math.PI / 180) * rotationDeg;
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = rad + (i * Math.PI) / points;
    const r = i % 2 === 0 ? outer : inner;
    coords.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return coords.join(" ");
}

function SvgFill({
  color,
  className,
  viewBox = "0 0 24 24",
  children,
}: {
  color: string;
  className: string;
  viewBox?: string;
  children: (fill: string) => React.ReactNode;
}) {
  const id = useId().replace(/:/g, "");
  if (!isGradient(color)) {
    return (
      <svg
        className={className}
        viewBox={viewBox}
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        {children(normalizeHex(color))}
      </svg>
    );
  }

  const parsed = parseLinearGradient(color);
  const angle = ((parsed?.angle ?? 90) * Math.PI) / 180;
  const x1 = 50 - Math.cos(angle) * 50;
  const y1 = 50 - Math.sin(angle) * 50;
  const x2 = 50 + Math.cos(angle) * 50;
  const y2 = 50 + Math.sin(angle) * 50;

  return (
    <svg
      className={className}
      viewBox={viewBox}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id={id}
          x1={`${x1}%`}
          y1={`${y1}%`}
          x2={`${x2}%`}
          y2={`${y2}%`}
        >
          <stop offset="0%" stopColor={parsed?.start || "#FFFFFF"} />
          <stop offset="100%" stopColor={parsed?.end || "#1F2D22"} />
        </linearGradient>
      </defs>
      {children(`url(#${id})`)}
    </svg>
  );
}

/** Shared shape graphics — library tiles and canvas use the same paths. */
export function ShapeGraphic({
  kind,
  color,
  borderColor = "#1F2D22",
  borderWidth = 0,
  className = "h-full w-full",
}: {
  kind: ShapeKind | string;
  color: string;
  borderColor?: string;
  borderWidth?: number;
  className?: string;
}) {
  const outlineWidth = Number.isFinite(borderWidth)
    ? Math.max(0, Math.min(24, borderWidth))
    : 0;
  if (isEmojiShapeKind(kind)) {
    return <EmojiGraphic kind={kind} className={className} />;
  }
  const isLine =
    kind === "line" || kind === "line_dashed" || kind === "line_dotted";
  if (outlineWidth > 0 && !isLine) {
    return (
      <div className={`relative ${className}`}>
        <ShapeGraphic
          kind={kind}
          color={borderColor}
          className="absolute inset-0 h-full w-full"
        />
        <div
          className="absolute"
          style={{ inset: `${outlineWidth}px` }}
        >
          <ShapeGraphic
            kind={kind}
            color={color}
            className="h-full w-full"
          />
        </div>
      </div>
    );
  }

  const box = fillBoxStyle(color);

  if (kind === "circle") {
    return <div className={`${className} rounded-full`} style={box} />;
  }

  if (kind === "oval") {
    return <div className={`${className} rounded-full`} style={box} />;
  }

  if (kind === "rounded_square") {
    return <RoundedSquareShape color={color} className={className} />;
  }

  if (kind === "triangle") {
    return (
      <div
        className={className}
        style={{ ...box, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
      />
    );
  }

  if (kind === "triangle_down") {
    return (
      <div
        className={className}
        style={{ ...box, clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)" }}
      />
    );
  }

  if (kind === "diamond") {
    return (
      <div
        className={className}
        style={{
          ...box,
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        }}
      />
    );
  }

  if (kind === "parallelogram") {
    return (
      <div
        className={className}
        style={{
          ...box,
          clipPath: "polygon(18% 0%, 100% 0%, 82% 100%, 0% 100%)",
        }}
      />
    );
  }

  if (kind === "trapezoid") {
    return (
      <div
        className={className}
        style={{
          ...box,
          clipPath: "polygon(18% 0%, 82% 0%, 100% 100%, 0% 100%)",
        }}
      />
    );
  }

  if (kind === "semicircle") {
    return (
      <div
        className={className}
        style={{
          ...box,
          borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
        }}
      />
    );
  }

  if (kind === "cross") {
    return (
      <SvgFill color={color} className={className}>
        {(fill) => <path fill={fill} d="M8 0h8v8h8v8h-8v8H8v-8H0V8h8V0z" />}
      </SvgFill>
    );
  }

  if (kind === "line") {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="h-[3px] w-full rounded-full" style={box} />
      </div>
    );
  }

  if (kind === "line_dashed") {
    return (
      <div className={`flex items-center ${className}`}>
        <div
          className="h-0 w-full border-t-[3px]"
          style={{
            borderImage: isGradient(color) ? `${color} 1` : undefined,
            borderColor: isGradient(color) ? undefined : normalizeHex(color),
            borderStyle: "dashed",
          }}
        />
      </div>
    );
  }

  if (kind === "line_dotted") {
    return (
      <div className={`flex items-center ${className}`}>
        <div
          className="h-0 w-full border-t-[3px]"
          style={{
            borderColor: isGradient(color)
              ? normalizeHex("#1F2D22")
              : normalizeHex(color),
            borderStyle: "dotted",
          }}
        />
      </div>
    );
  }

  if (kind === "arrow") {
    return (
      <SvgFill color={color} className={className}>
        {(fill) => (
          <path fill={fill} d="M0 7h13V0l11 12-11 12v-7H0z" />
        )}
      </SvgFill>
    );
  }

  if (kind === "arrow_thin") {
    return (
      <SvgFill color={color} className={className}>
        {(fill) => (
          <path
            fill={fill}
            d="M0 9.5h15.5L12 5.5 14.5 3 24 12l-9.5 9-2.5-2.5 3.5-4H0z"
          />
        )}
      </SvgFill>
    );
  }

  if (kind === "pentagon") {
    return (
      <SvgFill color={color} className={className}>
        {(fill) => <polygon fill={fill} points={regularPolygonPoints(5)} />}
      </SvgFill>
    );
  }

  if (kind === "hexagon") {
    return (
      <SvgFill color={color} className={className}>
        {(fill) => (
          <polygon
            fill={fill}
            points={regularPolygonPoints(6, 12, 12, 12, -90)}
          />
        )}
      </SvgFill>
    );
  }

  if (kind === "hexagon_flat") {
    return (
      <SvgFill color={color} className={className}>
        {(fill) => (
          <polygon
            fill={fill}
            points={regularPolygonPoints(6, 12, 12, 12, 0)}
          />
        )}
      </SvgFill>
    );
  }

  if (kind === "octagon") {
    return (
      <SvgFill color={color} className={className}>
        {(fill) => (
          <polygon
            fill={fill}
            points={regularPolygonPoints(8, 12, 12, 12, -22.5)}
          />
        )}
      </SvgFill>
    );
  }

  if (kind === "heart") {
    return (
      <SvgFill color={color} className={className} viewBox="2 3 20 18.5">
        {(fill) => (
          <path
            fill={fill}
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        )}
      </SvgFill>
    );
  }

  if (kind.startsWith("icon_colour_")) {
    return (
      <ColouredIconGraphic kind={kind} color={color} className={className} />
    );
  }

  if (kind.startsWith("icon_")) {
    return (
      <SvgFill color={color} className={className}>
        {(stroke) => (
          <g
            fill="none"
            stroke={stroke}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {kind === "icon_clock" && (
              <>
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7.5V12l3.2 2" />
              </>
            )}
            {kind === "icon_calendar" && (
              <>
                <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
                <path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17" />
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" />
              </>
            )}
            {kind === "icon_location" && (
              <>
                <path d="M19 10c0 5.2-7 11-7 11s-7-5.8-7-11a7 7 0 1 1 14 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </>
            )}
            {kind === "icon_bell" && (
              <>
                <path d="M5 17h14c-1.4-1.5-2-3.2-2-5.5a5 5 0 0 0-10 0C7 13.8 6.4 15.5 5 17Z" />
                <path d="M10 20h4" />
              </>
            )}
            {kind === "icon_envelope" && (
              <>
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="m4.5 7 7.5 6 7.5-6" />
              </>
            )}
            {kind === "icon_gift" && (
              <>
                <path d="M4 10h16v10H4zM3 6.5h18V10H3zM12 6.5V20" />
                <path d="M12 6.5c-2.8 0-5-.6-5-2.1 0-1.1.8-1.9 2-1.9 1.6 0 3 1.8 3 4ZM12 6.5c2.8 0 5-.6 5-2.1 0-1.1-.8-1.9-2-1.9-1.6 0-3 1.8-3 4Z" />
              </>
            )}
            {kind === "icon_camera" && (
              <>
                <path d="M4 7.5h3l1.5-2h7l1.5 2h3a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2Z" />
                <circle cx="12" cy="13.5" r="4" />
              </>
            )}
            {kind === "icon_music" && (
              <>
                <path d="M9 17V6l10-2v11" />
                <ellipse cx="6.5" cy="18" rx="2.5" ry="2" />
                <ellipse cx="16.5" cy="16" rx="2.5" ry="2" />
              </>
            )}
            {kind === "icon_cake" && (
              <>
                <path d="M5 11h14v9H5zM5 15c2 1.5 3.5 1.5 5 0 1.5 1.5 3 1.5 4.5 0 1.5 1.5 3 1.5 4.5 0M8 11V8M12 11V8M16 11V8" />
                <path d="M8 6c1-1 1-2 0-3-1 1-1 2 0 3ZM12 6c1-1 1-2 0-3-1 1-1 2 0 3ZM16 6c1-1 1-2 0-3-1 1-1 2 0 3Z" />
              </>
            )}
            {kind === "icon_rings" && (
              <>
                <circle cx="9" cy="13" r="5.5" />
                <circle cx="15" cy="13" r="5.5" />
                <path d="m6.5 6.5 2.5-3 2.5 3-2.5 2-2.5-2Z" />
              </>
            )}
            {kind === "icon_sparkles" && (
              <>
                <path d="m12 2.5 1.4 4.2L17.6 8l-4.2 1.3L12 13.5l-1.4-4.2L6.4 8l4.2-1.3L12 2.5Z" />
                <path d="m18.5 13.5.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z" />
                <path d="m5.2 14.2.55 1.65 1.65.55-1.65.55L5.2 18.6l-.55-1.65-1.65-.55 1.65-.55.55-1.65Z" />
              </>
            )}
            {kind === "icon_wine" && (
              <>
                <path d="M7.5 3h9v1.5c0 3.8-2.2 6.5-4.5 6.5S7.5 8.3 7.5 4.5V3Z" />
                <path d="M12 11v8.5M8.5 21h7" />
                <path d="M7.5 7h9" />
              </>
            )}
            {kind === "icon_cocktail" && (
              <>
                <path d="m6 4.5 6 8.5 6-8.5" />
                <path d="M12 13v6.5M8.5 21h7" />
                <path d="M8.5 4.5h7" />
                <path d="m15.5 6.5 2.5-2.5" />
                <circle
                  cx="18.5"
                  cy="3.5"
                  r="0.85"
                  fill={stroke}
                  stroke="none"
                />
              </>
            )}
            {kind === "icon_ribbon" && (
              <>
                <path d="M12 3.5c-2.8 0-5 1.9-5 4.4 0 3.2 5 6.6 5 6.6s5-3.4 5-6.6c0-2.5-2.2-4.4-5-4.4Z" />
                <path d="m9.5 13.5-3 7.5L12 18l5.5 3-3-7.5" />
              </>
            )}
            {kind === "icon_candle" && (
              <>
                <path d="M9.5 10h5v10.5h-5z" />
                <path d="M12 10V7.5" />
                <path d="M12 7.5c1.1-1.1 1.1-2.4 0-3.5-1.1 1.1-1.1 2.4 0 3.5Z" />
                <path d="M8 20.5h8" />
              </>
            )}
          </g>
        )}
      </SvgFill>
    );
  }

  if (kind === "star") {
    return (
      <SvgFill color={color} className={className}>
        {(fill) => <polygon fill={fill} points={starPoints(5)} />}
      </SvgFill>
    );
  }

  if (kind === "star_4") {
    return (
      <SvgFill color={color} className={className}>
        {(fill) => (
          <polygon fill={fill} points={starPoints(4, 12, 12, 12, 3.8)} />
        )}
      </SvgFill>
    );
  }

  if (kind === "star_6") {
    return (
      <SvgFill color={color} className={className}>
        {(fill) => (
          <polygon fill={fill} points={starPoints(6, 12, 12, 12, 5.4)} />
        )}
      </SvgFill>
    );
  }

  if (kind === "star_8") {
    return (
      <SvgFill color={color} className={className}>
        {(fill) => (
          <polygon fill={fill} points={starPoints(8, 12, 12, 12, 6)} />
        )}
      </SvgFill>
    );
  }

  if (kind === "burst") {
    return (
      <SvgFill color={color} className={className}>
        {(fill) => (
          <polygon fill={fill} points={starPoints(12, 12, 12, 12, 6.6)} />
        )}
      </SvgFill>
    );
  }

  // square / rectangle
  return <div className={`${className} rounded-[2px]`} style={box} />;
}
