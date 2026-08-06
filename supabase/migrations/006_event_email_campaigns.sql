-- Email campaign draft + per-guest delivery status for event invites.

do $$
begin
  create type public.email_delivery_status as enum (
    'pending',
    'sent',
    'failed',
    'bounced'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.event_email_campaigns (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.events (id) on delete cascade,
  subject text not null default '',
  preview_text text not null default '',
  sender_name text not null default '',
  reply_to text not null default '',
  greeting text not null default 'Dear',
  body text not null default '',
  cta_label text not null default 'View invitation',
  include_calendar boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.event_email_campaigns (id) on delete cascade,
  guest_id uuid not null references public.event_guests (id) on delete cascade,
  status public.email_delivery_status not null default 'pending',
  provider_message_id text,
  error text,
  idempotency_key text not null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists event_email_deliveries_idempotency_uidx
  on public.event_email_deliveries (idempotency_key);
create unique index if not exists event_email_deliveries_campaign_guest_uidx
  on public.event_email_deliveries (campaign_id, guest_id);
create index if not exists event_email_deliveries_guest_id_idx
  on public.event_email_deliveries (guest_id);

alter table public.event_email_campaigns enable row level security;
alter table public.event_email_deliveries enable row level security;

notify pgrst, 'reload schema';
