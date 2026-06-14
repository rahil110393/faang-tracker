import { useState } from "react";
import { Link } from "react-router-dom";
import { usePlanProgress, TOTAL_PLAN_DAYS } from "@/hooks/usePlanProgress";
import { usePlanPace } from "@/hooks/usePlanPace";
import { DaysLeftBanner } from "@/components/DaysLeftBanner";
import { DailySchedule } from "@/components/DailySchedule";
import { PaceTracker } from "@/components/PaceTracker";

function relativeDayLabel(offset: number): string {
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  if (offset === -1) return "Yesterday";
  if (offset > 1) return `In ${offset} days`;
  return `${Math.abs(offset)} days ago`;
}

function DayNavigator({
  offset,
  onChange,
}: {
  offset: number;
  onChange: (next: number) => void;
}) {
  const btn =
    "rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed";
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-900 p-2 ring-1 ring-slate-800">
      <button onClick={() => onChange(offset - 1)} className={btn} aria-label="Previous day">
        ← Prev
      </button>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-100">
          {relativeDayLabel(offset)}
        </span>
        {offset !== 0 && (
          <button
            onClick={() => onChange(0)}
            className="rounded-full bg-sky-600/20 px-3 py-1 text-xs font-medium text-sky-300 hover:bg-sky-600/30"
          >
            Back to today
          </button>
        )}
      </div>
      <button onClick={() => onChange(offset + 1)} className={btn} aria-label="Next day">
        Next →
      </button>
    </div>
  );
}

function StartDatePicker({ onSet }: { onSet: (date: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="rounded-xl bg-slate-900 p-6 ring-1 ring-slate-800 max-w-md">
      <h2 className="text-lg font-bold text-slate-50 mb-1">Set your plan start date</h2>
      <p className="text-sm text-slate-400 mb-4">
        This anchors your 60-day plan. Day 1 will be the date you pick.
      </p>
      <input
        type="date"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="rounded bg-slate-800 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-sky-500 w-full"
      />
      <button
        onClick={() => val && onSet(val)}
        disabled={!val}
        className="mt-3 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Start tracking
      </button>
    </div>
  );
}

export function TimetablePage() {
  const {
    startDate,
    setStartDate,
    clearStartDate,
    currentPlanDay,
    isWeekend,
    isPlanComplete,
  } = usePlanProgress();
  const { progressDay, completedDays, isLoading: paceLoading } = usePlanPace();

  const [dayOffset, setDayOffset] = useState(0);

  // The plan content follows your ACTUAL progress (progress-based), not the
  // calendar — so a missed day never gets skipped. While completion data loads,
  // fall back to the calendar day to avoid a flash of "Day 1".
  const baselinePlanDay = paceLoading ? currentPlanDay : progressDay;

  // Banner reflects real progress: day you're on, work-days left, % actually done.
  const bannerDaysLeft = Math.max(TOTAL_PLAN_DAYS - completedDays, 0);
  const bannerPercent = Math.round((completedDays / TOTAL_PLAN_DAYS) * 100);

  // Derive the viewed day from the offset (0 = today). The weekday/weekend layout
  // follows the calendar date; the plan content follows your progress baseline.
  const base = new Date();
  const viewedDate = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + dayOffset
  );
  const viewedIsWeekend = viewedDate.getDay() === 0 || viewedDate.getDay() === 6;
  const viewedPlanDay = Math.min(
    Math.max(baselinePlanDay + dayOffset, 1),
    TOTAL_PLAN_DAYS
  );

  if (!startDate) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-50">Timetable</h1>
          <p className="text-sm text-slate-400 mt-1">
            Your daily study schedule, calibrated for your availability.
          </p>
        </div>
        <StartDatePicker onSet={setStartDate} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-50">Timetable</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Your daily study schedule, calibrated for your availability.
          </p>
        </div>
        <button
          onClick={clearStartDate}
          className="text-xs text-slate-600 hover:text-slate-400"
        >
          Reset start date
        </button>
      </div>

      {isPlanComplete && (
        <div className="rounded-xl bg-emerald-900/30 border border-emerald-700/40 p-5">
          <p className="text-emerald-300 font-semibold">You've completed the 60-day plan.</p>
          <p className="text-emerald-400/70 text-sm mt-1">
            Review all your progress in{" "}
            <Link to="/days" className="underline hover:text-emerald-300">
              60 Days
            </Link>
            .
          </p>
        </div>
      )}

      <DaysLeftBanner
        currentPlanDay={baselinePlanDay}
        daysLeft={bannerDaysLeft}
        percentDone={bannerPercent}
        isWeekend={isWeekend}
        startDate={startDate}
      />

      <PaceTracker />

      <DayNavigator offset={dayOffset} onChange={setDayOffset} />

      <DailySchedule
        isWeekend={viewedIsWeekend}
        currentPlanDay={viewedPlanDay}
        viewedDate={viewedDate}
        relativeLabel={relativeDayLabel(dayOffset)}
      />
    </div>
  );
}
