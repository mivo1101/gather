"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { cardAspectRatio } from "@/components/editor/CanvasImageContent";
import {
  permanentlyDeleteEventAction,
  setEventArchivedAction,
} from "@/lib/actions/events";
import {
  eventLocation,
  eventPath,
  type EventStatus,
  type EventWorkspace,
} from "@/lib/data/event-workspace-utils";
import { formatEventDate, formatRelativeTime } from "@/lib/format";
import { invitationEditPath } from "@/lib/invitation-paths";
import { InvitationPagePreview } from "./InvitationPagePreview";
import { ChevronDownIcon, MoreIcon, SearchIcon } from "./icons";
import { Button, PlusIcon } from "@/components/ui/Button";

interface EventWorkspacesProps {
  workspaces: EventWorkspace[];
}

const stepLabels = [
  ["design", "Design"],
  ["details", "Details"],
  ["guests", "Guests"],
  ["send", "Send"],
] as const;

const statusLabels: Record<EventStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

const statusStyles: Record<EventStatus, string> = {
  draft: "bg-[#f1f1f3] text-[#66676d] ring-1 ring-black/[0.06]",
  active: "bg-[#e2f5e9] text-[#267448] ring-1 ring-[#267448]/10",
  completed: "bg-[#fff0c2] text-[#85620e] ring-1 ring-[#85620e]/10",
  archived: "bg-[#e6e6e9] text-[#73747a] ring-1 ring-black/[0.06]",
};

type EventView = "all" | "current" | "completed" | "archived";

