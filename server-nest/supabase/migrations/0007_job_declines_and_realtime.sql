-- A nurse passing on an open job. The appointment stays pending in the pool for
-- everyone else; it just stops being offered to this nurse. Distinct from the
-- terminal `declined` status, which kills the appointment for all nurses.
create table if not exists public.appointment_declines (
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  nurse_id       uuid not null references public.profiles(id) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (appointment_id, nurse_id)
);

-- unassigned() filters by nurse_id, so lead with it.
create index if not exists idx_appt_declines_nurse
  on public.appointment_declines(nurse_id);

alter table public.appointment_declines enable row level security;

-- A nurse may only record and see their own passes.
create policy appt_declines_own on public.appointment_declines
  for all
  using (nurse_id = auth.uid() or public.is_admin())
  with check (nurse_id = auth.uid() and public.current_user_role() = 'nurse');

-- Realtime: nurses subscribe to INSERTs on appointments to get the incoming-job
-- sheet without polling. postgres_changes applies RLS per subscriber, so
-- appt_open_pool_read already scopes this to the open pool for nurses only.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'appointments'
  ) then
    alter publication supabase_realtime add table public.appointments;
  end if;
end $$;
