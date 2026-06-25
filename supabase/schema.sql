create extension if not exists "pgcrypto";

create type public.user_role as enum ('student', 'teacher', 'lab_assistant', 'phd', 'institute', 'admin');
create type public.difficulty_level as enum ('beginner', 'intermediate', 'advanced');
create type public.maintenance_status as enum ('scheduled', 'in_progress', 'completed', 'overdue');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id uuid unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  mobile_number text,
  role public.user_role not null default 'student',
  verification_status text not null default 'pending',
  is_verified boolean not null default false,
  status text not null default 'active',
  institution text,
  institute text,
  department text,
  course text,
  batch_year text,
  entry_number text,
  roll_number text,
  designation text,
  subjects_taught text,
  lab_name text,
  teacher_name text,
  instructor_name text,
  supervisor_name text,
  pi_name text,
  research_area text,
  current_project text,
  publications_count integer not null default 0,
  conferences_count integer not null default 0,
  responsibility text,
  experience text,
  phd_year text,
  number_of_labs integer,
  coordinator_name text,
  official_email text,
  organization text,
  access_reason text,
  bio text,
  attendance_status text,
  class_name text,
  batch_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.institutes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  official_email text,
  description text,
  coordinator_name text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_requested public.user_role not null,
  status text not null default 'pending',
  details jsonb not null default '{}'::jsonb,
  document_url text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  target_user_id uuid references public.profiles(id) on delete set null,
  action_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.platform_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_status_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  changed_by uuid references public.profiles(id) on delete set null,
  status text,
  verification_status text,
  note text,
  created_at timestamptz not null default now()
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid references public.institutes(id) on delete cascade,
  name text not null,
  head_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.labs (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid references public.institutes(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  name text not null,
  lab_head_id uuid references public.profiles(id) on delete set null,
  research_area text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lab_members (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid not null references public.labs(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_in_lab text not null default 'member',
  approval_status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (lab_id, profile_id)
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  lab_id uuid references public.labs(id) on delete set null,
  name text not null,
  course text,
  batch_year text,
  department text,
  subject_name text,
  institute text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  unique (class_id, student_id)
);

create table public.join_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  difficulty public.difficulty_level not null default 'beginner',
  estimated_minutes integer not null default 30,
  skills_learned text[] not null default '{}',
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  experiment_id uuid not null references public.experiments(id) on delete cascade,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  status text not null default 'not_started',
  last_activity_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, experiment_id)
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  experiment_id uuid references public.experiments(id) on delete set null,
  title text not null,
  instructions text,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'submitted',
  score numeric(5,2),
  notes text,
  submitted_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  session_date date not null default current_date,
  topic text,
  created_at timestamptz not null default now()
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'present',
  marked_at timestamptz not null default now(),
  unique (session_id, student_id)
);

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  class_id uuid references public.classes(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.study_materials (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  title text not null,
  resource_url text,
  instructions text,
  created_at timestamptz not null default now()
);

create table public.experiment_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  experiment_id uuid references public.experiments(id) on delete set null,
  assignment_id uuid references public.assignments(id) on delete set null,
  simulation_completed boolean not null default false,
  quiz_submitted boolean not null default false,
  score numeric(5,2),
  time_spent_minutes integer not null default 0,
  topic_progress jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  experiment_id uuid references public.experiments(id) on delete set null,
  score numeric(5,2) not null check (score >= 0),
  total_marks numeric(5,2) not null check (total_marks > 0),
  attempt_number integer not null default 1,
  submitted_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_id text not null unique,
  student_id uuid not null references public.profiles(id) on delete cascade,
  experiment_id uuid references public.experiments(id) on delete set null,
  experiment_name text not null,
  score numeric(5,2) not null,
  percentage numeric(5,2) not null check (percentage between 0 and 100),
  issued_at timestamptz not null default now(),
  certificate_data jsonb not null default '{}'::jsonb
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  sku text unique,
  quantity numeric(10,2) not null default 0,
  unit text not null,
  reorder_level numeric(10,2) not null default 0,
  location text,
  supplier text,
  expires_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  changed_by uuid references public.profiles(id) on delete set null,
  change_type text not null,
  quantity_change numeric(10,2) not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create table public.equipment_maintenance (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  scheduled_for date not null,
  completed_at timestamptz,
  status public.maintenance_status not null default 'scheduled',
  assigned_to uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.certificate_records (
  id uuid primary key default gen_random_uuid(),
  certificate_id text not null unique,
  student_id uuid not null references public.profiles(id) on delete cascade,
  experiment_slug text not null,
  experiment_name text not null,
  experiment_category text,
  score numeric(5,2) not null check (score >= 0),
  total_marks numeric(5,2) not null check (total_marks > 0),
  percentage numeric(5,2) not null check (percentage between 0 and 100),
  student_snapshot jsonb not null default '{}'::jsonb,
  class_snapshot jsonb not null default '{}'::jsonb,
  teacher_snapshot jsonb not null default '{}'::jsonb,
  lab_snapshot jsonb not null default '{}'::jsonb,
  institute_snapshot jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.research_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  supervisor_name text,
  lab_id uuid references public.labs(id) on delete set null,
  research_area text,
  current_project text,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  protocol_notes text,
  updated_at timestamptz not null default now()
);

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  research_profile_id uuid not null references public.research_profiles(id) on delete cascade,
  title text not null,
  journal text,
  published_year integer,
  doi text,
  created_at timestamptz not null default now()
);

create table public.conferences (
  id uuid primary key default gen_random_uuid(),
  research_profile_id uuid not null references public.research_profiles(id) on delete cascade,
  title text not null,
  conference_name text,
  conference_year integer,
  presentation_type text,
  created_at timestamptz not null default now()
);

create or replace function public.is_biolabx_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from auth.users
    where id = auth.uid()
      and lower(email) = 'charanjaydeep712@gmail.com'
  );
$$;

create or replace function public.admin_update_profile_status(
  target_profile_id uuid,
  profile_updates jsonb,
  action_name text
)
returns public.profiles
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  updated_profile public.profiles;
begin
  if not public.is_biolabx_admin() then
    raise exception 'Only the BioLabX admin can update users';
  end if;

  update public.profiles
  set
    verification_status = coalesce(profile_updates->>'verification_status', verification_status),
    status = coalesce(profile_updates->>'status', status),
    role = case
      when profile_updates ? 'role' then (profile_updates->>'role')::public.user_role
      else role
    end,
    updated_at = now()
  where id = target_profile_id
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profile not found';
  end if;

  insert into public.admin_actions (admin_id, target_user_id, action_type, details)
  values (auth.uid(), target_profile_id, action_name, profile_updates);

  insert into public.user_status_logs (user_id, changed_by, status, verification_status, note)
  values (
    target_profile_id,
    auth.uid(),
    updated_profile.status,
    updated_profile.verification_status,
    action_name
  );

  return updated_profile;
end;
$$;

alter table public.profiles enable row level security;
alter table public.verification_requests enable row level security;
alter table public.admin_actions enable row level security;
alter table public.platform_announcements enable row level security;
alter table public.user_status_logs enable row level security;
alter table public.institutes enable row level security;
alter table public.departments enable row level security;
alter table public.labs enable row level security;
alter table public.lab_members enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.join_requests enable row level security;
alter table public.experiments enable row level security;
alter table public.student_progress enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.notices enable row level security;
alter table public.study_materials enable row level security;
alter table public.experiment_progress enable row level security;
alter table public.quiz_results enable row level security;
alter table public.certificates enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_logs enable row level security;
alter table public.equipment_maintenance enable row level security;
alter table public.certificate_records enable row level security;
alter table public.research_profiles enable row level security;
alter table public.publications enable row level security;
alter table public.conferences enable row level security;

create policy "Users and admin can read profiles"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_biolabx_admin());

