-- Let a nurse claim an unassigned pending job for themselves.
--
-- 0002_rls gave nurses appt_open_pool_read (SELECT) over the open pool, but the
-- only UPDATE policy was appt_participant_update, whose USING requires
-- patient_id = auth.uid() or nurse_id = auth.uid(). On an open row nurse_id is
-- NULL and the patient is someone else, so a claiming nurse matched no UPDATE
-- policy: the write silently affected zero rows and assign-self failed.
create policy appt_open_pool_claim on public.appointments
  for update
  using (
    nurse_id is null
    and status = 'pending'
    and public.current_user_role() = 'nurse'
  )
  with check (
    nurse_id = auth.uid()
    and status = 'confirmed'
  );
