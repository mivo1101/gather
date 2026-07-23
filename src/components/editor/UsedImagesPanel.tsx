"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { CanvasElement } from "@/lib/data/canvas-elements";
import { isPatternGraphicSrc } from "@/lib/data/element-library";

interface UsedImagesPanelProps {
  elements: CanvasElement[];
  onAddImageSrc: (src: string) => void;
}

/**
 * Left-bar Images tool: photos/videos already used on the design
 * (excludes decorative pattern graphics like flowers).
 */
export function UsedImagesPanel({
  elements,
  onAddImageSrc,
}: UsedImagesPanelProps) {
  const used = useMemo(() => {
    const seen = new Set<string>();
    const items: { src: string; name: string }[] = [];

    for (const el of elements) {
      if (el.type !== "image" || !el.content || seen.has(el.content)) continue;
      if (isPatternGraphicSrc(el.content)) continue;
      seen.add(el.content);
      items.push({
        src: el.content,
        name: "Photo",
      });
    }
    return items;
  }, [elements]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-black">Images</h2>
        <p className="mt-1 text-sm text-grey">
          Photos and videos used across all cards. Floral artwork is under
          Elements → Patterns.
        </p>
      </div>

      {used.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-soft-grey/50 px-4 py-8 text-center">
          <p className="text-sm font-medium text-black">
            No photos in this design yet
          </p>
          <p className="mt-1 text-xs text-grey">
            Add media from Uploads, or browse stock photos in the Images tool.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {used.map((item) => (
            <button
              key={item.src}
              type="button"
              onClick={() => onAddImageSrc(item.src)}
              className="group overflow-hidden rounded-xl border border-black/8 bg-white text-left transition-colors hover:border-signature/40"
            >
              <div className="relative flex aspect-square items-center justify-center bg-soft-grey/60 p-3">
                <Image
                  src={item.src}
                  alt=""
                  width={96}
                  height={96}
                  className="max-h-full max-w-full object-cover"
                />
              </div>
              <span className="block truncate px-2.5 py-2 text-[11px] font-semibold text-grey group-hover:text-black">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
