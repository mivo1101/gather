"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { signOutAction } from "@/lib/actions/auth";
import type { User } from "@/lib/data/types";
import { getDisplayName } from "@/lib/data/user-utils";
import {
  BrandKitIcon,
  CloseIcon,
  GuestsIcon,
  HomeIcon,
  InsightsIcon,
  InvitationsIcon,
  MenuIcon,
  SettingsIcon,
  TemplatesIcon,
} from "./icons";

const navItems = [
  { label: "Home", href: "/home", icon: HomeIcon },
  { label: "Invitations", href: "/invitations", icon: InvitationsIcon },
  { label: "Templates", href: "/templates", icon: TemplatesIcon },
  { label: "Guests", href: "/guests", icon: GuestsIcon },
  { label: "Insights", href: "/insights", icon: InsightsIcon },
  { label: "Brand Kit", href: "/brand-kit", icon: BrandKitIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
] as const;

interface AppSidebarProps {
  user: User;
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-sugar-milk text-black"
                  : "text-grey hover:bg-soft-grey hover:text-black"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-signature"
                  aria-hidden="true"
                />
              )}
              <span
                className={
                  active ? "text-signature" : "text-grey group-hover:text-black"
                }
              >
                <Icon />
              </span>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function UserChip({ user }: { user: User }) {
  const name = getDisplayName(user);
  const initials =
    `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() ||
    "?";

  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2">
      {user.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-signature"
          aria-hidden="true"
        >
          {initials}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-black">{name}</p>
        <p className="truncate text-xs text-grey">{user.email}</p>
      </div>
    </div>
  );
}

function SidebarPanel({
  user,
  pathname,
  onNavigate,
}: {
  user: User;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <Logo href="/home" />
      </div>

      <nav className="flex-1 px-3" aria-label="App navigation">
        <NavLinks pathname={pathname} onNavigate={onNavigate} />
      </nav>

      <div className="mt-auto border-t border-black/5 px-3 py-4">
        <div className="mb-3 rounded-2xl bg-sugar-milk px-4 py-4">
          <p className="text-sm font-semibold text-black">Upgrade to Pro</p>
          <p className="mt-1 text-xs leading-relaxed text-grey">
            Unlock more templates, guests, and insights.
          </p>
          <Link
            href="/settings"
            onClick={onNavigate}
            className="mt-3 inline-flex text-sm font-semibold text-signature transition-opacity hover:opacity-80"
          >
            Upgrade Now →
          </Link>
        </div>
        <UserChip user={user} />
        <form action={signOutAction} className="mt-1 px-1">
          <button
            type="submit"
            className="w-full rounded-xl px-2 py-2 text-left text-xs font-medium text-grey transition-colors hover:bg-soft-grey hover:text-black"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

/** Fixed left navigation for the signed-in editor */
export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-black/5 bg-white lg:block">
        <SidebarPanel user={user} pathname={pathname} />
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-black/5 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <Logo href="/home" />
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-black hover:bg-soft-grey"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-white shadow-xl">
            <div className="flex justify-end px-3 pt-3">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-soft-grey"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
              >
                <CloseIcon />
              </button>
            </div>
            <SidebarPanel
              user={user}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}
