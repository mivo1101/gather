"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  clearTrashAction,
  permanentlyDeleteInvitationsAction,
} from "@/lib/actions/invitations";
import {
  invitationDisplayStatus,
  type InvitationDisplayFilter,
} from "@/lib/data/invitation-status";
import type { Invitation, InvitationSort } from "@/lib/data/types";
import { BrandCheckbox } from "./BrandCheckbox";
import { CreateShortcuts } from "./CreateShortcuts";
import { useHubSearch } from "./HubSearchContext";
import { ChevronDownIcon } from "./icons";
import { InvitationCard } from "./InvitationCard";

interface RecentInvitationsProps {
  invitations: Invitation[];
}

// Mirrors what the cards print, so filtering by a label always finds the
// cards wearing it - including the states an invitation inherits from its event.
const statusOptions: { value: InvitationDisplayFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "trash", label: "Trash" },
];

const sortOptions: { value: InvitationSort; label: string }[] = [
  { value: "updated_desc", label: "Last edited" },
  { value: "updated_asc", label: "Oldest edited" },
  { value: "title_asc", label: "Title A-Z" },
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
  const router = useRouter();
  const { query } = useHubSearch();
  const [status, setStatus] = useState<InvitationDisplayFilter>("all");
  const [sort, setSort] = useState<InvitationSort>("updated_desc");
  const [trashedIds, setTrashedIds] = useState<Set<string>>(() => new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inTrashView = status === "trash";
  const search = query.trim().toLowerCase();

  useEffect(() => {
    setSelectedIds(new Set());
    setActionError(null);
  }, [status]);

  const handleTrashed = useCallback((id: string) => {
    setTrashedIds((prev) => new Set(prev).add(id));
  }, []);

  const handleTrashFailed = useCallback((id: string) => {
    setTrashedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handlePermanentlyDeleted = useCallback((id: string) => {
    setDeletedIds((prev) => new Set(prev).add(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handlePermanentDeleteFailed = useCallback((id: string) => {
    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const visible = useMemo(() => {
    const withOptimisticTrash = invitations
      .filter((invitation) => !deletedIds.has(invitation.id))
      .map((invitation) =>
        trashedIds.has(invitation.id)
          ? { ...invitation, status: "archived" as const }
          : invitation,
      );
    const filtered =
      status === "all"
        ? withOptimisticTrash.filter(
            (invitation) => invitation.status !== "archived",
          )
        : withOptimisticTrash.filter(
            (invitation) => invitationDisplayStatus(invitation) === status,
          );
    const searched = search
      ? filtered.filter((invitation) => {
          const haystack = [
            invitation.title,
            invitation.location,
            invitation.status,
            invitation.slug,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(search);
        })
      : filtered;
    return sortList(searched, sort);
  }, [invitations, status, sort, trashedIds, deletedIds, search]);

  const allVisibleSelected =
    visible.length > 0 && visible.every((item) => selectedIds.has(item.id));
  const selectedCount = visible.filter((item) =>
    selectedIds.has(item.id),
  ).length;

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(visible.map((item) => item.id)));
  };

  const deleteSelected = () => {
    const ids = visible
      .filter((item) => selectedIds.has(item.id))
      .map((item) => item.id);
    if (ids.length === 0) return;

    const confirmed = window.confirm(
      `Permanently delete ${ids.length} invitation${ids.length === 1 ? "" : "s"}? This cannot be undone.`,
    );
    if (!confirmed) return;

    setActionError(null);
    ids.forEach((id) => handlePermanentlyDeleted(id));
    startTransition(async () => {
      const result = await permanentlyDeleteInvitationsAction(ids);
      if ("error" in result) {
        ids.forEach((id) => handlePermanentDeleteFailed(id));
        setActionError(result.error);
        return;
      }
      setSelectedIds(new Set());
      router.refresh();
    });
  };

  const emptyTrash = () => {
    const ids = visible.map((item) => item.id);
    if (ids.length === 0) return;

    const confirmed = window.confirm(
      `Empty trash and permanently delete ${ids.length} invitation${ids.length === 1 ? "" : "s"}? This cannot be undone.`,
    );
    if (!confirmed) return;

    setActionError(null);
    ids.forEach((id) => handlePermanentlyDeleted(id));
    startTransition(async () => {
      const result = await clearTrashAction();
      if ("error" in result) {
        ids.forEach((id) => handlePermanentDeleteFailed(id));
        setActionError(result.error);
        return;
      }
      setSelectedIds(new Set());
      router.refresh();
    });
  };

  return (
    <section aria-labelledby="recent-invitations-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="recent-invitations-heading"
            className="text-xl font-semibold tracking-tight text-black"
          >
            {inTrashView ? "Trash" : "Recent Invitations"}
          </h2>
          {inTrashView ? (
            <p className="mt-1 text-sm text-grey">
              Select invitations to permanently delete, or empty trash.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="relative inline-flex items-center">
            <span className="sr-only">Filter by status</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as InvitationDisplayFilter)
              }
              className="appearance-none rounded-full border border-black/10 bg-white/90 py-2 pl-3.5 pr-10 text-sm font-medium text-black shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-colors hover:border-black/20 focus-visible:ring-2 focus-visible:ring-signature/40"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3.5 text-grey">
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
              className="appearance-none rounded-full border border-black/10 bg-white/90 py-2 pl-3.5 pr-10 text-sm font-medium text-black shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-colors hover:border-black/20 focus-visible:ring-2 focus-visible:ring-signature/40"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3.5 text-grey">
              <ChevronDownIcon />
            </span>
          </label>
        </div>
      </div>

      {inTrashView && visible.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-black/8 bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="inline-flex items-center gap-2 text-sm text-black">
            <BrandCheckbox
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
              label={allVisibleSelected ? "Deselect all" : "Select all"}
            />
            <button
              type="button"
              onClick={toggleSelectAll}
              className="font-medium hover:text-black/70"
            >
              {allVisibleSelected ? "Deselect all" : "Select all"}
            </button>
          </div>

          <span className="text-sm text-grey">
            {selectedCount} selected
          </span>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isPending || selectedCount === 0}
              onClick={deleteSelected}
              className="rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-sm font-medium text-black transition-colors hover:border-black/20 hover:bg-soft-grey disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? "Deleting…" : "Delete selected"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={emptyTrash}
              className="rounded-full bg-black px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Empty trash
            </button>
          </div>
        </div>
      )}

      {actionError && (
        <p className="mt-3 text-sm font-medium text-signature">{actionError}</p>
      )}

      {visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
          <p className="text-base font-semibold text-black">
            {search
              ? "No matching invitations"
              : inTrashView
                ? "Trash is empty"
                : "No invitations yet"}
          </p>
          <p className="mt-2 text-sm text-grey">
            {search
              ? `Nothing matched “${query.trim()}”. Try another title, location, or status.`
              : inTrashView
                ? "Invitations you move to trash will appear here."
                : "Create your first invitation to see it here."}
          </p>
          {!inTrashView && (
            <div className="mt-6 flex justify-center">
              <CreateShortcuts />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((invitation) => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
              selectable={inTrashView}
              selected={selectedIds.has(invitation.id)}
              onSelectedChange={toggleSelected}
              onTrashed={handleTrashed}
              onTrashFailed={handleTrashFailed}
              onPermanentlyDeleted={handlePermanentlyDeleted}
              onPermanentDeleteFailed={handlePermanentDeleteFailed}
            />
          ))}
        </div>
      )}
    </section>
  );
}
