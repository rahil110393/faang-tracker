-- Migration: granular question-level tracking
-- Adds plan_sections, plan_items, item_completions tables.
-- plan_days stays as-is (day_number, phase) — descriptions move to sections/items.

-- ── 1. plan_sections ──────────────────────────────────────────────────────────
-- A section groups related questions/tasks within a day+track combo.
-- e.g. Day 1 / DSA  →  section "Arrays/Hashing patterns"
create table if not exists public.plan_sections (
  id          uuid    primary key default gen_random_uuid(),
  day_number  int     not null references public.plan_days(day_number) on delete cascade,
  track       text    not null check (track in ('DSA','DESIGN','BEHAVIORAL')),
  title       text    not null,          -- "Arrays/Hashing patterns"
  context_note text,                     -- "Time-box each at 25 min."
  sort_order  int     not null default 0
);

create index if not exists plan_sections_day_track_idx
  on public.plan_sections (day_number, track);

alter table public.plan_sections enable row level security;

-- All authenticated users can read the plan
drop policy if exists "plan_sections readable" on public.plan_sections;
create policy "plan_sections readable"
  on public.plan_sections for select
  to authenticated using (true);

-- ── 2. plan_items ─────────────────────────────────────────────────────────────
-- Individual questions / tasks inside a section.
-- e.g. "Two Sum", "Group Anagrams", "Top K Frequent"
create table if not exists public.plan_items (
  id          uuid    primary key default gen_random_uuid(),
  section_id  uuid    not null references public.plan_sections(id) on delete cascade,
  title       text    not null,          -- "Two Sum"
  leetcode_url text,                     -- optional LC link admin can set
  difficulty  text    check (difficulty in ('Easy','Medium','Hard')),
  sort_order  int     not null default 0
);

create index if not exists plan_items_section_idx
  on public.plan_items (section_id);

alter table public.plan_items enable row level security;

drop policy if exists "plan_items readable" on public.plan_items;
create policy "plan_items readable"
  on public.plan_items for select
  to authenticated using (true);

-- ── 3. item_completions ───────────────────────────────────────────────────────
-- Per-user, per-item completion tracking (replaces coarse track_completions).
create table if not exists public.item_completions (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  item_id      uuid        not null references public.plan_items(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create index if not exists item_completions_user_item_idx
  on public.item_completions (user_id, item_id);

create index if not exists item_completions_user_idx
  on public.item_completions (user_id);

alter table public.item_completions enable row level security;

drop policy if exists "item_completions owner all" on public.item_completions;
create policy "item_completions owner all"
  on public.item_completions for all
  to authenticated
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── 4. Convenience view: item completion counts per day/track ─────────────────
-- (Optional — helps the grid overview. No RLS needed on views.)
create or replace view public.day_track_item_counts as
select
  ps.day_number,
  ps.track,
  count(pi.id)::int as total_items
from public.plan_sections ps
join public.plan_items pi on pi.section_id = ps.id
group by ps.day_number, ps.track;
