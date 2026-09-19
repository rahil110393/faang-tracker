-- Migration: spaced-repetition review engine
-- Adds review_cards (SM-2 scheduling state) and review_log (append-only grade history).
-- Purely additive — item_completions stays the source of truth for "done".

-- ── 1. review_cards ───────────────────────────────────────────────────────────
-- One row per user+item, holding the SM-2 state for that problem.
-- A row only exists once the user has graded the item at least once.
create table if not exists public.review_cards (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  item_id          uuid        not null references public.plan_items(id) on delete cascade,
  ease_factor      numeric     not null default 2.5,   -- SM-2 EF, floored at 1.3
  interval_days    int         not null default 0,     -- days until next review
  repetitions      int         not null default 0,     -- consecutive successful reviews
  due_on           date        not null,               -- next review date (local "YYYY-MM-DD")
  last_grade       int         check (last_grade between 0 and 5),
  last_reviewed_at timestamptz not null default now(),
  lapses           int         not null default 0,     -- times graded < 3
  unique (user_id, item_id)
);

create index if not exists review_cards_user_due_idx
  on public.review_cards (user_id, due_on);

create index if not exists review_cards_user_item_idx
  on public.review_cards (user_id, item_id);

alter table public.review_cards enable row level security;

drop policy if exists "review_cards owner all" on public.review_cards;
create policy "review_cards owner all"
  on public.review_cards for all
  to authenticated
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── 2. review_log ─────────────────────────────────────────────────────────────
-- Append-only history of every grade ever given. Nothing reads this yet — it
-- exists because grade history can't be reconstructed from review_cards after
-- the fact, and it's what later enables "are my scores trending up?".
create table if not exists public.review_log (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  item_id     uuid        not null references public.plan_items(id) on delete cascade,
  grade       int         not null check (grade between 0 and 5),
  reviewed_at timestamptz not null default now()
);

create index if not exists review_log_user_item_idx
  on public.review_log (user_id, item_id);

alter table public.review_log enable row level security;

drop policy if exists "review_log owner all" on public.review_log;
create policy "review_log owner all"
  on public.review_log for all
  to authenticated
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());
