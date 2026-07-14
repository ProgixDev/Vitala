-- ============================================================================
-- Seed: services catalog (safe to run repeatedly).
-- User/appointment seed data is created via the API seed script instead,
-- because users must exist in auth.users first.
-- ============================================================================
insert into public.services (name, description, category, price, duration_min, icon) values
  ('General Home Care',        'Routine at-home nursing care and check-ups.',        'general-care',              60,  60, 'stethoscope'),
  ('Wound Care',               'Cleaning, dressing and monitoring of wounds.',       'wound-care',                75,  45, 'bandage'),
  ('Elderly Care',             'Daily assistance and monitoring for seniors.',       'elderly-care',              80,  90, 'accessibility'),
  ('Post-Surgery Care',        'Recovery support and follow-up after surgery.',      'post-surgery',              95,  60, 'activity'),
  ('Medication Administration','Administering and managing prescribed medication.',  'medication-administration', 50,  30, 'pill'),
  ('Vital Signs Monitoring',   'Blood pressure, heart rate and vitals monitoring.',  'vital-monitoring',          45,  30, 'heart-pulse'),
  ('Emergency Nursing',        'Urgent at-home nursing response.',                   'emergency',                120, 60, 'siren')
on conflict do nothing;
