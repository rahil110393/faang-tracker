import { Link, useParams } from "react-router-dom";
import { TaskItem } from "@/components/TaskItem";
import { LinkManager } from "@/components/LinkManager";
import { NoteEditor } from "@/components/NoteEditor";
import { usePlanDays } from "@/hooks/usePlanDays";
import { useDayDetail } from "@/hooks/useDayDetail";
import { useItemCompletions, useToggleItemCompletion } from "@/hooks/useItemCompletions";
import type { Track } from "@/lib/database.types";

const TRACKS: Track[] = ["DSA", "DESIGN", "BEHAVIORAL"];

export function DayView() {
  const params = useParams<{ dayNumber: string }>();
  const dayNum = Number(params.dayNumber);

  const { data: planDays = [] } = usePlanDays();
  const { data: sections = [], isLoading: sectionsLoading } = useDayDetail(dayNum);
  const { data: itemCompletions = [] } = useItemCompletions();
  const toggle = useToggleItemCompletion();

  const day = planDays.find((d) => d.day_number === dayNum);
  const completedItemIds = new Set(itemCompletions.map((ic) => ic.item_id));

  const prev = dayNum > 1 ? dayNum - 1 : null;
  const next = dayNum < 60 ? dayNum + 1 : null;

  if (!sectionsLoading && !day && planDays.length > 0) {
    return <div className="text-slate-300">Day not found.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {day?.phase ?? "…"}
          </div>
          <h1 className="text-3xl font-bold text-slate-50">Day {dayNum}</h1>
        </div>
        <div className="flex gap-2">
          {prev && (
            <Link
              to={`/day/${prev}`}
              className="rounded bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700"
            >
              ← Day {prev}
            </Link>
          )}
          {next && (
            <Link
              to={`/day/${next}`}
              className="rounded bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700"
            >
              Day {next} →
            </Link>
          )}
        </div>
      </div>

      {sectionsLoading ? (
        <div className="space-y-3">
          {TRACKS.map((t) => (
            <div key={t} className="h-32 animate-pulse rounded-lg bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {TRACKS.map((track) => {
            const trackSections = sections
              .filter((s) => s.track === track)
              .sort((a, b) => a.sort_order - b.sort_order);
            return (
              <TaskItem
                key={track}
                track={track}
                sections={trackSections}
                completedItemIds={completedItemIds}
                onToggleItem={(itemId, completed) =>
                  toggle.mutate({ itemId, completed })
                }
              >
                <LinkManager day={dayNum} track={track} />
              </TaskItem>
            );
          })}
        </div>
      )}

      <NoteEditor day={dayNum} />
    </div>
  );
}
