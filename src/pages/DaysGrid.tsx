import { DayCard } from "@/components/DayCard";
import { PHASE_META } from "@/data/plan-seed";
import { usePlanDays } from "@/hooks/usePlanDays";
import { useItemCompletions, useDayTrackCounts } from "@/hooks/useItemCompletions";
import type { Phase, Track } from "@/lib/database.types";

export function DaysGrid() {
  const { data: planDays = [] } = usePlanDays();
  const { data: itemCompletions = [] } = useItemCompletions();
  const { data: trackCounts = [] } = useDayTrackCounts();

  // Build Map<dayNumber, Map<track, {done, total}>>
  const totalsByDayTrack = new Map<string, number>();
  for (const tc of trackCounts) {
    totalsByDayTrack.set(`${tc.day_number}_${tc.track}`, tc.total_items);
  }
  const doneByDayTrack = new Map<string, number>();
  for (const ic of itemCompletions) {
    const key = `${ic.day_number}_${ic.track}`;
    doneByDayTrack.set(key, (doneByDayTrack.get(key) ?? 0) + 1);
  }

  function completedTracksForDay(dayNumber: number): Set<Track> {
    const done = new Set<Track>();
    for (const track of ["DSA", "DESIGN", "BEHAVIORAL"] as Track[]) {
      const key = `${dayNumber}_${track}`;
      const total = totalsByDayTrack.get(key) ?? 0;
      const completed = doneByDayTrack.get(key) ?? 0;
      if (total > 0 && completed >= total) done.add(track);
    }
    return done;
  }

  return (
    <div className="space-y-8">
      {(Object.keys(PHASE_META) as Phase[]).map((phase) => {
        const days = planDays.filter((d) => d.phase === phase);
        return (
          <section key={phase}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {PHASE_META[phase].label}{" "}
              <span className="text-slate-600">
                — Days {PHASE_META[phase].range[0]}–{PHASE_META[phase].range[1]}
              </span>
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2">
              {days.map((d) => (
                <DayCard
                  key={d.day_number}
                  dayNumber={d.day_number}
                  phase={d.phase}
                  completedTracks={completedTracksForDay(d.day_number)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
