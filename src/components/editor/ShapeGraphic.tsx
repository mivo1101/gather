"use client";

import type { ShapeKind } from "@/lib/data/canvas-elements";

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
  if (kind === "circle") {
    return (
      <div
        className={`${className} rounded-full`}
        style={{ backgroundColor: color }}
      />
    );
  }
  if (kind === "triangle") {
    return (
      <div
        className={className}
        style={{
          backgroundColor: color,
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
        }}
      />
    );
  }
  if (kind === "line") {
    return (
      <div className={`flex items-center ${className}`}>
        <div
          className="h-[3px] w-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    );
  }
  if (kind === "diamond") {
    return (
      <div
        className={className}
        style={{
          backgroundColor: color,
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        }}
      />
    );
  }
  if (kind === "heart") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          fill={color}
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
    );
  }
  if (kind === "star") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          fill={color}
          d="M12 2l2.9 6.9H22l-5.5 4.3 2.1 7L12 16.9 5.4 20.2l2.1-7L2 8.9h7.1L12 2z"
        />
      </svg>
    );
  }
  // square / rectangle
  return (
    <div
      className={`${className} rounded-[2px]`}
      style={{ backgroundColor: color }}
    />
  );
}
