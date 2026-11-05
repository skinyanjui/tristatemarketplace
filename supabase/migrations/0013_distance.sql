alter table public.tm_listings add column lat double precision, add column lng double precision;
update public.tm_listings set (lat, lng) = (select v.lat, v.lng from (values
  ('Evansville, IN', 37.9748, -87.5558), ('Newburgh, IN', 37.9445, -87.4056), ('Henderson, KY', 37.8362, -87.5900),
  ('Boonville, IN', 38.0492, -87.2739), ('Mount Vernon, IN', 37.9323, -87.8950), ('Posey County, IN', 37.9323, -87.8950),
  ('Princeton, IN', 38.3553, -87.5681), ('Mount Carmel, IL', 38.4109, -87.7614)
) as v(place, lat, lng) where v.place = tm_listings.place);

-- Ids of listings within `miles` of a point (great-circle distance). Runs with the caller's RLS.
create or replace function public.tm_near(c_lat double precision, c_lng double precision, miles double precision)
returns setof text language sql stable security invoker set search_path = public as $$
  select id from public.tm_listings
  where lat is not null and lng is not null
    and 3958.8 * 2 * asin(sqrt(
      power(sin(radians(lat - c_lat) / 2), 2) +
      cos(radians(c_lat)) * cos(radians(lat)) * power(sin(radians(lng - c_lng) / 2), 2)
    )) <= miles;
$$;
