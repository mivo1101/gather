"use client";

import { useEffect, useRef, useState } from "react";
import type { ShapeKind } from "@/lib/data/canvas-elements";

type EmojiMotion =
  | "wave"
  | "pulse"
  | "bounce"
  | "clap"
  | "twinkle"
  | "float"
  | "tilt";

type EmojiSpec = {
  glyph: string;
  motion: EmojiMotion;
};

const EMOJI_BY_KIND: Partial<Record<ShapeKind, EmojiSpec>> = {
  emoji_wave: { glyph: "👋", motion: "wave" },
  emoji_heart: { glyph: "❤️", motion: "pulse" },
  emoji_party: { glyph: "🎉", motion: "bounce" },
  emoji_clap: { glyph: "👏", motion: "clap" },
  emoji_sparkles: { glyph: "✨", motion: "twinkle" },
  emoji_balloon: { glyph: "🎈", motion: "float" },
  emoji_cake: { glyph: "🎂", motion: "bounce" },
  emoji_rings: { glyph: "💍", motion: "twinkle" },
  emoji_cheers: { glyph: "🥂", motion: "tilt" },
  emoji_bouquet: { glyph: "💐", motion: "float" },
  emoji_kiss: { glyph: "😘", motion: "bounce" },
  emoji_love_letter: { glyph: "💌", motion: "float" },
  emoji_gift: { glyph: "🎁", motion: "bounce" },
  emoji_rose: { glyph: "🌹", motion: "float" },
  emoji_party_face: { glyph: "🥳", motion: "bounce" },
  emoji_raised_hands: { glyph: "🙌", motion: "wave" },
};

export function isEmojiShapeKind(kind: string): boolean {
  return Object.prototype.hasOwnProperty.call(EMOJI_BY_KIND, kind);
}

export function emojiSpecForKind(kind: string): EmojiSpec | null {
  return EMOJI_BY_KIND[kind as ShapeKind] ?? null;
}

/** System emoji (Apple Color Emoji on iOS/macOS) with light CSS motion. */
export function EmojiGraphic({
  kind,
  className = "h-full w-full",
}: {
  kind: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(20);
  const spec = emojiSpecForKind(kind);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setFontSize(Math.max(10, Math.min(width, height) * 0.88));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!spec) return null;

  return (
    <span
      ref={ref}
      className={`emoji-icon emoji-icon--${spec.motion} ${className}`}
      style={{ fontSize }}
      aria-hidden="true"
    >
      {spec.glyph}
    </span>
  );
}
