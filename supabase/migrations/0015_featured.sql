alter table public.tm_listings add column featured_until timestamptz;
create index tm_listings_featured_idx on public.tm_listings (featured_until) where featured_until is not null;

-- Switches. 'featured_demo' = 'on' lets owners feature their own listing for free (sample mode,
-- no Stripe). Set it to 'off' when real Stripe keys are live.
create table public.tm_settings (key text primary key, value text not null);
alter table public.tm_settings enable row level security;
create policy "tm settings are public" on public.tm_settings for select using (true);
insert into public.tm_settings values ('featured_demo', 'on');

create or replace function public.tm_feature_demo(listing_id text, days int default 7)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare until timestamptz;
begin
  if coalesce((select value from tm_settings where key = 'featured_demo'), 'off') <> 'on' then
    raise exception 'Free featuring is turned off';
  end if;
  update tm_listings set featured_until = greatest(now(), coalesce(featured_until, now())) + make_interval(days => days)
  where id = listing_id and seller_id = auth.uid() and status = 'active'
  returning featured_until into until;
  if until is null then raise exception 'Listing not found or not yours'; end if;
  return until;
end $$;
revoke all on function public.tm_feature_demo(text, int) from public, anon;
grant execute on function public.tm_feature_demo(text, int) to authenticated;
