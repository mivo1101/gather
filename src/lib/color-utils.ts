import type { CSSProperties } from "react";

/** Colour helpers for the editor picker and canvas fills. */

export function isGradient(value: string | null | undefined): boolean {
  if (!value) return false;
  return /gradient\(/i.test(value);
}

export function isTransparent(value: string | null | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === "transparent" || v === "rgba(0,0,0,0)" || v === "#00000000";
}

/** Normalize to #RRGGBB when possible; otherwise return trimmed input. */
export function normalizeHex(
  raw: string | null | undefined,
  fallback = "#1F2D22",
): string {
  if (raw == null) return fallback;
  const value = raw.trim();
  if (!value) return fallback;
  if (isGradient(value) || isTransparent(value)) return value;

  let hex = value.startsWith("#") ? value.slice(1) : value;
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) return `#${hex.toUpperCase()}`;
  if (/^[0-9a-f]{8}$/i.test(hex)) return `#${hex.slice(0, 6).toUpperCase()}`;
  return fallback;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex);
  if (!normalized.startsWith("#") || normalized.length !== 7) return null;
  const n = Number.parseInt(normalized.slice(1), 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Parse #hex / rgb() / rgba() into channels. Alpha defaults to 1. */
export function parseCssColor(
  value: string | null | undefined,
): { r: number; g: number; b: number; a: number } | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (isTransparent(trimmed)) return { r: 0, g: 0, b: 0, a: 0 };

  const rgba = trimmed.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i,
  );
  if (rgba) {
    return {
      r: Number(rgba[1]),
      g: Number(rgba[2]),
      b: Number(rgba[3]),
      a: rgba[4] === undefined ? 1 : Number(rgba[4]),
    };
  }

  const hex = normalizeHex(trimmed, "");
  if (!hex.startsWith("#") || hex.length !== 7) return null;
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return { ...rgb, a: 1 };
}

/** WCAG relative luminance for RGB channels (0–1). */
function luminanceFromRgb(r: number, g: number, b: number): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG relative luminance for a solid hex colour (0–1). */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  return luminanceFromRgb(rgb.r, rgb.g, rgb.b);
}

/**
 * True when a solid/gradient/rgba surface reads as light.
 * Semi-transparent fills are blended over white (typical invitation card).
 */
export function isLightColor(value: string | null | undefined): boolean {
  if (!value || isTransparent(value)) return true;
  if (isGradient(value)) {
    const parsed = parseLinearGradient(value);
    if (!parsed) return true;
    return (
      (relativeLuminance(parsed.start) + relativeLuminance(parsed.end)) / 2 >
      0.55
    );
  }

  const parsed = parseCssColor(value);
  if (!parsed) return true;
  if (parsed.a <= 0.08) return true;
  // Blend over white so translucent dark tints still read as light surfaces
  const a = Math.min(1, Math.max(0, parsed.a));
  const r = parsed.r * a + 255 * (1 - a);
  const g = parsed.g * a + 255 * (1 - a);
  const b = parsed.b * a + 255 * (1 - a);
  return luminanceFromRgb(r, g, b) > 0.55;
}

