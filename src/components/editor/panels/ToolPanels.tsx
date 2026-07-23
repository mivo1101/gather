"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { InvitationPage } from "@/lib/data/invitation-content";
import { type LibraryElement } from "@/lib/data/element-library";
import { ElementsBrowser } from "../ElementsBrowser";
import { TrashIcon } from "../editor-icons";
import type { ImageFrame } from "@/lib/data/canvas-elements";
import { ColourField, EmptyHint, PanelSection } from "./shared";

export function ToolElementsPanel({
  defaultColor,
  onDefaultColorChange,
  onAddLibraryElement,
}: {
  defaultColor: string;
  onDefaultColorChange: (color: string) => void;
  onAddLibraryElement: (item: LibraryElement) => void;
}) {
  return (
    <div className="space-y-5">
      <ColourField
        label="Colour"
        value={defaultColor}
        onChange={onDefaultColorChange}
      />
      <p className="text-xs text-grey">
        New elements will use this colour when possible.
      </p>
      <ElementsBrowser onSelect={onAddLibraryElement} />
    </div>
  );
}

const FRAMES: { id: ImageFrame; label: string }[] = [
  { id: "none", label: "None" },
  { id: "square", label: "Square" },
  { id: "circle", label: "Circle" },
  { id: "heart", label: "Heart" },
  { id: "rounded", label: "Rounded" },
];

