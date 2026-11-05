-- Anyone can report a listing; nobody can read reports through the public API (review them in the dashboard).
create table public.tm_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null references public.tm_listings on delete cascade,
  reporter_id uuid references auth.users on delete set null default auth.uid(),
  reason text not null check (reason in ('scam','prohibited','wrong_category','duplicate','other')),
  details text not null default '' check (char_length(details) <= 1000),
  created_at timestamptz not null default now()
);
alter table public.tm_reports enable row level security;
create policy "tm anyone can report" on public.tm_reports for insert to anon, authenticated
  with check (reporter_id is null or reporter_id = auth.uid());
