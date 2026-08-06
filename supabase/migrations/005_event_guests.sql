-- Guests belong to an event workspace. Display name is what seeds the
-- Guest name element; prefix is optional. Each recipient gets an opaque
-- token for personalised invitation links (/invite/{event-slug}?t=...).

create table if not exists public.event_guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  prefix text not null default '',
  display_name text not null,
  email text not null,
  token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists event_guests_token_uidx
  on public.event_guests (token);
create unique index if not exists event_guests_event_email_uidx
  on public.event_guests (event_id, lower(email));
create index if not exists event_guests_event_id_idx
  on public.event_guests (event_id);

alter table public.event_guests enable row level security;

-- App reads and writes through the server service-role client.
notify pgrst, 'reload schema';
