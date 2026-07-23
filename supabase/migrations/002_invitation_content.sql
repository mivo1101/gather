-- Run in Supabase → SQL Editor after schema.sql

alter table public.invitations
  add column if not exists content jsonb not null default '{}'::jsonb;
