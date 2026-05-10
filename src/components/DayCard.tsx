import { Link } from "react-router-dom";
import type { Phase, Track } from "@/lib/database.types";

const PHASE_BG: Record<Phase, string> = {
  P1: "bg-phase-p1/10 border-phase-p1/40 hover:border-phase-p1",
  P2: "bg-phase-p2/10 border-phase-p2/40 hover:border-phase-p2",
  P3: "bg-phase-p3/10 border-phase-p3/40 hover:border-phase-p3",
  P4: "bg-phase-p4/10 border-phase-p4/40 hover:border-phase-p4",
};

const PHASE_TEXT: Record<Phase, string> = {
  P1: "text-phase-p1",
  P2: "text-phase-p2",
  P3: "text-phase-p3",
  P4: "text-phase-p4",
};

export function DayCard({
  dayNumber,
  phase,
  completedTracks,
}: {
  dayNumber: number;
  phase: Phase;
  completedTracks: Set<Track>;
}) {
  const allDone = completedTracks.size === 3;
  return (
    <Link
      to={`/day/${dayNumber}`}
      className={`relative block rounded-lg border p-3 transition ${PHASE_BG[phase]} ${
        allDone ? "ring-2 ring-emerald-400" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-slate-100">{dayNumber}</div>
        <div className={`text-[10px] font-semibold ${PHASE_TEXT[phase]}`}>{phase}</div>
      </div>
      <div className="mt-2 flex gap-1">
        {(["DSA", "DESIGN", "BEHAVIORAL"] as Track[]).map((t) => (
          <div
            key={t}
            title={t}
            className={`h-1.5 flex-1 rounded-full ${
              completedTracks.has(t) ? "bg-emerald-400" : "bg-slate-700"
            }`}
          />
        ))}
      </div>
      {allDone && <div className="absolute right-2 top-2 text-emerald-400">✓</div>}
    </Link>
  );
}
