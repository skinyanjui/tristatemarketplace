-- Advertising: products, requests (member -> admin review -> live), and live ad creatives.
-- Business rules live here so they cannot be bypassed from the browser.

create table public.tm_ad_products (
  id text primary key check (id in ('featured', 'sponsored', 'ad')),
  name text not null,
  blurb text not null,
  price_cents int not null check (price_cents >= 0),       -- price per 7 days
  needs_listing boolean not null,
  active boolean not null default true,
  sort int not null default 0
);
alter table public.tm_ad_products enable row level security;
create policy "ad products are public" on public.tm_ad_products for select using (true);
insert into public.tm_ad_products (id, name, blurb, price_cents, needs_listing, sort) values
  ('featured',  'Featured listing',  'Pinned to the top of the first page with a Featured tag.',                          500, true, 1),
  ('sponsored', 'Sponsored listing', 'Shown in the feed with a blue border and a Sponsored tag.', 1500, true, 2),
  ('ad',        'Ad card',           'A full-card picture and headline between listings that sends buyers to your site.',  2500, false, 3);

create table public.tm_ad_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  product text not null references public.tm_ad_products(id),
  listing_id text references public.tm_listings(id) on delete set null,
  business_name text not null check (char_length(business_name) between 2 and 80),
  contact text not null check (char_length(contact) between 5 and 120),
  headline text check (char_length(headline) <= 60),
  detail text check (char_length(detail) <= 50),
  cta text check (cta in ('Learn more', 'Call now', 'Get a quote', 'Shop now', 'Book now', 'Visit us')),
  url text check (url ~ '^https?://[^\s]+$' and char_length(url) <= 300),
  image_url text check (image_url ~ '^https://[^\s]+$' and char_length(image_url) <= 500),
  days int not null check (days in (7, 14, 30)),
  price_cents int not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'live', 'declined', 'ended', 'cancelled')),
  admin_note text,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,
  check (product = 'ad' or listing_id is not null),
  check (product <> 'ad' or (coalesce(headline, '') <> '' and url is not null))
);
create unique index tm_ad_requests_open_idx on public.tm_ad_requests (user_id, product, coalesce(listing_id, '')) where status in ('pending', 'approved');
alter table public.tm_ad_requests enable row level security;
create policy "own or admin can read ad requests" on public.tm_ad_requests for select to authenticated using (user_id = auth.uid() or public.tm_is_admin());
create policy "members can request ads" on public.tm_ad_requests for insert to authenticated with check (user_id = auth.uid());

-- Rules applied to every new request, whatever the browser sends.
create or replace function public.tm_guard_ad_request() returns trigger language plpgsql set search_path = public as $$
declare p public.tm_ad_products; l public.tm_listings;
begin
  new.user_id := auth.uid();
  new.status := 'pending'; new.admin_note := null; new.decided_at := null; new.starts_at := null; new.ends_at := null;
  select * into p from public.tm_ad_products where id = new.product and active;
  if not found then raise exception 'That ad type is not available.'; end if;
  new.price_cents := p.price_cents * case new.days when 7 then 1 when 14 then 2 else 4 end;   -- 30 days is billed as 4 weeks
  if p.needs_listing then
    select * into l from public.tm_listings where id = new.listing_id;
    if not found or l.seller_id is distinct from auth.uid() then raise exception 'Pick one of your own listings.'; end if;
    if l.status <> 'active' then raise exception 'Only active listings can be promoted.'; end if;
    new.headline := null; new.detail := null; new.cta := null; new.url := null; new.image_url := null;
  else
    new.listing_id := null;
  end if;
  if (select count(*) from public.tm_ad_requests where user_id = auth.uid() and status = 'pending') >= 3 then
    raise exception 'You already have 3 requests waiting. We will review them first.';
  end if;
  return new;
end $$;
create trigger tm_guard_ad_request before insert on public.tm_ad_requests for each row execute function public.tm_guard_ad_request();

