alter table public.tm_listings add column price_value numeric generated always as (
  case when price ilike '%free%' then 0
  else nullif(replace(substring(price from '[0-9][0-9,]*(?:\.[0-9]+)?'), ',', ''), '')::numeric end) stored;
create index tm_listings_price_idx on public.tm_listings (price_value);
create index tm_listings_status_created_idx on public.tm_listings (status, created_at desc);
