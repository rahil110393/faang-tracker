import { Link } from "react-router-dom";
import { useReviewQueue, DAILY_REVIEW_CAP } from "@/hooks/useReviewQueue";
import { GradeStrip } from "./GradeStrip";
import type { Track } from "@/lib/database.types";
import type { ReviewCardRow } from "@/hooks/useReviewCards";

const TRACK_COLOR: Record<Track, string> = {
  DSA: "text-blue-400",
  DESIGN: "text-purple-400",
  BEHAVIORAL: "text-emerald-400",
};

/** LeetCode has no stored URL for most items — fall back to a search. */
function problemUrl(card: ReviewCardRow): string {
  if (card.leetcode_url) return card.leetcode_url;
  return `https://leetcode.com/problemset/?search=${encodeURIComponent(card.title)}`;
}

function readinessColor(pct: number): string {
  if (pct >= 80) return "text-emerald-400";
  if (pct >= 50) return "text-amber-400";
  return "text-red-400";
}

export function ReviewQueue() {
  const { dueToday, dueCount, totalCards, fresh, fading, stale, readinessPct, isLoading } =
    useReviewQueue();

  if (isLoading) return null;

  // Nothing graded yet — explain the feature rather than showing an empty shell.
  if (totalCards === 0) {
    return (
      <div className="rounded-xl bg-slate-900 p-5 ring-1 ring-slate-800">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Due for review
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Tick off a task and grade how it went — it'll come back here on a spaced
          schedule so it actually sticks.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-900 p-5 ring-1 ring-slate-800">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Due for review
        </div>
        <div className="text-xs tabular-nums text-slate-500">
          <span className={`text-sm font-bold ${readinessColor(readinessPct)}`}>
            {readinessPct}%
          </span>{" "}
          ready
        </div>
      </div>

      <div className="mt-1 text-xs text-slate-500 tabular-nums">
        {fresh} fresh · {fading} fading · {stale} stale
        {stale > 0 && (
          <span className="ml-1 text-red-400/80">— {stale} you'd likely fail today</span>
        )}
      </div>

      {dueToday.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          Nothing due today. {fresh === totalCards ? "All fresh." : "Come back tomorrow."}
        </p>
      ) : (
        <>
          <ul className="mt-3 space-y-2.5">
            {dueToday.map((card) => (
              <li
                key={card.item_id}
                className="rounded-lg bg-slate-950/60 p-3 ring-1 ring-slate-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-100">
                      {card.title}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      <Link to={`/day/${card.day_number}#${card.track}`} className="hover:underline">
                        Day {card.day_number}
                      </Link>{" "}
                      · <span className={TRACK_COLOR[card.track]}>{card.track}</span>
                      {card.lapses > 0 && (
                        <span className="ml-1 text-amber-500/80">
                          · {card.lapses} lapse{card.lapses === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={problemUrl(card)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-xs text-sky-400 hover:underline"
                  >
                    Open ↗
                  </a>
                </div>
                <div className="mt-2">
                  <GradeStrip itemId={card.item_id} track={card.track} compact />
                </div>
              </li>
            ))}
          </ul>

          {dueCount > DAILY_REVIEW_CAP && (
            <p className="mt-2.5 text-xs text-slate-500">
              {dueCount - DAILY_REVIEW_CAP} more due — capped at {DAILY_REVIEW_CAP}/day so it
              stays doable. Clear these and the rest roll forward.
            </p>
          )}
        </>
      )}
    </div>
  );
}
