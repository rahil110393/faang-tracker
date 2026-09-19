import { useMemo } from "react";
import { useReviewCards, type ReviewCardRow } from "./useReviewCards";
import { freshnessOf, isDue, strengthOf, todayStr } from "@/lib/sm2";

/** Max reviews surfaced per day — overflow rolls to tomorrow, oldest-due first. */
export const DAILY_REVIEW_CAP = 5;

export interface ReviewQueue {
  dueToday: ReviewCardRow[]; // capped at DAILY_REVIEW_CAP
  dueCount: number; // total due, before the cap
  totalCards: number;
  fresh: number;
  fading: number;
  stale: number;
  readinessPct: number; // fresh / total, 0..100
  isLoading: boolean;
}

/**
 * Derives the daily review queue and readiness stats from the review cards.
 * No DB query of its own — mirrors how useStreak/usePlanPace derive from
 * useItemCompletions.
 */
export function useReviewQueue(): ReviewQueue {
  const { data: cards = [], isLoading } = useReviewCards();

  return useMemo<ReviewQueue>(() => {
    const today = todayStr();

    let fresh = 0;
    let fading = 0;
    let stale = 0;
    for (const card of cards) {
      const bucket = freshnessOf(strengthOf(card, today));
      if (bucket === "fresh") fresh++;
      else if (bucket === "fading") fading++;
      else stale++;
    }

    const due = cards
      .filter((c) => isDue(c.due_on, today))
      .sort((a, b) => a.due_on.localeCompare(b.due_on));

    return {
      dueToday: due.slice(0, DAILY_REVIEW_CAP),
      dueCount: due.length,
      totalCards: cards.length,
      fresh,
      fading,
      stale,
      readinessPct: cards.length === 0 ? 0 : Math.round((fresh / cards.length) * 100),
      isLoading,
    };
  }, [cards, isLoading]);
}
