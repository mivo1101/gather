import Link from "next/link";

export type EventHubTabId = "overview" | "guests" | "email" | "rsvps";

const TABS: { id: EventHubTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "guests", label: "Guests" },
  { id: "email", label: "Email" },
  { id: "rsvps", label: "RSVPs" },
];

export function parseEventHubTab(raw: string | undefined): EventHubTabId {
  if (raw === "guests" || raw === "email" || raw === "rsvps") return raw;
  return "overview";
}

interface EventHubTabsProps {
  eventSlug: string;
  active: EventHubTabId;
  guestCount?: number;
  rsvpResponded?: number;
}

/** Sub-nav under the event header - one section at a time. */
export function EventHubTabs({
  eventSlug,
  active,
  guestCount,
  rsvpResponded,
}: EventHubTabsProps) {
  return (
    <nav
      className="mt-6 border-b border-black/[0.07]"
      aria-label="Event sections"
    >
      <ul className="-mb-px flex flex-wrap gap-1 sm:gap-2">
        {TABS.map((tab) => {
          const selected = tab.id === active;
          const badge =
            tab.id === "guests" && guestCount
              ? guestCount
              : tab.id === "rsvps" && typeof rsvpResponded === "number"
                ? rsvpResponded
                : null;
          return (
            <li key={tab.id}>
              <Link
                href={`/invitations/${eventSlug}?tab=${tab.id}`}
                aria-current={selected ? "page" : undefined}
                className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition-colors sm:px-4 ${
                  selected
                    ? "border-signature text-black"
                    : "border-transparent text-grey hover:border-black/15 hover:text-black"
                }`}
              >
                {tab.label}
                {badge !== null ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                      selected
                        ? "bg-black text-white"
                        : "bg-soft-grey text-grey"
                    }`}
                  >
                    {badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