create table public.tm_ads (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.tm_ad_requests(id) on delete cascade,
  business_name text not null, headline text not null, detail text not null default '',
  cta text not null default 'Learn more', url text not null, image_url text,
  starts_at timestamptz not null, ends_at timestamptz not null
);
alter table public.tm_ads enable row level security;
create policy "running ads are public" on public.tm_ads for select using (now() >= starts_at and now() < ends_at);

-- Puts an approved request live. Not callable from the browser; only the admin functions below use it.
create or replace function public.tm_go_live(req_id uuid) returns void language plpgsql security definer set search_path = public as $$
declare r public.tm_ad_requests;
begin
  select * into r from public.tm_ad_requests where id = req_id and status in ('pending', 'approved');
  if not found then raise exception 'That request is not waiting.'; end if;
  if r.product = 'ad' then
    if (select count(*) from public.tm_ads where now() >= starts_at and now() < ends_at) >= 3 then
      raise exception 'All 3 ad slots are taken. Try again when one ends.';
    end if;
    insert into public.tm_ads (request_id, business_name, headline, detail, cta, url, image_url, starts_at, ends_at)
    values (r.id, r.business_name, r.headline, coalesce(r.detail, ''), coalesce(r.cta, 'Learn more'), r.url, r.image_url, now(), now() + make_interval(days => r.days));
  elsif r.product = 'featured' then
    update public.tm_listings set featured_until = greatest(now(), coalesce(featured_until, now())) + make_interval(days => r.days) where id = r.listing_id;
  else
    update public.tm_listings set sponsored_until = greatest(now(), coalesce(sponsored_until, now())) + make_interval(days => r.days) where id = r.listing_id;
  end if;
  update public.tm_ad_requests set status = 'live', starts_at = now(), ends_at = now() + make_interval(days => r.days) where id = r.id;
end $$;
revoke execute on function public.tm_go_live(uuid) from public, anon, authenticated;

-- Admin: approve or decline. While billing is off (launch/testing) approval goes live at once; once billing is on it waits for payment.
create or replace function public.tm_decide_ad(req_id uuid, approve boolean, note text default null) returns text language plpgsql security definer set search_path = public as $$
declare billing text; st text;
begin
  if not public.tm_is_admin() then raise exception 'Admins only.'; end if;
  if not exists (select 1 from public.tm_ad_requests where id = req_id and status = 'pending') then raise exception 'That request is not waiting.'; end if;
  if not approve then
    update public.tm_ad_requests set status = 'declined', admin_note = note, decided_at = now() where id = req_id;
    return 'declined';
  end if;
  billing := coalesce((select value from public.tm_settings where key = 'ads_billing'), 'off');
  update public.tm_ad_requests set admin_note = note, decided_at = now() where id = req_id;
  if billing = 'off' then perform public.tm_go_live(req_id); st := 'live';
  else update public.tm_ad_requests set status = 'approved' where id = req_id; st := 'approved'; end if;
  return st;
end $$;

-- Admin: payment received, go live.
create or replace function public.tm_mark_ad_paid(req_id uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.tm_is_admin() then raise exception 'Admins only.'; end if;
  if not exists (select 1 from public.tm_ad_requests where id = req_id and status = 'approved') then raise exception 'That request is not waiting for payment.'; end if;
  perform public.tm_go_live(req_id);
end $$;

-- Member: withdraw a request that has not gone live.
create or replace function public.tm_cancel_ad(req_id uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  update public.tm_ad_requests set status = 'cancelled', decided_at = now() where id = req_id and user_id = auth.uid() and status in ('pending', 'approved');
  if not found then raise exception 'That request cannot be cancelled.'; end if;
end $$;

revoke execute on function public.tm_decide_ad(uuid, boolean, text), public.tm_mark_ad_paid(uuid), public.tm_cancel_ad(uuid) from public, anon;
grant execute on function public.tm_decide_ad(uuid, boolean, text), public.tm_mark_ad_paid(uuid), public.tm_cancel_ad(uuid) to authenticated;
insert into public.tm_settings (key, value) values ('ads_billing', 'off') on conflict (key) do nothing;
