-- Security fix: inside a SECURITY DEFINER function current_user is the owner, so the old check let any member self-verify.
create or replace function public.tm_set_verified(uid uuid, is_verified boolean, name text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not (public.tm_is_admin() or (auth.uid() is null and session_user in ('postgres', 'supabase_admin'))) then raise exception 'Admins only.'; end if;
  insert into public.tm_profiles (user_id, display_name, verified, verified_at)
  values (uid, coalesce(name, (select split_part(email, '@', 1) from auth.users where id = uid)), is_verified, case when is_verified then now() end)
  on conflict (user_id) do update set verified = is_verified, verified_at = case when is_verified then now() end, display_name = coalesce(name, tm_profiles.display_name);
end $$;
