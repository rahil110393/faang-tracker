# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal single-user Vite + React + TypeScript tracker for a structured 60-day FAANG/MAANG interview prep plan across three tracks — **DSA**, **DESIGN** (LLD/HLD), **BEHAVIORAL** — plus a calibrated daily timetable. Backend is Supabase (Postgres + Auth + RLS), no custom server.

## Commands

```bash
npm install
cp .env.example .env      # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev                # Vite dev server at http://localhost:5173
npm run build               # tsc -b (type-check) && vite build
npm run preview             # preview the production build
```

- There is no test suite in this repo (no test runner installed).
- `npm run lint` invokes `eslint .`, but eslint is not installed as a dependency and has no config file — it currently fails with `command not found`. Install/configure eslint before relying on this script.
- Database schema changes: SQL files under `supabase/migrations/` are applied manually, in filename order, via the Supabase SQL editor. There is no Supabase CLI / migration runner wired into this repo — a new migration is just a new numbered `.sql` file plus running it yourself against the project.
- `supabase/seed.sql` is auto-generated: `node scripts/generate-seed.js > supabase/seed.sql`. It seeds `plan_days` and, from `20260512_seed_sections.sql` onward, also clears and reseeds `plan_sections`/`plan_items`. The plan content is hand-duplicated inside `scripts/generate-seed.js` (mirrors `src/data/plan-seed.ts`) — if you change the plan, update both and regenerate.

## Architecture

### Two parallel plan-content representations — know which one is live

There are **two separate representations of the 60-day plan**, and the UI has migrated between them mid-project:

1. **Legacy/coarse**: `plan_days` (one text blob per day per track) + `task_completions` (one row per day+track, no boolean, existence = done). Hook: `useCompletions`/`useToggleCompletion` (`src/hooks/useCompletions.ts`). **This path is effectively dead code in the UI** — nothing currently imports `useCompletions`. It still exists in the schema/types and is what the README describes, but do not add new features against it.
2. **Current/granular**: `plan_sections` (a titled group per day+track) → `plan_items` (individual checkable questions/tasks) → `item_completions` (one row per user+item). This is what `DayView`, `Dashboard`, `TaskItem`, and `useStreak` actually read and write today, via `useDayDetail` (`src/hooks/useDayDetail.ts`) and `useItemCompletions`/`useToggleItemCompletion`/`useDayTrackCounts` (`src/hooks/useItemCompletions.ts`). A Postgres view `day_track_item_counts` gives per-(day,track) item totals so "is this track done" can be computed as `done >= total`.

Streak (`useStreak`) is a pure `useMemo` over `useItemCompletions()` data — no separate DB query, no boolean column. "Active" means at least one item completed that calendar day.

