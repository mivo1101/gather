import type { CSSProperties } from "react";
import type { ElementEffects, EffectKind } from "@/lib/data/canvas-elements";
import { isGradient, normalizeHex } from "@/lib/color-utils";

export const EFFECT_DEFAULTS = {
  direction: -45,
  offset: 20,
  blur: 10,
  transparency: 30,
} as const;

/** Resolve legacy boolean flags into a modern effect kind. */
export function resolveEffectKind(effects?: ElementEffects | null): EffectKind {
  if (!effects) return "none";
  if (effects.kind) return effects.kind;
  if (effects.glow) return "glow";
  if (effects.shadow || effects.shadowInset) return "drop";
  if (effects.outline) return "drop";
  return "none";
}

export function effectParams(effects?: ElementEffects | null) {
  return {
    kind: resolveEffectKind(effects),
    direction: effects?.direction ?? EFFECT_DEFAULTS.direction,
    offset: effects?.offset ?? EFFECT_DEFAULTS.offset,
    blur: effects?.blur ?? EFFECT_DEFAULTS.blur,
    transparency: effects?.transparency ?? EFFECT_DEFAULTS.transparency,
  };
}

function shadowColor(transparency: number, base = "0,0,0") {
  const alpha = Math.max(0, Math.min(1, 1 - transparency / 100));
  return `rgba(${base},${alpha.toFixed(3)})`;
}

function offsetXY(directionDeg: number, offset: number) {
  const rad = (directionDeg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * offset,
    y: Math.sin(rad) * offset,
  };
}

/**
 * Build CSS that follows visible alpha (frames / clip-paths).
 * Put `filter` on a parent of the clipped shape so the shadow isn't clipped away.
 */
export function effectsToCss(
  effects?: ElementEffects | null,
  color?: string,
): CSSProperties {
  const { kind, direction, offset, blur, transparency } = effectParams(effects);
  if (kind === "none") return {};

  const { x, y } = offsetXY(direction, offset);
  const ink = shadowColor(transparency);
  const filters: string[] = [];

  if (kind === "drop") {
    filters.push(`drop-shadow(${x.toFixed(1)}px ${y.toFixed(1)}px ${blur}px ${ink})`);
  } else if (kind === "glow") {
    const glowBlur = Math.max(blur, 6);
    filters.push(`drop-shadow(0 0 ${glowBlur}px ${ink})`);
    filters.push(
      `drop-shadow(0 0 ${Math.max(2, glowBlur / 2)}px ${shadowColor(Math.min(100, transparency + 20))})`,
    );
  } else if (kind === "echo") {
    const steps = 3;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const ex = x * t;
      const ey = y * t;
      const a = transparency + (100 - transparency) * (1 - t) * 0.35;
      filters.push(
        `drop-shadow(${ex.toFixed(1)}px ${ey.toFixed(1)}px ${Math.max(0, blur * 0.35)}px ${shadowColor(a)})`,
      );
    }
  }

  // Soft signature tint when glowing with brand colour context
  if (kind === "glow" && color && !isGradient(color)) {
    const hex = normalizeHex(color);
    // keep neutral black glow primarily; brand tint is optional via second pass already
    void hex;
  }

  return {
    filter: filters.length ? filters.join(" ") : undefined,
  };
}

export function withEffectKind(
  effects: ElementEffects | undefined,
  kind: EffectKind,
): ElementEffects {
  const base = effectParams(effects);
  if (kind === "none") {
    return {
      kind: "none",
      direction: base.direction,
      offset: base.offset,
      blur: base.blur,
      transparency: base.transparency,
      shadow: false,
      glow: false,
      outline: false,
      shadowInset: false,
    };
  }
  return {
    kind,
    direction: base.direction,
    offset: kind === "glow" ? 0 : base.offset || EFFECT_DEFAULTS.offset,
    blur:
      kind === "glow"
        ? Math.max(base.blur, 14)
        : base.blur || EFFECT_DEFAULTS.blur,
    transparency: base.transparency,
    shadow: kind === "drop",
    glow: kind === "glow",
    outline: false,
    shadowInset: false,
  };
}
