-- Live nurse tracking needs UPDATE events over Realtime. The default replica
-- identity only logs the primary key for the old tuple, which Supabase Realtime
-- requires for UPDATE/DELETE.
--
-- NOTE: applied and verified insufficient on its own — UPDATE events still do
-- not reach subscribers on this project (INSERTs do). Kept because it IS a
-- documented requirement for UPDATE events; the remaining cause is elsewhere.
alter table public.appointments replica identity full;
