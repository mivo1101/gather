"use client";

import { useEffect, useId } from "react";
import type { CanvasElement } from "@/lib/data/canvas-elements";
import type { InvitationPage } from "@/lib/data/invitation-content";
import { InteractiveRsvpPanel } from "@/components/invitation/InteractiveRsvpPanel";
import { LocationMapPanel } from "@/components/invitation/LocationMapPanel";
import { CanvasImageContent, cardAspectRatio } from "./CanvasImageContent";
import { CloseIcon, DesktopIcon, MobileIcon } from "./editor-icons";
import { ShapeGraphic } from "./ShapeGraphic";
import type {
  CustomCanvasSize,
  InvitationShape,
  PreviewDevice,
} from "./editor-types";

function fontFamilyClass(family: CanvasElement["style"]["fontFamily"]) {
  switch (family) {
    case "caveat":
      return "font-[family-name:var(--font-cursive)]";
    case "urbanist":
      return "font-sans";
    default:
      return "font-[family-name:var(--font-playfair)]";
  }
}

function inviteSlug(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") || "preview"
  );
}

function PreviewInvitation({
  elements,
  backgroundColor,
  shape,
  customSize,
}: {
  elements: CanvasElement[];
  backgroundColor: string;
  shape: InvitationShape;
  customSize?: CustomCanvasSize;
}) {
  const aspect = cardAspectRatio(shape, customSize);

  return (
    <div
      className="relative w-full overflow-hidden bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
      style={{
        backgroundColor,
        aspectRatio: String(aspect),
      }}
    >
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: `${el.width}%`,
            height: el.height ? `${el.height}%` : undefined,
            transform: `rotate(${el.rotation}deg)`,
          }}
        >
          {el.type === "text" && (
            <div
              className={`whitespace-pre-wrap break-words ${fontFamilyClass(el.style.fontFamily)}`}
              style={{
                fontSize: `${Math.max(7, el.style.fontSize * 0.72)}px`,
                fontWeight:
                  el.style.bold || el.style.fontWeight === "bold" ? 700 : 400,
                color: el.style.color,
                textAlign: el.style.textAlign,
                lineHeight: el.style.lineHeight,
                letterSpacing: `${el.style.letterSpacing}px`,
                fontStyle: el.style.italic ? "italic" : "normal",
              }}
            >
              {el.content}
            </div>
          )}
          {el.type === "image" && (
            <CanvasImageContent
              src={el.content}
              color={el.style.color}
              frame={el.style.frame}
              className="relative h-full min-h-[20px] w-full"
            />
          )}
          {el.type === "shape" && (
            <ShapeGraphic kind={el.content} color={el.style.color} />
          )}
          {el.type === "divider" && (
            <div
              className="h-0.5 w-full rounded-full"
              style={{ backgroundColor: el.style.color }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function IPhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[min(100%,280px)]">
      <div className="relative rounded-[2.6rem] bg-[#1c1c1e] p-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
        <span className="absolute -left-[2px] top-[100px] h-7 w-[3px] rounded-l-sm bg-[#2c2c2e]" />
        <span className="absolute -left-[2px] top-[140px] h-12 w-[3px] rounded-l-sm bg-[#2c2c2e]" />
        <span className="absolute -left-[2px] top-[200px] h-12 w-[3px] rounded-l-sm bg-[#2c2c2e]" />
        <span className="absolute -right-[2px] top-[160px] h-16 w-[3px] rounded-r-sm bg-[#2c2c2e]" />

        <div className="relative overflow-hidden rounded-[2.1rem] bg-[#f6f4f1]">
          <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center">
            <div className="h-[22px] w-[90px] rounded-full bg-black" />
          </div>
          <div className="flex min-h-[520px] flex-col px-3 pb-6 pt-10">
            <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-grey">
              Your invitation
            </p>
            <div className="flex flex-1 items-start justify-center overflow-y-auto">
              {children}
            </div>
            <div className="mx-auto mt-4 h-1 w-28 rounded-full bg-black/20" />
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-xs font-semibold text-white/70">
        iPhone
      </p>
    </div>
  );
}

function MacBookFrame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const slug = inviteSlug(title);

  return (
    <div className="mx-auto w-full max-w-[820px]">
      <div className="rounded-t-[1.1rem] bg-[#2b2b2d] p-[12px] pb-3 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="relative overflow-hidden rounded-[0.55rem] bg-[#ebe7e2]">
          <div className="flex items-center gap-2 border-b border-black/5 bg-white/90 px-3 py-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <div className="ml-2 flex-1 truncate rounded-md bg-soft-grey px-3 py-1 text-center text-[10px] font-medium text-grey">
              {`gather.app/invite/${slug}`}
            </div>
          </div>
          <div className="flex min-h-[360px] items-center justify-center px-8 py-8">
            <div className="w-full max-w-[240px]">{children}</div>
          </div>
        </div>
      </div>
      <div className="relative mx-auto h-3 w-[102%] max-w-none -translate-x-[1%] rounded-b-xl bg-gradient-to-b from-[#c8c8cc] to-[#a8a8ad]">
        <div className="absolute inset-x-[28%] top-0 h-[3px] rounded-b-md bg-[#9a9a9e]" />
      </div>
      <div className="mx-auto h-2 w-[108%] max-w-none -translate-x-[4%] rounded-b-2xl bg-[#b0b0b4]" />
      <p className="mt-4 text-center text-xs font-semibold text-white/70">
        MacBook
      </p>
    </div>
  );
}

interface EditorPreviewModalProps {
  open: boolean;
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  pages: InvitationPage[];
  activePageId: string;
  title: string;
  shape: InvitationShape;
  customSize: CustomCanvasSize;
  rsvp?: { prompt: string; note: string };
  onClose: () => void;
}

export function EditorPreviewModal({
  open,
  device,
  onDeviceChange,
  pages,
  activePageId,
  title,
  shape,
  customSize,
  rsvp,
  onClose,
}: EditorPreviewModalProps) {
  const titleId = useId();
  const activePage =
    pages.find((page) => page.id === activePageId) ?? pages[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !activePage) return null;

  const card =
    activePage.kind === "rsvp" ? (
      <div className="aspect-[9/16] w-full overflow-hidden bg-white">
        <InteractiveRsvpPanel
          config={activePage.rsvpConfig}
          prompt={rsvp?.prompt}
          note={rsvp?.note}
          interactive
          className="h-full w-full"
        />
      </div>
    ) : activePage.kind === "location" && activePage.location ? (
      <div className="aspect-[9/16] w-full overflow-hidden bg-white">
        <LocationMapPanel
          location={activePage.location}
          className="h-full w-full"
        />
      </div>
    ) : (
      <PreviewInvitation
        elements={activePage.elements}
        backgroundColor={activePage.backgroundColor || "#fff8f4"}
        shape={shape}
        customSize={customSize}
      />
    );

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-[#1a1a1c]/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-signature">
            Preview
          </p>
          <h2 id={titleId} className="truncate text-sm font-semibold text-white">
            {title}
          </h2>
        </div>

        <div className="flex rounded-xl bg-white/10 p-1">
          <button
            type="button"
            onClick={() => onDeviceChange("desktop")}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
              device === "desktop"
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:text-white"
            }`}
            aria-pressed={device === "desktop"}
          >
            <DesktopIcon />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange("mobile")}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
              device === "mobile"
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:text-white"
            }`}
            aria-pressed={device === "mobile"}
          >
            <MobileIcon />
            Mobile
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Close preview"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto px-4 py-8 sm:px-8">
        {device === "mobile" ? (
          <IPhoneFrame>{card}</IPhoneFrame>
        ) : device === "desktop" ? (
          <MacBookFrame title={title}>{card}</MacBookFrame>
        ) : (
          <div className="flex h-full w-full max-w-5xl items-center justify-center">
            <div
              className="w-full"
              style={{
                maxWidth:
                  shape === "landscape"
                    ? "min(92vw, 900px)"
                    : shape === "square"
                      ? "min(70vh, 520px)"
                      : "min(52vh, 420px)",
              }}
            >
              {card}
            </div>
          </div>
        )}
      </div>

      {pages.length > 1 && (
        <div className="shrink-0 border-t border-white/10 px-4 py-3 text-center text-xs text-white/50">
          Previewing{" "}
          {activePage.name ||
            `page ${pages.findIndex((p) => p.id === activePage.id) + 1}`}{" "}
          of {pages.length}
        </div>
      )}
    </div>
  );
}
