"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  Invitation,
  InvitationSort,
  InvitationStatusFilter,
} from "@/lib/data/types";
import { ChevronDownIcon } from "./icons";
import { InvitationCard } from "./InvitationCard";

interface RecentInvitationsProps {
  invitations: Invitation[];
}

const statusOptions: { value: InvitationStatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const sortOptions: { value: InvitationSort; label: string }[] = [
  { value: "updated_desc", label: "Last edited" },
  { value: "updated_asc", label: "Oldest edited" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "event_asc", label: "Event date" },
];

function sortList(list: Invitation[], sort: InvitationSort): Invitation[] {
  const next = [...list];
  switch (sort) {
    case "updated_asc":
      return next.sort(
        (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      );
    case "title_asc":
      return next.sort((a, b) => a.title.localeCompare(b.title));
    case "event_asc":
      return next.sort((a, b) => {
        if (!a.eventDate && !b.eventDate) return 0;
        if (!a.eventDate) return 1;
        if (!b.eventDate) return -1;
        return (
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        );
      });
    case "updated_desc":
    default:
      return next.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }
}

/** Recent invitations grid with client-side status filter and sort */
export function RecentInvitations({ invitations }: RecentInvitationsProps) {
  const [status, setStatus] = useState<InvitationStatusFilter>("all");
  const [sort, setSort] = useState<InvitationSort>("updated_desc");

  const visible = useMemo(() => {
    const filtered =
      status === "all"
        ? invitations
        : invitations.filter((invitation) => invitation.status === status);
    return sortList(filtered, sort);
  }, [invitations, status, sort]);

  return (
    <section aria-labelledby="recent-invitations-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="recent-invitations-heading"
            className="text-xl font-semibold tracking-tight text-black"
          >
            Recent invitations
          </h2>
          <p className="mt-1 text-sm text-grey">
            Pick up where you left off, or jump back into a draft.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="relative inline-flex items-center">
            <span className="sr-only">Filter by status</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as InvitationStatusFilter)
              }
              className="appearance-none rounded-full border border-black/10 bg-white/90 py-2 pl-3.5 pr-9 text-sm font-medium text-black shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-colors hover:border-black/20 focus-visible:ring-2 focus-visible:ring-signature/40"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 text-grey">
              <ChevronDownIcon />
            </span>
          </label>

          <label className="relative inline-flex items-center">
            <span className="sr-only">Sort invitations</span>
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as InvitationSort)
              }
              className="appearance-none rounded-full border border-black/10 bg-white/90 py-2 pl-3.5 pr-9 text-sm font-medium text-black shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-colors hover:border-black/20 focus-visible:ring-2 focus-visible:ring-signature/40"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 text-grey">
              <ChevronDownIcon />
            </span>
          </label>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
          <p className="text-base font-semibold text-black">No invitations yet</p>
          <p className="mt-2 text-sm text-grey">
            Create your first invitation to see it here.
          </p>
          <Link
            href="/invitations/new"
            className="mt-6 inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black/90"
          >
            + Create Invitation
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((invitation) => (
            <InvitationCard key={invitation.id} invitation={invitation} />
          ))}
        </div>
      )}
    </section>
  );
}
