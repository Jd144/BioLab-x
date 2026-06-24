create extension if not exists "pgcrypto";

create type public.user_role as enum ('student', 'teacher', 'lab_assistant', 'phd', 'institute', 'admin');
create type public.difficulty_level as enum ('beginner', 'intermediate', 'advanced');
create type public.maintenance_status as enum ('scheduled', 'in_progress', 'completed', 'overdue');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'student',
  institution text,
  department text,
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

create table public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  experiment_id uuid references public.experiments(id) on delete set null,
  score numeric(5,2) not null check (score >= 0),
  total_marks numeric(5,2) not null check (total_marks > 0),
  attempt_number integer not null default 1,
  submitted_at timestamptz not null default now()
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

alter table public.profiles enable row level security;
alter table public.experiments enable row level security;
alter table public.student_progress enable row level security;
alter table public.quiz_results enable row level security;
alter table public.inventory_items enable row level security;
alter table public.equipment_maintenance enable row level security;

create policy "Profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'BioLabX User'),
    coalesce(new.raw_user_meta_data->>'role', 'student')::public.user_role
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
