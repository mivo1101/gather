const categories = [
  {
    name: "Weddings",
    description: "Elegant designs for your special day",
    gradient: "from-rose-100 to-pink-50",
    accent: "#FF60AA",
    icon: "wedding",
  },
  {
    name: "Birthdays",
    description: "Celebrate another year in style",
    gradient: "from-amber-100 to-orange-50",
    accent: "#F59E0B",
    icon: "birthday",
  },
  {
    name: "Baby & showers",
    description: "Baby showers, reveals, and naming days",
    gradient: "from-sky-100 to-cyan-50",
    accent: "#38BDF8",
    icon: "baby",
  },
  {
    name: "Corporate Events",
    description: "Professional invitations that impress",
    gradient: "from-slate-100 to-gray-50",
    accent: "#64748B",
    icon: "corporate",
  },
  {
    name: "Dinner & gatherings",
    description: "Intimate dinners and house parties",
    gradient: "from-stone-100 to-amber-50",
    accent: "#A47551",
    icon: "dinner",
  },
  {
    name: "Start from blank",
    description: "Build something completely your own",
    gradient: "from-pink-50 to-rose-100",
    accent: "#FF60AA",
    icon: "blank",
  },
] as const;

type CategoryIcon = (typeof categories)[number]["icon"];

function EventIcon({ type, color }: { type: CategoryIcon; color: string }) {
  const common = {
    viewBox: "0 0 40 40",
    className: "ml-auto h-10 w-10 opacity-40",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (type) {
    case "wedding":
      return (
        <svg {...common}>
          <circle cx="15" cy="22" r="7" />
          <circle cx="25" cy="22" r="7" />
        </svg>
      );
    case "birthday":
      return (
        <svg {...common}>
          <path d="M8 18h24v14a2 2 0 01-2 2H10a2 2 0 01-2-2V18z" />
          <path d="M8 24h24M14 18v-3M20 18v-3M26 18v-3" />
          <path d="M14 12c0-1.5.8-2.5 2-3.5M20 12c0-1.5.8-2.5 2-3.5M26 12c0-1.5.8-2.5 2-3.5" />
          <circle cx="14" cy="8" r="1.2" fill={color} stroke="none" />
          <circle cx="20" cy="8" r="1.2" fill={color} stroke="none" />
          <circle cx="26" cy="8" r="1.2" fill={color} stroke="none" />
        </svg>
      );
    case "corporate":
      return (
        <svg {...common}>
          <rect x="8" y="10" width="24" height="22" rx="1.5" />
          <path d="M14 32V10M26 32V10M8 18h24M8 24h24" />
          <path d="M17 32v-4h6v4" />
        </svg>
      );
    case "baby":
      return (
        <svg {...common}>
          <circle cx="20" cy="14" r="7" />
          <path d="M13 14h14" />
          <path d="M20 21v5M14 32c0-4 2.5-6 6-6s6 2 6 6" />
          <circle cx="17.5" cy="13" r="1" fill={color} stroke="none" />
          <circle cx="22.5" cy="13" r="1" fill={color} stroke="none" />
        </svg>
      );
    case "dinner":
      return (
        <svg {...common}>
          <circle cx="20" cy="21" r="10" />
          <circle cx="20" cy="21" r="5" />
          <path d="M7 7v12M4 7v6c0 2 1.3 3 3 3s3-1 3-3V7M33 7v26M29 7c0 6 1 9 4 9" />
        </svg>
      );
    case "blank":
      return (
        <svg {...common}>
          <rect x="8" y="6" width="24" height="28" rx="2" strokeDasharray="3 3" />
          <path d="M20 14v12M14 20h12" />
        </svg>
      );
  }
}

/** Placeholder invitation card illustration */
function TemplateIllustration({
  accent,
  icon,
}: {
  accent: string;
  icon: CategoryIcon;
}) {
  return (
    <div className="relative h-full w-full p-4" aria-hidden="true">
      <div className="flex h-full flex-col justify-between rounded-lg bg-white/80 p-3 shadow-sm">
        <div>
          <div
            className="h-1.5 w-8 rounded-full"
            style={{ backgroundColor: accent }}
          />
          <div className="mt-2 h-2 w-16 rounded-full bg-black/10" />
          <div className="mt-1 h-2 w-12 rounded-full bg-black/5" />
        </div>
        <EventIcon type={icon} color={accent} />
      </div>
    </div>
  );
}

export function TemplatePreview() {
  return (
    <section id="templates" className="bg-sugar-milk py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black md:text-4xl">
            Templates for every occasion
          </h2>
          <p className="mt-4 text-base text-grey">
            Choose from a growing library of beautifully crafted invitation templates,
            or create your own from scratch.
          </p>
        </div>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.name}>
              <a
                href="/signin"
                className="group block overflow-hidden rounded-2xl border border-black/5 bg-white transition-all hover:border-signature/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signature focus-visible:ring-offset-2"
              >
                <div
                  className={`aspect-[4/3] bg-gradient-to-br ${category.gradient}`}
                >
                  <TemplateIllustration
                    accent={category.accent}
                    icon={category.icon}
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-black transition-colors group-hover:text-signature">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-grey">
                    {category.description}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
