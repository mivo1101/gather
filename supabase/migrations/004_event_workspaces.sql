-- Separate event workspaces from invitation design drafts.
-- Existing invitation records are intentionally not backfilled: users choose
-- which designs belong to real events.

do $$
begin
  create type public.event_status as enum ('draft', 'active', 'completed', 'archived');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users (id) on delete cascade,
  name text not null default 'Untitled event',
  slug text not null,
  status public.event_status not null default 'draft',
  event_date timestamptz,
  timezone text not null default 'Australia/Melbourne',
  venue text,
  address text,
  invitation_id uuid references public.invitations (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists events_user_slug_uidx
  on public.events (user_id, slug);
create unique index if not exists events_invitation_uidx
  on public.events (invitation_id)
  where invitation_id is not null;
create index if not exists events_user_id_idx
  on public.events (user_id);
create index if not exists events_updated_at_idx
  on public.events (updated_at desc);

alter table public.events enable row level security;

-- App reads and writes through the server service-role client, matching the
-- existing users and invitations tables. No browser policies are added yet.

-- Make the new table available to PostgREST immediately after this migration.
notify pgrst, 'reload schema';