/** Ink / border / soft fill that contrast against a page or card surface. */
export function contrastingInk(surface: string | null | undefined): {
  ink: string;
  muted: string;
  fill: string;
} {
  if (isLightColor(surface)) {
    return {
      ink: "#1F2D22",
      muted: "rgba(31,45,34,0.35)",
      fill: "rgba(31,45,34,0.06)",
    };
  }
  return {
    ink: "#FFFFFF",
    muted: "rgba(255,255,255,0.35)",
    fill: "rgba(255,255,255,0.08)",
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

export function rgbToHsv(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

export function hsvToRgb(
  h: number,
  s: number,
  v: number,
): { r: number; g: number; b: number } {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h < 60) [rp, gp, bp] = [c, x, 0];
  else if (h < 120) [rp, gp, bp] = [x, c, 0];
  else if (h < 180) [rp, gp, bp] = [0, c, x];
  else if (h < 240) [rp, gp, bp] = [0, x, c];
  else if (h < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];
  return {
    r: (rp + m) * 255,
    g: (gp + m) * 255,
    b: (bp + m) * 255,
  };
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const rgb = hexToRgb(hex) ?? { r: 31, g: 45, b: 34 };
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

export function hsvToHex(h: number, s: number, v: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

export interface LinearGradientValue {
  angle: number;
  start: string;
  end: string;
}

export function parseLinearGradient(value: string): LinearGradientValue | null {
  if (!isGradient(value)) return null;
  const angleMatch = value.match(/(-?\d+(?:\.\d+)?)deg/i);
  const colors = [...value.matchAll(/#([0-9a-f]{3,8})\b/gi)].map((m) =>
    normalizeHex(`#${m[1]}`),
  );
  if (colors.length < 2) {
    return {
      angle: angleMatch ? Number(angleMatch[1]) : 90,
      start: colors[0] || "#FFFFFF",
      end: colors[0] || "#1F2D22",
    };
  }
  return {
    angle: angleMatch ? Number(angleMatch[1]) : 90,
    start: colors[0],
    end: colors[colors.length - 1],
  };
}

export function buildLinearGradient(
  angle: number,
  start: string,
  end: string,
): string {
  return `linear-gradient(${Math.round(angle)}deg, ${normalizeHex(start)} 0%, ${normalizeHex(end)} 100%)`;
}

/** CSS for solid or gradient fills on boxes / shapes. */
export function fillBoxStyle(
  value: string | null | undefined,
): CSSProperties {
  if (value == null || isTransparent(value)) {
    return { backgroundColor: "transparent", backgroundImage: "none" };
  }
  if (isGradient(value)) {
    return { backgroundColor: "transparent", backgroundImage: value };
  }
  return { backgroundColor: normalizeHex(value), backgroundImage: "none" };
}

/** CSS for text that may be a solid colour or a gradient fill. */
export function fillTextStyle(
  value: string | null | undefined,
): CSSProperties {
  if (value == null) {
    return {
      color: "#1F2D22",
      backgroundImage: "none",
      WebkitTextFillColor: undefined,
    };
  }
  if (isGradient(value)) {
    return {
      backgroundImage: value,
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      color: "transparent",
      WebkitTextFillColor: "transparent",
    };
  }
  return {
    color: isTransparent(value) ? "transparent" : normalizeHex(value),
    backgroundImage: "none",
    WebkitTextFillColor: undefined,
  };
}

/** Extract unique solid + gradient fills used across invitation pages. */
export function collectDocumentColors(
  pages: Array<{
    backgroundColor?: string | null;
    elements?: Array<{
      style?: { color?: string | null };
      widget?: {
        kind?: string;
        chrome?: { background?: string; textColor?: string; borderColor?: string };
        buttonStyle?: { background?: string; textColor?: string; borderColor?: string };
        fieldStyle?: { background?: string; textColor?: string; borderColor?: string };
        optionStyle?: { background?: string; textColor?: string; borderColor?: string };
        labelStyle?: { color?: string };
      } | null;
    }>;
  }>,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const push = (raw: string | null | undefined) => {
    if (!raw) return;
    const value = raw.trim();
    if (!value || isTransparent(value)) return;
    const key = isGradient(value) ? value : normalizeHex(value);
    if (seen.has(key.toLowerCase())) return;
    seen.add(key.toLowerCase());
    out.push(key);
  };

  for (const page of pages) {
    push(page.backgroundColor);
    for (const el of page.elements ?? []) {
      push(el.style?.color);
      const w = el.widget;
      if (!w) continue;
      if ("chrome" in w && w.chrome) {
        push(w.chrome.background);
        push(w.chrome.textColor);
        push(w.chrome.borderColor);
      }
      if ("buttonStyle" in w && w.buttonStyle) {
        push(w.buttonStyle.background);
        push(w.buttonStyle.textColor);
        push(w.buttonStyle.borderColor);
      }
      if ("fieldStyle" in w && w.fieldStyle) {
        push(w.fieldStyle.background);
        push(w.fieldStyle.textColor);
        push(w.fieldStyle.borderColor);
      }
      if ("optionStyle" in w && w.optionStyle) {
        push(w.optionStyle.background);
        push(w.optionStyle.textColor);
        push(w.optionStyle.borderColor);
      }
      if ("labelStyle" in w && w.labelStyle) {
        push(w.labelStyle.color);
      }
    }
  }

  return out.slice(0, 24);
}
