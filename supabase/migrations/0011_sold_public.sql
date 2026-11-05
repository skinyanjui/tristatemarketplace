-- Sold listings stay visible (with a Sold badge); removed/pending ones stay private.
drop policy if exists "tm active listings are public" on public.tm_listings;
create policy "tm active listings are public" on public.tm_listings for select
  using (status in ('active','sold') or auth.uid() = seller_id);
