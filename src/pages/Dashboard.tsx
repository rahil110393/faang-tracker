import { Link } from "react-router-dom";
import { StreakBadge } from "@/components/StreakBadge";
import { PhaseProgress } from "@/components/PhaseProgress";
import { usePlanDays } from "@/hooks/usePlanDays";
import { useDayDetail } from "@/hooks/useDayDetail";
import { useItemCompletions, useDayTrackCounts } from "@/hooks/useItemCompletions";
import type { Track } from "@/lib/database.types";

const TRACKS: Track[] = ["DSA", "DESIGN", "BEHAVIORAL"];
const TRACK_LABEL: Record<Track, string> = {
  DSA: "DSA",
  DESIGN: "Design",
  BEHAVIORAL: "Behavioral",
};

export function Dashboard() {
  const { data: planDays = [] } = usePlanDays();
  const { data: itemCompletions = [] } = useItemCompletions();
  const { data: trackCounts = [] } = useDayTrackCounts();

  // Build done/total per (day, track)
  const totalsByDayTrack = new Map<string, number>();
  for (const tc of trackCounts) {
    totalsByDayTrack.set(`${tc.day_number}_${tc.track}`, tc.total_items);
  }
  const doneByDayTrack = new Map<string, number>();
  for (const ic of itemCompletions) {
    const key = `${ic.day_number}_${ic.track}`;
    doneByDayTrack.set(key, (doneByDayTrack.get(key) ?? 0) + 1);
  }

  function isTrackDone(dayNumber: number, track: Track): boolean {
    const key = `${dayNumber}_${track}`;
    const total = totalsByDayTrack.get(key) ?? 0;
    return total > 0 && (doneByDayTrack.get(key) ?? 0) >= total;
  }

  // Current day: first day that isn't fully complete across all 3 tracks
  const currentDay =
    planDays.find((d) =>
      TRACKS.some((t) => !isTrackDone(d.day_number, t))
    )?.day_number ?? planDays[0]?.day_number ?? 1;

  const todayPhase = planDays.find((d) => d.day_number === currentDay)?.phase ?? "P1";

  const { data: todaySections = [] } = useDayDetail(currentDay);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <StreakBadge />
        </div>
        <div className="lg:col-span-2 rounded-xl bg-slate-900 p-5 ring-1 ring-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Today's focus
              </div>
              <div className="mt-1 text-xl font-bold text-slate-50">
                Day {currentDay}{" "}
                <span className="text-slate-500 text-sm font-normal">· {todayPhase}</span>
              </div>
            </div>
            <Link
              to={`/day/${currentDay}`}
              className="rounded bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-500"
            >
              Open day →
            </Link>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {TRACKS.map((track) => {
              const sections = todaySections.filter((s) => s.track === track);
              const sectionTitle = sections[0]?.title ?? "…";
              const itemCount = sections.reduce((n, s) => n + s.items.length, 0);
              const done = isTrackDone(currentDay, track);
              return (
                <li key={track} className="flex gap-2">
                  <span className={done ? "text-emerald-400" : "text-slate-600"}>●</span>
                  <span className={done ? "line-through text-slate-500" : "text-slate-200"}>
                    <b>{TRACK_LABEL[track]}:</b> {sectionTitle}
                    {itemCount > 0 && (
                      <span className="ml-1 text-slate-500">({itemCount} items)</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <PhaseProgress />
    </div>
  );
}
