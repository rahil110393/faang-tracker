# FAANG Prep Tracker

A personal Vite + React + TypeScript tracker for the 60-day FAANG prep plan, with calendar streak tracking, per-task link management, and per-day notes. Backend: Supabase (PostgreSQL + Auth + RLS).

## Quick start

```bash
cd faang-tracker
npm install
cp .env.example .env   # fill in your Supabase URL + anon key
npm run dev
```

Open http://localhost:5173.

## Supabase setup (one-time)

1. Create a project at https://supabase.com (free tier is fine).
2. In **Project Settings → API**, copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` public key → `VITE_SUPABASE_ANON_KEY`
3. In the **SQL editor**, run, in order:
   1. `supabase/migrations/20260510_initial.sql` — creates tables + RLS policies
   2. `supabase/seed.sql` — inserts the 60 plan days (idempotent)
4. In **Authentication → Providers**, enable **Email**. For a personal app you can disable email confirmation in Auth settings to skip verification.
5. Sign up in the app, then sign in.

## Features

- **Dashboard**: streak (current + longest), today's 3 tasks, 4-phase progress.
- **60 Days grid**: every day color-coded by phase, completion bars per track.
- **Day view**: 3 task checkboxes (DSA / Design / Behavioral), link manager per track, day note (autosaves).
- **Links page**: all your linked resources, filterable by type and track.

## Streak rule

A calendar day is *active* if you marked **at least one** task complete on that date. Current streak counts consecutive active calendar days ending today (or yesterday if you haven't checked anything today yet).

## Project layout

```
src/
  components/   StreakBadge, PhaseProgress, DayCard, TaskItem, LinkManager, NoteEditor
  hooks/        useSession, useCompletions, useStreak, useLinks, useDailyNote
  lib/          supabase client + Database types
  data/         plan-seed.ts (60 days as TS constant)
  pages/        AuthPage, Dashboard, DaysGrid, DayView, LinksPage
supabase/
  migrations/   20260510_initial.sql
  seed.sql
```

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build
