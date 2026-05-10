import { useMemo } from "react";
import { useItemCompletions } from "./useItemCompletions";

function toLocalDateString(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / 86_400_000);
}

export interface StreakInfo {
  current: number;
  longest: number;
  activeToday: boolean;
  totalActiveDays: number;
}

export function useStreak(): { data: StreakInfo; isLoading: boolean } {
  const { data: completions, isLoading } = useItemCompletions();

  const data = useMemo<StreakInfo>(() => {
    const dates = new Set<string>();
    for (const c of completions ?? []) dates.add(toLocalDateString(c.completed_at));
    const sorted = Array.from(dates).sort();
    if (sorted.length === 0) return { current: 0, longest: 0, activeToday: false, totalActiveDays: 0 };

    let longest = 1;
    let run = 1;
    for (let i = 1; i < sorted.length; i++) {
      if (daysBetween(sorted[i - 1], sorted[i]) === 1) {
        run++;
        longest = Math.max(longest, run);
      } else {
        run = 1;
      }
    }

    const today = todayStr();
    const last = sorted[sorted.length - 1];
    const gapFromToday = daysBetween(last, today);
    let current = 0;
    if (gapFromToday === 0 || gapFromToday === 1) {
      current = 1;
      for (let i = sorted.length - 2; i >= 0; i--) {
        if (daysBetween(sorted[i], sorted[i + 1]) === 1) current++;
        else break;
      }
    }

    return {
      current,
      longest,
      activeToday: dates.has(today),
      totalActiveDays: sorted.length,
    };
  }, [completions]);

  return { data, isLoading };
}
