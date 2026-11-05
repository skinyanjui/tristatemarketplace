-- Ranked search: word stems (drill/drills), category synonyms (truck finds Cars), prefixes (dri),
-- and typo tolerance (pupies, retriver). Runs with the caller's row security.

create or replace function public.tm_kind_words(k text) returns text language sql immutable as $$
  select case k
    when 'car' then 'car cars vehicle vehicles auto automobile truck trucks suv sedan'
    when 'home' then 'real estate house houses home homes property rent'
    when 'land' then 'land lot lots acreage acres property'
    when 'livestock' then 'livestock cattle cows cow horses horse goats sheep animals'
    when 'sale' then 'garage sale yard sale estate sale moving sale'
    when 'event' then 'event events concert festival market show'
    when 'moto' then 'motorcycle motorcycles motorbike bike cruiser'
    when 'boat' then 'boat boats rv camper pontoon trailer'
    when 'trailer' then 'trailer trailers hauler camper'
    when 'farm' then 'farm equipment tractor implement'
    when 'furniture' then 'furniture couch sofa table chair dresser bed'
    when 'appliance' then 'appliance appliances fridge refrigerator washer dryer stove'
    when 'tools' then 'tools tool drill saw'
    when 'garden' then 'lawn garden mower yard outdoor'
    when 'electronics' then 'electronics tv television computer laptop phone'
    when 'sports' then 'sports fitness bike bicycle outdoors'
    when 'clothing' then 'clothing clothes apparel shoes'
    when 'kids' then 'kids baby children child toys crib'
    when 'antiques' then 'antique antiques vintage collectible'
    when 'music' then 'music instrument instruments guitar piano drums'
    when 'pets' then 'pets pet dog dogs puppy puppies cat kitten'
    when 'services' then 'service services contractor repair'
    when 'jobs' then 'job jobs hiring work employment'
    when 'free' then 'free giveaway'
    else '' end
$$;

alter table public.tm_listings add column search tsvector generated always as (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(place, '') || ' ' || public.tm_kind_words(kind)), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C')
) stored;
create index tm_listings_fts_idx on public.tm_listings using gin (search);

-- Ids of listings matching q, best first (at most 300).
create or replace function public.tm_search(q text) returns table (id text, score real)
language sql stable security invoker set search_path = public, extensions as $$
  with t as (
    select lower(trim(regexp_replace(q, '[^[:alnum:] ]', ' ', 'g'))) as clean
  ), tok as (
    select clean, (regexp_split_to_array(clean, '\s+')) as words from t where clean <> ''
  ), qq as (
    select clean,
      websearch_to_tsquery('english', clean) as and_q,
      websearch_to_tsquery('english', array_to_string(words, ' or ')) as or_q,
      case when length(words[array_length(words, 1)]) >= 2 then to_tsquery('simple', words[array_length(words, 1)] || ':*') end as pre_q
    from tok
  )
  select l.id,
    (case when l.search @@ qq.and_q then 3 else 0 end
     + 2 * ts_rank_cd(l.search, qq.and_q) + ts_rank_cd(l.search, qq.or_q)
     + case when qq.pre_q is not null and l.search @@ qq.pre_q then 0.5 else 0 end
     + case when l.title ilike '%' || qq.clean || '%' then 1.5 else 0 end
     + similarity(l.title, qq.clean) + word_similarity(qq.clean, l.title) * 0.5)::real as score
  from public.tm_listings l, qq
  where l.search @@ qq.and_q or l.search @@ qq.or_q or (qq.pre_q is not null and l.search @@ qq.pre_q)
     or similarity(l.title, qq.clean) > 0.25 or word_similarity(qq.clean, l.title) > 0.5
  order by score desc
  limit 300
$$;
grant execute on function public.tm_search(text) to anon, authenticated;
