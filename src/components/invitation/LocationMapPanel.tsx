"use client";

import {
  googleMapsEmbedUrl,
  googleMapsOpenUrl,
  type InvitationLocation,
} from "@/lib/data/invitation-content";

interface LocationMapPanelProps {
  location: InvitationLocation;
  className?: string;
  /** When false (editor), links/map don't navigate away from the canvas. */
  interactive?: boolean;
}

/** Interactive location card with Google Maps embed + open link. */
export function LocationMapPanel({
  location,
  className = "",
  interactive = true,
}: LocationMapPanelProps) {
  const query =
    location.mapsQuery.trim() ||
    [location.venue, location.address].filter(Boolean).join(", ");
  const embedUrl = googleMapsEmbedUrl(query || "Melbourne, Australia");
  const openUrl =
    location.ctaUrl?.trim() ||
    googleMapsOpenUrl(query || "Melbourne, Australia");
  const ctaLabel = location.ctaLabel?.trim() || "Open in Google Maps";

  const ctaClassName =
    "mt-4 inline-flex items-center justify-center rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black/90";

  return (
    <div
      className={`flex h-full w-full flex-col bg-gradient-to-b from-white to-soft-grey ${className}`}
    >
      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-signature">
            Location
          </p>
          <h3 className="mt-2 text-2xl font-bold leading-tight text-black">
            {location.venue || "Venue"}
          </h3>
          {location.address ? (
            <p className="mt-2 text-sm text-grey">{location.address}</p>
          ) : null}
          <div className="mx-auto mt-2 h-0.5 w-10 bg-signature" aria-hidden="true" />
        </div>

        <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-2xl border border-black/8 bg-soft-grey shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <iframe
            title={`Map of ${location.venue || query}`}
            src={embedUrl}
            className="h-full min-h-[200px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            tabIndex={interactive ? undefined : -1}
          />
          {!interactive ? (
            <div
              className="absolute inset-0 z-10 cursor-default bg-transparent"
              aria-hidden="true"
            />
          ) : null}
        </div>

        {interactive ? (
          <a
            href={openUrl}
            target="_blank"
            rel="noreferrer"
            className={ctaClassName}
          >
            {ctaLabel}
          </a>
        ) : (
          <span className={`${ctaClassName} pointer-events-none`} aria-hidden="true">
            {ctaLabel}
          </span>
        )}
      </div>
    </div>
  );
}
