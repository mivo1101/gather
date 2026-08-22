"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { createInvitationWithShapeAction } from "@/lib/actions/invitations";
import type { InvitationCanvasShape } from "@/lib/data/invitation-content";

type IconProps = { className?: string };

function PortraitIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="7" y="3" width="10" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function LandscapeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="18" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SquareIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CustomSizeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 6v13h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 6h14M19 19V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M5 6l2.2-2.2M5 6l2.2 2.2M19 6l-2.2-2.2M19 6l-2.2 2.2M19 19l-2.2-2.2M19 19l2.2-2.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const shapeShortcuts: {
  shape: InvitationCanvasShape;
  title: string;
  icon: (props: IconProps) => ReactNode;
}[] = [
  { shape: "portrait", title: "Portrait", icon: PortraitIcon },
  { shape: "landscape", title: "Landscape", icon: LandscapeIcon },
  { shape: "square", title: "Square", icon: SquareIcon },
  { shape: "custom", title: "Custom", icon: CustomSizeIcon },
];

/** Layout chips that open a fresh canvas in the chosen shape. */
export function CreateShortcuts() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2" aria-busy={isPending}>
      {shapeShortcuts.map(({ shape, title, icon: Icon }) => (
        <button
          key={shape}
          type="button"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const { path } = await createInvitationWithShapeAction(shape);
              router.push(path);
            });
          }}
          className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-3.5 py-2 text-sm font-medium text-black transition-colors hover:border-black/20 disabled:cursor-wait disabled:opacity-60"
        >
          <Icon className="h-4 w-4 text-signature" />
          {title}
        </button>
      ))}
      <Link
        href="/templates"
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-signature transition-opacity hover:opacity-80"
      >
        Browse templates
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
