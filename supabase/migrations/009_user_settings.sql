create table if not exists public.user_settings (
  user_id text primary key references public.users (id) on delete cascade,
  timezone text not null default 'Australia/Melbourne',
  language text not null default 'en-AU',
  date_format text not null default 'day_month_year',
  email_rsvp_updates boolean not null default true,
  email_delivery_issues boolean not null default true,
  email_event_reminders boolean not null default true,
  email_product_updates boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

-- App reads/writes via the server service role key (bypasses RLS).
