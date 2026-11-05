-- Moderators. Add one with: insert into public.tm_admins select id from auth.users where email = 'you@example.com';
create table public.tm_admins (user_id uuid primary key references auth.users on delete cascade);
alter table public.tm_admins enable row level security;
create function public.tm_is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.tm_admins where user_id = auth.uid());
$$;
revoke all on function public.tm_is_admin() from public, anon;
grant execute on function public.tm_is_admin() to authenticated;
create policy "tm admins see themselves" on public.tm_admins for select to authenticated using (user_id = auth.uid());
create policy "tm admins read reports" on public.tm_reports for select to authenticated using (public.tm_is_admin());
create policy "tm admins delete reports" on public.tm_reports for delete to authenticated using (public.tm_is_admin());
create policy "tm admins read all listings" on public.tm_listings for select to authenticated using (public.tm_is_admin());
create policy "tm admins moderate listings" on public.tm_listings for update to authenticated using (public.tm_is_admin()) with check (public.tm_is_admin());
