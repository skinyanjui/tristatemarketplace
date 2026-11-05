-- Listings expire after 60 days (owners renew from Account), hot paths get indexes,
-- and posting rules are tightened.

alter table public.tm_listings add column expires_at timestamptz not null default now() + interval '60 days';

drop policy "tm active listings are public" on public.tm_listings;
create policy "tm active listings are public" on public.tm_listings for select
  using ((status in ('active', 'sold') and expires_at > now()) or auth.uid() = seller_id);

drop policy "tm send message" on public.tm_messages;
create policy "tm send message" on public.tm_messages for insert to authenticated with check (
  sender_id = auth.uid() and sender_email = (auth.jwt() ->> 'email') and seller_id <> auth.uid()
  and exists (select 1 from public.tm_listings l where l.id = tm_messages.listing_id and l.seller_id = tm_messages.seller_id
              and l.status = 'active' and l.expires_at > now()));

create or replace function public.tm_renew(listing_id text) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare t timestamptz;
begin
  update tm_listings set expires_at = now() + interval '60 days'
  where id = listing_id and seller_id = auth.uid() and status <> 'removed' returning expires_at into t;
  if t is null then raise exception 'Listing not found or not yours'; end if;
  return t;
end $$;
revoke all on function public.tm_renew(text) from public, anon;
grant execute on function public.tm_renew(text) to authenticated;

-- Posting rules: events and sales need a future date, others carry none; no instant duplicates.
create or replace function public.tm_guard_listing() returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') or public.tm_is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.featured_until := null; new.created_at := now(); new.seller_meta := 'Private seller'; new.status := 'active';
    new.expires_at := now() + interval '60 days';
    if new.kind in ('event', 'sale') then
      if new.event_date is null then raise exception 'Please add the date.'; end if;
      if new.event_date < current_date then raise exception 'That date has already passed.'; end if;
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

alter table public.tm_listings add constraint tm_listings_price_text_check check (price = '' or price ~ '[0-9]' or price ilike '%free%');

-- Indexes for the queries the app runs.
create index if not exists tm_listings_seller_idx on public.tm_listings (seller_id);
create index if not exists tm_listings_kind_idx on public.tm_listings (kind, created_at desc);
create index if not exists tm_listings_expires_idx on public.tm_listings (expires_at);
create index if not exists tm_messages_seller_idx on public.tm_messages (seller_id, created_at desc);
create index if not exists tm_messages_sender_idx on public.tm_messages (sender_id, created_at desc);
create index if not exists tm_messages_listing_idx on public.tm_messages (listing_id);
create index if not exists tm_reports_listing_idx on public.tm_reports (listing_id);
create index if not exists tm_saves_listing_idx on public.tm_saves (listing_id);

-- Faster search.
create extension if not exists pg_trgm with schema extensions;
create index if not exists tm_listings_search_idx on public.tm_listings using gin (title extensions.gin_trgm_ops, description extensions.gin_trgm_ops, place extensions.gin_trgm_ops);
