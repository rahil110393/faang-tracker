import { usePlanPace } from "@/hooks/usePlanPace";

const STATUS_STYLE = {
  ahead: { ring: "ring-emerald-700/50", bg: "bg-emerald-900/30", text: "text-emerald-300", label: "Ahead" },
  "on-track": { ring: "ring-sky-700/50", bg: "bg-sky-900/30", text: "text-sky-300", label: "On track" },
  behind: { ring: "ring-amber-700/50", bg: "bg-amber-900/30", text: "text-amber-300", label: "Behind" },
  done: { ring: "ring-emerald-700/50", bg: "bg-emerald-900/30", text: "text-emerald-300", label: "Complete" },
} as const;

export function PaceTracker() {
  const { completedDays, expectedDay, behindDays, status, pacePerDay, isLoading } =
    usePlanPace();

  if (isLoading) return null;

  const s = STATUS_STYLE[status];
  const expectedCompleted = Math.max(expectedDay - 1, 0);
  const paceLabel = pacePerDay <= 1 ? "about 1" : pacePerDay.toFixed(1);

  let message: string;
  if (status === "done") {
    message = "All 60 days complete. You did the work — go get the offer.";
  } else if (status === "behind") {
    message = `You've finished ${completedDays} days; by now you planned to be at ${expectedCompleted}. To still land on time, complete ${paceLabel} days of work per day. A missed day isn't failure — just pick up where you left off.`;
  } else if (status === "ahead") {
    message = `You've finished ${completedDays} days vs ${expectedCompleted} planned — ${Math.abs(behindDays)} ahead. Bank the buffer for a sick day, or push into the next topic.`;
  } else {
    message = `Right on pace — ${completedDays} days done, exactly where you planned. Protect the daily rhythm; that's the whole game.`;
  }

  return (
    <div className={`rounded-xl p-4 ring-1 ${s.ring} ${s.bg}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Are you on track?
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.text} ${s.bg} ring-1 ${s.ring}`}>
          {status === "behind" ? `${behindDays} day${behindDays === 1 ? "" : "s"} behind` : s.label}
        </span>
      </div>
      <p className={`mt-2 text-sm leading-relaxed ${s.text}`}>{message}</p>
    </div>
  );
}
