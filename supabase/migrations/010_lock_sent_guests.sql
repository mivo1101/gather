-- A successfully sent invitation permanently locks that guest's identity.
-- This protects the RSVP/invitation token association even if a client bypasses
-- the guest-list UI.

create or replace function public.prevent_sent_guest_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.event_email_deliveries delivery
    where delivery.guest_id = old.id
      and delivery.status = 'sent'
  ) then
    if tg_op = 'DELETE' then
      -- Allow the normal cascade when the entire parent event is deleted.
      if exists (
        select 1 from public.events event where event.id = old.event_id
      ) then
        raise exception using
          errcode = 'check_violation',
          message = 'This invitation has already been sent. This guest''s details can no longer be changed or removed.';
      end if;
      return old;
    end if;

    if new.prefix is distinct from old.prefix
      or new.display_name is distinct from old.display_name
      or lower(new.email) is distinct from lower(old.email)
      or new.event_id is distinct from old.event_id
      or new.token is distinct from old.token
    then
      raise exception using
        errcode = 'check_violation',
        message = 'This invitation has already been sent. This guest''s details can no longer be changed or removed.';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists lock_sent_guest_changes on public.event_guests;
create trigger lock_sent_guest_changes
before update or delete on public.event_guests
for each row execute function public.prevent_sent_guest_changes();

notify pgrst, 'reload schema';
