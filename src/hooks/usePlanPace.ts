import { useMemo } from "react";
import { usePlanProgress, TOTAL_PLAN_DAYS } from "./usePlanProgress";
import { useItemCompletions, useDayTrackCounts } from "./useItemCompletions";
import type { Track } from "@/lib/database.types";

const TRACKS: Track[] = ["DSA", "DESIGN", "BEHAVIORAL"];

export type PaceStatus = "ahead" | "on-track" | "behind" | "done";

export interface PlanPace {
  completedDays: number; // plan days where all 3 tracks are fully complete
  progressDay: number; // the day you're actually on (first incomplete), 1..60
  expectedDay: number; // where the calendar says you should be
  behindDays: number; // positive = behind, negative = ahead
  status: PaceStatus;
  pacePerDay: number; // days of work to finish per remaining calendar day to stay on time
  isLoading: boolean;
}

export function usePlanPace(): PlanPace {
  const { daysSinceStart, startDate } = usePlanProgress();
  const { data: completions = [], isLoading: l1 } = useItemCompletions();
  const { data: trackCounts = [], isLoading: l2 } = useDayTrackCounts();

  return useMemo<PlanPace>(() => {
    const isLoading = l1 || l2;

    // total items per (day, track)
    const totals = new Map<string, number>();
    for (const tc of trackCounts) {
      totals.set(`${tc.day_number}_${tc.track}`, tc.total_items);
    }
    // completed items per (day, track)
    const done = new Map<string, number>();
    for (const c of completions) {
      const key = `${c.day_number}_${c.track}`;
      done.set(key, (done.get(key) ?? 0) + 1);
    }

    const isDayComplete = (day: number) =>
      TRACKS.every((track) => {
        const key = `${day}_${track}`;
        const total = totals.get(key) ?? 0;
        return total > 0 && (done.get(key) ?? 0) >= total;
      });

    let completedDays = 0;
    let progressDay = TOTAL_PLAN_DAYS; // default to last day if everything is done
    let foundIncomplete = false;
    for (let day = 1; day <= TOTAL_PLAN_DAYS; day++) {
      if (isDayComplete(day)) {
        completedDays++;
      } else if (!foundIncomplete) {
        progressDay = day;
        foundIncomplete = true;
      }
    }
    if (!foundIncomplete) progressDay = TOTAL_PLAN_DAYS; // all done

    // Calendar expectation: after N elapsed days you'd plan to have N days done.
    const expectedCompleted = startDate ? daysSinceStart : 0;
    const expectedDay = Math.min(expectedCompleted + 1, TOTAL_PLAN_DAYS);
    const behindDays = expectedCompleted - completedDays;

    const remainingWork = Math.max(TOTAL_PLAN_DAYS - completedDays, 0);
    const calendarDaysLeft = Math.max(TOTAL_PLAN_DAYS - daysSinceStart, 1);
    const pacePerDay = remainingWork / calendarDaysLeft;

    let status: PaceStatus;
    if (remainingWork === 0) status = "done";
    else if (behindDays >= 1) status = "behind";
    else if (behindDays <= -1) status = "ahead";
    else status = "on-track";

    return {
      completedDays,
      progressDay,
      expectedDay,
      behindDays,
      status,
      pacePerDay,
      isLoading,
    };
  }, [completions, trackCounts, daysSinceStart, startDate, l1, l2]);
}
