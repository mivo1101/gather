"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { User } from "@/lib/data/types";
import { getGreeting } from "@/lib/data/user-utils";
import { AppTopBar } from "./AppTopBar";
import { HubSearchProvider } from "./HubSearchContext";
import { HomeIcon, TemplatesIcon } from "./icons";

export type HubTab = "home" | "templates";

const tabs: {
  id: HubTab;
  label: string;
  href: string;
  icon: typeof HomeIcon;
}[] = [
  { id: "home", label: "Home", href: "/home", icon: HomeIcon },
  {
    id: "templates",
    label: "Templates",
    href: "/templates",
    icon: TemplatesIcon,
  },
];

const copy: Record<
  HubTab,
  { subtitle: string; searchPlaceholder: string }
> = {
  home: {
    subtitle: "Create, manage and share beautiful invitations.",
    searchPlaceholder: "Search invitations...",
  },
  templates: {
    subtitle: "Browse designs by event — weddings, birthdays, and more.",
    searchPlaceholder: "Search templates...",
  },
};

interface HomeHubProps {
  user: User;
  greeting: string;
  active: HubTab;
  children: ReactNode;
}

/** Shared Home / Templates chrome: greeting, underline tabs, search bar. */
export function HomeHub({ user, greeting, active, children }: HomeHubProps) {
  const { subtitle, searchPlaceholder } = copy[active];
  const [localGreeting, setLocalGreeting] = useState(greeting);

  useEffect(() => {
    const updateGreeting = () => setLocalGreeting(getGreeting());
    updateGreeting();
    const interval = window.setInterval(updateGreeting, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <HubSearchProvider>
      <div className="flex flex-col gap-8">
        <header className="animate-fade-up">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-black md:text-4xl">
                {localGreeting}, {user.firstName}{" "}
                <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-2 text-base text-grey">{subtitle}</p>
            </div>

            <div className="w-full xl:max-w-[42rem] xl:pt-0.5">
              <AppTopBar
                user={user}
                searchPlaceholder={searchPlaceholder}
              />
            </div>
          </div>

          <nav
            className="mt-6 flex items-end gap-1 border-b border-black/8"
            aria-label="Browse"
          >
            {tabs.map((tab) => {
              const isActive = tab.id === active;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative -mb-px inline-flex items-center gap-2 px-3.5 pb-3 pt-1 text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-black"
                      : "text-grey hover:text-black"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-signature" : "text-grey"
                    }`}
                  />
                  {tab.label}
                  {isActive && (
                    <span
                      className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-signature"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </header>

        <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          {children}
        </div>
      </div>
    </HubSearchProvider>
  );
}
