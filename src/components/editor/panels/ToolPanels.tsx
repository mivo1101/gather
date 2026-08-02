"use client";

import { useEffect, useRef, useState } from "react";
import type { InvitationPage } from "@/lib/data/invitation-content";
import { type LibraryElement } from "@/lib/data/element-library";
import type {
  StockImage,
  StockImageOrientation,
  StockImagePage,
} from "@/lib/data/stock-images";
import {
  PAPER_TEXTURE_BLENDS,
  PAPER_TEXTURES,
  paperTextureLayerStyle,
} from "@/lib/paper-textures";
import { ElementsBrowser } from "../ElementsBrowser";
import { TrashIcon } from "../editor-icons";
import {
  ColourField,
  EmptyHint,
  PanelSection,
  ThinSlider,
} from "./shared";

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

const STOCK_CATEGORIES = [
  { id: "events", label: "Events", query: "celebration event" },
  { id: "wedding", label: "Wedding", query: "wedding celebration" },
  { id: "birthday", label: "Birthday", query: "birthday party" },
  { id: "baby", label: "Baby shower", query: "baby shower celebration" },
  { id: "corporate", label: "Corporate", query: "corporate event" },
  { id: "dinner", label: "Dinner", query: "dinner party table" },
  { id: "flowers", label: "Flowers", query: "flowers botanical" },
] as const;

function referralUrl(value: string): string {
  try {
    const url = new URL(value);
    url.searchParams.set("utm_source", "gather");
    url.searchParams.set("utm_medium", "referral");
    return url.toString();
  } catch {
    return value;
  }
}

async function requestStockImages({
  query,
  orientation,
  page,
  signal,
}: {
  query: string;
  orientation: StockImageOrientation;
  page: number;
  signal?: AbortSignal;
}): Promise<StockImagePage> {
  const params = new URLSearchParams({
    query,
    orientation,
    page: String(page),
  });
  const response = await fetch(`/api/stock-images?${params}`, { signal });
  const result = (await response.json()) as StockImagePage & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(result.error || "Could not load stock photos.");
  }
  return result;
}

