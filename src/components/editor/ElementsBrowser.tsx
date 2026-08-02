"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LIBRARY_ELEMENTS,
  patternMarkSpec,
  searchLibraryElements,
  type LibraryElement,
} from "@/lib/data/element-library";
import { ChevronLeftIcon } from "./editor-icons";
import { ShapeGraphic } from "./ShapeGraphic";

const ELEMENT_RECENTS_KEY = "gather.editor.elementRecents";
const MAX_RECENTS = 12;

type CollectionId =
  | "recent"
  | "icons"
  | "graphics"
  | "flowers"
  | "shapes"
  | "dividers";

interface ElementCollection {
  id: Exclude<CollectionId, "recent">;
  label: string;
  items: LibraryElement[];
}

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
      className={`${fontClass} leading-none text-[#1F2D22]`}
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
      className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-black/8 bg-white text-left transition-[border-color,transform] hover:-translate-y-0.5 hover:border-signature/35"
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
          <div
            className={
              item.shapeKind.startsWith("line") ||
              item.shapeKind.startsWith("arrow")
                ? size === "sm"
                  ? "h-4 w-10"
                  : "h-5 w-12"
                : shapeBox
            }
          >
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
  if (style === "dashed" || style === "dotted" || style === "double") {
    return (
      <span
        className={`w-12 ${
          style === "dashed"
            ? "border-t-2 border-dashed"
            : style === "dotted"
              ? "border-t-2 border-dotted"
              : "border-t-4 border-double"
        }`}
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

function CollectionRail({
  title,
  items,
  onSelect,
  onSeeAll,
}: {
  title: string;
  items: LibraryElement[];
  onSelect: (item: LibraryElement) => void;
  onSeeAll: () => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  if (items.length === 0) return null;

  return (
    <section aria-label={title}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-black">{title}</h3>
        <button
          type="button"
          onClick={onSeeAll}
          className="text-xs font-semibold text-signature hover:underline"
        >
          See all
        </button>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            railRef.current?.scrollBy({ left: -168, behavior: "smooth" })
          }
          className="absolute -left-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-grey shadow-sm transition-colors hover:text-black"
          aria-label={`Scroll ${title} left`}
        >
          ‹
        </button>
        <div
          ref={railRef}
          className="flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <div key={item.id} className="h-[84px] w-[72px] shrink-0">
              <ElementTile item={item} onSelect={onSelect} size="sm" />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            railRef.current?.scrollBy({ left: 168, behavior: "smooth" })
          }
          className="absolute -right-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-grey shadow-sm transition-colors hover:text-black"
          aria-label={`Scroll ${title} right`}
        >
          ›
        </button>
      </div>
    </section>
  );
}

interface ElementsBrowserProps {
  onSelect: (item: LibraryElement) => void;
}

export function ElementsBrowser({ onSelect }: ElementsBrowserProps) {
  const [query, setQuery] = useState("");
  const [expandedCollection, setExpandedCollection] =
    useState<CollectionId | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentIds(loadElementRecents());
  }, []);

  const recents = useMemo(
    () =>
      recentIds
        .map((id) => LIBRARY_ELEMENTS.find((item) => item.id === id))
        .filter((item): item is LibraryElement => Boolean(item)),
    [recentIds],
  );

  const collections = useMemo<ElementCollection[]>(
    () => [
      {
        id: "icons",
        label: "Icons",
        items: LIBRARY_ELEMENTS.filter(
          (item) =>
            item.category === "patterns" && item.subcategory === "icons",
        ),
      },
      {
        id: "graphics",
        label: "Graphics",
        items: LIBRARY_ELEMENTS.filter(
          (item) =>
            item.category === "patterns" &&
            (item.subcategory === "monogram" ||
              item.subcategory === "social"),
        ),
      },
      {
        id: "flowers",
        label: "Flowers",
        items: LIBRARY_ELEMENTS.filter(
          (item) =>
            item.category === "patterns" && item.subcategory === "flowers",
        ),
      },
      {
        id: "shapes",
        label: "Shapes",
        items: LIBRARY_ELEMENTS.filter((item) => item.category === "shapes"),
      },
      {
        id: "dividers",
        label: "Dividers",
        items: LIBRARY_ELEMENTS.filter((item) => item.category === "dividers"),
      },
    ],
    [],
  );

  const searchResults = useMemo(
    () => (query.trim() ? searchLibraryElements(query) : []),
    [query],
  );

  const expanded = useMemo(() => {
    if (!expandedCollection) return null;
    if (expandedCollection === "recent") {
      return { label: "Recently used", items: recents };
    }
    return (
      collections.find((collection) => collection.id === expandedCollection) ??
      null
    );
  }, [collections, expandedCollection, recents]);

  const handleSelect = (item: LibraryElement) => {
    saveElementRecent(item.id);
    setRecentIds(loadElementRecents());
    onSelect(item);
  };

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="sr-only">Search elements</span>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (event.target.value.trim()) setExpandedCollection(null);
          }}
          placeholder="Search elements…"
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-grey/70 focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
        />
      </label>

      {query.trim() ? (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-black">Results</h3>
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
        </section>
      ) : expanded ? (
        <section className="space-y-3">
          <button
            type="button"
            onClick={() => setExpandedCollection(null)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-signature"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
            {expanded.label}
          </button>
          {expanded.items.length === 0 ? (
            <p className="text-sm text-grey">
              Elements you add will show up here.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {expanded.items.map((item) => (
                <div key={item.id} className="h-[88px]">
                  <ElementTile item={item} onSelect={handleSelect} size="sm" />
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {recents.length > 0 && (
            <CollectionRail
              title="Recently used"
              items={recents}
              onSelect={handleSelect}
              onSeeAll={() => setExpandedCollection("recent")}
            />
          )}
          {collections.map((collection) => (
            <CollectionRail
              key={collection.id}
              title={collection.label}
              items={collection.items}
              onSelect={handleSelect}
              onSeeAll={() => setExpandedCollection(collection.id)}
            />
          ))}
        </>
      )}
    </div>
  );
}
