-- Turn contact on for the sample listings: their messages land in the site owner's inbox.
-- Demo rows stay is_demo = true, so they never count as the owner's own listings (see Account).
update public.tm_listings
set seller_id = (select id from auth.users where email = 'sam@sandalwoodmedical.com')
where is_demo and seller_id is null
  and exists (select 1 from auth.users where email = 'sam@sandalwoodmedical.com');
