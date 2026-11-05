-- Backend audit fixes. Members could feature their own listings for free, back-date listings to the
-- top, re-list items a moderator removed, and post unbounded text. This closes those gaps.

-- 1. Field limits and allowed values.
create or replace function public.tm_photos_ok(p text[]) returns boolean language sql immutable as $$
  select coalesce(array_length(p, 1), 0) <= 12 and not exists (
    select 1 from unnest(p) u
    where u not like 'https://bfovgafcfetfeqykjfco.supabase.co/storage/v1/object/public/tm-listing-photos/%' and u not like '/listings/%')
$$;
alter table public.tm_listings
  add constraint tm_listings_kind_check check (kind in ('car','home','land','livestock','sale','event','moto','boat','trailer','farm','furniture','appliance','tools','garden','electronics','sports','clothing','kids','antiques','music','pets','services','jobs','free')),
  add constraint tm_listings_description_check check (char_length(description) <= 4000),
  add constraint tm_listings_place_check check (char_length(place) <= 80),
  add constraint tm_listings_price_check check (char_length(price) <= 40),
  add constraint tm_listings_condition_check check (char_length(condition) <= 40),
  add constraint tm_listings_seller_name_check check (char_length(seller_name) <= 60),
  add constraint tm_listings_photos_check check (public.tm_photos_ok(photos));

-- 2. Members cannot touch money, ranking or moderation fields. Admins, the service role (Stripe
--    webhook) and SECURITY DEFINER functions are exempt.
create or replace function public.tm_guard_listing() returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') or public.tm_is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.featured_until := null; new.created_at := now(); new.seller_meta := 'Private seller'; new.status := 'active';
    if (select count(*) from public.tm_listings where seller_id = new.seller_id and status = 'active') >= 25 then
      raise exception 'You have 25 active listings. Mark some as sold or delete a few first.';
    end if;
    if (select count(*) from public.tm_listings where seller_id = new.seller_id and created_at > now() - interval '1 hour') >= 10 then
      raise exception 'That is a lot of listings at once. Please try again in a little while.';
    end if;
  else
    new.featured_until := old.featured_until; new.created_at := old.created_at; new.seller_meta := old.seller_meta;
    new.seller_id := old.seller_id; new.featured := old.featured; new.is_demo := old.is_demo;
    if old.status = 'removed' then new.status := 'removed'; end if;
  end if;
  return new;
end $$;
create trigger tm_guard_listing before insert or update on public.tm_listings for each row execute function public.tm_guard_listing();

-- 3. Spam brakes on messages and reports.
create or replace function public.tm_guard_message() returns trigger language plpgsql set search_path = public as $$
begin
  if (select count(*) from public.tm_messages where sender_id = new.sender_id and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'You are sending messages quickly. Please wait a bit and try again.';
  end if;
  if (select count(*) from public.tm_messages where sender_id = new.sender_id and listing_id = new.listing_id and created_at > now() - interval '1 day') >= 3 then
    raise exception 'You already messaged about this one. The seller will get back to you by email.';
  end if;
  return new;
end $$;
create trigger tm_guard_message before insert on public.tm_messages for each row execute function public.tm_guard_message();

create unique index tm_reports_one_per_member on public.tm_reports (listing_id, reporter_id) where reporter_id is not null;
create or replace function public.tm_guard_report() returns trigger language plpgsql set search_path = public as $$
begin
  if new.reporter_id is not null and (select count(*) from public.tm_reports where reporter_id = new.reporter_id and created_at > now() - interval '1 day') >= 20 then
    raise exception 'Thanks, we have plenty of reports from you today.';
  end if;
  return new;
end $$;
create trigger tm_guard_report before insert on public.tm_reports for each row execute function public.tm_guard_report();

-- 4. Free featuring (sample mode) is bounded: 1 to 14 days at a time, never more than 30 days ahead.
create or replace function public.tm_feature_demo(listing_id text, days int default 7)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare until timestamptz;
begin
  if coalesce((select value from tm_settings where key = 'featured_demo'), 'off') <> 'on' then
    raise exception 'Free featuring is turned off';
  end if;
  if days < 1 or days > 14 then raise exception 'Pick 1 to 14 days'; end if;
  update tm_listings set featured_until = least(greatest(now(), coalesce(featured_until, now())) + make_interval(days => days), now() + interval '30 days')
  where id = listing_id and seller_id = auth.uid() and status = 'active'
  returning featured_until into until;
  if until is null then raise exception 'Listing not found or not yours'; end if;
  return until;
end $$;

-- 5. Stripe webhook idempotency: each Checkout session extends a listing once.
create table public.tm_payments (session_id text primary key, listing_id text not null, created_at timestamptz not null default now());
alter table public.tm_payments enable row level security;

-- 6. Photo bucket: images only, 8 MB.
update storage.buckets set file_size_limit = 8388608, allowed_mime_types = array['image/jpeg','image/png','image/webp','image/heic','image/heif'] where id = 'tm-listing-photos';