create policy "Users and admin can update profiles"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_biolabx_admin())
  with check (auth.uid() = id or public.is_biolabx_admin());

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can create verification requests"
  on public.verification_requests for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users and admin can read verification requests"
  on public.verification_requests for select
  to authenticated
  using (auth.uid() = user_id or public.is_biolabx_admin());

create policy "Admin can manage verification requests"
  on public.verification_requests for update
  to authenticated
  using (public.is_biolabx_admin())
  with check (public.is_biolabx_admin());

create policy "Admin can create admin actions"
  on public.admin_actions for insert
  to authenticated
  with check (public.is_biolabx_admin());

create policy "Admin can read admin actions"
  on public.admin_actions for select
  to authenticated
  using (public.is_biolabx_admin());

create policy "Authenticated users can read active announcements"
  on public.platform_announcements for select
  to authenticated
  using (is_active = true or public.is_biolabx_admin());

create policy "Admin can manage announcements"
  on public.platform_announcements for all
  to authenticated
  using (public.is_biolabx_admin())
  with check (public.is_biolabx_admin());

create policy "Admin can create user status logs"
  on public.user_status_logs for insert
  to authenticated
  with check (public.is_biolabx_admin());

create policy "Users and admin can read user status logs"
  on public.user_status_logs for select
  to authenticated
  using (auth.uid() = user_id or public.is_biolabx_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    user_id,
    full_name,
    email,
    mobile_number,
    role,
    verification_status,
    status,
    course,
    batch_year,
    entry_number,
    department,
    institute,
    designation,
    lab_name,
    supervisor_name,
    research_area,
    current_project,
    publications_count,
    conferences_count,
    responsibility,
    bio
  )
  values (
    new.id,
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'BioLabX User'),
    new.email,
    new.raw_user_meta_data->>'mobile_number',
    coalesce(new.raw_user_meta_data->>'role', 'student')::public.user_role,
    case when new.email = 'charanjaydeep712@gmail.com' or coalesce(new.raw_user_meta_data->>'role', 'student') = 'student' then 'approved' else 'pending' end,
    'active',
    new.raw_user_meta_data->>'course',
    new.raw_user_meta_data->>'batch_year',
    new.raw_user_meta_data->>'entry_number',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'institute',
    new.raw_user_meta_data->>'designation',
    new.raw_user_meta_data->>'lab_name',
    new.raw_user_meta_data->>'supervisor_name',
    new.raw_user_meta_data->>'research_area',
    new.raw_user_meta_data->>'current_project',
    coalesce(nullif(new.raw_user_meta_data->>'publications_count', ''), '0')::integer,
    coalesce(nullif(new.raw_user_meta_data->>'conferences_count', ''), '0')::integer,
    new.raw_user_meta_data->>'responsibility',
    new.raw_user_meta_data->>'bio'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create policy "Public experiments are readable by anyone"
  on public.experiments for select
  using (is_public = true or auth.role() = 'authenticated');

