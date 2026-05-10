import { useStreak } from "@/hooks/useStreak";

const messages = [
  { min: 0, msg: "Start today — Day 1 awaits." },
  { min: 1, msg: "First spark. Keep it going tomorrow." },
  { min: 3, msg: "Habit forming." },
  { min: 7, msg: "One week. Solid." },
  { min: 14, msg: "Two weeks of compound interest." },
  { min: 30, msg: "Reflexive now. Don't break it." },
  { min: 50, msg: "You're in the zone." },
];

function messageFor(streak: number) {
  return [...messages].reverse().find((m) => streak >= m.min)?.msg ?? "";
}

export function StreakBadge() {
  const { data } = useStreak();
  const flameColor = data.activeToday ? "text-orange-400" : "text-slate-500";

  return (
    <div className="flex items-center gap-4 rounded-xl bg-slate-900 p-5 ring-1 ring-slate-800">
      <div className={`text-5xl ${data.activeToday ? "animate-flame" : ""} ${flameColor}`}>🔥</div>
      <div>
        <div className="text-3xl font-bold text-slate-50">{data.current} day{data.current === 1 ? "" : "s"}</div>
        <div className="text-sm text-slate-400">
          Longest: {data.longest} · Active days: {data.totalActiveDays}
        </div>
        <div className="text-xs text-slate-500 mt-1">{messageFor(data.current)}</div>
      </div>
    </div>
  );
}
