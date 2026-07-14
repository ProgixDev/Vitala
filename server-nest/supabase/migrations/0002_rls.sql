-- ============================================================================
-- Row Level Security — defense-in-depth beneath the NestJS guards.
-- Rule of thumb: patients see their own rows, nurses see rows assigned to them,
-- admins see everything. The service-role key (server-only) bypasses all of this.
-- ============================================================================

alter table public.profiles            enable row level security;
alter table public.medical_profiles    enable row level security;
alter table public.nurse_profiles      enable row level security;
alter table public.nurse_availability  enable row level security;
alter table public.locations           enable row level security;
alter table public.user_settings       enable row level security;
alter table public.services            enable row level security;
alter table public.appointments        enable row level security;
alter table public.payments            enable row level security;
alter table public.reviews             enable row level security;
alter table public.notifications       enable row level security;
alter table public.emergency_requests  enable row level security;
alter table public.emergency_contacts  enable row level security;

-- ---------- profiles --------------------------------------------------------
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.is_admin());
-- Nurses are publicly discoverable so patients can browse/book them.
create policy profiles_nurse_public on public.profiles
  for select using (role = 'nurse' and status = 'active');
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- owner-only tables (keyed by profile_id = auth.uid()) ------------
create policy medical_owner on public.medical_profiles
  for all using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid());

create policy nurse_profile_read on public.nurse_profiles
  for select using (true); -- nurse profiles are public for browsing
create policy nurse_profile_write on public.nurse_profiles
  for update using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

create policy availability_read on public.nurse_availability
  for select using (true);
create policy availability_owner on public.nurse_availability
  for all using (nurse_id = auth.uid() or public.is_admin())
  with check (nurse_id = auth.uid());

create policy locations_owner on public.locations
  for all using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid());

create policy settings_owner on public.user_settings
  for all using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid());

create policy contacts_owner on public.emergency_contacts
  for all using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid());

-- ---------- services (public catalog; admin-managed) -----------------------
create policy services_read on public.services
  for select using (true);
create policy services_admin_write on public.services
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- appointments (patient OR assigned nurse OR admin) --------------
create policy appt_participant_read on public.appointments
  for select using (
    patient_id = auth.uid() or nurse_id = auth.uid() or public.is_admin()
  );
create policy appt_patient_create on public.appointments
  for insert with check (patient_id = auth.uid());
create policy appt_participant_update on public.appointments
  for update using (
    patient_id = auth.uid() or nurse_id = auth.uid() or public.is_admin()
  );
-- Unassigned appointments are visible to nurses so they can accept jobs.
create policy appt_open_pool_read on public.appointments
  for select using (
    nurse_id is null and status = 'pending' and public.current_user_role() = 'nurse'
  );

-- ---------- payments (owner OR admin) --------------------------------------
create policy payments_owner_read on public.payments
  for select using (user_id = auth.uid() or public.is_admin());
create policy payments_admin_write on public.payments
  for all using (public.is_admin()) with check (public.is_admin());
-- Note: payment creation/mutation happens through the service-role client in
-- the Stripe flow, which bypasses RLS — so we keep client writes admin-only.

-- ---------- reviews (public read; patient authors) -------------------------
create policy reviews_read on public.reviews
  for select using (not is_hidden or public.is_admin());
create policy reviews_patient_write on public.reviews
  for insert with check (patient_id = auth.uid());
create policy reviews_owner_update on public.reviews
  for update using (
    patient_id = auth.uid() or nurse_id = auth.uid() or public.is_admin()
  );

-- ---------- notifications (owner only) -------------------------------------
create policy notifications_owner on public.notifications
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- ---------- emergency requests (patient OR assigned OR admin) --------------
create policy emergency_owner_read on public.emergency_requests
  for select using (
    patient_id = auth.uid() or auth.uid() = any(assigned_personnel) or public.is_admin()
  );
create policy emergency_patient_create on public.emergency_requests
  for insert with check (patient_id = auth.uid());
create policy emergency_update on public.emergency_requests
  for update using (
    patient_id = auth.uid() or auth.uid() = any(assigned_personnel) or public.is_admin()
  );

-- ============================================================================
-- Storage buckets (replace Cloudinary)
-- ============================================================================
insert into storage.buckets (id, name, public)
values
  ('avatars',   'avatars',   true),   -- profile pictures, publicly served
  ('nurse-docs','nurse-docs',false),  -- ID docs + selfies, private/verification-only
  ('receipts',  'receipts',  false)   -- payment receipts, owner-only
on conflict (id) do nothing;

-- Avatars: anyone can read; a user manages only files under their own uid prefix.
create policy avatars_read on storage.objects
  for select using (bucket_id = 'avatars');
create policy avatars_write on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy avatars_update on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Nurse docs: owner or admin only.
create policy nurse_docs_owner on storage.objects
  for all using (
    bucket_id = 'nurse-docs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- Receipts: owner or admin only.
create policy receipts_owner on storage.objects
  for select using (
    bucket_id = 'receipts'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