create policy "Students can read their own progress"
  on public.student_progress for select
  to authenticated
  using (auth.uid() = student_id);

create policy "Students can upsert their own progress"
  on public.student_progress for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Students can update their own progress"
  on public.student_progress for update
  to authenticated
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

create policy "Students can read their own quiz results"
  on public.quiz_results for select
  to authenticated
  using (auth.uid() = student_id);

create policy "Students can insert their own quiz results"
  on public.quiz_results for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Inventory is readable by authenticated users"
  on public.inventory_items for select
  to authenticated
  using (true);

create policy "Maintenance is readable by authenticated users"
  on public.equipment_maintenance for select
  to authenticated
  using (true);

create policy "Students can read their own certificates"
  on public.certificate_records for select
  to authenticated
  using (auth.uid() = student_id);

create policy "Students can insert their own certificates"
  on public.certificate_records for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Authenticated users can read institutes"
  on public.institutes for select to authenticated using (true);

create policy "Authenticated users can read departments"
  on public.departments for select to authenticated using (true);

create policy "Authenticated users can read labs"
  on public.labs for select to authenticated using (true);

create policy "Authenticated users can read lab members"
  on public.lab_members for select to authenticated using (true);

create policy "Authenticated users can read classes"
  on public.classes for select to authenticated using (true);

create policy "Authenticated users can read class members"
  on public.class_members for select to authenticated using (true);

create policy "Authenticated users can read join requests"
  on public.join_requests for select to authenticated using (true);

create policy "Authenticated users can read assignments"
  on public.assignments for select to authenticated using (true);

create policy "Authenticated users can read assignment submissions"
  on public.assignment_submissions for select to authenticated using (true);

create policy "Authenticated users can read attendance sessions"
  on public.attendance_sessions for select to authenticated using (true);

create policy "Authenticated users can read attendance records"
  on public.attendance_records for select to authenticated using (true);

create policy "Authenticated users can read notices"
  on public.notices for select to authenticated using (true);

create policy "Authenticated users can read study materials"
  on public.study_materials for select to authenticated using (true);

create policy "Students can read their own experiment progress"
  on public.experiment_progress for select to authenticated using (auth.uid() = student_id);

create policy "Students can upsert their own experiment progress"
  on public.experiment_progress for insert to authenticated with check (auth.uid() = student_id);

create policy "Students can read their own issued certificates"
  on public.certificates for select to authenticated using (auth.uid() = student_id);

create policy "Students can insert their own issued certificates"
  on public.certificates for insert to authenticated with check (auth.uid() = student_id);

create policy "Authenticated users can read inventory logs"
  on public.inventory_logs for select to authenticated using (true);

create policy "Authenticated users can insert inventory logs"
  on public.inventory_logs for insert to authenticated with check (true);

create policy "Researchers can read their own research profile"
  on public.research_profiles for select to authenticated using (auth.uid() = profile_id);

create policy "Researchers can upsert their own research profile"
  on public.research_profiles for insert to authenticated with check (auth.uid() = profile_id);

create policy "Authenticated users can read publications"
  on public.publications for select to authenticated using (true);

create policy "Authenticated users can read conferences"
  on public.conferences for select to authenticated using (true);
