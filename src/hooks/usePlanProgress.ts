import { useState, useMemo } from "react";

const STORAGE_KEY = "dsa_plan_start_date";
const TOTAL_DAYS = 60;

export const TOTAL_PLAN_DAYS = TOTAL_DAYS;

export interface PlanProgress {
  startDate: string | null;
  currentPlanDay: number;
  daysSinceStart: number;
  daysLeft: number;
  percentDone: number;
  isWeekend: boolean;
  isPlanComplete: boolean;
  setStartDate: (date: string) => void;
  clearStartDate: () => void;
}

export function usePlanProgress(): PlanProgress {
  const [startDate, setStartDateState] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
  );

  const setStartDate = (date: string) => {
    localStorage.setItem(STORAGE_KEY, date);
    setStartDateState(date);
  };

  const clearStartDate = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStartDateState(null);
  };

  const derived = useMemo(() => {
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    if (!startDate) {
      return {
        currentPlanDay: 1,
        daysSinceStart: 0,
        daysLeft: TOTAL_DAYS,
        percentDone: 0,
        isWeekend,
        isPlanComplete: false,
      };
    }

    const start = new Date(startDate + "T00:00:00");
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysSinceStart = Math.max(
      Math.floor((todayMidnight.getTime() - start.getTime()) / 86_400_000),
      0
    );
    const currentPlanDay = Math.min(Math.max(daysSinceStart + 1, 1), TOTAL_DAYS);
    const daysLeft = Math.max(TOTAL_DAYS - currentPlanDay, 0);
    const percentDone = Math.round((currentPlanDay / TOTAL_DAYS) * 100);
    const isPlanComplete = daysSinceStart >= TOTAL_DAYS;

    return { currentPlanDay, daysSinceStart, daysLeft, percentDone, isWeekend, isPlanComplete };
  }, [startDate]);

  return { startDate, setStartDate, clearStartDate, ...derived };
}
