-- Maximum distance is a preference, not a requirement: NULL means "no limit",
-- and that is now the starting state. 0008 gave the column `not null default
-- 25`, which made every nurse look like they had picked a 25 km radius when in
-- fact nobody had chosen anything — so the default is cleared here too.
alter table public.nurse_profiles
  alter column max_radius_km drop default,
  alter column max_radius_km drop not null;

-- Nobody explicitly chose 25 — it was the 0008 default handed to every row.
update public.nurse_profiles set max_radius_km = null where max_radius_km = 25;

comment on column public.nurse_profiles.max_radius_km is
  'Nurse-set radius for the open job pool, NULL = no limit. Applied client-side today.';
