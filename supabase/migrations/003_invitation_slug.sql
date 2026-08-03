-- Run in Supabase → SQL Editor after 002_invitation_content.sql
-- Adds unique human-readable URL slugs for invitations.

alter table public.invitations
  add column if not exists slug text;

-- Backfill missing slugs from titles (append short id suffix to avoid collisions).
update public.invitations
set slug = trim(both '-' from regexp_replace(
  lower(coalesce(nullif(trim(title), ''), 'untitled-invitation')),
  '[^a-z0-9]+',
  '-',
  'g'
)) || '-' || substr(replace(id::text, '-', ''), 1, 8)
where slug is null or trim(slug) = '';

alter table public.invitations
  alter column slug set not null;

create unique index if not exists invitations_slug_uidx
  on public.invitations (slug);
