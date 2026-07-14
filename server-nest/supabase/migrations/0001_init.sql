-- ============================================================================
-- Vitala — initial schema (Supabase Postgres)
-- Identity lives in auth.users; everything app-specific hangs off profiles.id.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------- Enums -----------------------------------------------------------
create type user_role            as enum ('patient', 'nurse', 'admin');
create type user_status          as enum ('active', 'pending', 'suspended', 'rejected');
create type gender_type          as enum ('male', 'female', 'other');
create type blood_type           as enum ('A+','A-','B+','B-','AB+','AB-','O+','O-');
create type verification_status  as enum ('pending', 'approved', 'rejected');
create type service_category     as enum (
  'general-care','wound-care','elderly-care','post-surgery',
  'medication-administration','vital-monitoring','emergency','other');
create type appointment_type     as enum ('normal', 'emergency');
create type appointment_status   as enum (
  'pending','confirmed','on-the-way','in-progress','completed','cancelled','declined');
create type payment_method       as enum ('credit_card','debit_card','paypal','stripe','cash');
create type payment_status       as enum (
  'pending','processing','completed','failed','cancelled','refunded');
create type notification_type    as enum (
  'appointment','payment','message','emergency','system','promotion','verification');
create type notification_priority as enum ('low','medium','high','urgent');
create type emergency_type       as enum ('nurse-alert','ambulance','family-alert');
create type emergency_status     as enum (
  'pending','dispatched','en-route','on-scene','completed','cancelled');
create type contact_relationship as enum (
  'spouse','parent','child','sibling','friend','guardian','other');

-- ---------- updated_at helper ----------------------------------------------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ---------- profiles (1:1 with auth.users) ---------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          user_role   not null default 'patient',
  status        user_status not null default 'active',
  full_name     text        not null,
  phone         text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- medical_profiles (patient) -------------------------------------
create table public.medical_profiles (
  profile_id        uuid primary key references public.profiles(id) on delete cascade,
  gender            gender_type,
  date_of_birth     date,
  blood_type        blood_type,
  allergies         text[] not null default '{}',
  chronic_illnesses text[] not null default '{}',
  height_cm         numeric,
  weight_kg         numeric,
  updated_at        timestamptz not null default now()
);
create trigger trg_medical_updated before update on public.medical_profiles
  for each row execute function public.set_updated_at();

-- ---------- nurse_profiles --------------------------------------------------
create table public.nurse_profiles (
  profile_id          uuid primary key references public.profiles(id) on delete cascade,
  license_number      text,
  specializations     text[] not null default '{}',
  experience_years    int,
  id_doc_front_url    text,
  id_doc_back_url     text,
  selfie_url          text,
  verification_status verification_status not null default 'pending',
  rejection_reason    text,
  rating              numeric not null default 0 check (rating between 0 and 5),
  total_reviews       int     not null default 0,
  updated_at          timestamptz not null default now()
);
create trigger trg_nurse_updated before update on public.nurse_profiles
  for each row execute function public.set_updated_at();

