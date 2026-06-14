interface DaysLeftBannerProps {
  currentPlanDay: number;
  daysLeft: number;
  percentDone: number;
  isWeekend: boolean;
  startDate: string | null;
}

function getMotivation(daysLeft: number, isWeekend: boolean): string {
  if (isWeekend) return "It's the weekend — this is your chance to pull ahead.";
  if (daysLeft > 45) return "The foundation phase — build the habit, not the result.";
  if (daysLeft >= 30) return "You're in the trenches now. This is where average developers quit.";
  if (daysLeft >= 15) return "Every session compounds. The gap between you and others is widening.";
  if (daysLeft >= 7) return "Final approach. Sharpen everything you've built.";
  return "You're almost there. Don't let up now.";
}

function barColor(percentDone: number): string {
  if (percentDone <= 33) return "bg-blue-500";
  if (percentDone <= 66) return "bg-purple-500";
  return "bg-emerald-500";
}

export function DaysLeftBanner({
  currentPlanDay,
  daysLeft,
  percentDone,
  isWeekend,
}: DaysLeftBannerProps) {
  return (
    <div className="space-y-3">
      {isWeekend && (
        <div className="bg-emerald-900/40 border border-emerald-700/50 rounded-lg px-4 py-2 text-emerald-300 text-sm font-medium">
          Weekend mode — full sessions available. Use every hour.
        </div>
      )}

      <div className="rounded-xl bg-slate-900 p-5 ring-1 ring-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-bold text-slate-50">Day {currentPlanDay}</span>
            <span className="text-slate-500 text-sm font-normal ml-2">of 60</span>
          </div>
          <span className="text-slate-400 text-sm">{daysLeft} days left</span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full transition-all ${barColor(percentDone)}`}
            style={{ width: `${percentDone}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-slate-500">{percentDone}% complete</div>

        <p className="mt-3 text-sm text-slate-300 italic">
          {getMotivation(daysLeft, isWeekend)}
        </p>
      </div>
    </div>
  );
}