Separately, `src/data/plan-seed.ts` exports a **static TS constant `PLAN`** (all 60 days, `{ day, phase, dsa, design, behavioral }` as plain text) plus `PHASE_META` (P1–P4 labels/taglines). This is a **third, independent copy of the plan text**, used only by `DailySchedule` (to preview what track content applies to today's timetable slot) and for phase metadata — it is not read from the DB and is not what gets checked off. Editing plan text requires updating it in up to three places: `plan-seed.ts`, `scripts/generate-seed.js`'s inline `PLAN` array, and (if already seeded) the DB rows.

### Progress tracking has two independent notions of "what day am I on"

- `usePlanProgress` (`src/hooks/usePlanProgress.ts`): purely client-side/**calendar**-based. Reads/writes a start date to `localStorage` (`dsa_plan_start_date`, no DB persistence — per-browser only) and derives `currentPlanDay` as `daysSinceStart + 1`, capped at 60. This is what layout (weekday vs weekend schedule) is keyed off.
- `usePlanPace` (`src/hooks/usePlanPace.ts`): **progress**-based, derived from actual `item_completions`/`day_track_item_counts` data. `progressDay` is the first day where not all three tracks are fully complete — so a missed day is never silently skipped. It also computes pace vs the calendar (`behindDays`, `status: ahead|on-track|behind|done`).

`TimetablePage` intentionally mixes both: the schedule's weekday/weekend layout follows the calendar date, but the plan content shown follows the progress baseline (`progressDay`), falling back to the calendar day only while pace data is loading (to avoid a "Day 1" flash). See the comments in `src/pages/TimetablePage.tsx` for the exact reasoning if you touch this.

### Routing / pages

All routes sit behind an auth gate in `src/App.tsx` — if there's no Supabase session, only `<AuthPage />` renders (see `useSession`).

| Route | Page | Purpose |
|---|---|---|
| `/` | `Dashboard` | Streak badge, today's focus (first incomplete day across all tracks), phase progress, timetable preview |
| `/days` | `DaysGrid` | 60-day grid grouped by phase |
| `/day/:dayNumber` | `DayView` | Per-track sections/items with checkboxes, link manager, day note; supports a `#DSA`/`#DESIGN`/`#BEHAVIORAL` hash to scroll to a track (used by timetable deep links) |
| `/links` | `LinksPage` | All saved links, filterable by type/track |
| `/timetable` | `TimetablePage` | Calibrated daily schedule (weekday vs weekend time blocks) with day navigation and pace tracker |

### Database (Supabase, RLS-scoped by `auth.uid()`)

- `plan_days(day_number, phase, dsa_description, design_description, behavioral_description)` — admin-seeded, SELECT-only for authenticated users.
- `plan_sections(id, day_number, track, title, context_note, sort_order)` and `plan_items(id, section_id, title, leetcode_url, difficulty, sort_order)` — admin-seeded, SELECT-only. This is the live content model (see above).
- `item_completions(id, user_id, item_id, completed_at)` unique on `(user_id, item_id)` — per-user, full CRUD scoped to owner. This is the live completions table.
- `links(id, user_id, day_number, track nullable, url, label, type, created_at)` and `daily_notes(id, user_id, day_number, content, updated_at)` unique on `(user_id, day_number)` — per-user, full CRUD scoped to owner.
- `task_completions` — legacy table, schema/RLS still present, unused by the current UI (see above).
- View `day_track_item_counts(day_number, track, total_items)` — used to compute per-track completion fractions without a client-side join.
- Types are hand-written in `src/lib/database.types.ts` (not generated) — keep them in sync manually when the schema changes.

### Conventions worth preserving

- **React Query for all server state** (`staleTime: 30_000`, `refetchOnWindowFocus: false` globally in `main.tsx`; individual hooks override with `staleTime: Infinity` for effectively-static plan content). Never reach for `useState`/`useEffect` for fetched data.
- Toggle mutations (`useToggleCompletion`, `useToggleItemCompletion`) are delete-or-insert, not a boolean flip — there's no `completed` column, existence of the row is the signal.
- `NoteEditor` debounces saves at 800ms; there's no manual save button by design.
- Path alias `@/` → `src/` (configured in both `tsconfig.json` and `vite.config.ts`) — always import via `@/...`.
- Dark theme throughout (`bg-slate-950/900/800`). Phase accent colors are custom Tailwind tokens (`phase.p1`–`p4`, see `tailwind.config.ts`); track colors (DSA=blue, DESIGN=purple, BEHAVIORAL=green) are inline Tailwind classes, not tokens.
- Any new DB table needs RLS policies scoped to `auth.uid()` — this project has no server-side authorization layer, RLS *is* the security boundary.

### Deployment

`vercel.json` configures the build (`npm run build` → `dist/`) and SPA rewrites. `.github/workflows/deploy.yml` runs on push/PR to `master`, using the Vercel CLI with `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID`/`VERCEL_TOKEN` secrets and injecting `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` as build-time env vars — pushes to `master` deploy to production, other branches/PRs get a preview deploy.
