-- Members ask to be verified; admins approve or decline. Approval sets the profile's Verified badge.
create table public.tm_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  display_name text not null check (char_length(display_name) between 2 and 60),
  contact text not null check (char_length(contact) between 4 and 200),
  details text not null default '' check (char_length(details) <= 1000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  decision_note text check (decision_note is null or char_length(decision_note) <= 300),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create unique index tm_verification_one_pending on public.tm_verification_requests (user_id) where status = 'pending';
create index tm_verification_status_idx on public.tm_verification_requests (status, created_at);
alter table public.tm_verification_requests enable row level security;
create policy "tm members ask for verification" on public.tm_verification_requests for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and decision_note is null and decided_at is null);
create policy "tm members read own verification requests" on public.tm_verification_requests for select to authenticated
  using (user_id = auth.uid() or public.tm_is_admin());

create or replace function public.tm_decide_verification(req_id uuid, approve boolean, note text default null) returns void
language plpgsql security definer set search_path = public as $$
declare r public.tm_verification_requests;
begin
  if not public.tm_is_admin() then raise exception 'Admins only.'; end if;
  select * into r from public.tm_verification_requests where id = req_id and status = 'pending' for update;
  if not found then raise exception 'That request has already been handled.'; end if;
  update public.tm_verification_requests set status = case when approve then 'approved' else 'declined' end, decision_note = left(note, 300), decided_at = now() where id = req_id;
  if approve then perform public.tm_set_verified(r.user_id, true, r.display_name); end if;
end $$;
revoke all on function public.tm_decide_verification(uuid, boolean, text) from public, anon;
grant execute on function public.tm_decide_verification(uuid, boolean, text) to authenticated;
