-- One RSVP response per guest, keyed by opaque invite token on submit.

create table if not exists public.event_rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  guest_id uuid not null references public.event_guests (id) on delete cascade,
  attendance text not null default 'unknown'
    check (attendance in ('yes', 'no', 'unknown')),
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists event_rsvp_responses_guest_uidx
  on public.event_rsvp_responses (guest_id);
create index if not exists event_rsvp_responses_event_id_idx
  on public.event_rsvp_responses (event_id);

alter table public.event_rsvp_responses enable row level security;

notify pgrst, 'reload schema';
