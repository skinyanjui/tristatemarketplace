-- Sponsored placements (clearly labelled ads in the feed) and public seller profiles with a Verified badge.
alter table public.tm_listings add column if not exists sponsored_until timestamptz;
create index if not exists tm_listings_sponsored_idx on public.tm_listings (sponsored_until) where sponsored_until is not null;

-- Members can never set or change their own sponsorship.
create or replace function public.tm_guard_listing() returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') or public.tm_is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.featured_until := null; new.sponsored_until := null; new.created_at := now(); new.seller_meta := 'Private seller'; new.status := 'active';
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
    new.featured_until := old.featured_until; new.sponsored_until := old.sponsored_until; new.created_at := old.created_at; new.seller_meta := old.seller_meta;
    new.seller_id := old.seller_id; new.featured := old.featured; new.is_demo := old.is_demo; new.expires_at := old.expires_at;
    if old.status = 'removed' then new.status := 'removed'; end if;
  end if;
  return new;
end $$;

create table if not exists public.tm_profiles (
  user_id uuid primary key references auth.users on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 60),
  verified boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.tm_profiles enable row level security;
-- Profiles are public (name and badge only). Nobody can edit them from the browser: only admins, through tm_set_verified.
create policy "tm profiles are public" on public.tm_profiles for select using (true);

create or replace function public.tm_set_verified(uid uuid, is_verified boolean, name text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not (public.tm_is_admin() or current_user in ('postgres', 'supabase_admin', 'service_role')) then raise exception 'Admins only.'; end if;
  insert into public.tm_profiles (user_id, display_name, verified, verified_at)
  values (uid, coalesce(name, (select split_part(email, '@', 1) from auth.users where id = uid)), is_verified, case when is_verified then now() end)
  on conflict (user_id) do update set verified = is_verified, verified_at = case when is_verified then now() end, display_name = coalesce(name, tm_profiles.display_name);
end $$;
revoke all on function public.tm_set_verified(uuid, boolean, text) from public, anon;
grant execute on function public.tm_set_verified(uuid, boolean, text) to authenticated;

-- Test data: the sample seller is a verified profile, and three sample listings are sponsored for 30 days.
select public.tm_set_verified((select id from auth.users where email = 'sam@sandalwoodmedical.com'), true, 'Tristate Market');
update public.tm_listings set sponsored_until = now() + interval '30 days'
where id in (
  (select id from public.tm_listings where is_demo and kind = 'car' and status = 'active' order by created_at limit 1),
  (select id from public.tm_listings where is_demo and kind = 'services' and status = 'active' order by created_at limit 1),
  (select id from public.tm_listings where is_demo and kind = 'tools' and status = 'active' order by created_at limit 1)
);
