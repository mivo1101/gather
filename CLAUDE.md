# Gather - working notes

## Verifying a change

Run `npm run verify` (typecheck + lint + client-boundary check). That is the
whole gate for a normal change.

**Never run `next build` directly.** It writes to `.next`, which the running
dev server is serving from, and overwrites its asset manifest - the page comes
back as unstyled HTML until the dev server is killed and `.next` deleted. Use
`npm run build:check`, which sets `NEXT_DIST_DIR=.next-build` so a verification
build cannot touch the dev server. See the comment in `next.config.ts`.

## Server and client components

Everything a `"use client"` module exports becomes a client reference. A server
component may *render* a client component, but calling a client *function*
throws at render time. Neither `tsc` nor ESLint sees this - only loading the
page does - so `npm run check:boundaries` enforces two rules:

1. A `"use client"` module must not re-export from a non-client module. Doing so
   gives one pure helper two import paths, and the one through the client module
   silently poisons it for server callers.
2. A server file must not import a lowercase (non-component) binding from a
   client module.

Keep pure helpers in plain modules and import them from there. `canvas-metrics.ts`
is the example: `cardAspectRatio` lives there, and `CanvasImageContent.tsx`
(a client module) deliberately does not re-export it.

## Brand

The product is brand-led: the signature pink, the theme, and the component
styles repeat across every page on purpose. Before styling something new, look
for the component already doing that job and share it.

- Signature pink is the accent: `text-signature`, `bg-signature` and its tints.
- Progress rails use `components/app/SetupSteps.tsx` - pink pill when done,
  black for the current step, faded grey ahead, pink arrows between. The event
  setup flow and Home's "Up next" panel both render it.
- Major black (primary) buttons lead with the pink `+`, `<PlusIcon />` from
  `components/ui/Button` - the same mark as the logo. Secondary, ghost, and chip
  buttons stay plain.
- Status colour lives in `components/app/StatusDot.tsx`: grey not started,
  green live, blue finished, faded grey discarded.

## Writing style

Plain hyphens only - never `—` or `–`, in code, comments, copy, or commits.