function EventWorkspaceCard({ workspace }: { workspace: EventWorkspace }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const invitation = workspace.invitation;
  const firstPage = invitation?.content.pages[0];
  const shape = invitation?.content.shape ?? "landscape";
  const customSize = invitation?.content.customSize;
  const aspectRatio = invitation
    ? cardAspectRatio(shape, customSize)
    : 16 / 10;
  const location = eventLocation(workspace);
  const percentage = Math.round(
    (workspace.progress.completed / workspace.progress.total) * 100,
  );
  const archived = workspace.status === "archived";

  const toggleArchived = () => {
    setActionError(null);
    startTransition(async () => {
      const result = await setEventArchivedAction(workspace.id, !archived);
      if ("error" in result) {
        setActionError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const deleteEvent = () => {
    const confirmed = window.confirm(
      `Permanently delete “${workspace.name}”? The invitation design will not be deleted. This cannot be undone.`,
    );
    if (!confirmed) return;

    setActionError(null);
    startTransition(async () => {
      const result = await permanentlyDeleteEventAction(workspace.id);
      if ("error" in result) {
        setActionError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-black/[0.07] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.03)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
      <Link
        href={eventPath(workspace)}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-signature/40 focus-visible:ring-inset"
      >
        <div className="flex h-52 items-center justify-center overflow-hidden rounded-t-[23px] bg-[#f2efed] p-5">
          {/* Inner clip so hover scale / shadows never tint the neutral stage. */}
          <div className="flex h-full w-full min-w-0 items-center justify-center overflow-hidden">
            <div
              className="relative isolate min-h-0 min-w-0 overflow-hidden rounded-lg bg-[#f2efed] shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition-transform duration-500 group-hover:scale-[1.015]"
              style={{
                aspectRatio: String(aspectRatio),
                height: aspectRatio <= 1 ? "100%" : "auto",
                width: aspectRatio > 1 ? "100%" : "auto",
                maxHeight: "100%",
                maxWidth: "100%",
              }}
            >
              {firstPage && invitation ? (
                <InvitationPagePreview
                  page={firstPage}
                  shape={shape}
                  customSize={customSize}
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-white px-6 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-signature/10 text-xl text-signature">
                    +
                  </span>
                  <span className="mt-3 text-xs font-semibold text-black">
                    Add an invitation design
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold tracking-tight text-black">
                {workspace.name}
              </h2>
              <p className="mt-1 truncate text-sm text-grey">
                {workspace.eventDate
                  ? formatEventDate(workspace.eventDate)
                  : "Date not confirmed"}
                <span className="px-1.5 text-black/20">·</span>
                {location || "Location not confirmed"}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[workspace.status]}`}
            >
              {statusLabels[workspace.status]}
            </span>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-black">Event Setup</span>
              <span className="text-grey">{percentage}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-soft-grey">
              <div
                className="h-full rounded-full bg-signature transition-[width]"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {stepLabels.map(([key, label]) => {
                const completed = workspace.progress[key];
                return (
                  <span
                    key={key}
                    className={`truncate rounded-full px-2 py-1 text-center text-[10px] font-medium ${
                      completed
                        ? "bg-signature/10 text-signature"
                        : "bg-soft-grey text-grey"
                    }`}
                  >
                    {completed ? "✓ " : ""}
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between rounded-b-[23px] border-t border-black/[0.06] px-5 py-3.5">
        <span className="text-xs text-grey">
          Edited {formatRelativeTime(workspace.updatedAt)}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={eventPath(workspace)}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-soft-grey"
          >
            Open event
          </Link>
          {invitation ? (
            <Button
              href={invitationEditPath(invitation)}
              size="sm"
            >
              Edit design
            </Button>
          ) : (
            <Button
              href={eventPath(workspace)}
              size="sm"
            >
              <PlusIcon />
              Add design
            </Button>
          )}
          <details className="relative">
            <summary
              className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-full text-grey hover:bg-soft-grey hover:text-black [&::-webkit-details-marker]:hidden"
              aria-label={`More actions for ${workspace.name}`}
            >
              <MoreIcon className="h-4 w-4" />
            </summary>
            <div className="absolute bottom-full right-0 z-30 mb-2 w-40 overflow-hidden rounded-2xl border border-black/[0.07] bg-white py-1.5 shadow-[0_14px_35px_rgba(0,0,0,0.14)]">
              <button
                type="button"
                disabled={isPending}
                onClick={toggleArchived}
                className="w-full px-4 py-2 text-left text-sm text-black hover:bg-soft-grey disabled:opacity-45"
              >
                {archived ? "Restore" : "Archive"}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={deleteEvent}
                className="w-full px-4 py-2 text-left text-sm text-[#b42318] hover:bg-[#fff3f1] disabled:opacity-45"
              >
                Delete permanently
              </button>
            </div>
          </details>
        </div>
      </div>
      {actionError ? (
        <p className="border-t border-black/[0.05] px-5 py-2 text-xs font-medium text-[#b42318]">
          {actionError}
        </p>
      ) : null}
    </article>
  );
}

export function EventWorkspaces({ workspaces }: EventWorkspacesProps) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<EventView>("all");
  const search = query.trim().toLowerCase();
  const visible = useMemo(
    () => {
      const byView = workspaces.filter((workspace) => {
        if (view === "archived") return workspace.status === "archived";
        if (view === "completed") return workspace.status === "completed";
        if (view === "current") {
          return workspace.status === "draft" || workspace.status === "active";
        }
        return workspace.status !== "archived";
      });
      return search
        ? byView.filter((workspace) =>
            [workspace.name, eventLocation(workspace), workspace.status]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(search),
          )
        : byView;
    },
    [search, view, workspaces],
  );

  if (workspaces.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-black/10 bg-white/75 px-6 py-20 text-center">
        <p className="text-lg font-semibold text-black">No events yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-grey">
          Create an event to organise its invitation, guests and responses.
        </p>
        <Button
          href="/invitations/new-event"
          size="md"
          className="mt-6"
        >
          <PlusIcon />
          Create event
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-grey">
          {visible.length} {visible.length === 1 ? "event" : "events"}
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <label className="relative block">
            <span className="sr-only">Event view</span>
            <select
              value={view}
              onChange={(event) =>
                setView(event.target.value as EventView)
              }
              className="w-full appearance-none rounded-full border border-black/8 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-black outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/15 sm:w-auto"
            >
              <option value="all">All events</option>
              <option value="current">Active &amp; Draft</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-grey">
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </span>
          </label>
          <label className="relative block w-full sm:w-72">
          <span className="sr-only">Search events</span>
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-signature">
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events..."
            className="w-full rounded-full border border-black/8 bg-white py-2.5 pl-10 pr-4 text-sm text-black outline-none placeholder:text-grey focus:border-signature/40 focus:ring-2 focus:ring-signature/15"
          />
          </label>
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {visible.map((workspace) => (
            <EventWorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-14 text-center">
          <p className="font-semibold text-black">No matching events</p>
          <p className="mt-2 text-sm text-grey">
            {search
              ? `Nothing matched “${query.trim()}”.`
              : view === "archived"
                ? "Archived events will appear here."
                : view === "completed"
                  ? "Events will appear here after their scheduled time has passed."
                : "Create an event to get started."}
          </p>
        </div>
      )}
    </>
  );
}
