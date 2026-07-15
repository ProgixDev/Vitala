-- What jobs a nurse wants offered, as opposed to what they're qualified for.
--
-- Deliberately NOT reusing nurse_profiles.specializations: that's free-text
-- (TagInput), so it already holds a mix of labels and slugs ('Wound Care' vs
-- 'wound-care') and can't be matched against services.category reliably. It's a
-- credentials/display field; this is a preference.
alter table public.nurse_profiles
  add column if not exists max_radius_km int not null default 25
    constraint nurse_radius_sane check (max_radius_km between 1 and 200),
  -- Empty means "no preference" — offer everything. Values are service category
  -- slugs; kept loose (text[]) rather than an enum so adding a service category
  -- doesn't require a migration here too.
  add column if not exists job_categories text[] not null default '{}';

comment on column public.nurse_profiles.max_radius_km is
  'Nurse-set radius for the open job pool. Applied client-side today.';
comment on column public.nurse_profiles.job_categories is
  'Service category slugs the nurse wants offered. Empty = all.';
