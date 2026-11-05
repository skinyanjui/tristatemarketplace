alter table public.tm_listings add column event_date date;
create index tm_listings_event_date_idx on public.tm_listings (event_date) where event_date is not null;
-- Demo events and sales get real dates (see the Date row in each listing's details).
update public.tm_listings set event_date = case id
  when 'acoustic-night' then date '2026-11-06'
  when 'maker-market' then date '2026-11-14'
  when 'neighborhood-sale' then date '2026-11-08'
  when 'moving-sale' then date '2026-11-07'
  when 'estate-evv' then date '2026-11-07'
  when 'multi-family' then date '2026-11-07' end
where id in ('acoustic-night','maker-market','neighborhood-sale','moving-sale','estate-evv','multi-family');
