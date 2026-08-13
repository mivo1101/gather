"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "profile", label: "Profile" },
  { id: "regional", label: "Language & Region" },
  { id: "notifications", label: "Notifications" },
  { id: "account", label: "Account" },
] as const;

export function SettingsSectionNav() {
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]["id"]>(
    "profile",
  );

  useEffect(() => {
    const elements = sections
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActiveSection(
            visible[0].target.id as (typeof sections)[number]["id"],
          );
        }
      },
      { rootMargin: "-22% 0px -62% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className="sticky top-[65px] z-20 mb-6 border-b border-black/[0.07] bg-gradient-to-r from-[#fff3f8] via-[#fff6f7] to-[#fff8f4] lg:top-0"
      aria-label="Settings sections"
    >
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="-mb-px flex min-w-max gap-1 sm:gap-2">
          {sections.map(({ id, label }) => {
            const selected = activeSection === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={selected ? "location" : undefined}
                  onClick={() => setActiveSection(id)}
                  className={`inline-flex border-b-2 px-3 py-3 text-sm font-semibold transition-colors sm:px-4 ${
                    selected
                      ? "border-signature text-black"
                      : "border-transparent text-grey hover:border-black/15 hover:text-black"
                  }`}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
