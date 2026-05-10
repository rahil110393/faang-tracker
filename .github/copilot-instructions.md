# FAANG Prep Tracker — Copilot Instructions

## Project Overview
A personal single-user web app for tracking a structured **60-day FAANG/MAANG interview preparation plan**. The user (a senior engineer with ~12 years of experience) works through daily tasks across three tracks — **DSA**, **DESIGN** (LLD/HLD), and **BEHAVIORAL** — with per-task checkboxes, per-track resource links, calendar streaks, and free-text daily notes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Language | TypeScript 5.6 (strict mode) |
| Build Tool | Vite 5.4 |
| Styling | Tailwind CSS 3.4 (dark theme, JIT) |
| Routing | React Router DOM v6 |
| Server State | TanStack React Query v5 |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) |
| Supabase Client | `@supabase/supabase-js` v2.45 |
| CSS Processing | PostCSS + Autoprefixer |

---

## Project Structure

```
faang-tracker/
├── index.html
├── vite.config.ts          # @vitejs/plugin-react, "@" alias → src/
├── tailwind.config.ts      # Custom phase colors + flame animation
├── tsconfig.json           # Strict ES2022, paths alias @/* → src/*
├── scripts/
│   └── generate-seed.js    # Node script: generates seed.sql from inline plan data
├── src/
│   ├── main.tsx            # Entry: QueryClientProvider + BrowserRouter + App
│   ├── App.tsx             # Auth gate, NavBar, all route declarations
│   ├── index.css           # Tailwind directives + 100% height reset
│   ├── components/
│   │   ├── DayCard.tsx     # Clickable tile for the 60-day grid
│   │   ├── LinkManager.tsx # Per-(day, track) link CRUD inline UI
│   │   ├── NoteEditor.tsx  # Textarea with 800ms debounced autosave
│   │   ├── PhaseProgress.tsx # 4-card phase progress bars
│   │   ├── StreakBadge.tsx  # Flame icon + streak stats
│   │   └── TaskItem.tsx    # Checkbox card per track
│   ├── hooks/
│   │   ├── useSession.ts       # Supabase auth session listener
│   │   ├── useCompletions.ts   # Fetch + toggle task completions
│   │   ├── useStreak.ts        # Pure memoized streak computation
│   │   ├── useLinks.ts         # Fetch / add / delete resource links
│   │   └── useDailyNote.ts     # Fetch + debounced upsert daily notes
│   ├── lib/
│   │   ├── supabase.ts         # Typed supabase client singleton
│   │   └── database.types.ts   # Hand-written DB type definitions
│   ├── data/
│   │   └── plan-seed.ts        # All 60 days as a static TS constant (no DB call)
│   └── pages/
│       ├── AuthPage.tsx    # Sign in / Sign up form
│       ├── Dashboard.tsx   # Streak + today's focus + phase progress
│       ├── DaysGrid.tsx    # 60-day grid grouped by phase
│       ├── DayView.tsx     # Full day: TaskItems + LinkManagers + NoteEditor
│       └── LinksPage.tsx   # All links, filterable by type and track
└── supabase/
    ├── seed.sql            # Idempotent INSERT for all 60 plan_days rows
    └── migrations/
        ├── 20260510_initial.sql  # Core schema + RLS
        └── 20260511_questions.sql # Granular question-level schema (future)
```

---

## Routing

All routes are behind an auth gate in `App.tsx`. If no session exists, only `<AuthPage />` is rendered.

| Route | Page | Description |
|---|---|---|
| `/` | `Dashboard` | Streak badge + today's focus card + PhaseProgress |
| `/days` | `DaysGrid` | 60-day grid grouped by phase |
| `/day/:dayNumber` | `DayView` | 3 TaskItems + LinkManagers + NoteEditor + prev/next nav |
| `/links` | `LinksPage` | All links, filterable by type and track |

---

## Database Schema

### `plan_days` (static, admin-seeded)
```sql
day_number   int PK   -- 1–60
phase        text     -- P1 | P2 | P3 | P4
dsa_description      text
design_description   text
behavioral_description text
```
RLS: authenticated users SELECT only.

### `task_completions` (per-user)
```sql
id           uuid PK  default gen_random_uuid()
user_id      uuid FK  → auth.users (cascade)
day_number   int FK   → plan_days (cascade)
track        text     -- DSA | DESIGN | BEHAVIORAL
completed_at timestamptz  default now()
UNIQUE (user_id, day_number, track)
```
RLS: full CRUD scoped to `auth.uid()`.

