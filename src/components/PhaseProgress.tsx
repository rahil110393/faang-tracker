import { PHASE_META } from "@/data/plan-seed";
import { usePlanDays } from "@/hooks/usePlanDays";
import { useItemCompletions, useDayTrackCounts } from "@/hooks/useItemCompletions";
import type { Phase } from "@/lib/database.types";

const PHASE_COLORS: Record<Phase, string> = {
  P1: "bg-phase-p1",
  P2: "bg-phase-p2",
  P3: "bg-phase-p3",
  P4: "bg-phase-p4",
};

export function PhaseProgress() {
  const { data: planDays = [] } = usePlanDays();
  const { data: itemCompletions = [] } = useItemCompletions();
  const { data: trackCounts = [] } = useDayTrackCounts();

  const stats = (Object.keys(PHASE_META) as Phase[]).map((phase) => {
    const dayNumbers = new Set(planDays.filter((d) => d.phase === phase).map((d) => d.day_number));
    const totalItems = trackCounts
      .filter((tc) => dayNumbers.has(tc.day_number))
      .reduce((n, tc) => n + tc.total_items, 0);
    const doneItems = itemCompletions.filter((ic) => dayNumbers.has(ic.day_number)).length;
    return { phase, meta: PHASE_META[phase], totalItems, doneItems };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ phase, meta, totalItems, doneItems }) => {
        const pct = totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100);
        return (
          <div key={phase} className="rounded-xl bg-slate-900 p-4 ring-1 ring-slate-800">
            <div className="flex items-center justify-between">
              <div className={`text-xs font-semibold uppercase tracking-wide text-white ${PHASE_COLORS[phase]} rounded px-2 py-0.5`}>
                {phase}
              </div>
              <div className="text-sm text-slate-400">{pct}%</div>
            </div>
            <div className="mt-2 text-sm font-medium text-slate-100">{meta.label}</div>
            <div className="mt-1 text-xs text-slate-500">{meta.tagline}</div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div className={`h-full ${PHASE_COLORS[phase]}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {doneItems} / {totalItems} items
            </div>
          </div>
        );
      })}
    </div>
  );
}
