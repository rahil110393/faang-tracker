import type { Track } from "@/lib/database.types";
import type { Grade } from "@/lib/sm2";
import { useGradeCard, useReviewCards } from "@/hooks/useReviewCards";

/**
 * The four grades, worded per track. Same SM-2 quality values throughout —
 * only the language changes, because "brute force only" is meaningless for a
 * STAR story and "rambled" is meaningless for Two Sum.
 */
const GRADE_LABELS: Record<Track, Record<Grade, string>> = {
  DSA: {
    0: "Read solution",
    2: "Brute force only",
    3: "Optimal, with hint",
    5: "Optimal, solo",
  },
  DESIGN: {
    0: "Re-read my notes",
    2: "Got gist, missed key parts",
    3: "Solid, needed a peek",
    5: "Explained cleanly",
  },
  BEHAVIORAL: {
    0: "Blanked",
    2: "Rambled, lost thread",
    3: "Told it, fumbled details",
    5: "Tight STAR, under 3 min",
  },
};

const GRADES: Grade[] = [0, 2, 3, 5];

const GRADE_STYLE: Record<Grade, string> = {
  0: "bg-red-900/30 text-red-300 ring-red-800/50 hover:bg-red-900/50",
  2: "bg-amber-900/30 text-amber-300 ring-amber-800/50 hover:bg-amber-900/50",
  3: "bg-sky-900/30 text-sky-300 ring-sky-800/50 hover:bg-sky-900/50",
  5: "bg-emerald-900/30 text-emerald-300 ring-emerald-800/50 hover:bg-emerald-900/50",
};

export function GradeStrip({
  itemId,
  track,
  compact = false,
}: {
  itemId: string;
  track: Track;
  compact?: boolean;
}) {
  const grade = useGradeCard();
  const { data: cards = [] } = useReviewCards();

  // Look up existing SM-2 state so re-grading advances the schedule instead of
  // restarting it. Undefined on first grade, which is what newCardState covers.
  const card = cards.find((c) => c.item_id === itemId);

  return (
    <div
      className={compact ? "flex flex-wrap gap-1" : "mt-1.5 flex flex-wrap items-center gap-1.5"}
    >
      {!compact && (
        <span className="mr-0.5 text-xs text-slate-500">
          {card ? "Re-grade:" : "How did that go?"}
        </span>
      )}
      {GRADES.map((g) => (
        <button
          key={g}
          type="button"
          disabled={grade.isPending}
          onClick={() => grade.mutate({ itemId, grade: g, current: card })}
          className={`rounded px-2 py-0.5 text-xs font-medium ring-1 transition disabled:opacity-50 ${
            GRADE_STYLE[g]
          } ${card?.last_grade === g ? "ring-2" : ""}`}
        >
          {GRADE_LABELS[track][g]}
        </button>
      ))}
      {card && !compact && (
        <span className="ml-1 text-xs text-slate-600">
          next in {card.interval_days}d
        </span>
      )}
    </div>
  );
}
