"use client";

import type { InvitationLocation } from "@/lib/data/invitation-content";
import { PanelSection } from "./shared";

interface LocationEditorPanelProps {
  location: InvitationLocation;
  onChange: (location: InvitationLocation) => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-grey">
      {children}
    </span>
  );
}

export function LocationEditorPanel({
  location,
  onChange,
}: LocationEditorPanelProps) {
  const patch = (partial: Partial<InvitationLocation>) =>
    onChange({ ...location, ...partial });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-black">Location page</p>
        <p className="mt-1 text-xs text-grey">
          Venue details drive the map embed and open link.
        </p>
      </div>

      <PanelSection title="Venue">
        <div className="space-y-3">
          <label className="block">
            <FieldLabel>Name</FieldLabel>
            <input
              type="text"
              value={location.venue}
              onChange={(e) => patch({ venue: e.target.value })}
              placeholder="The Grand Pavilion"
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
            />
          </label>
          <label className="block">
            <FieldLabel>Address</FieldLabel>
            <textarea
              value={location.address}
              onChange={(e) => patch({ address: e.target.value })}
              placeholder="123 Main St, Melbourne"
              rows={3}
              className="w-full resize-y rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
            />
          </label>
        </div>
      </PanelSection>

      <PanelSection title="Map">
        <div className="space-y-3">
          <label className="block">
            <FieldLabel>Maps search query</FieldLabel>
            <input
              type="text"
              value={location.mapsQuery}
              onChange={(e) => patch({ mapsQuery: e.target.value })}
              placeholder="Venue name, city"
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
            />
          </label>
          <p className="text-xs leading-relaxed text-grey">
            Used for the Google Maps embed and “Open in Google Maps” link. Leave
            blank to combine venue + address.
          </p>
          <button
            type="button"
            onClick={() =>
              patch({
                mapsQuery: [location.venue, location.address]
                  .map((part) => part.trim())
                  .filter(Boolean)
                  .join(", "),
              })
            }
            className="text-xs font-semibold text-signature hover:underline"
          >
            Fill from venue + address
          </button>
        </div>
      </PanelSection>
    </div>
  );
}
