"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { PlusIcon } from "@/components/ui/Button";
import { createInvitationWithShapeAction } from "@/lib/actions/invitations";
import { shapeShortcuts } from "./CreateShortcuts";
import { TemplatesIcon } from "./icons";

/**
 * Creating is the one action available from every page, so the layout choice
 * lives here rather than taking a panel on Home.
 */
export function CreateInvitationMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        disabled={isPending}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        <PlusIcon />
        {isPending ? "Opening…" : "Create Invitation"}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-black/5 bg-white p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.14)]"
        >
          <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-grey">
            Start blank
          </p>
          {shapeShortcuts.map(({ shape, title, icon: Icon }) => (
            <button
              key={shape}
              type="button"
              role="menuitem"
              disabled={isPending}
              onClick={() => {
                setOpen(false);
                startTransition(async () => {
                  const { path } = await createInvitationWithShapeAction(shape);
                  router.push(path);
                });
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm text-black transition-colors hover:bg-soft-grey disabled:opacity-50"
            >
              <Icon className="h-4 w-4 text-signature" />
              {title}
            </button>
          ))}
          <div className="my-1 h-px bg-black/5" />
          <Link
            href="/templates"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-black transition-colors hover:bg-soft-grey"
          >
            <TemplatesIcon className="h-4 w-4 text-signature" />
            Browse templates
          </Link>
        </div>
      )}
    </div>
  );
}
