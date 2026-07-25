"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ShapeKind } from "@/lib/data/canvas-elements";
import {
  fillBoxStyle,
  isGradient,
  normalizeHex,
  parseLinearGradient,
} from "@/lib/color-utils";

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
  className = "h-full w-full",
}: {
  kind: ShapeKind | string;
  color: string;
  className?: string;
}) {
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
