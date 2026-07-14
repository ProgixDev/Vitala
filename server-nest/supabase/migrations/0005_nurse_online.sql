-- Nurse "on duty" flag — whether they're taking new visits right now.
-- The weekly-slots table (nurse_availability) already exists from 0001_init;
-- this just adds the real-time on/off signal the nurse toggles in the app.
alter table public.nurse_profiles
  add column if not exists is_online boolean not null default false;
