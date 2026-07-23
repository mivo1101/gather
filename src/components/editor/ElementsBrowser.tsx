"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  ELEMENT_CATEGORIES,
  LIBRARY_ELEMENTS,
  PATTERN_SUBCATEGORIES,
  patternMarkSpec,
  searchLibraryElements,
  type ElementCategoryId,
  type LibraryElement,
  type PatternSubcategoryId,
} from "@/lib/data/element-library";
import { ChevronLeftIcon } from "./editor-icons";
import { ShapeGraphic } from "./ShapeGraphic";

const ELEMENT_RECENTS_KEY = "gather.editor.elementRecents";
const MAX_RECENTS = 12;

export function loadElementRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ELEMENT_RECENTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function saveElementRecent(id: string) {
  if (typeof window === "undefined") return;
  const next = [id, ...loadElementRecents().filter((item) => item !== id)].slice(
    0,
    MAX_RECENTS,
  );
  window.localStorage.setItem(ELEMENT_RECENTS_KEY, JSON.stringify(next));
}

const CATEGORY_CARD: Record<
  ElementCategoryId,
  { tint: string; glyph: string }
> = {
  patterns: { tint: "from-[#fff0f6] to-[#ffe4ef]", glyph: "❀" },
  shapes: { tint: "from-[#eef6f2] to-[#dceee4]", glyph: "◇" },
  dividers: { tint: "from-[#f6f6f6] to-[#ebebeb]", glyph: "—" },
};

function PatternMarkPreview({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const mark = patternMarkSpec(id);
  const fontClass =
    mark.fontFamily === "caveat"
      ? "font-[family-name:var(--font-cursive)]"
      : mark.fontFamily === "urbanist"
        ? "font-sans"
        : "font-[family-name:var(--font-playfair)]";

  return (
    <span
      className={`${fontClass} leading-none text-[#1F2D22] ${
        compact ? "text-xl" : "text-2xl"
      }`}
      style={{
        fontSize: compact
          ? Math.max(14, mark.fontSize * 0.45)
          : Math.max(18, mark.fontSize * 0.55),
      }}
    >
      {mark.glyph}
    </span>
  );
}

function ElementTile({
  item,
  onSelect,
  size = "md",
}: {
  item: LibraryElement;
  onSelect: (item: LibraryElement) => void;
  size?: "sm" | "md";
}) {
  const previewBox =
    size === "sm" ? "h-12 w-full p-1.5" : "h-16 w-full p-2";
  const imageClass =
    size === "sm"
      ? "max-h-9 max-w-9 object-contain"
      : "max-h-11 max-w-11 object-contain";
  const shapeBox = size === "sm" ? "h-5 w-5" : "h-6 w-6";

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-black/8 bg-white text-left transition-colors hover:border-signature/35"
      title={item.name}
    >
      <div
        className={`relative flex shrink-0 items-center justify-center bg-soft-grey/60 ${previewBox}`}
      >
        {item.kind === "pattern" && item.preview ? (
          <Image
            src={item.preview}
            alt=""
            width={44}
            height={44}
            className={imageClass}
          />
        ) : item.kind === "shape" && item.shapeKind ? (
          <div className={shapeBox}>
            <ShapeGraphic kind={item.shapeKind} color="#1F2D22" />
          </div>
        ) : item.kind === "divider" ? (
          <DividerPreview style={item.dividerStyle ?? "solid"} />
        ) : (
          <PatternMarkPreview id={item.id} compact={size === "sm"} />
        )}
      </div>
      <span className="truncate border-t border-black/5 px-1.5 py-1 text-center text-[10px] font-semibold leading-tight text-grey group-hover:text-black">
        {item.name}
      </span>
    </button>
  );
}

export { ElementTile };

