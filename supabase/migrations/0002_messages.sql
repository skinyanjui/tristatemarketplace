-- Buyer-to-seller messages. Buyers must be signed in; only the seller (and the sender) can read a message.
create table public.tm_messages (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null references public.tm_listings on delete cascade,
  seller_id uuid not null references auth.users on delete cascade,
  sender_id uuid not null references auth.users on delete cascade default auth.uid(),
  sender_email text not null,
  body text not null check (char_length(body) between 2 and 2000),
  created_at timestamptz not null default now()
);
create index tm_messages_seller_idx on public.tm_messages (seller_id, created_at desc);
alter table public.tm_messages enable row level security;
create policy "tm send message" on public.tm_messages for insert to authenticated
  with check (sender_id = auth.uid() and sender_email = (auth.jwt() ->> 'email') and seller_id <> auth.uid()
    and exists (select 1 from public.tm_listings l where l.id = listing_id and l.seller_id = tm_messages.seller_id and l.status = 'active'));
create policy "tm read own messages" on public.tm_messages for select to authenticated
  using (seller_id = auth.uid() or sender_id = auth.uid());
