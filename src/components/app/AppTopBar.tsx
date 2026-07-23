import Link from "next/link";
import { Button, PlusIcon } from "@/components/ui/Button";
import type { User } from "@/lib/data/types";
import { BellIcon, SearchIcon } from "./icons";

interface AppTopBarProps {
  user: User;
}

/** Search + create actions for the editor chrome */
export function AppTopBar({ user }: AppTopBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block w-full max-w-md">
        <span className="sr-only">Search invitations</span>
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-grey">
          <SearchIcon className="h-4 w-4" />
        </span>
        <input
          type="search"
          name="q"
          placeholder="Search invitations..."
          className="w-full rounded-full border border-black/10 bg-white/90 py-2.5 pl-10 pr-4 text-sm text-black shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-colors placeholder:text-grey focus:border-signature/40 focus:bg-white focus:ring-2 focus:ring-signature/20"
          aria-label="Search invitations"
        />
      </label>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-grey transition-colors hover:bg-white hover:text-black"
          aria-label="Notifications"
        >
          <BellIcon />
        </button>
        <Button href="/invitations/new" size="sm">
          <PlusIcon />
          Create Invitation
        </Button>
        <span className="sr-only">Signed in as {user.firstName}</span>
      </div>
    </div>
  );
}

/** Lightweight placeholder for routes that are not built yet */
export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-signature">
        Coming soon
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-black">
        {title}
      </h1>
      <p className="mt-3 max-w-lg text-base text-grey">{description}</p>
      <Link
        href="/home"
        className="mt-8 text-sm font-semibold text-signature transition-opacity hover:opacity-80"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
