/**
 * SM-2 spaced-repetition scheduling.
 *
 * Pure functions — no React, no Supabase — so the scheduling maths can be
 * reasoned about (and tested) in isolation.
 *
 * Deviation from textbook SM-2: intervals are capped at 21 days. The plan is
 * only 60 days long, so an uncapped interval (which grows past a month after a
 * few good grades) would push a problem past interview day and it'd never come
 * back. The cap turns ~4 touches into ~6 for a problem first solved on Day 5.
 */

export const MAX_INTERVAL_DAYS = 21;
export const MIN_EASE_FACTOR = 1.3;
export const DEFAULT_EASE_FACTOR = 2.5;

/** SM-2 quality score. Below 3 means "failed" and resets the schedule. */
export type Grade = 0 | 2 | 3 | 5;

export const PASS_THRESHOLD = 3;

/** Local calendar date as "YYYY-MM-DD" — matches what a Postgres `date` returns. */
export function todayStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Whole days from date string `a` to date string `b` (negative if b is earlier). */
export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / 86_400_000);
}

/** Add `days` to a "YYYY-MM-DD" string, returning the same format. */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return todayStr(d);
}

/** The SM-2 scheduling state we persist per card. */
export interface CardState {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_on: string;
  lapses: number;
}

/** State for an item that has never been graded before. */
export function newCardState(today: string = todayStr()): CardState {
  return {
    ease_factor: DEFAULT_EASE_FACTOR,
    interval_days: 0,
    repetitions: 0,
    due_on: today,
    lapses: 0,
  };
}

/**
 * Apply a grade to a card and return its next scheduling state.
 *
 * - grade < 3  → reset: back tomorrow, repetitions cleared, lapse recorded
 * - grade >= 3 → 1 day, then 3 days, then interval * ease (capped)
 */
export function gradeToNextState(
  current: CardState,
  grade: Grade,
  today: string = todayStr()
): CardState {
  // SM-2 ease adjustment, applied on every review regardless of pass/fail.
  const delta = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
  const ease = Math.max(MIN_EASE_FACTOR, current.ease_factor + delta);

  if (grade < PASS_THRESHOLD) {
    return {
      ease_factor: ease,
      interval_days: 1,
      repetitions: 0,
      due_on: addDays(today, 1),
      lapses: current.lapses + 1,
    };
  }

  const repetitions = current.repetitions + 1;
  let interval: number;
  if (repetitions === 1) interval = 1;
  else if (repetitions === 2) interval = 3;
  else interval = Math.round(current.interval_days * ease);

  interval = Math.min(Math.max(interval, 1), MAX_INTERVAL_DAYS);

  return {
    ease_factor: ease,
    interval_days: interval,
    repetitions,
    due_on: addDays(today, interval),
    lapses: current.lapses,
  };
}

/**
 * Predicted recall strength, 0..1, from the Ebbinghaus forgetting curve.
 * At exactly one interval since review, strength is ~0.37 — the point the
 * schedule intends you to be re-tested.
 */
export function strengthOf(
  card: Pick<CardState, "interval_days"> & { last_reviewed_on: string },
  today: string = todayStr()
): number {
  const elapsed = Math.max(0, daysBetween(card.last_reviewed_on, today));
  const interval = Math.max(card.interval_days, 1);
  return Math.exp(-elapsed / interval);
}

export type Freshness = "fresh" | "fading" | "stale";

export function freshnessOf(strength: number): Freshness {
  if (strength >= 0.9) return "fresh";
  if (strength >= 0.6) return "fading";
  return "stale";
}

/** True when the card's due date has arrived (plain string compare — both are "YYYY-MM-DD"). */
export function isDue(dueOn: string, today: string = todayStr()): boolean {
  return dueOn <= today;
}
