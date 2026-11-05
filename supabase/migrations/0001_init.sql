-- Tristate Market: first schema. Not applied yet (waiting on a Supabase project).
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null default '',
  seller_type text not null default 'Private seller',
  created_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles on delete cascade,
  kind text not null,
  title text not null check (char_length(title) between 3 and 140),
  place text not null,
  price text not null default '',
  condition text not null default '',
  description text not null default '',
  details jsonb not null default '[]',
  photos text[] not null default '{}',
  featured boolean not null default false,
  status text not null default 'active' check (status in ('active', 'sold', 'removed')),
  created_at timestamptz not null default now()
);
create index listings_kind_idx on public.listings (kind, created_at desc);

create table public.saves (
  user_id uuid not null references public.profiles on delete cascade,
  listing_id uuid not null references public.listings on delete cascade,
  primary key (user_id, listing_id)
);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.saves enable row level security;

create policy "profiles are public" on public.profiles for select using (true);
create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "active listings are public" on public.listings for select using (status = 'active' or auth.uid() = seller_id);
create policy "sellers manage own listings" on public.listings for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
create policy "own saves" on public.saves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true) on conflict do nothing;
create policy "anyone can view photos" on storage.objects for select using (bucket_id = 'listing-photos');
create policy "signed-in users upload to their folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
