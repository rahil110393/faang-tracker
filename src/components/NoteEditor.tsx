import { useEffect, useState } from "react";
import { useDailyNote, useSaveDailyNote } from "@/hooks/useDailyNote";

export function NoteEditor({ day }: { day: number }) {
  const { data, isLoading } = useDailyNote(day);
  const save = useSaveDailyNote();
  const [value, setValue] = useState("");
  const [savedTick, setSavedTick] = useState(false);

  useEffect(() => {
    setValue(data ?? "");
  }, [data]);

  useEffect(() => {
    if (isLoading) return;
    if (value === (data ?? "")) return;
    const t = setTimeout(async () => {
      await save.mutateAsync({ day, content: value });
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 1500);
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="rounded-lg bg-slate-900 p-4 ring-1 ring-slate-800">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Day Note
        </div>
        <div className="text-xs text-slate-500">
          {save.isPending ? "Saving…" : savedTick ? "Saved ✓" : ""}
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        placeholder="Reflections, blockers, what you'd do differently…"
        className="mt-2 w-full resize-y rounded bg-slate-950/60 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-800 focus:ring-sky-500"
      />
    </div>
  );
}
