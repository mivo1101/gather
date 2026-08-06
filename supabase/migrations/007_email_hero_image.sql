-- Optional hero image for invite emails (design pick or upload).

alter table public.event_email_campaigns
  add column if not exists hero_image_url text;

notify pgrst, 'reload schema';
