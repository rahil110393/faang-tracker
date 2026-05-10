import type { Track } from "@/lib/database.types";
import type { PlanSectionRow, PlanItemRow } from "@/hooks/useDayDetail";

const TRACK_LABEL: Record<Track, string> = {
  DSA: "DSA (~1.5h)",
  DESIGN: "Design — LLD/HLD (~1.5h)",
  BEHAVIORAL: "Behavioral / Review (~0.5h)",
};

const TRACK_COLOR: Record<Track, string> = {
  DSA: "border-l-blue-500",
  DESIGN: "border-l-purple-500",
  BEHAVIORAL: "border-l-emerald-500",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-red-400",
};

function ItemRow({
  item,
  completed,
  onToggle,
}: {
  item: PlanItemRow;
  completed: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-800/60">
      <input
        type="checkbox"
        checked={completed}
        onChange={onToggle}
        className="h-4 w-4 flex-shrink-0 cursor-pointer accent-emerald-400"
      />
      <span className={`flex-1 text-sm ${completed ? "line-through text-slate-500" : "text-slate-100"}`}>
        {item.title}
      </span>
      {item.difficulty && (
        <span className={`text-xs font-medium ${DIFFICULTY_COLOR[item.difficulty]}`}>
          {item.difficulty}
        </span>
      )}
      {item.leetcode_url && (
        <a
          href={item.leetcode_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-sky-400 hover:underline"
        >
          LC↗
        </a>
      )}
    </label>
  );
}

export function TaskItem({
  track,
  sections,
  completedItemIds,
  onToggleItem,
  children,
}: {
  track: Track;
  sections: PlanSectionRow[];
  completedItemIds: Set<string>;
  onToggleItem: (itemId: string, completed: boolean) => void;
  children?: React.ReactNode;
}) {
  const totalItems = sections.reduce((n, s) => n + s.items.length, 0);
  const doneItems = sections.reduce(
    (n, s) => n + s.items.filter((i) => completedItemIds.has(i.id)).length,
    0
  );
  const allDone = totalItems > 0 && doneItems === totalItems;

  return (
    <div className={`rounded-lg border-l-4 bg-slate-900 ring-1 ring-slate-800 ${TRACK_COLOR[track]}`}>
      {/* Track header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {TRACK_LABEL[track]}
        </div>
        <div className={`text-xs font-medium tabular-nums ${allDone ? "text-emerald-400" : "text-slate-500"}`}>
          {doneItems}/{totalItems}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3 px-4 pb-4">
        {sections.map((section) => (
          <div key={section.id}>
            <div className="mb-1 text-sm font-semibold text-slate-200">
              {section.title}
            </div>
            {section.context_note && (
              <p className="mb-2 text-xs text-slate-500">{section.context_note}</p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  completed={completedItemIds.has(item.id)}
                  onToggle={() =>
                    onToggleItem(item.id, completedItemIds.has(item.id))
                  }
                />
              ))}
            </div>
          </div>
        ))}

        {children && <div className="mt-3 border-t border-slate-800 pt-3">{children}</div>}
      </div>
    </div>
  );
}
