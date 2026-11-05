-- Wanted posts: a buyer says what they are looking for; sellers reply with "I have this".
alter table public.tm_listings add column if not exists wanted boolean not null default false;
create index if not exists tm_listings_wanted_idx on public.tm_listings (wanted) where wanted;

-- Saved searches: the filters a member wants to re-run (one row per distinct query).
create table if not exists public.tm_saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 120),
  query text not null check (char_length(query) <= 500),
  created_at timestamptz not null default now(),
  unique (user_id, query)
);
alter table public.tm_saved_searches enable row level security;
create policy "own saved searches select" on public.tm_saved_searches for select to authenticated using (user_id = auth.uid());
create policy "own saved searches insert" on public.tm_saved_searches for insert to authenticated with check (user_id = auth.uid() and (select count(*) from public.tm_saved_searches s where s.user_id = auth.uid()) < 20);
create policy "own saved searches delete" on public.tm_saved_searches for delete to authenticated using (user_id = auth.uid());

-- Sample wanted posts (demo data; remove with: delete from public.tm_listings where is_demo and wanted;)
insert into public.tm_listings (id, seller_name, seller_meta, kind, title, place, price, condition, description, details, is_demo, wanted) values
 ('wanted-trailer', 'Marcus T.', 'Private buyer', 'trailer', 'Wanted: 16 ft utility trailer, tilt or ramp', 'Henderson, KY', '$2,500', 'Used OK', 'Starting a small landscaping side job and need a dependable trailer. Can pick up within 60 miles. Title in hand required.', '[["Length","14 to 18 ft"],["Needs","Clear title"]]', true, true),
 ('wanted-sofa', 'Priya N.', 'Private buyer', 'furniture', 'Wanted: sectional sofa for a small apartment', 'Evansville, IN', '$400', 'Used OK', 'Looking for a clean, pet-free sectional that fits a 12 ft wall. Can pick up this week.', '[["Material","Fabric or leather"],["Width","Under 12 ft"]]', true, true),
 ('wanted-mower', 'Dale W.', 'Private buyer', 'garden', 'Wanted: working riding mower, 42 in deck or larger', 'Newburgh, IN', '$900', 'Used OK', 'Need a mower that starts and cuts. Happy to look at one that needs minor work.', '[["Deck","42 in or larger"]]', true, true)
on conflict (id) do nothing;
