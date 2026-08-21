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
  BellIcon,
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

const panelShadow =
  "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]";

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
    <ul className="flex flex-col gap-0.5">
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

function NavPanel({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-black/[0.04] bg-white ${panelShadow}`}
    >
      <div className="shrink-0 px-4 py-5">
        <Logo href="/home" />
      </div>
      <nav
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-4"
        aria-label="App navigation"
      >
        <NavLinks pathname={pathname} onNavigate={onNavigate} />
      </nav>
    </div>
  );
}

function AccountPanel({
  user,
  onNavigate,
}: {
  user: User;
  onNavigate?: () => void;
}) {
  return (
    <div
      className={`shrink-0 rounded-2xl border border-black/[0.04] bg-white px-3 py-3 ${panelShadow}`}
    >
      <div className="mb-2 rounded-xl bg-sugar-milk px-3.5 py-3.5">
        <p className="text-sm font-semibold text-black">Upgrade to Pro</p>
        <p className="mt-1 text-xs leading-relaxed text-grey">
          Unlock more templates, guests, and insights.
        </p>
        <Link
          href="/settings"
          onClick={onNavigate}
          className="mt-2.5 inline-flex text-sm font-semibold text-signature transition-opacity hover:opacity-80"
        >
          Upgrade Now →
        </Link>
      </div>
      <UserChip user={user} />
      <form action={signOutAction} className="mt-0.5 px-1">
        <button
          type="submit"
          className="w-full rounded-xl px-2 py-2 text-left text-xs font-medium text-grey transition-colors hover:bg-soft-grey hover:text-black"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

/** Fixed left navigation for the signed-in editor */
export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17.5rem] flex-col gap-3 p-3 lg:flex">
        <NavPanel pathname={pathname} />
        <AccountPanel user={user} />
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-black/5 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo href="/home" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-grey transition-colors hover:bg-soft-grey hover:text-black"
            aria-label="Notifications"
          >
            <BellIcon />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-black hover:bg-soft-grey"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col gap-3 bg-soft-grey p-3 shadow-xl">
            <div className="flex justify-end">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white hover:bg-soft-grey"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
              >
                <CloseIcon />
              </button>
            </div>
            <NavPanel
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
            <AccountPanel
              user={user}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}
