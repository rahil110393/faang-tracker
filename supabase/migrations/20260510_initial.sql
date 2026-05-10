-- FAANG Prep Tracker: schema + RLS policies
-- Run in Supabase SQL editor (or via supabase db push).

-- 1. Static plan table (read-only for users; admin populates via seed.sql)
create table if not exists public.plan_days (
  day_number int primary key check (day_number between 1 and 60),
  phase text not null check (phase in ('P1','P2','P3','P4')),
  dsa_description text not null,
  design_description text not null,
  behavioral_description text not null
);

alter table public.plan_days enable row level security;

drop policy if exists "plan_days readable by authenticated" on public.plan_days;
create policy "plan_days readable by authenticated"
  on public.plan_days for select
  to authenticated using (true);

-- 2. Per-user task completions
create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number int not null references public.plan_days(day_number) on delete cascade,
  track text not null check (track in ('DSA','DESIGN','BEHAVIORAL')),
  completed_at timestamptz not null default now(),
  unique (user_id, day_number, track)
);

create index if not exists task_completions_user_day_idx
  on public.task_completions (user_id, day_number);
create index if not exists task_completions_user_completedat_idx
  on public.task_completions (user_id, completed_at);

alter table public.task_completions enable row level security;

drop policy if exists "task_completions owner all" on public.task_completions;
create policy "task_completions owner all"
  on public.task_completions for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 3. Per-user links
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number int not null references public.plan_days(day_number) on delete cascade,
  track text check (track in ('DSA','DESIGN','BEHAVIORAL')),
  url text not null,
  label text not null,
  type text not null default 'other'
    check (type in ('leetcode','youtube','article','note','other')),
  created_at timestamptz not null default now()
);

create index if not exists links_user_day_idx on public.links (user_id, day_number);

alter table public.links enable row level security;

drop policy if exists "links owner all" on public.links;
create policy "links owner all"
  on public.links for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 4. Per-user daily notes (one per day)
create table if not exists public.daily_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number int not null references public.plan_days(day_number) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, day_number)
);

alter table public.daily_notes enable row level security;

drop policy if exists "daily_notes owner all" on public.daily_notes;
create policy "daily_notes owner all"
  on public.daily_notes for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
