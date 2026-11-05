-- Events are judged by the tristate's calendar day (Central time), not UTC.
create or replace function public.tm_guard_listing() returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') or public.tm_is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.featured_until := null; new.created_at := now(); new.seller_meta := 'Private seller'; new.status := 'active';
    new.expires_at := now() + interval '60 days';
    if new.kind in ('event', 'sale') then
      if new.event_date is null then raise exception 'Please add the date.'; end if;
      if new.event_date < (now() at time zone 'America/Chicago')::date then raise exception 'That date has already passed.'; end if;
    else
      new.event_date := null;
    end if;
    if exists (select 1 from public.tm_listings where seller_id = new.seller_id and lower(title) = lower(new.title) and created_at > now() - interval '1 day') then
      raise exception 'Looks like you already posted this one.';
    end if;
    if (select count(*) from public.tm_listings where seller_id = new.seller_id and status = 'active') >= 25 then
      raise exception 'You have 25 active listings. Mark some as sold or delete a few first.';
    end if;
    if (select count(*) from public.tm_listings where seller_id = new.seller_id and created_at > now() - interval '1 hour') >= 10 then
      raise exception 'That is a lot of listings at once. Please try again in a little while.';
    end if;
  else
    new.featured_until := old.featured_until; new.created_at := old.created_at; new.seller_meta := old.seller_meta;
    new.seller_id := old.seller_id; new.featured := old.featured; new.is_demo := old.is_demo; new.expires_at := old.expires_at;
    if old.status = 'removed' then new.status := 'removed'; end if;
  end if;
  return new;
end $$;
