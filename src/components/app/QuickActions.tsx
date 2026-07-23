import Link from "next/link";
import {
  GuestsIcon,
  InsightsIcon,
  PlusCircleIcon,
  TemplatesIcon,
} from "./icons";

const actions = [
  {
    title: "Create Invitation",
    description: "Start from scratch",
    href: "/invitations/new",
    icon: PlusCircleIcon,
    iconWrap: "bg-[#fde8d8] text-[#c45c2a]",
  },
  {
    title: "Browse Templates",
    description: "Find the perfect design",
    href: "/templates",
    icon: TemplatesIcon,
    iconWrap: "bg-[#fce4ef] text-signature",
  },
  {
    title: "Add Guests",
    description: "Import or add your guests",
    href: "/guests",
    icon: GuestsIcon,
    iconWrap: "bg-[#e4f3ec] text-[#2f7a5b]",
  },
  {
    title: "View Insights",
    description: "Track RSVP and engagement",
    href: "/insights",
    icon: InsightsIcon,
    iconWrap: "bg-[#ffe8d6] text-[#c46a2b]",
  },
] as const;

/** Four compact shortcuts on the Home dashboard */
export function QuickActions() {
  return (
    <section aria-label="Quick actions">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center gap-4 rounded-2xl border border-black/8 bg-white/90 px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-signature/25 hover:bg-white hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)]"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.iconWrap}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-black">
                  {action.title}
                </span>
                <span className="mt-0.5 block text-xs text-grey">
                  {action.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