-- ---------- nurse_availability (weekly slots) ------------------------------
create table public.nurse_availability (
  id         uuid primary key default gen_random_uuid(),
  nurse_id   uuid not null references public.profiles(id) on delete cascade,
  weekday    smallint not null check (weekday between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time   time not null
);
create index idx_availability_nurse on public.nurse_availability(nurse_id);

-- ---------- locations (saved addresses) ------------------------------------
create table public.locations (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label      text,
  address    text not null,
  latitude   numeric,
  longitude  numeric,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_locations_profile on public.locations(profile_id);

-- ---------- settings (1:1) --------------------------------------------------
create table public.user_settings (
  profile_id      uuid primary key references public.profiles(id) on delete cascade,
  notify_push     boolean not null default true,
  notify_email    boolean not null default true,
  notify_sms      boolean not null default false,
  share_location  boolean not null default true,
  language        text    not null default 'en',
  dark_mode       boolean not null default false,
  biometric_auth  boolean not null default false,
  expo_push_token text,
  updated_at      timestamptz not null default now()
);
create trigger trg_settings_updated before update on public.user_settings
  for each row execute function public.set_updated_at();

-- ---------- services (catalog) ---------------------------------------------
create table public.services (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text not null,
  category     service_category not null,
  price        numeric not null,
  duration_min int not null default 60,
  is_available boolean not null default true,
  icon         text,
  image_url    text,
  requirements text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_services_updated before update on public.services
  for each row execute function public.set_updated_at();

-- ---------- appointments ----------------------------------------------------
create table public.appointments (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid not null references public.profiles(id) on delete cascade,
  nurse_id          uuid references public.profiles(id) on delete set null,
  service_id        uuid references public.services(id) on delete set null,
  appointment_type  appointment_type   not null default 'normal',
  status            appointment_status not null default 'pending',
  scheduled_date    date not null,
  scheduled_start   time not null,
  scheduled_end     time,
  address           text not null,
  latitude          numeric,
  longitude         numeric,
  location_label    text,
  symptoms          text,
  notes             text,
  price             numeric not null,
  duration_min      int not null default 60,
  -- live tracking of the nurse
  nurse_lat         numeric,
  nurse_lng         numeric,
  nurse_loc_at      timestamptz,
  -- completion
  completion_notes  text,
  completed_at      timestamptz,
  -- cancellation
  cancellation_reason text,
  cancelled_by      uuid references public.profiles(id) on delete set null,
  cancelled_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index idx_appt_patient on public.appointments(patient_id, status);
create index idx_appt_nurse   on public.appointments(nurse_id, status);
create index idx_appt_date     on public.appointments(scheduled_date);
create trigger trg_appt_updated before update on public.appointments
  for each row execute function public.set_updated_at();

-- ---------- payments (1:1 appointment) -------------------------------------
create table public.payments (
  id                       uuid primary key default gen_random_uuid(),
  appointment_id           uuid not null unique references public.appointments(id) on delete cascade,
  user_id                  uuid not null references public.profiles(id) on delete cascade,
  amount                   numeric not null,
  currency                 text not null default 'USD',
  method                   payment_method,
  status                   payment_status not null default 'pending',
  stripe_payment_intent_id text,
  stripe_charge_id         text,
  receipt_url              text,
  receipt_number           text unique default ('REC-' || replace(gen_random_uuid()::text, '-', '')),
  refund_amount            numeric,
  refund_reason            text,
  refunded_at              timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index idx_payments_user on public.payments(user_id);
create trigger trg_payments_updated before update on public.payments
  for each row execute function public.set_updated_at();

-- ---------- reviews (patient -> nurse, 1:1 appointment) --------------------
create table public.reviews (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  patient_id     uuid not null references public.profiles(id) on delete cascade,
  nurse_id       uuid not null references public.profiles(id) on delete cascade,
  rating         smallint not null check (rating between 1 and 5),
  comment        text check (char_length(comment) <= 500),
  professionalism smallint check (professionalism between 1 and 5),
  punctuality     smallint check (punctuality between 1 and 5),
  communication   smallint check (communication between 1 and 5),
  care_quality    smallint check (care_quality between 1 and 5),
  is_reported    boolean not null default false,
  report_reason  text,
  is_hidden      boolean not null default false,
  nurse_response text,
  nurse_responded_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index idx_reviews_nurse on public.reviews(nurse_id, created_at desc);
create trigger trg_reviews_updated before update on public.reviews
  for each row execute function public.set_updated_at();

-- ---------- notifications ---------------------------------------------------
create table public.notifications (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  title              text not null,
  message            text not null,
  type               notification_type not null,
  priority           notification_priority not null default 'medium',
  is_read            boolean not null default false,
  read_at            timestamptz,
  related_appointment uuid references public.appointments(id) on delete set null,
  related_payment     uuid references public.payments(id) on delete set null,
  action_url         text,
  action_label       text,
  metadata           jsonb not null default '{}',
  created_at         timestamptz not null default now()
);
create index idx_notifications_user on public.notifications(user_id, is_read, created_at desc);

-- ---------- emergency_requests ---------------------------------------------
create table public.emergency_requests (
  id                 uuid primary key default gen_random_uuid(),
  patient_id         uuid not null references public.profiles(id) on delete cascade,
  type               emergency_type not null,
  appointment_id     uuid references public.appointments(id) on delete set null,
  description        text not null,
  address            text,
  latitude           numeric,
  longitude          numeric,
  status             emergency_status not null default 'pending',
  assigned_personnel uuid[] not null default '{}',
  eta                timestamptz,
  completed_at       timestamptz,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index idx_emergency_patient on public.emergency_requests(patient_id, status);
create trigger trg_emergency_updated before update on public.emergency_requests
  for each row execute function public.set_updated_at();

-- ---------- emergency_contacts ---------------------------------------------
create table public.emergency_contacts (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  relationship contact_relationship not null,
  phone        text not null,
  email        text,
  is_primary   boolean not null default false,
  address      text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index idx_contacts_profile on public.emergency_contacts(profile_id);
create trigger trg_contacts_updated before update on public.emergency_contacts
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Auto-create a profile (+ settings, + role-specific row) on signup.
-- Role/full_name/phone come from the signup payload's user_metadata.
-- ============================================================================
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_role user_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'patient');
begin
  insert into public.profiles (id, role, full_name, phone, status)
  values (
    new.id,
    v_role,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    case when v_role = 'nurse' then 'pending'::user_status else 'active'::user_status end
  );

  insert into public.user_settings (profile_id) values (new.id);

  if v_role = 'patient' then
    insert into public.medical_profiles (profile_id) values (new.id);
  elsif v_role = 'nurse' then
    insert into public.nurse_profiles (profile_id) values (new.id);
  end if;

  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- RLS helper: read the caller's role WITHOUT recursing into profiles policies.
-- SECURITY DEFINER runs as owner and bypasses RLS.
-- ============================================================================
create or replace function public.current_user_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
