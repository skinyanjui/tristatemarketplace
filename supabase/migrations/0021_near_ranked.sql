-- Listings within a radius, nearest first, for the "Closest first" sort.
create or replace function public.tm_near_ranked(c_lat double precision, c_lng double precision, miles double precision)
returns table(id text, dist double precision) language sql stable security invoker set search_path = public as $$
  select id, d from (
    select id, 3958.8 * 2 * asin(sqrt(
      power(sin(radians(lat - c_lat) / 2), 2) +
      cos(radians(c_lat)) * cos(radians(lat)) * power(sin(radians(lng - c_lng) / 2), 2)
    )) as d
    from public.tm_listings where lat is not null and lng is not null
  ) x where d <= miles order by d, id;
$$;
grant execute on function public.tm_near_ranked(double precision, double precision, double precision) to anon, authenticated;
