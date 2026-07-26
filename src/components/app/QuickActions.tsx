import type { ReactNode } from "react";
import { createInvitationAction } from "@/lib/actions/invitations";
import type { InvitationCanvasShape } from "@/lib/data/invitation-content";

type IconProps = { className?: string };

function PortraitIcon({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="7"
        y="3"
        width="10"
        height="18"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function LandscapeIcon({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="7"
        width="18"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SquareIcon({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CustomSizeIcon({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Bottom-left L */}
      <path
        d="M5 6v13h13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Width ↔ along the top of the L */}
      <path
        d="M5 6h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5 6l2.2-2.2M5 6l2.2 2.2M19 6l-2.2-2.2M19 6l-2.2 2.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Height ↕ up from the right end of the L */}
      <path
        d="M19 19V6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M19 6l-2.2 2.2M19 6l2.2 2.2M19 19l-2.2-2.2M19 19l2.2-2.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const actions: {
  shape: InvitationCanvasShape;
  title: string;
  icon: (props: IconProps) => ReactNode;
}[] = [
  { shape: "portrait", title: "Portrait", icon: PortraitIcon },
  { shape: "landscape", title: "Landscape", icon: LandscapeIcon },
  { shape: "square", title: "Square", icon: SquareIcon },
  { shape: "custom", title: "Custom", icon: CustomSizeIcon },
];

function LayoutsIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M10 4v16M10 12h11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Create-with-layout shortcuts on the Home dashboard */
export function QuickActions() {
  return (
    <section
      aria-labelledby="create-invitation-heading"
      className="rounded-3xl border border-black/8 bg-white/75 px-5 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-md sm:px-6"
    >
        <div>
          <h2
            id="create-invitation-heading"
            className="text-lg font-semibold tracking-tight text-black"
          >
            Create a new invitation
          </h2>
          <p className="mt-0.5 text-sm text-grey">
            Choose a layout to start designing.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-4 self-stretch">
            <div className="flex w-16 flex-col items-center gap-1" aria-hidden="true">
              <span className="flex h-9 w-9 items-center justify-center text-signature">
                <LayoutsIcon />
              </span>
              <span className="text-xs font-semibold text-black">Layouts</span>
            </div>
            <span className="h-10 w-px bg-black/10" aria-hidden="true" />
          </div>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <form key={action.shape} action={createInvitationAction}>
                <input type="hidden" name="shape" value={action.shape} />
                <button
                  type="submit"
                  className="group flex w-16 flex-col items-center gap-1"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full text-signature transition-colors duration-200 group-hover:bg-signature/15">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="whitespace-nowrap text-xs font-normal text-black group-hover:font-semibold">
                    {action.title}
                  </span>
                </button>
              </form>
            );
          })}
      </div>
    </section>
  );
}