### `links` (per-user)
```sql
id        uuid PK
user_id   uuid FK  → auth.users (cascade)
day_number int FK  → plan_days (cascade)
track     text nullable  -- DSA | DESIGN | BEHAVIORAL
url       text
label     text
type      text  -- leetcode | youtube | article | note | other (default other)
created_at timestamptz
```
RLS: full CRUD scoped to `auth.uid()`.

### `daily_notes` (per-user)
```sql
id         uuid PK
user_id    uuid FK  → auth.users (cascade)
day_number int FK   → plan_days (cascade)
content    text  default ''
updated_at timestamptz
UNIQUE (user_id, day_number)
```
RLS: full CRUD scoped to `auth.uid()`.

### Future: `plan_sections` + `plan_items` + `item_completions`
Defined in `20260511_questions.sql` — granular question-level tracking (not yet wired into the UI). `item_completions` replaces coarse track completions with row-per-question completions.

---

## Hooks

| Hook | Purpose |
|---|---|
| `useSession` | Subscribes to Supabase auth state; returns `{ session, loading }` |
| `useCompletions` | Fetches all `task_completions` for current user; `useToggleCompletion` mutation deletes if done, inserts if not |
| `useStreak` | Pure `useMemo` over completions data — computes `current`, `longest`, `activeToday`, `totalActiveDays` |
| `useLinks(dayNumber?)` | Fetches links (optionally scoped to a day); `useAddLink` / `useDeleteLink` mutations |
| `useDailyNote(day)` | Fetches single note content via `.maybeSingle()`; `useSaveDailyNote` upserts on conflict |

React Query config: `staleTime: 30_000`, `refetchOnWindowFocus: false`.

---

## Static Plan Data

`src/data/plan-seed.ts` exports:
- **`PLAN: PlanDay[]`** — all 60 days hard-coded with `{ day, phase, dsa, design, behavioral }`. Used for all UI rendering; no DB call needed.
- **`PHASE_META`** — maps P1–P4 to `{ label, range, tagline }`:
  - **P1** (Days 1–15): Foundations — DSA fluency, LLD basics, HLD primitives
  - **P2** (Days 16–35): Depth — hard DSA, full HLD case studies, advanced LLD
  - **P3** (Days 36–50): Mock-heavy — real simulations, company-tagged practice, behavioral mocks
  - **P4** (Days 51–60): Polish — speed drills, weak-area cleanup, taper, rest

---

## Styling Conventions

- **Dark theme throughout** (`bg-slate-950`, `bg-slate-900`, `bg-slate-800`).
- **Phase accent colors** (custom Tailwind tokens):
  - `phase.p1` → `#3b82f6` (blue) — Foundations
  - `phase.p2` → `#8b5cf6` (purple) — Depth
  - `phase.p3` → `#f97316` (orange) — Mock-heavy
  - `phase.p4` → `#10b981` (emerald) — Polish
- **Track accent colors** (inline Tailwind): blue = DSA, purple = DESIGN, green = BEHAVIORAL.
- **`animate-flame`** — custom keyframe (scale + rotate oscillation, 1.4s ease-in-out infinite) on `StreakBadge` when active today.
- Path alias `@/` maps to `src/` — always use `@/` for imports.

---

## Environment Variables

```
VITE_SUPABASE_URL=<project-url>
VITE_SUPABASE_ANON_KEY=<anon-key>
```
Defined in `.env` (not committed). The supabase client falls back to `http://localhost` / `"anon"` with a console warning if missing.

---

## Key Conventions

- **TypeScript strict mode** — no `any`, no unused locals/parameters.
- **React Query** for all async server state; never use `useState` + `useEffect` for fetched data.
- **Supabase RLS** enforces all data isolation — never filter by `user_id` client-side only.
- **`useToggleCompletion`** performs a delete-or-insert (no boolean column) — toggling calls the mutation which inspects the current completions set.
- **`NoteEditor`** debounces saves at 800ms — do not add manual save buttons.
- **`useStreak`** is a pure computation over `useCompletions` data — no additional DB queries.
- The `plan_days` table is read-only for regular users; content is seeded via `supabase/seed.sql`.
- All new DB tables must include RLS policies scoped to `auth.uid()`.