export function ToolImagesPanel({
  onAddImageSrc,
}: {
  onAddImageSrc: (src: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("events");
  const [orientation, setOrientation] =
    useState<StockImageOrientation>("all");
  const [photos, setPhotos] = useState<StockImage[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const categoryRailRef = useRef<HTMLDivElement>(null);

  const category =
    STOCK_CATEGORIES.find((item) => item.id === categoryId) ??
    STOCK_CATEGORIES[0];
  const searchTerm = query.trim() || category.query;

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(
      () => {
        setLoading(true);
        setError(null);
        void requestStockImages({
          query: searchTerm,
          orientation,
          page: 1,
          signal: controller.signal,
        })
          .then((result) => {
            setPhotos(result.photos);
            setPage(1);
            setHasMore(result.hasMore);
          })
          .catch((requestError: unknown) => {
            if (
              requestError instanceof DOMException &&
              requestError.name === "AbortError"
            ) {
              return;
            }
            setPhotos([]);
            setHasMore(false);
            setError(
              requestError instanceof Error
                ? requestError.message
                : "Could not load stock photos.",
            );
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
          });
      },
      query.trim() ? 350 : 0,
    );

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [orientation, query, searchTerm]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const result = await requestStockImages({
        query: searchTerm,
        orientation,
        page: nextPage,
      });
      setPhotos((current) => {
        const existing = new Set(current.map((photo) => photo.id));
        return [
          ...current,
          ...result.photos.filter((photo) => !existing.has(photo.id)),
        ];
      });
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not load more stock photos.",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const addPhoto = async (photo: StockImage) => {
    if (addingId) return;
    setAddingId(photo.id);
    setError(null);
    try {
      const response = await fetch("/api/stock-images/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          downloadLocation: photo.downloadLocation,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(
          result.error || "Could not add this Unsplash photograph.",
        );
      }
      onAddImageSrc(photo.imageUrl);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not add this Unsplash photograph.",
      );
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="sr-only">Search stock photos</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Unsplash photos…"
          className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
        />
      </label>

      {!query.trim() && (
        <div className="relative">
          <div
            ref={categoryRailRef}
            className="flex gap-1.5 overflow-x-auto pb-1 pr-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {STOCK_CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategoryId(item.id)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                  categoryId === item.id
                    ? "bg-black text-white"
                    : "bg-soft-grey text-grey hover:text-black"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              categoryRailRef.current?.scrollBy({
                left: 160,
                behavior: "smooth",
              })
            }
            className="absolute -right-1 top-1/2 flex h-7 w-7 -translate-y-[55%] items-center justify-center rounded-full border border-black/10 bg-white text-grey shadow-sm transition-colors hover:text-black"
            aria-label="Show more image categories"
          >
            ›
          </button>
        </div>
      )}

      <div className="flex gap-1 rounded-xl bg-soft-grey p-1">
        {(
          [
            ["all", "All"],
            ["landscape", "Wide"],
            ["portrait", "Tall"],
            ["squarish", "Square"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setOrientation(id)}
            className={`flex-1 rounded-lg px-1.5 py-1.5 text-[11px] font-semibold transition-colors ${
              orientation === id
                ? "bg-white text-black shadow-sm"
                : "text-grey hover:text-black"
            }`}
            aria-pressed={orientation === id}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-2" aria-label="Loading photos">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/3] animate-pulse rounded-xl bg-soft-grey"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <EmptyHint>
          No photos found for “{searchTerm}”. Try another search.
        </EmptyHint>
      ) : (
        <div className="grid grid-cols-2 items-start gap-2">
          {photos.map((photo) => (
            <article
              key={photo.id}
              className="overflow-hidden rounded-xl border border-black/8 bg-white"
            >
              <button
                type="button"
                onClick={() => void addPhoto(photo)}
                disabled={addingId !== null}
                className="group relative block aspect-[4/3] w-full overflow-hidden bg-soft-grey disabled:cursor-wait"
                title={`Add photo by ${photo.photographer.name}`}
              >
                {/* Unsplash requires use of the returned hotlinked image URL. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.description}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-x-2 bottom-2 rounded-full bg-black/70 px-2 py-1 text-center text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {addingId === photo.id ? "Adding…" : "Add photo"}
                </span>
              </button>
              <p className="truncate px-2 py-1.5 text-[9px] text-grey">
                Photo by{" "}
                <a
                  href={referralUrl(photo.photographer.profileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-black hover:underline"
                >
                  {photo.photographer.name}
                </a>{" "}
                on{" "}
                <a
                  href={referralUrl(photo.photoUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-black hover:underline"
                >
                  Unsplash
                </a>
              </p>
            </article>
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <button
          type="button"
          onClick={() => void loadMore()}
          disabled={loadingMore}
          className="w-full rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold text-black hover:border-signature/35 disabled:cursor-wait disabled:text-grey"
        >
          {loadingMore ? "Loading…" : "Show more photos"}
        </button>
      )}

      <p className="text-center text-[10px] text-grey">
        Photos provided by{" "}
        <a
          href="https://unsplash.com/?utm_source=gather&utm_medium=referral"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-black hover:underline"
        >
          Unsplash
        </a>
      </p>
    </div>
  );
}

const UPLOADS_KEY = "gather.editor.uploads";

export type UploadRecord = {
  id: string;
  name: string;
  url: string;
  path?: string;
  kind: "image" | "video" | "audio";
  createdAt: number;
};

function dedupeUploads(items: UploadRecord[]): UploadRecord[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function loadUploads(): UploadRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(UPLOADS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    const uploads = dedupeUploads(
      (parsed as UploadRecord[]).filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          typeof item.url === "string" &&
          !item.url.startsWith("blob:"),
      ),
    );
    if (uploads.length !== parsed.length) {
      window.localStorage.setItem(UPLOADS_KEY, JSON.stringify(uploads));
    }
    return uploads;
  } catch {
    return [];
  }
}

function saveUploads(items: UploadRecord[]) {
  window.localStorage.setItem(
    UPLOADS_KEY,
    JSON.stringify(dedupeUploads(items).slice(0, 40)),
  );
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
  // Empty on SSR; subscribeUploads hydrates from localStorage after mount
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [filter, setFilter] = useState<"image" | "video" | "audio" | "all">(
    "all",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => subscribeUploads(setUploads), []);

  const filtered = uploads.filter(
    (item) => filter === "all" || item.kind === filter,
  );

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const results = await Promise.allSettled(
        Array.from(files).map(async (file): Promise<UploadRecord> => {
          const body = new FormData();
          body.append("file", file);
          const response = await fetch("/api/uploads", {
            method: "POST",
            body,
          });
          const result = (await response.json()) as {
            upload?: UploadRecord;
            error?: string;
          };
          if (!response.ok || !result.upload) {
            throw new Error(result.error || `Could not upload ${file.name}.`);
          }
          return result.upload;
        }),
      );
      const next = results
        .filter(
          (result): result is PromiseFulfilledResult<UploadRecord> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);
      const failures = results.filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      );

      if (next.length === 0) {
        throw failures[0]?.reason instanceof Error
          ? failures[0].reason
          : new Error("The upload could not be saved.");
      }

      const merged = dedupeUploads([...next, ...loadUploads()]);
      saveUploads(merged);
      setUploads(merged);
      notifyUploadsChanged();
      const firstImage = next.find((item) => item.kind === "image");
      if (firstImage) onAddImageSrc(firstImage.url);
      if (failures.length > 0) {
        setUploadError(
          `${next.length} saved, but ${failures.length} ${
            failures.length === 1 ? "file" : "files"
          } could not be uploaded.`,
        );
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "The upload could not be saved.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const onDelete = (id: string) => {
    setUploads(removeUpload(id));
  };

  return (
    <div className="space-y-5">
      <label
        className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-soft-grey/50 px-4 py-10 text-center transition-colors ${
          isUploading
            ? "cursor-wait opacity-65"
            : "cursor-pointer hover:border-signature/40"
        }`}
      >
        <span className="text-sm font-semibold text-black">
          {isUploading ? "Saving uploads…" : "Upload files"}
        </span>
        <span className="mt-1 text-xs text-grey">
          {isUploading
            ? "Your files are being stored securely"
            : "Images, video, or audio · up to 25 MB"}
        </span>
        <input
          type="file"
          accept="image/*,video/*,audio/*"
          multiple
          disabled={isUploading}
          className="hidden"
          onChange={(event) => {
            const files = event.currentTarget.files;
            void onFiles(files);
            event.currentTarget.value = "";
          }}
        />
      </label>

      {uploadError && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {uploadError}
        </p>
      )}

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
  onChangeTexture,
  onChangeBorder,
}: {
  page: InvitationPage;
  onChangeBackground: (color: string) => void;
  onChangePattern: (
    pattern: NonNullable<InvitationPage["backgroundPattern"]>,
  ) => void;
  onChangeTexture: (
    patch: Partial<
      Pick<
        InvitationPage,
        | "backgroundTexture"
        | "backgroundTextureOpacity"
        | "backgroundTextureTint"
        | "backgroundTextureBlend"
      >
    >,
  ) => void;
  onChangeBorder: (border: InvitationPage["border"]) => void;
}) {
  const border = page.border;
  const texture = page.backgroundTexture || "none";

  return (
    <div className="space-y-5">
      <ColourField
        label="Colours"
        value={page.backgroundColor}
        onChange={onChangeBackground}
      />

      <PanelSection title="Paper texture">
        <div className="grid grid-cols-2 gap-2">
          {PAPER_TEXTURES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTexture({ backgroundTexture: item.id })}
              className={`overflow-hidden rounded-xl border text-left transition-colors ${
                texture === item.id
                  ? "border-signature ring-2 ring-signature/15"
                  : "border-black/10 hover:border-signature/35"
              }`}
            >
              <span
                className="relative block h-14 overflow-hidden"
                style={{ backgroundColor: page.backgroundColor }}
              >
                {item.id !== "none" && (
                  <span
                    className="absolute inset-0"
                    style={paperTextureLayerStyle({
                      texture: item.id,
                      opacity: Math.max(
                        34,
                        page.backgroundTextureOpacity ?? 22,
                      ),
                      tint: page.backgroundTextureTint || "#ffffff",
                      blend: page.backgroundTextureBlend || "soft-light",
                    })}
                  />
                )}
              </span>
              <span className="block border-t border-black/5 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-black">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {texture !== "none" && (
          <div className="mt-4 space-y-4">
            <ThinSlider
              label="Intensity"
              value={page.backgroundTextureOpacity ?? 22}
              min={4}
              max={65}
              step={1}
              display={`${page.backgroundTextureOpacity ?? 22}%`}
              onChange={(backgroundTextureOpacity) =>
                onChangeTexture({ backgroundTextureOpacity })
              }
            />

            <ColourField
              label="Texture tint"
              value={page.backgroundTextureTint || "#ffffff"}
              onChange={(backgroundTextureTint) =>
                onChangeTexture({ backgroundTextureTint })
              }
            />

            <div>
              <p className="mb-2 text-[11px] font-medium tracking-wide text-grey">
                Blend
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {PAPER_TEXTURE_BLENDS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      onChangeTexture({ backgroundTextureBlend: item.id })
                    }
                    className={`rounded-xl border px-2 py-2 text-[11px] font-semibold ${
                      (page.backgroundTextureBlend || "soft-light") === item.id
                        ? "border-signature bg-signature/10 text-signature"
                        : "border-black/10 text-black hover:bg-soft-grey"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-grey">
              The paper sits above the card colour, so recolouring the card
              keeps the same tactile surface.
            </p>
          </div>
        )}
      </PanelSection>

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
            <label className="block">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-medium tracking-wide text-grey">
                  Border width
                </span>
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
            <ColourField
              label="Border colour"
              value={border.color}
              onChange={(color) => onChangeBorder({ ...border, color })}
            />
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
