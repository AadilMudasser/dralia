-- ============================================================
-- AQ Wellness Portal — Database Schema (Reference)
-- ============================================================
-- This file documents the schema already deployed to the
-- "dralia" Supabase project. It is provided for reference and
-- disaster recovery — you do NOT need to run this if you are
-- using the existing "dralia" project, since all tables, RLS
-- policies, triggers, and storage buckets are already live.
--
-- If you ever need to recreate this on a FRESH Supabase project,
-- run this file in the Supabase SQL Editor from top to bottom.
-- ============================================================

create extension if not exists "uuid-ossp" with schema extensions;

-- ============================================================
-- TABLES
-- ============================================================

-- One row per authenticated user (doctor or patient), 1:1 with auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('doctor', 'patient')),
  full_name text not null,
  email text not null,
  phone text,
  date_of_birth date,
  gender text,
  address text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Extends profiles with patient-specific medical fields.
-- id is the SAME id as the linked profiles row (1:1).
create table public.patients (
  id uuid primary key references public.profiles(id) on delete cascade,
  medical_history text,
  goals text,
  height_cm numeric,
  weight_kg numeric,
  emergency_contact_name text,
  emergency_contact_phone text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.progress_photos (
  id uuid primary key default extensions.uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  photo_type text not null check (photo_type in ('front', 'side', 'back')),
  storage_path text not null,
  notes text,
  uploaded_at timestamptz not null default now()
);

create table public.forms (
  id uuid primary key default extensions.uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  title text not null,
  form_url text not null,
  assigned_by uuid references public.profiles(id),
  status text not null default 'pending' check (status in ('pending', 'completed')),
  assigned_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.treatment_plans (
  id uuid primary key default extensions.uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  plan_type text not null check (plan_type in ('diet', 'exercise', 'physiotherapy', 'supplement', 'lifestyle')),
  title text not null,
  description text,
  plan_date date not null default current_date,
  attachment_path text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consultation_notes (
  id uuid primary key default extensions.uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  note text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default extensions.uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  title text not null,
  message text,
  type text not null check (type in ('form', 'plan', 'note', 'general')),
  reference_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- HELPER FUNCTION
-- ============================================================

create or replace function public.is_doctor()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'doctor'
  );
$$;

-- ============================================================
-- TRIGGERS — updated_at maintenance
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_patients_updated before update on public.patients
  for each row execute function public.set_updated_at();
create trigger trg_plans_updated before update on public.treatment_plans
  for each row execute function public.set_updated_at();

-- ============================================================
-- TRIGGERS — auto-create notifications
-- ============================================================

create or replace function public.notify_on_form_assigned()
returns trigger language plpgsql as $$
begin
  insert into public.notifications (patient_id, title, message, type, reference_id)
  values (new.patient_id, 'New form assigned', new.title, 'form', new.id);
  return new;
end;
$$;
create trigger trg_notify_form after insert on public.forms
  for each row execute function public.notify_on_form_assigned();

create or replace function public.notify_on_plan_assigned()
returns trigger language plpgsql as $$
begin
  insert into public.notifications (patient_id, title, message, type, reference_id)
  values (new.patient_id, 'New treatment plan added', new.title, 'plan', new.id);
  return new;
end;
$$;
create trigger trg_notify_plan after insert on public.treatment_plans
  for each row execute function public.notify_on_plan_assigned();

create or replace function public.notify_on_note_added()
returns trigger language plpgsql as $$
begin
  insert into public.notifications (patient_id, title, message, type, reference_id)
  values (new.patient_id, 'New consultation note', left(new.note, 80), 'note', new.id);
  return new;
end;
$$;
create trigger trg_notify_note after insert on public.consultation_notes
  for each row execute function public.notify_on_note_added();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.progress_photos enable row level security;
alter table public.forms enable row level security;
alter table public.treatment_plans enable row level security;
alter table public.consultation_notes enable row level security;
alter table public.notifications enable row level security;

-- profiles
create policy "doctor full access profiles" on public.profiles for all using (is_doctor()) with check (is_doctor());
create policy "patient view own profile" on public.profiles for select using (id = auth.uid());
create policy "patient update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- patients
create policy "doctor full access patients" on public.patients for all using (is_doctor()) with check (is_doctor());
create policy "patient view own record" on public.patients for select using (id = auth.uid());

-- progress_photos
create policy "doctor full access photos" on public.progress_photos for all using (is_doctor()) with check (is_doctor());
create policy "patient view own photos" on public.progress_photos for select using (patient_id = auth.uid());
create policy "patient upload own photos" on public.progress_photos for insert with check (patient_id = auth.uid());

-- forms
create policy "doctor full access forms" on public.forms for all using (is_doctor()) with check (is_doctor());
create policy "patient view own forms" on public.forms for select using (patient_id = auth.uid());
create policy "patient complete own forms" on public.forms for update using (patient_id = auth.uid()) with check (patient_id = auth.uid());

-- treatment_plans
create policy "doctor full access plans" on public.treatment_plans for all using (is_doctor()) with check (is_doctor());
create policy "patient view own plans" on public.treatment_plans for select using (patient_id = auth.uid());

-- consultation_notes
create policy "doctor full access notes" on public.consultation_notes for all using (is_doctor()) with check (is_doctor());
create policy "patient view own notes" on public.consultation_notes for select using (patient_id = auth.uid());

-- notifications
create policy "doctor full access notifications" on public.notifications for all using (is_doctor()) with check (is_doctor());
create policy "patient view own notifications" on public.notifications for select using (patient_id = auth.uid());
create policy "patient update own notifications" on public.notifications for update using (patient_id = auth.uid()) with check (patient_id = auth.uid());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (id, name, public) values ('progress-photos', 'progress-photos', false);
insert into storage.buckets (id, name, public) values ('attachments', 'attachments', false);
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Storage policies use a {user_id}/filename folder convention,
-- e.g. progress-photos/<patient_uuid>/front-12345.jpg

create policy "anyone view avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "patient upload own avatar" on storage.objects for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "patient update own avatar" on storage.objects for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "doctor manage avatars storage" on storage.objects for all using (bucket_id = 'avatars' and is_doctor()) with check (bucket_id = 'avatars' and is_doctor());

create policy "patient view own progress photos" on storage.objects for select using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "patient upload own progress photos" on storage.objects for insert with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "doctor manage progress photos storage" on storage.objects for all using (bucket_id = 'progress-photos' and is_doctor()) with check (bucket_id = 'progress-photos' and is_doctor());

create policy "patient view own attachments" on storage.objects for select using (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "doctor manage attachments storage" on storage.objects for all using (bucket_id = 'attachments' and is_doctor()) with check (bucket_id = 'attachments' and is_doctor());

-- ============================================================
-- SEED: the one doctor account
-- ============================================================
-- The doctor's auth user must be created first via the Supabase
-- Dashboard (Authentication > Users > Add user), or via the
-- Supabase Admin API. Then insert their profile row:
--
-- insert into public.profiles (id, role, full_name, email)
-- values ('<doctor-auth-user-uuid>', 'doctor', 'Dr. Alia Qaiser', 'draliaqaiser@gmail.com');
--
-- NOTE: in the live "dralia" project this has already been done.