function DividerPreview({ style }: { style: string }) {
  const color = "#ff60aa";
  if (style === "dashed") {
    return (
      <span
        className="w-12 border-t-2 border-dashed"
        style={{ borderColor: color }}
      />
    );
  }
  if (style === "dotted") {
    return (
      <span
        className="w-12 border-t-2 border-dotted"
        style={{ borderColor: color }}
      />
    );
  }
  if (style === "double") {
    return (
      <span
        className="w-12 border-t-4 border-double"
        style={{ borderColor: color }}
      />
    );
  }
  if (style === "thick") {
    return (
      <span className="h-2 w-12 rounded-full" style={{ backgroundColor: color }} />
    );
  }
  if (style === "dots") {
    return (
      <span className="flex items-center gap-1">
        {[0, 1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
    );
  }
  if (style === "diamond") {
    return (
      <span className="flex w-12 items-center gap-1">
        <span className="h-px flex-1" style={{ backgroundColor: color }} />
        <span
          className="h-2 w-2 rotate-45"
          style={{ backgroundColor: color }}
        />
        <span className="h-px flex-1" style={{ backgroundColor: color }} />
      </span>
    );
  }
  return (
    <span className="h-0.5 w-12 rounded-full" style={{ backgroundColor: color }} />
  );
}

interface ElementsBrowserProps {
  onSelect: (item: LibraryElement) => void;
}

/**
 * Canva-style Elements browser: search, recently used, browse categories.
 */
export function ElementsBrowser({ onSelect }: ElementsBrowserProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<ElementCategoryId | null>(null);
  const [patternSub, setPatternSub] = useState<PatternSubcategoryId>("all");
  const [showAllRecents, setShowAllRecents] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>(() =>
    loadElementRecents(),
  );
  const recentRailRef = useRef<HTMLDivElement>(null);

  const recents = useMemo(() => {
    return recentIds
      .map((id) => LIBRARY_ELEMENTS.find((item) => item.id === id))
      .filter((item): item is LibraryElement => Boolean(item));
  }, [recentIds]);

  const searchResults = useMemo(
    () => (query.trim() ? searchLibraryElements(query) : []),
    [query],
  );

  const categoryItems = useMemo(() => {
    if (!activeCategory) return [];
    const base = LIBRARY_ELEMENTS.filter(
      (item) => item.category === activeCategory,
    );
    if (activeCategory !== "patterns" || patternSub === "all") return base;
    return base.filter((item) => item.subcategory === patternSub);
  }, [activeCategory, patternSub]);

  const handleSelect = (item: LibraryElement) => {
    saveElementRecent(item.id);
    setRecentIds(loadElementRecents());
    onSelect(item);
  };

  const scrollRecents = (dir: -1 | 1) => {
    const rail = recentRailRef.current;
    if (!rail) return;
    rail.scrollBy({ left: dir * 140, behavior: "smooth" });
  };

  const activeCategoryMeta = activeCategory
    ? ELEMENT_CATEGORIES.find((c) => c.id === activeCategory)
    : null;

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="sr-only">Search elements</span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim()) {
              setActiveCategory(null);
              setShowAllRecents(false);
            }
          }}
          placeholder="Search elements…"
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-grey/70 focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
        />
      </label>

      {query.trim() ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-black">Results</p>
          {searchResults.length === 0 ? (
            <p className="text-sm text-grey">No elements match that search.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {searchResults.map((item) => (
                <div key={item.id} className="h-[88px]">
                  <ElementTile item={item} onSelect={handleSelect} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeCategory ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setActiveCategory(null);
              setPatternSub("all");
            }}
            className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-signature"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
            {activeCategoryMeta?.label ?? "Back"}
          </button>

          {activeCategory === "patterns" && (
            <div className="flex flex-wrap gap-1.5">
              {PATTERN_SUBCATEGORIES.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setPatternSub(sub.id)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                    patternSub === sub.id
                      ? "bg-black text-white"
                      : "bg-soft-grey text-grey hover:text-black"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {categoryItems.map((item) => (
              <div key={item.id} className="h-[88px]">
                <ElementTile item={item} onSelect={handleSelect} size="sm" />
              </div>
            ))}
          </div>
        </div>
      ) : showAllRecents ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowAllRecents(false)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-signature"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
            Recently used
          </button>
          {recents.length === 0 ? (
            <p className="text-sm text-grey">
              Elements you add will show up here.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {recents.map((item) => (
                <div key={item.id} className="h-[88px]">
                  <ElementTile item={item} onSelect={handleSelect} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-black">Recently used</p>
              {recents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllRecents(true)}
                  className="text-xs font-semibold text-signature hover:underline"
                >
                  See all
                </button>
              )}
            </div>
            {recents.length === 0 ? (
              <p className="rounded-xl bg-soft-grey/70 px-3 py-4 text-sm text-grey">
                Add an element to start your Recents.
              </p>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => scrollRecents(-1)}
                  className="absolute -left-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-grey shadow-sm hover:text-black"
                  aria-label="Scroll recent left"
                >
                  ‹
                </button>
                <div
                  ref={recentRailRef}
                  className="flex items-stretch gap-2 overflow-x-auto px-5 scrollbar-none"
                >
                  {recents.slice(0, 8).map((item) => (
                    <div
                      key={item.id}
                      className="h-[88px] w-[68px] shrink-0"
                    >
                      <ElementTile
                        item={item}
                        onSelect={handleSelect}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => scrollRecents(1)}
                  className="absolute -right-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-grey shadow-sm hover:text-black"
                  aria-label="Scroll recent right"
                >
                  ›
                </button>
              </div>
            )}
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-black">
              Browse categories
            </p>
            <div className="grid grid-cols-3 gap-3">
              {ELEMENT_CATEGORIES.map((category) => {
                const card = CATEGORY_CARD[category.id];
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category.id);
                      setPatternSub("all");
                    }}
                    className="group flex flex-col items-center gap-2 text-center"
                  >
                    <span
                      className={`flex aspect-square w-full items-center justify-center rounded-2xl bg-gradient-to-br ${card.tint} text-2xl shadow-[0_6px_16px_rgba(0,0,0,0.06)] transition-transform group-hover:scale-[1.03]`}
                    >
                      {card.glyph}
                    </span>
                    <span className="text-xs font-semibold text-black">
                      {category.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
