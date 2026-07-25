-- Run this in Supabase → SQL Editor → New query → Run

create type public.invitation_status as enum ('draft', 'published', 'archived');

create table public.users (
  id text primary key,
  email text not null unique,
  name text,
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users (id) on delete cascade,
  title text not null default 'Untitled invitation',
  slug text not null unique,
  status public.invitation_status not null default 'draft',
  cover_image text,
  event_date timestamptz,
  location text,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invitations_user_id_idx on public.invitations (user_id);
create index invitations_updated_at_idx on public.invitations (updated_at desc);
create unique index invitations_slug_uidx on public.invitations (slug);

alter table public.users enable row level security;
alter table public.invitations enable row level security;

-- App reads/writes via the server service role key (bypasses RLS).
-- No anon policies yet — keep tables locked to the browser.