export function ToolImagesPanel({
  onAddImageSrc: _onAddImageSrc,
  onPickFrame,
}: {
  onAddImageSrc: (src: string, frame?: ImageFrame) => void;
  onPickFrame: (frame: ImageFrame) => void;
}) {
  const [query, setQuery] = useState("");
  const [frame, setFrame] = useState<ImageFrame>("none");
  const [mediaTab, setMediaTab] = useState<"photos" | "videos">("photos");

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="sr-only">Search photos and videos</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            mediaTab === "photos" ? "Search photos…" : "Search videos…"
          }
          className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
        />
      </label>

      <div className="flex gap-1 rounded-xl bg-soft-grey p-1">
        {(
          [
            { id: "photos" as const, label: "Photos" },
            { id: "videos" as const, label: "Videos" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMediaTab(tab.id)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
              mediaTab === tab.id
                ? "bg-white text-black shadow-sm"
                : "text-grey hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <EmptyHint>
        {query.trim()
          ? `No ${mediaTab} match “${query.trim()}”.`
          : mediaTab === "photos"
            ? "Stock photos will live here (Unsplash / Pexels). For now, add your own under Uploads."
            : "Stock video clips will live here. For now, add your own under Uploads."}
      </EmptyHint>

      <PanelSection title="Frames">
        <p className="mb-2 text-xs text-grey">
          Apply to the selected photo, or use when placing a new one.
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {FRAMES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setFrame(item.id);
                onPickFrame(item.id);
              }}
              className={`rounded-xl border px-2.5 py-2 text-left text-xs font-semibold ${
                frame === item.id
                  ? "border-signature bg-signature/10 text-signature"
                  : "border-black/10 text-black hover:bg-soft-grey"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="Effects">
        <p className="text-xs text-grey">
          Select a photo on the canvas to apply shadow, glow, or outline.
        </p>
      </PanelSection>
    </div>
  );
}

const UPLOADS_KEY = "gather.editor.uploads";

export type UploadRecord = {
  id: string;
  name: string;
  url: string;
  kind: "image" | "video" | "audio";
  createdAt: number;
};

export function loadUploads(): UploadRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(UPLOADS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as UploadRecord[]) : [];
  } catch {
    return [];
  }
}

function saveUploads(items: UploadRecord[]) {
  window.localStorage.setItem(UPLOADS_KEY, JSON.stringify(items.slice(0, 40)));
}

const UPLOADS_CHANGED = "gather-uploads-changed";

function notifyUploadsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(UPLOADS_CHANGED));
}

export function subscribeUploads(
  onChange: (items: UploadRecord[]) => void,
): () => void {
  const refresh = () => onChange(loadUploads());
  refresh();
  window.addEventListener(UPLOADS_CHANGED, refresh);
  return () => window.removeEventListener(UPLOADS_CHANGED, refresh);
}

export function removeUpload(id: string): UploadRecord[] {
  const current = loadUploads();
  const removed = current.find((item) => item.id === id);
  if (removed?.url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(removed.url);
    } catch {
      /* ignore */
    }
  }
  const next = current.filter((item) => item.id !== id);
  saveUploads(next);
  notifyUploadsChanged();
  return next;
}

export function ToolUploadsPanel({
  onAddImageSrc,
}: {
  onAddImageSrc: (src: string) => void;
}) {
  const [uploads, setUploads] = useState<UploadRecord[]>(() => loadUploads());
  const [filter, setFilter] = useState<"image" | "video" | "audio" | "all">(
    "all",
  );

  useEffect(() => subscribeUploads(setUploads), []);

  const filtered = uploads.filter(
    (item) => filter === "all" || item.kind === filter,
  );

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const next: UploadRecord[] = [];
    Array.from(files).forEach((file) => {
      const kind = file.type.startsWith("video")
        ? "video"
        : file.type.startsWith("audio")
          ? "audio"
          : "image";
      const url = URL.createObjectURL(file);
      next.push({
        id: `up_${Math.random().toString(36).slice(2, 9)}`,
        name: file.name,
        url,
        kind,
        createdAt: Date.now(),
      });
    });
    const merged = [...next, ...uploads];
    saveUploads(merged);
    notifyUploadsChanged();
    setUploads(merged);
    const firstImage = next.find((item) => item.kind === "image");
    if (firstImage) onAddImageSrc(firstImage.url);
  };

  const onDelete = (id: string) => {
    setUploads(removeUpload(id));
  };

  return (
    <div className="space-y-5">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-soft-grey/50 px-4 py-10 text-center transition-colors hover:border-signature/40">
        <span className="text-sm font-semibold text-black">Upload files</span>
        <span className="mt-1 text-xs text-grey">
          Images, video, or audio from your device
        </span>
        <input
          type="file"
          accept="image/*,video/*,audio/*"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </label>

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["all", "All"],
            ["image", "Image"],
            ["video", "Video"],
            ["audio", "Audio"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              filter === id
                ? "bg-black text-white"
                : "bg-soft-grey text-grey hover:text-black"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyHint>
          {filter === "video" || filter === "audio"
            ? `${filter} uploads will appear here. Canvas placement for video/audio is coming soon.`
            : "No uploads yet. Drop files above to get started."}
        </EmptyHint>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl border border-black/8 text-left hover:border-signature/40"
            >
              <button
                type="button"
                onClick={() => {
                  if (item.kind === "image") onAddImageSrc(item.url);
                }}
                className="w-full text-left"
              >
                <div className="flex aspect-square items-center justify-center bg-soft-grey/60 p-2 text-xs font-semibold text-grey">
                  {item.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    item.kind.toUpperCase()
                  )}
                </div>
                <span className="block truncate px-2 py-1.5 text-[10px] font-semibold text-grey">
                  {item.name}
                </span>
              </button>
              <button
                type="button"
                aria-label={`Delete ${item.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(item.id);
                }}
                className="absolute right-1.5 top-1.5 rounded-full bg-white/95 p-1.5 text-grey opacity-0 shadow-sm ring-1 ring-black/5 transition-opacity hover:text-black group-hover:opacity-100 focus-visible:opacity-100"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const PATTERNS: {
  id: NonNullable<InvitationPage["backgroundPattern"]>;
  label: string;
}[] = [
  { id: "none", label: "None" },
  { id: "dots", label: "Dots" },
  { id: "grid", label: "Grid" },
  { id: "stripes", label: "Stripes" },
  { id: "waves", label: "Waves" },
];

const BORDER_STYLES: {
  id: NonNullable<InvitationPage["border"]>["style"];
  label: string;
}[] = [
  { id: "none", label: "None" },
  { id: "solid", label: "Solid" },
  { id: "dashed", label: "Dashed" },
  { id: "double", label: "Double" },
  { id: "ornament", label: "Ornament" },
];

export function ToolBackgroundPanel({
  page,
  onChangeBackground,
  onChangePattern,
  onChangeBorder,
}: {
  page: InvitationPage;
  onChangeBackground: (color: string) => void;
  onChangePattern: (
    pattern: NonNullable<InvitationPage["backgroundPattern"]>,
  ) => void;
  onChangeBorder: (border: InvitationPage["border"]) => void;
}) {
  const border = page.border;

  return (
    <div className="space-y-5">
      <ColourField
        label="Colours"
        value={page.backgroundColor}
        onChange={onChangeBackground}
      />

      <PanelSection title="Background patterns">
        <div className="grid grid-cols-2 gap-1.5">
          {PATTERNS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangePattern(item.id)}
              className={`rounded-xl border px-2.5 py-2 text-left text-xs font-semibold ${
                (page.backgroundPattern || "none") === item.id
                  ? "border-signature bg-signature/10 text-signature"
                  : "border-black/10 text-black hover:bg-soft-grey"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="Border">
        <div className="mb-3 grid grid-cols-2 gap-1.5">
          {BORDER_STYLES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "none") onChangeBorder(null);
                else
                  onChangeBorder({
                    style: item.id,
                    color: border?.color || "#1F2D22",
                    width: border?.width || 2,
                  });
              }}
              className={`rounded-xl border px-2.5 py-2 text-left text-xs font-semibold ${
                (border?.style || "none") === item.id
                  ? "border-signature bg-signature/10 text-signature"
                  : "border-black/10 text-black hover:bg-soft-grey"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {border && border.style !== "none" && (
          <div className="space-y-3">
            <ColourField
              label="Border colour"
              value={border.color}
              onChange={(color) => onChangeBorder({ ...border, color })}
            />
            <label className="block">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-grey">Width</span>
                <span className="text-xs text-grey">{border.width}px</span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                value={border.width}
                onChange={(e) =>
                  onChangeBorder({
                    ...border,
                    width: Number(e.target.value),
                  })
                }
                className="h-1 w-full appearance-none rounded-full bg-black/10 accent-signature"
              />
            </label>
          </div>
        )}
      </PanelSection>
    </div>
  );
}

export function ToolPlaceholder({ title }: { title: string }) {
  return (
    <EmptyHint>
      {title} tools are available as shortcuts — use Layout and canvas controls
      for now.
    </EmptyHint>
  );
}
